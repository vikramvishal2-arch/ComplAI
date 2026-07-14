import { getRatingBand, toUpguardRating, type RatingBand } from './tprm-rating';
import { scoreToGrade } from './vendor-rating';
import type { VendorCertification, VendorRiskDomain } from './vendor-assessment-types';
import { DOMAIN_LABELS } from './vendor-assessment-types';

export type ScoreComponent = {
  id: string;
  label: string;
  weight: string;
  score: number | null;
  detail: string;
};

export type VendorScoreResult = {
  score100: number | null;
  score950: number | null;
  grade: string;
  band: RatingBand;
  domainScores: Record<string, number>;
  components: ScoreComponent[];
  /** True when verified SOC 2 and/or ISO 27001 lifts security into green band */
  certificationMetSecurityBaseline: boolean;
  certificationBoostApplied: boolean;
};

const DOMAIN_KEYS: VendorRiskDomain[] = ['security', 'privacy', 'compliance', 'resilience', 'operations'];

function hasVerifiedFramework(certifications: VendorCertification[], patterns: string[]): boolean {
  return certifications.some(
    (c) =>
      c.status === 'verified' &&
      patterns.some((p) => c.framework.toLowerCase().includes(p.toLowerCase()) || c.name.toLowerCase().includes(p.toLowerCase()))
  );
}

function averageExternalVectors(vectors: Array<{ score: number }> | undefined): number | null {
  if (!vectors?.length) return null;
  return Math.round(vectors.reduce((s, v) => s + v.score, 0) / vectors.length);
}

/**
 * Composite vendor security score (0–100, mapped to 0–950 UpGuard-style scale).
 *
 * Basis:
 * 1. Attack surface (public internet signals) — external risk vector average
 * 2. Questionnaire / stored assessment — domain scores or base rating from DB
 * 3. Certification attestation — verified SOC 2 / ISO 27001 raise floors (security presumed met)
 */
export function computeVendorSecurityScore(input: {
  baseScore100: number | null;
  domainScores?: Record<string, number>;
  certifications: VendorCertification[];
  externalVectors?: Array<{ score: number }>;
  questionnaireCompleted?: boolean;
}): VendorScoreResult {
  const { certifications } = input;
  const attackSurface = averageExternalVectors(input.externalVectors);
  const storedDomains = { ...(input.domainScores ?? {}) };

  const domainValues = DOMAIN_KEYS.map((d) => storedDomains[d]).filter((v) => v != null) as number[];
  const questionnaireAvg =
    domainValues.length > 0
      ? Math.round(domainValues.reduce((a, b) => a + b, 0) / domainValues.length)
      : null;

  let baseOverall =
    input.baseScore100 ??
    questionnaireAvg ??
    attackSurface ??
    null;

  const components: ScoreComponent[] = [
    {
      id: 'attack-surface',
      label: 'Public attack surface',
      weight: '40%',
      score: attackSurface,
      detail:
        'Live Shodan / Censys / VirusTotal / NVD / EPSS / HIBP overlays when configured and refreshed; otherwise curated demo or simulated vectors — never fake clear on provider errors.',
    },
    {
      id: 'questionnaire',
      label: 'TPRM questionnaire',
      weight: '40%',
      score: questionnaireAvg,
      detail:
        input.questionnaireCompleted || questionnaireAvg != null
          ? 'Weighted score across security, privacy, compliance, resilience, and operations domains from completed or in-progress assessments.'
          : 'No completed questionnaire yet — send or import a vendor assessment to refine this component.',
    },
    {
      id: 'certifications',
      label: 'Certification attestation',
      weight: '20% floor',
      score: null,
      detail:
        'Verified third-party attestations (SOC 2 Type II, ISO 27001) can raise the overall and security-domain floors — independent auditors validate control effectiveness.',
    },
  ];

  const soc2Verified = hasVerifiedFramework(certifications, ['soc 2', 'soc2']);
  const iso27001Verified = hasVerifiedFramework(certifications, ['iso 27001', 'iso27001']);
  const pciVerified = hasVerifiedFramework(certifications, ['pci']);

  let certificationBoostApplied = false;
  let certificationMetSecurityBaseline = false;

  const adjustedDomains: Record<string, number> = { ...storedDomains };

  if (baseOverall == null && !soc2Verified && !iso27001Verified) {
    return {
      score100: null,
      score950: null,
      grade: '',
      band: 'unrated',
      domainScores: adjustedDomains,
      components,
      certificationMetSecurityBaseline: false,
      certificationBoostApplied: false,
    };
  }

  let overall = baseOverall ?? 55;

  if (soc2Verified) {
    certificationBoostApplied = true;
    certificationMetSecurityBaseline = true;
    adjustedDomains.security = Math.max(adjustedDomains.security ?? overall, 85);
    adjustedDomains.compliance = Math.max(adjustedDomains.compliance ?? overall, 88);
    overall = Math.max(overall, 82);
    components[2] = {
      ...components[2],
      score: 88,
      detail:
        'SOC 2 Type II verified — Trust Services Criteria (security, availability, confidentiality) attested by independent CPA. Security requirements presumed substantially met; score floor applied.',
    };
  }

  if (iso27001Verified) {
    certificationBoostApplied = true;
    certificationMetSecurityBaseline = true;
    adjustedDomains.security = Math.max(adjustedDomains.security ?? overall, 80);
    adjustedDomains.compliance = Math.max(adjustedDomains.compliance ?? overall, 90);
    overall = Math.max(overall, 80);
    const isoDetail =
      'ISO/IEC 27001 verified — certifiable ISMS with Annex A controls audited by accredited body. Security management baseline presumed met.';
    components[2] = {
      ...components[2],
      score: Math.max(components[2].score ?? 0, 90),
      detail: soc2Verified ? `${components[2].detail} ${isoDetail}` : isoDetail,
    };
  }

  if (soc2Verified && iso27001Verified) {
    overall = Math.max(overall, 88);
    adjustedDomains.security = Math.max(adjustedDomains.security ?? 0, 90);
  }

  if (pciVerified) {
    adjustedDomains.compliance = Math.max(adjustedDomains.compliance ?? overall, 85);
    certificationBoostApplied = true;
  }

  if (!soc2Verified && !iso27001Verified && certifications.length > 0) {
    components[2].detail =
      'Certifications found but not internet-verified (claimed or in progress) — no score floor applied until verified.';
    components[2].score = 50;
  }

  if (attackSurface != null && questionnaireAvg != null) {
    overall = Math.round(attackSurface * 0.4 + questionnaireAvg * 0.4 + overall * 0.2);
  } else if (attackSurface != null) {
    overall = Math.round(attackSurface * 0.55 + overall * 0.45);
  } else if (questionnaireAvg != null) {
    overall = Math.round(questionnaireAvg * 0.55 + overall * 0.45);
  }

  overall = Math.max(overall, soc2Verified ? 82 : 0, iso27001Verified ? 80 : 0);
  if (soc2Verified && iso27001Verified) overall = Math.max(overall, 88);

  const score950 = toUpguardRating(overall);
  const band = getRatingBand(score950);

  for (const key of DOMAIN_KEYS) {
    if (adjustedDomains[key] == null && overall != null) {
      adjustedDomains[key] = overall;
    }
  }

  return {
    score100: overall,
    score950,
    grade: scoreToGrade(overall),
    band,
    domainScores: adjustedDomains,
    components,
    certificationMetSecurityBaseline,
    certificationBoostApplied,
  };
}

export function domainRecordToScores(record: Record<string, number>) {
  return Object.entries(record).map(([domain, percentage]) => ({
    domain: domain as VendorRiskDomain,
    label: DOMAIN_LABELS[domain as VendorRiskDomain] ?? domain,
    score: percentage,
    maxScore: 100,
    percentage,
    findingsCount: 0,
  }));
}

export const RATING_BAND_LEGEND: Array<{ band: RatingBand; range: string; meaning: string }> = [
  { band: 'excellent', range: '801–950', meaning: 'Strong posture; suitable for critical-tier vendors with minimal gaps' },
  { band: 'good', range: '701–800', meaning: 'Green band — security baseline met; typical for SOC 2 / ISO 27001 certified vendors' },
  { band: 'fair', range: '601–700', meaning: 'Amber — gaps remain; enhanced monitoring recommended' },
  { band: 'poor', range: '501–600', meaning: 'Elevated risk; remediation plan required' },
  { band: 'critical', range: '0–500', meaning: 'High risk; consider restricting data access or replacing vendor' },
];
