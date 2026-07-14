import type { RiskAssessmentStageKey } from '@/lib/data/risk-assessment-domains';
import {
  RISK_CATEGORY_OPTIONS,
  type RiskImpact,
  type RiskLikelihood,
  type RiskStatus,
  type RiskTreatment,
} from '@/lib/types';
import { calculateRiskScore, riskScoreLabel } from '@/lib/risk/scoring';

export type RiskSeverityBucket = 'critical' | 'high' | 'medium' | 'low';

/** Inline risk item fields aligned with the Risk register model (stored as JSON on AuditRiskDomain). */
export type DomainRiskItemCore = {
  controlId: string;
  title: string;
  description: string;
  category: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  residualLikelihood: RiskLikelihood | null;
  residualImpact: RiskImpact | null;
  treatment: RiskTreatment;
  status: RiskStatus;
  owner: string;
  dueDate: string | null;
  mitigationPlan: string;
};

export type DomainRiskItem = DomainRiskItemCore & {
  id: string;
  /** Assessment workflow stage (not on the register). */
  stage: RiskAssessmentStageKey;
};

const LIKELIHOODS: RiskLikelihood[] = [
  'rare',
  'unlikely',
  'possible',
  'likely',
  'almost_certain',
];

const IMPACTS: RiskImpact[] = ['negligible', 'minor', 'moderate', 'major', 'critical'];

const TREATMENTS: RiskTreatment[] = ['mitigate', 'accept', 'transfer', 'avoid'];

const STATUSES: RiskStatus[] = [
  'identified',
  'assessing',
  'in_review',
  'pending_approval',
  'treating',
  'accepted',
  'closed',
];

const STAGES: RiskAssessmentStageKey[] = ['identification', 'analysis', 'evaluation'];

const LEGACY_STATUS_MAP: Record<string, RiskStatus> = {
  open: 'identified',
  in_progress: 'assessing',
  closed: 'closed',
};

const SEVERITY_TO_IMPACT: Record<RiskSeverityBucket, RiskImpact> = {
  critical: 'critical',
  high: 'major',
  medium: 'moderate',
  low: 'minor',
};

export function severityBucketFromScore(score: number): RiskSeverityBucket {
  const label = riskScoreLabel(score).toLowerCase() as RiskSeverityBucket;
  return label;
}

export function domainRiskInherentScore(item: Pick<DomainRiskItem, 'likelihood' | 'impact'>): number {
  return calculateRiskScore(item.likelihood, item.impact);
}

export function domainRiskPresentScore(
  item: Pick<
    DomainRiskItem,
    'status' | 'likelihood' | 'impact' | 'residualLikelihood' | 'residualImpact'
  >
): number | null {
  if (item.residualLikelihood && item.residualImpact) {
    return calculateRiskScore(item.residualLikelihood, item.residualImpact);
  }
  if (item.status === 'closed') return null;
  return domainRiskInherentScore(item);
}

export function domainRiskSeverityBucket(
  item: Pick<DomainRiskItem, 'likelihood' | 'impact'>
): RiskSeverityBucket {
  return severityBucketFromScore(domainRiskInherentScore(item));
}

export function defaultDomainRiskItemFields(
  overrides: Partial<DomainRiskItemCore> = {}
): DomainRiskItemCore {
  return {
    controlId: '',
    title: 'New risk item',
    description: '',
    category: 'compliance',
    likelihood: 'possible',
    impact: 'moderate',
    residualLikelihood: null,
    residualImpact: null,
    treatment: 'mitigate',
    status: 'identified',
    owner: '',
    dueDate: null,
    mitigationPlan: '',
    ...overrides,
  };
}

export function createDomainRiskItem(
  overrides: Partial<DomainRiskItem> = {}
): DomainRiskItem {
  const { id, stage, ...coreOverrides } = overrides;
  return {
    id: id ?? `risk-${Date.now()}`,
    stage: stage ?? 'identification',
    ...defaultDomainRiskItemFields(coreOverrides),
    ...coreOverrides,
  };
}

function parseLikelihood(value: unknown, fallback: RiskLikelihood): RiskLikelihood {
  const s = String(value ?? '');
  return LIKELIHOODS.includes(s as RiskLikelihood) ? (s as RiskLikelihood) : fallback;
}

function parseImpact(value: unknown, fallback: RiskImpact): RiskImpact {
  const s = String(value ?? '');
  return IMPACTS.includes(s as RiskImpact) ? (s as RiskImpact) : fallback;
}

function parseTreatment(value: unknown): RiskTreatment {
  const s = String(value ?? 'mitigate');
  return TREATMENTS.includes(s as RiskTreatment) ? (s as RiskTreatment) : 'mitigate';
}

function parseRiskStatus(value: unknown): RiskStatus {
  const s = String(value ?? 'identified');
  if (STATUSES.includes(s as RiskStatus)) return s as RiskStatus;
  return LEGACY_STATUS_MAP[s] ?? 'identified';
}

function parseStage(value: unknown): RiskAssessmentStageKey {
  const s = String(value ?? 'identification');
  return STAGES.includes(s as RiskAssessmentStageKey)
    ? (s as RiskAssessmentStageKey)
    : 'identification';
}

function parseCategory(value: unknown): string {
  const s = String(value ?? 'compliance');
  return (RISK_CATEGORY_OPTIONS as readonly string[]).includes(s) ? s : 'compliance';
}

function parseLegacySeverity(value: unknown): RiskSeverityBucket | null {
  const s = String(value ?? '').toLowerCase();
  if (s === 'critical' || s === 'high' || s === 'medium' || s === 'low') {
    return s;
  }
  return null;
}

export function parseDomainRiskItem(raw: unknown): DomainRiskItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = String(o.id ?? '').trim();
  const title = String(o.title ?? '').trim();
  if (!id || !title) return null;

  const legacySeverity = parseLegacySeverity(o.severity);
  const likelihood = parseLikelihood(o.likelihood, 'possible');
  const impact = parseImpact(
    o.impact,
    legacySeverity ? SEVERITY_TO_IMPACT[legacySeverity] : 'moderate'
  );

  const residualLikelihoodRaw = o.residualLikelihood;
  const residualImpactRaw = o.residualImpact;

  return {
    id,
    title,
    controlId: String(o.controlId ?? ''),
    description: String(o.description ?? ''),
    category: parseCategory(o.category),
    likelihood,
    impact,
    residualLikelihood:
      residualLikelihoodRaw == null || residualLikelihoodRaw === ''
        ? null
        : parseLikelihood(residualLikelihoodRaw, 'unlikely'),
    residualImpact:
      residualImpactRaw == null || residualImpactRaw === ''
        ? null
        : parseImpact(residualImpactRaw, 'minor'),
    treatment: parseTreatment(o.treatment),
    status: parseRiskStatus(o.status),
    owner: String(o.owner ?? ''),
    dueDate: o.dueDate ? String(o.dueDate) : null,
    mitigationPlan: String(o.mitigationPlan ?? ''),
    stage: parseStage(o.stage),
  };
}

export function normalizeDomainRiskItem(item: DomainRiskItem): DomainRiskItem {
  return createDomainRiskItem(item);
}

export function countDomainRisksBySeverity(items: DomainRiskItem[]) {
  return {
    critical: items.filter((i) => domainRiskSeverityBucket(i) === 'critical').length,
    high: items.filter((i) => domainRiskSeverityBucket(i) === 'high').length,
    medium: items.filter((i) => domainRiskSeverityBucket(i) === 'medium').length,
    low: items.filter((i) => domainRiskSeverityBucket(i) === 'low').length,
  };
}
