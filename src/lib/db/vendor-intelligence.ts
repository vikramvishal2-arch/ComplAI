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

export async function refreshVendorInternetIntelligence(vendorId: string) {
  const org = await getDefaultOrganization();
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, organizationId: org.id },
  });
  if (!vendor) return null;

  const profile = getPublicVendorProfile(vendor.primaryDomain);
  const { certifications, verifiedOverInternet } = resolveVendorCertifications(
    vendor.primaryDomain,
    vendor.certifications
  );

  const external = resolveExternalRiskVectors({
    primaryDomain: vendor.primaryDomain,
    securityRating100: vendor.securityRating ?? vendor.aiRiskScore,
    tier: vendor.tier,
  });

  const questionnaireCompleted = await prisma.vendorAssessment.count({
    where: { vendorId, organizationId: org.id, status: 'completed' },
  });

  const scoreResult = computeVendorSecurityScore({
    baseScore100: profile?.securityRating100 ?? vendor.securityRating ?? vendor.aiRiskScore,
    domainScores: parseDomainScores(vendor.domainScores),
    certifications,
    externalVectors: external.vectors,
    questionnaireCompleted: questionnaireCompleted > 0,
  });

  const domainScoresJson = scoreResult.domainScores as Prisma.InputJsonValue;
  const certificationsJson = certifications as unknown as Prisma.InputJsonValue;

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      securityRating: scoreResult.score100 ?? undefined,
      aiRiskScore: scoreResult.score100 ?? undefined,
      ratingGrade: scoreResult.grade || undefined,
      domainScores: domainScoresJson,
      certifications: certificationsJson,
      aiRiskSummary: profile?.aiSummary ?? vendor.aiRiskSummary,
      lastAssessedAt: new Date(),
    },
  });

  const detail = await getVendorDetail(vendorId);
  return {
    vendor: detail?.vendor,
    score: scoreResult,
    certificationsFound: certifications.length,
    verifiedOverInternet,
    refreshedAt: new Date().toISOString(),
  };
}

export async function refreshAllVendorsInternetIntelligence() {
  const org = await getDefaultOrganization();
  const vendors = await prisma.vendor.findMany({
    where: { organizationId: org.id },
    select: { id: true },
  });

  const results: Array<{ id: string; ok: boolean; certificationsFound: number }> = [];
  for (const v of vendors) {
    try {
      const r = await refreshVendorInternetIntelligence(v.id);
      results.push({
        id: v.id,
        ok: Boolean(r),
        certificationsFound: r?.certificationsFound ?? 0,
      });
    } catch {
      results.push({ id: v.id, ok: false, certificationsFound: 0 });
    }
  }
  return results;
}
