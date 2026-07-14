import { calculateRiskScore, isHighOrCriticalScore } from './scoring';
import type { RiskImpact, RiskLikelihood, RiskStatus } from '../types';

export class RiskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RiskValidationError';
  }
}

export function resolvePresentRiskFields(
  status: RiskStatus,
  residualLikelihood: RiskLikelihood | null | undefined,
  residualImpact: RiskImpact | null | undefined
): { residualLikelihood: RiskLikelihood | null; residualImpact: RiskImpact | null } {
  if (status !== 'closed') {
    return {
      residualLikelihood: residualLikelihood ?? null,
      residualImpact: residualImpact ?? null,
    };
  }

  return {
    residualLikelihood: residualLikelihood ?? 'unlikely',
    residualImpact: residualImpact ?? 'minor',
  };
}

export function validateClosedRiskResidual(
  status: RiskStatus,
  residualLikelihood: RiskLikelihood | null | undefined,
  residualImpact: RiskImpact | null | undefined
): void {
  if (status !== 'closed') return;

  if (!residualLikelihood || !residualImpact) {
    throw new RiskValidationError(
      'Closed risks require residual likelihood and impact (medium or low severity only).'
    );
  }

  const score = calculateRiskScore(residualLikelihood, residualImpact);
  if (isHighOrCriticalScore(score)) {
    throw new RiskValidationError(
      'Closed risks cannot have high or critical residual severity. Reduce residual likelihood or impact to medium or low.'
    );
  }
}

/** Reviewer and approver names are mandatory on risk create/update. */
export function validateRiskReviewerApprover(
  reviewer?: string | null,
  approver?: string | null
): void {
  if (!reviewer?.trim()) {
    throw new RiskValidationError('Reviewer name is required');
  }
  if (!approver?.trim()) {
    throw new RiskValidationError('Approver name is required');
  }
}
