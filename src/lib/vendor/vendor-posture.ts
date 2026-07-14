import {
  getPublicVendorProfile,
  resolveExternalRiskVectors,
} from './public-vendor-profiles';
import { resolveVendorCertifications } from './vendor-certification-intelligence';
import {
  computeVendorSecurityScore,
  domainRecordToScores,
  type ScoreComponent,
} from './vendor-score-engine';
import { type RatingBand } from './tprm-rating';
import { parseDomainScores } from './vendor-assessment-types';
import type { VendorDomainScore } from './vendor-assessment-types';
import { parseBreachIntel } from './breach-intelligence-shared';
import type { VendorBreachIntel } from './breach-intelligence-types';
import { applyExternalIntelToVectors, parseExternalIntel } from './intel/correlate';
import type { VendorExternalIntel } from './external-intel-types';

export type VendorPostureInput = {
  id: string;
  name: string;
  primaryDomain: string;
  tier: string;
  securityRating: number | null;
  aiRiskScore: number | null;
  ratingGrade?: string;
  domainScores?: unknown;
  aiRiskSummary?: string;
  certifications?: unknown;
  breachIntel?: unknown;
  externalIntel?: unknown;
};

export type VendorPostureSummary = {
  vendorId: string;
  name: string;
  primaryDomain: string;
  tier: string;
  score100: number | null;
  score950: number | null;
  grade: string;
  summary: string;
  domainScores: VendorDomainScore[];
  certifications: ReturnType<typeof resolveVendorCertifications>['certifications'];
  certificationsVerifiedOverInternet: boolean;
  fromPublicIntelligence: boolean;
  /** Curated demo profile vs simulated — live overlays applied when externalIntel is present */
  attackSurfaceMode: 'curated_demo' | 'simulated' | 'live_correlated';
  breachIntel: VendorBreachIntel | null;
  externalIntel: VendorExternalIntel | null;
  scoreComponents: ScoreComponent[];
  certificationMetSecurityBaseline: boolean;
  band: RatingBand;
  externalSurface: {
    pass: number;
    warn: number;
    fail: number;
    topRisks: Array<{ label: string; status: 'pass' | 'warn' | 'fail' }>;
  };
};

export function buildVendorPosture(
  vendor: VendorPostureInput,
  options?: { questionnaireCompleted?: boolean }
): VendorPostureSummary {
  const profile = getPublicVendorProfile(vendor.primaryDomain);
  const externalIntel = parseExternalIntel(vendor.externalIntel);
  const rawBase =
    externalIntel?.correlatedScore100 ??
    vendor.securityRating ??
    vendor.aiRiskScore ??
    profile?.securityRating100 ??
    null;

  const { certifications, verifiedOverInternet } = resolveVendorCertifications(
    vendor.primaryDomain,
    vendor.certifications
  );

  const external = resolveExternalRiskVectors({
    primaryDomain: vendor.primaryDomain,
    securityRating100: rawBase,
    tier: vendor.tier,
  });

  const breachIntel = parseBreachIntel(vendor.breachIntel) ?? parseBreachIntel(externalIntel?.breachIntel);
  const vectors = applyExternalIntelToVectors(external.vectors, externalIntel);

  const storedDomains = parseDomainScores(vendor.domainScores);
  const profileDomains = Object.fromEntries(
    (profile?.domainScores ?? []).map((d) => [d.domain, d.percentage])
  );
  const mergedDomains = { ...profileDomains, ...storedDomains };

  const scoreResult = computeVendorSecurityScore({
    baseScore100: rawBase,
    domainScores: mergedDomains,
    certifications,
    externalVectors: vectors,
    questionnaireCompleted: options?.questionnaireCompleted,
  });

  const domainScores = domainRecordToScores(scoreResult.domainScores);
  if (domainScores.length === 0 && profile?.domainScores.length) {
    domainScores.push(...profile.domainScores);
  }

  const topRisks = vectors
    .filter((v) => v.status !== 'pass')
    .slice(0, 3)
    .map((v) => ({ label: v.label, status: v.status }));

  const liveCorrelated = Boolean(externalIntel?.live);

  return {
    vendorId: vendor.id,
    name: vendor.name,
    primaryDomain: vendor.primaryDomain,
    tier: vendor.tier,
    score100: scoreResult.score100,
    score950: scoreResult.score950,
    grade: scoreResult.grade,
    summary: vendor.aiRiskSummary?.trim() || externalIntel?.summary || profile?.aiSummary || '',
    domainScores,
    certifications,
    certificationsVerifiedOverInternet: verifiedOverInternet,
    fromPublicIntelligence: external.intelligence != null,
    attackSurfaceMode: liveCorrelated
      ? 'live_correlated'
      : external.intelligence
        ? 'curated_demo'
        : 'simulated',
    breachIntel,
    externalIntel,
    scoreComponents: scoreResult.components,
    certificationMetSecurityBaseline: scoreResult.certificationMetSecurityBaseline,
    band: scoreResult.band,
    externalSurface: {
      pass: vectors.filter((v) => v.status === 'pass').length,
      warn: vectors.filter((v) => v.status === 'warn').length,
      fail: vectors.filter((v) => v.status === 'fail').length,
      topRisks,
    },
  };
}
