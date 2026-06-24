import type { RiskImpact, RiskLikelihood } from '../types';

const LIKELIHOOD_WEIGHT: Record<RiskLikelihood, number> = {
  rare: 1,
  unlikely: 2,
  possible: 3,
  likely: 4,
  almost_certain: 5,
};

const IMPACT_WEIGHT: Record<RiskImpact, number> = {
  negligible: 1,
  minor: 2,
  moderate: 3,
  major: 4,
  critical: 5,
};

export function calculateRiskScore(
  likelihood: RiskLikelihood,
  impact: RiskImpact
): number {
  return LIKELIHOOD_WEIGHT[likelihood] * IMPACT_WEIGHT[impact];
}

export function riskScoreLabel(score: number): string {
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

export function isHighOrCriticalScore(score: number): boolean {
  return score >= 12;
}

export function formatRiskScoreDisplay(score: number): string {
  return `${score} (${riskScoreLabel(score)})`;
}

export function parseRiskScoreLabel(value: string | null | undefined): string | null {
  if (!value || value === '—') return null;
  const match = value.match(/\((\w+)\)\s*$/);
  return match?.[1] ?? null;
}

export function parseRiskScoreValue(value: string | null | undefined): number | null {
  if (!value || value === '—') return null;
  const match = value.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function resolvePresentRiskDisplay(entry: {
  status: string;
  inherentRisk?: string | null;
  presentRisk?: string | null;
}): string {
  if (entry.presentRisk && entry.presentRisk !== '—') return entry.presentRisk;
  if (entry.status === 'closed') return '—';
  return entry.inherentRisk ?? '—';
}

export function isHighOrCriticalDisplay(value: string | null | undefined): boolean {
  const label = parseRiskScoreLabel(value);
  return label === 'High' || label === 'Critical';
}

export function getPresentRiskScore(risk: {
  status: string;
  riskScore: number;
  residualRiskScore: number | null;
  residualLikelihood?: RiskLikelihood | null;
  residualImpact?: RiskImpact | null;
}): number | null {
  if (risk.residualLikelihood && risk.residualImpact) {
    return calculateRiskScore(risk.residualLikelihood, risk.residualImpact);
  }

  if (risk.residualRiskScore != null) return risk.residualRiskScore;

  if (risk.status === 'closed') return null;

  return risk.riskScore;
}

export function formatRiskSeverityDisplay(risk: {
  status: string;
  riskScore: number;
  residualRiskScore: number | null;
  residualLikelihood?: RiskLikelihood | null;
  residualImpact?: RiskImpact | null;
}): string {
  const present = getPresentRiskScore(risk);
  if (present != null) return formatRiskScoreDisplay(present);
  return '—';
}
