import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { getDefaultOrganization } from './repository';
import { getPublicVendorProfile } from '../vendor/public-vendor-profiles';
import { resolveVendorCertifications } from '../vendor/vendor-certification-intelligence';
import { computeVendorSecurityScore } from '../vendor/vendor-score-engine';
import { resolveExternalRiskVectors } from '../vendor/public-vendor-profiles';
import { parseDomainScores } from '../vendor/vendor-assessment-types';
import { getVendorDetail } from './vendor-repository';
import { ensureVendorSchema } from './ensure-vendor-schema';
import {
  applyLiveBreachToVectors,
  fetchDomainBreachHistory,
  parseBreachIntel,
  type VendorBreachIntel,
} from '../vendor/breach-intelligence';
import { runIntelligenceIntegrationService } from '../vendor/intel/service';
import { applyExternalIntelToVectors, parseExternalIntel } from '../vendor/intel/correlate';
import { syncVendorExternalIntelToElastic } from '../vendor/intel/elastic-sync';
import type { VendorExternalIntel } from '../vendor/external-intel-types';
import { ensureExternalIntelProviders } from '../vendor/external-intel-types';

async function persistAndScoreVendor(input: {
  vendorId: string;
  orgId: string;
  vendor: {
    primaryDomain: string;
    securityRating: number | null;
    aiRiskScore: number | null;
    tier: string;
    domainScores: unknown;
    certifications: unknown;
    aiRiskSummary: string;
    name: string;
  };
  externalIntel: VendorExternalIntel;
  breachIntel: VendorBreachIntel;
}) {
  const profile = getPublicVendorProfile(input.vendor.primaryDomain);
  const { certifications, verifiedOverInternet } = resolveVendorCertifications(
    input.vendor.primaryDomain,
    input.vendor.certifications
  );
  const external = resolveExternalRiskVectors({
    primaryDomain: input.vendor.primaryDomain,
    securityRating100: input.vendor.securityRating ?? input.vendor.aiRiskScore,
    tier: input.vendor.tier,
  });
  const vectors = applyExternalIntelToVectors(external.vectors, input.externalIntel);
  const questionnaireCompleted = await prisma.vendorAssessment.count({
    where: { vendorId: input.vendorId, organizationId: input.orgId, status: 'completed' },
  });
  const scoreResult = computeVendorSecurityScore({
    baseScore100:
      input.externalIntel.correlatedScore100 ??
      profile?.securityRating100 ??
      input.vendor.securityRating ??
      input.vendor.aiRiskScore,
    domainScores: parseDomainScores(input.vendor.domainScores),
    certifications,
    externalVectors: vectors,
    questionnaireCompleted: questionnaireCompleted > 0,
  });

  await prisma.vendor.update({
    where: { id: input.vendorId },
    data: {
      securityRating: scoreResult.score100 ?? undefined,
      aiRiskScore: scoreResult.score100 ?? undefined,
      ratingGrade: scoreResult.grade || undefined,
      domainScores: scoreResult.domainScores as Prisma.InputJsonValue,
      certifications: certifications as unknown as Prisma.InputJsonValue,
      breachIntel: input.breachIntel as unknown as Prisma.InputJsonValue,
      externalIntel: input.externalIntel as unknown as Prisma.InputJsonValue,
      aiRiskSummary: profile?.aiSummary ?? input.vendor.aiRiskSummary,
      lastAssessedAt: new Date(),
    },
  });

  const elastic = await syncVendorExternalIntelToElastic({
    vendorId: input.vendorId,
    vendorName: input.vendor.name,
    primaryDomain: input.vendor.primaryDomain,
    intel: input.externalIntel,
  });

  return {
    scoreResult,
    certifications,
    verifiedOverInternet,
    attackSurfaceMode: input.externalIntel.live
      ? ('live_correlated' as const)
      : external.intelligence
        ? ('curated_demo' as const)
        : ('simulated' as const),
    elastic,
  };
}

export async function checkVendorBreachIntelligence(vendorId: string) {
  await ensureVendorSchema();
  const org = await getDefaultOrganization();
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, organizationId: org.id },
  });
  if (!vendor) return null;

  const breachIntel = await fetchDomainBreachHistory(vendor.primaryDomain);
  const existing = parseExternalIntel(vendor.externalIntel);
  const checkedAt = new Date().toISOString();
  const hibpProvider = {
    source: 'hibp' as const,
    status:
      breachIntel.status === 'clear'
        ? ('clear' as const)
        : breachIntel.status === 'breaches_found'
          ? ('findings' as const)
          : breachIntel.status === 'error'
            ? ('error' as const)
            : ('skipped' as const),
    live: breachIntel.live,
    checkedAt: breachIntel.checkedAt,
    message: breachIntel.message,
    error: breachIntel.error,
    findingCount: breachIntel.breachCount,
    configured: true,
  };
  const externalIntel: VendorExternalIntel = existing
    ? {
        ...existing,
        breachIntel,
        checkedAt,
        providers: ensureExternalIntelProviders(
          existing.providers.map((p) => (p.source === 'hibp' ? hibpProvider : p)),
          checkedAt
        ),
      }
    : {
        domain: vendor.primaryDomain,
        checkedAt,
        live: breachIntel.live,
        correlatedScore100: null,
        providers: ensureExternalIntelProviders([hibpProvider], checkedAt),
        findings: [],
        cves: [],
        summary: breachIntel.message,
        breachIntel,
      };

  const profile = getPublicVendorProfile(vendor.primaryDomain);
  const { certifications } = resolveVendorCertifications(
    vendor.primaryDomain,
    vendor.certifications
  );
  const external = resolveExternalRiskVectors({
    primaryDomain: vendor.primaryDomain,
    securityRating100: vendor.securityRating ?? vendor.aiRiskScore,
    tier: vendor.tier,
  });
  const vectors = applyLiveBreachToVectors(external.vectors, breachIntel);
  const questionnaireCompleted = await prisma.vendorAssessment.count({
    where: { vendorId, organizationId: org.id, status: 'completed' },
  });
  const scoreResult = computeVendorSecurityScore({
    baseScore100: profile?.securityRating100 ?? vendor.securityRating ?? vendor.aiRiskScore,
    domainScores: parseDomainScores(vendor.domainScores),
    certifications,
    externalVectors: vectors,
    questionnaireCompleted: questionnaireCompleted > 0,
  });

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      breachIntel: breachIntel as unknown as Prisma.InputJsonValue,
      externalIntel: externalIntel as unknown as Prisma.InputJsonValue,
      securityRating: scoreResult.score100 ?? undefined,
      aiRiskScore: scoreResult.score100 ?? undefined,
      ratingGrade: scoreResult.grade || undefined,
      domainScores: scoreResult.domainScores as Prisma.InputJsonValue,
    },
  });

  await syncVendorExternalIntelToElastic({
    vendorId,
    vendorName: vendor.name,
    primaryDomain: vendor.primaryDomain,
    intel: externalIntel,
  });

  const detail = await getVendorDetail(vendorId);
  return {
    vendor: detail?.vendor ?? null,
    breachIntel,
    externalIntel,
  };
}

export async function refreshVendorInternetIntelligence(vendorId: string) {
  await ensureVendorSchema();
  const org = await getDefaultOrganization();
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, organizationId: org.id },
  });
  if (!vendor) return null;

  const externalIntel = await runIntelligenceIntegrationService(vendor.primaryDomain);
  const breachIntel = (externalIntel.breachIntel as VendorBreachIntel) ?? (await fetchDomainBreachHistory(vendor.primaryDomain));

  const persisted = await persistAndScoreVendor({
    vendorId,
    orgId: org.id,
    vendor: {
      primaryDomain: vendor.primaryDomain,
      securityRating: vendor.securityRating,
      aiRiskScore: vendor.aiRiskScore,
      tier: vendor.tier,
      domainScores: vendor.domainScores,
      certifications: vendor.certifications,
      aiRiskSummary: vendor.aiRiskSummary,
      name: vendor.name,
    },
    externalIntel,
    breachIntel,
  });

  const detail = await getVendorDetail(vendorId);
  return {
    vendor: detail?.vendor,
    score: persisted.scoreResult,
    certificationsFound: persisted.certifications.length,
    verifiedOverInternet: persisted.verifiedOverInternet,
    breachIntel,
    externalIntel,
    elastic: persisted.elastic,
    attackSurfaceMode: persisted.attackSurfaceMode,
    refreshedAt: new Date().toISOString(),
  };
}

export async function refreshAllVendorsInternetIntelligence() {
  const org = await getDefaultOrganization();
  const vendors = await prisma.vendor.findMany({
    where: { organizationId: org.id },
    select: { id: true },
  });

  const results: Array<{
    id: string;
    ok: boolean;
    certificationsFound: number;
    breachStatus?: VendorBreachIntel['status'];
    elasticIndexed?: number;
  }> = [];
  for (const v of vendors) {
    try {
      const r = await refreshVendorInternetIntelligence(v.id);
      results.push({
        id: v.id,
        ok: Boolean(r),
        certificationsFound: r?.certificationsFound ?? 0,
        breachStatus: r?.breachIntel.status,
        elasticIndexed: r?.elastic.indexed,
      });
    } catch {
      results.push({ id: v.id, ok: false, certificationsFound: 0 });
    }
  }
  return results;
}

export function getStoredBreachIntel(value: unknown): VendorBreachIntel | null {
  return parseBreachIntel(value);
}

export function getStoredExternalIntel(value: unknown): VendorExternalIntel | null {
  return parseExternalIntel(value);
}
