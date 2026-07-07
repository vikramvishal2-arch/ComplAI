import type { PrivacyRiskImpact, PrivacyRiskLikelihood } from '../types';

const LIKELIHOOD_WEIGHT: Record<PrivacyRiskLikelihood, number> = {
  rare: 1,
  unlikely: 2,
  possible: 3,
  likely: 4,
  almost_certain: 5,
};

const IMPACT_WEIGHT: Record<PrivacyRiskImpact, number> = {
  negligible: 1,
  minor: 2,
  moderate: 3,
  major: 4,
  critical: 5,
};

export function calculatePrivacyRiskScore(
  likelihood: PrivacyRiskLikelihood,
  impact: PrivacyRiskImpact
): number {
  return LIKELIHOOD_WEIGHT[likelihood] * IMPACT_WEIGHT[impact];
}

export function privacyRiskScoreLabel(score: number): string {
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

export function formatPrivacyRiskRating(
  likelihood: PrivacyRiskLikelihood,
  impact: PrivacyRiskImpact
): string {
  const score = calculatePrivacyRiskScore(likelihood, impact);
  return `${score} (${privacyRiskScoreLabel(score)})`;
}

export function resolveResidualRiskRating(
  inherentLikelihood: PrivacyRiskLikelihood,
  inherentImpact: PrivacyRiskImpact,
  residualLikelihood: PrivacyRiskLikelihood | null,
  residualImpact: PrivacyRiskImpact | null
): string {
  if (residualLikelihood && residualImpact) {
    return formatPrivacyRiskRating(residualLikelihood, residualImpact);
  }
  return formatPrivacyRiskRating(inherentLikelihood, inherentImpact);
}

export function riskRatingTone(rating: string): string {
  if (rating.includes('Critical')) return 'text-red-700 font-semibold';
  if (rating.includes('High')) return 'text-orange-700 font-medium';
  if (rating.includes('Medium')) return 'text-amber-700';
  return 'text-emerald-700';
}
