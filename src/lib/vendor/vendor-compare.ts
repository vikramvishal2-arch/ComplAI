import type { VendorPostureSummary } from './vendor-posture';
import type { VendorFinding, VendorRemediationItem } from './vendor-assessment-types';

export type VendorCompareSide = {
  id: string;
  name: string;
  primaryDomain: string;
  tier: string;
  dataAccess: string;
  industry: string;
  status: string;
  inherentRiskScore: number;
  lastAssessedAt: string | null;
  assessmentCompletedAt: string | null;
  assessmentTemplateName: string | null;
  assessmentSummary: string;
  openFindingsCount: number;
  openRemediationCount: number;
  findingsBySeverity: Record<'critical' | 'high' | 'medium' | 'low', number>;
  posture: VendorPostureSummary;
};

export type VendorCompareRecommendation = {
  preferredVendorId: string | null;
  preferredVendorName: string | null;
  confidence: 'clear' | 'narrow' | 'tie';
  headline: string;
  rationale: string[];
  scoreDelta950: number | null;
};

function severityCounts(findings: VendorFinding[]) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    if (f.status === 'resolved' || f.status === 'accepted') continue;
    if (f.severity in counts) counts[f.severity as keyof typeof counts] += 1;
  }
  return counts;
}

export function buildCompareSide(input: {
  vendor: {
    id: string;
    name: string;
    primaryDomain: string;
    tier: string;
    dataAccess: string;
    industry: string;
    status: string;
    inherentRiskScore: number;
    lastAssessedAt: string | null;
  };
  posture: VendorPostureSummary;
  openFindingsCount: number;
  openRemediationCount: number;
  latestCompleted: {
    completedAt: string | null;
    templateName: string;
    aiSummary: string;
    findings: unknown;
  } | null;
  findings: VendorFinding[];
}): VendorCompareSide {
  return {
    id: input.vendor.id,
    name: input.vendor.name,
    primaryDomain: input.vendor.primaryDomain,
    tier: input.vendor.tier,
    dataAccess: input.vendor.dataAccess,
    industry: input.vendor.industry,
    status: input.vendor.status,
    inherentRiskScore: input.vendor.inherentRiskScore,
    lastAssessedAt: input.vendor.lastAssessedAt,
    assessmentCompletedAt: input.latestCompleted?.completedAt ?? null,
    assessmentTemplateName: input.latestCompleted?.templateName ?? null,
    assessmentSummary:
      input.latestCompleted?.aiSummary?.trim() || input.posture.summary || '',
    openFindingsCount: input.openFindingsCount,
    openRemediationCount: input.openRemediationCount,
    findingsBySeverity: severityCounts(input.findings),
    posture: input.posture,
  };
}

export function recommendVendorForLeadership(
  a: VendorCompareSide,
  b: VendorCompareSide
): VendorCompareRecommendation {
  const scoreA = a.posture.score950;
  const scoreB = b.posture.score950;
  const rationale: string[] = [];

  if (scoreA == null || scoreB == null) {
    return {
      preferredVendorId: null,
      preferredVendorName: null,
      confidence: 'tie',
      headline: 'Insufficient scored posture to recommend a preferred vendor',
      rationale: ['Both vendors need a completed assessment with a security rating.'],
      scoreDelta950: null,
    };
  }

  const delta = scoreA - scoreB;
  const absDelta = Math.abs(delta);
  const preferred = delta >= 0 ? a : b;
  const other = delta >= 0 ? b : a;
  const confidence: VendorCompareRecommendation['confidence'] =
    absDelta >= 80 ? 'clear' : absDelta >= 25 ? 'narrow' : 'tie';

  if (absDelta === 0) {
    rationale.push('Security ratings are equal on the 0–950 scale.');
  } else {
    rationale.push(
      `${preferred.name} scores ${preferred.posture.score950}/950 vs ${other.name} at ${other.posture.score950}/950 (${absDelta} pt gap).`
    );
  }

  const findingPressure = (side: VendorCompareSide) =>
    side.findingsBySeverity.critical * 4 +
    side.findingsBySeverity.high * 3 +
    side.findingsBySeverity.medium * 2 +
    side.findingsBySeverity.low;

  const pressureA = findingPressure(a);
  const pressureB = findingPressure(b);
  if (pressureA !== pressureB) {
    const lower = pressureA < pressureB ? a : b;
    rationale.push(
      `${lower.name} has lighter open-finding pressure (critical/high weighted).`
    );
  }

  const failA = a.posture.externalSurface.fail;
  const failB = b.posture.externalSurface.fail;
  if (failA !== failB) {
    const better = failA < failB ? a : b;
    rationale.push(
      `${better.name} shows fewer failing external attack-surface checks (${Math.min(failA, failB)} vs ${Math.max(failA, failB)}).`
    );
  }

  const verifiedA = a.posture.certifications.filter((c) => c.status === 'verified').length;
  const verifiedB = b.posture.certifications.filter((c) => c.status === 'verified').length;
  if (verifiedA !== verifiedB) {
    const better = verifiedA > verifiedB ? a : b;
    rationale.push(
      `${better.name} has more verified certifications (${Math.max(verifiedA, verifiedB)} vs ${Math.min(verifiedA, verifiedB)}).`
    );
  }

  const tierRank: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  const tierA = tierRank[a.tier] ?? 2;
  const tierB = tierRank[b.tier] ?? 2;
  if (tierA !== tierB) {
    rationale.push(
      `Business criticality differs: ${a.name} is ${a.tier} tier, ${b.name} is ${b.tier} tier — weigh residual risk against dependency.`
    );
  }

  if (confidence === 'tie') {
    return {
      preferredVendorId: null,
      preferredVendorName: null,
      confidence,
      headline: 'Risk portfolios are close — decide on business fit and residual findings',
      rationale,
      scoreDelta950: absDelta,
    };
  }

  return {
    preferredVendorId: preferred.id,
    preferredVendorName: preferred.name,
    confidence,
    headline:
      confidence === 'clear'
        ? `${preferred.name} presents the stronger risk posture for leadership selection`
        : `${preferred.name} edges ahead — review residual findings before final decision`,
    rationale,
    scoreDelta950: absDelta,
  };
}

export function countOpenRemediation(items: VendorRemediationItem[]): number {
  return items.filter((r) => r.status !== 'completed' && r.status !== 'waived').length;
}
