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
  const rawBase =
    vendor.securityRating ?? vendor.aiRiskScore ?? profile?.securityRating100 ?? null;

  const { certifications, verifiedOverInternet } = resolveVendorCertifications(
    vendor.primaryDomain,
    vendor.certifications
  );

  const external = resolveExternalRiskVectors({
    primaryDomain: vendor.primaryDomain,
    securityRating100: rawBase,
    tier: vendor.tier,
  });

  const storedDomains = parseDomainScores(vendor.domainScores);
  const profileDomains = Object.fromEntries(
    (profile?.domainScores ?? []).map((d) => [d.domain, d.percentage])
  );
  const mergedDomains = { ...profileDomains, ...storedDomains };

  const scoreResult = computeVendorSecurityScore({
    baseScore100: rawBase,
    domainScores: mergedDomains,
    certifications,
    externalVectors: external.vectors,
    questionnaireCompleted: options?.questionnaireCompleted,
  });

  const domainScores = domainRecordToScores(scoreResult.domainScores);
  if (domainScores.length === 0 && profile?.domainScores.length) {
    domainScores.push(...profile.domainScores);
  }

  const vectors = external.vectors;
  const topRisks = vectors
    .filter((v) => v.status !== 'pass')
    .slice(0, 3)
    .map((v) => ({ label: v.label, status: v.status }));

  return {
    vendorId: vendor.id,
    name: vendor.name,
    primaryDomain: vendor.primaryDomain,
    tier: vendor.tier,
    score100: scoreResult.score100,
    score950: scoreResult.score950,
    grade: scoreResult.grade,
    summary: vendor.aiRiskSummary?.trim() || profile?.aiSummary || '',
    domainScores,
    certifications,
    certificationsVerifiedOverInternet: verifiedOverInternet,
    fromPublicIntelligence: external.intelligence != null,
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
