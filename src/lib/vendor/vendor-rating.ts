import { randomUUID } from 'crypto';
import type { VendorQuestion, VendorResponse, ChecklistResponseStatus } from './assessment';
import type {
  VendorDomainScore,
  VendorFinding,
  VendorFindingSeverity,
  VendorRemediationItem,
  VendorRiskDomain,
} from './vendor-assessment-types';
import { DOMAIN_LABELS } from './vendor-assessment-types';
import { categoryToDomain } from './vendor-assessment-templates';

const SEVERITY_FROM_WEIGHT = (weight: number, status: ChecklistResponseStatus | undefined): VendorFindingSeverity => {
  if (status === 'partial') return weight >= 9 ? 'high' : 'medium';
  if (status === 'no' || !status) return weight >= 9 ? 'critical' : weight >= 7 ? 'high' : 'medium';
  return 'low';
};

export function scoreToGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/** UpGuard publishes 0–950; map internal 0–100 score to comparable scale */
export function toUpguardScale(score: number): number {
  return Math.round(Math.max(0, Math.min(950, score * 9.5)));
}

export function computeDomainScores(
  questions: VendorQuestion[],
  responses: VendorResponse[]
): VendorDomainScore[] {
  const byId = Object.fromEntries(responses.map((r) => [r.questionId, r]));
  const buckets = new Map<
    VendorRiskDomain,
    { earned: number; total: number; findings: number }
  >();

  for (const q of questions) {
    const domain = categoryToDomain(q.category);
    const r = byId[q.id];
    const status = r?.status;
    if (status === 'na') continue;

    const bucket = buckets.get(domain) ?? { earned: 0, total: 0, findings: 0 };
    bucket.total += q.weight;
    if (status === 'yes') bucket.earned += q.weight;
    else if (status === 'partial') bucket.earned += q.weight * 0.5;
    if (!status || status === 'no' || status === 'partial') bucket.findings += 1;
    buckets.set(domain, bucket);
  }

  return (['security', 'privacy', 'compliance', 'resilience', 'operations'] as VendorRiskDomain[])
    .filter((d) => buckets.has(d))
    .map((domain) => {
      const b = buckets.get(domain)!;
      const percentage = b.total > 0 ? Math.round((b.earned / b.total) * 100) : 0;
      return {
        domain,
        label: DOMAIN_LABELS[domain],
        score: Math.round(b.earned),
        maxScore: b.total,
        percentage,
        findingsCount: b.findings,
      };
    });
}

export function generateFindingsFromResponses(
  questions: VendorQuestion[],
  responses: VendorResponse[]
): VendorFinding[] {
  const byId = Object.fromEntries(responses.map((r) => [r.questionId, r]));
  const now = new Date().toISOString();
  const findings: VendorFinding[] = [];

  for (const q of questions) {
    const r = byId[q.id];
    const status = r?.status;
    if (!status || status === 'yes' || status === 'na') continue;

    const severity = SEVERITY_FROM_WEIGHT(q.weight, status);
    findings.push({
      id: randomUUID(),
      questionId: q.id,
      domain: categoryToDomain(q.category),
      title: q.checklistLabel ?? q.question.slice(0, 80),
      description: r?.answer?.trim() || `Gap identified for: ${q.question}`,
      recommendation: q.evidenceGuidance ?? `Remediate: ${q.question}`,
      severity,
      status: 'open',
      controlIds: q.controlIds ?? [],
      controlRefs: q.controlRefs ?? [],
      detectedAt: now,
    });
  }

  return findings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

export function generateRemediationItems(findings: VendorFinding[]): VendorRemediationItem[] {
  const now = new Date().toISOString();
  const due = new Date();
  due.setDate(due.getDate() + 30);

  return findings
    .filter((f) => f.status === 'open' || f.status === 'remediation_requested')
    .map((f) => ({
      id: randomUUID(),
      findingId: f.id,
      title: `Remediate: ${f.title}`,
      description: f.recommendation,
      severity: f.severity,
      status: 'pending' as const,
      owner: '',
      dueDate: due.toISOString().slice(0, 10),
      requestedAt: now,
      notes: '',
    }));
}

export function aggregateAssessmentScore(domainScores: VendorDomainScore[]): number {
  if (domainScores.length === 0) return 0;
  const total = domainScores.reduce((s, d) => s + d.percentage, 0);
  return Math.round(total / domainScores.length);
}

function severityRank(s: VendorFindingSeverity): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[s];
}

export function domainScoresToRecord(scores: VendorDomainScore[]): Record<string, number> {
  return Object.fromEntries(scores.map((d) => [d.domain, d.percentage]));
}
