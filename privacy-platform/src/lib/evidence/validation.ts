import type { ControlEvidence, EvidenceContext } from '../types';

export function countEvidenceForContext(
  evidence: ControlEvidence[],
  context: EvidenceContext
): number {
  return evidence.filter((e) => e.context === context).length;
}

export function hasEvidenceForContext(
  evidence: ControlEvidence[],
  context: EvidenceContext
): boolean {
  return countEvidenceForContext(evidence, context) > 0;
}

export const EVIDENCE_REQUIRED_MESSAGES: Record<EvidenceContext, string> = {
  compliance:
    'Upload at least one compliance evidence file before saving the compliance plan.',
  remediation:
    'Upload at least one remediation evidence file before saving the remediation plan.',
  issues: 'Upload at least one issues evidence file before raising a new issue.',
};
