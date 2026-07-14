import type {
  ComplianceStatus,
  ControlEvidence,
  ControlEvidenceHealth,
  EvidenceHealthStatus,
} from '@/lib/types';

const STATUSES_EXPECTING_EVIDENCE: ComplianceStatus[] = [
  'implementing',
  'implemented',
  'needs_review',
  'audit_ready',
];

export function controlExpectsEvidence(status: ComplianceStatus): boolean {
  return STATUSES_EXPECTING_EVIDENCE.includes(status);
}

export function assessControlEvidenceHealth(input: {
  status: ComplianceStatus;
  evidence: Pick<
    ControlEvidence,
    | 'validationVerdict'
    | 'validationScore'
    | 'validationSummary'
    | 'validationAction'
    | 'validatedAt'
  >[];
}): ControlEvidenceHealth {
  const fileCount = input.evidence.length;
  const expects = controlExpectsEvidence(input.status);

  if (input.status === 'not_applicable') {
    return {
      status: 'not_required',
      fileCount,
      reviewedCount: 0,
      label: 'N/A',
      detail: 'Evidence not required for not-applicable controls.',
    };
  }

  if (fileCount === 0) {
    if (!expects) {
      return {
        status: 'missing',
        fileCount: 0,
        reviewedCount: 0,
        label: 'No evidence',
        detail: 'No evidence uploaded yet for this control.',
      };
    }
    return {
      status: 'missing',
      fileCount: 0,
      reviewedCount: 0,
      label: 'Missing evidence',
      detail: 'Status expects supporting evidence, but none has been uploaded.',
    };
  }

  const reviewed = input.evidence.filter((e) => e.validationVerdict);
  const reviewedCount = reviewed.length;

  if (reviewedCount === 0) {
    return {
      status: 'unreviewed',
      fileCount,
      reviewedCount: 0,
      label: 'Not assessed',
      detail: `${fileCount} file${fileCount === 1 ? '' : 's'} uploaded but evidence quality has not been reviewed.`,
    };
  }

  const hasMismatch = reviewed.some((e) => e.validationVerdict === 'mismatched');
  if (hasMismatch) {
    return {
      status: 'mismatched',
      fileCount,
      reviewedCount,
      label: 'Wrong evidence',
      detail: 'At least one uploaded file was assessed as mismatched for this control.',
    };
  }

  const hasWeak = reviewed.some(
    (e) => e.validationVerdict === 'weak' || e.validationAction === 'replace'
  );
  if (hasWeak) {
    return {
      status: 'weak',
      fileCount,
      reviewedCount,
      label: 'Weak evidence',
      detail: 'Uploaded evidence was assessed as weak or needing replacement/supplement.',
    };
  }

  const allReviewedOk =
    reviewedCount === fileCount &&
    reviewed.every(
      (e) => e.validationVerdict === 'strong' || e.validationVerdict === 'acceptable'
    );

  if (allReviewedOk || reviewed.every((e) => e.validationVerdict === 'strong' || e.validationVerdict === 'acceptable')) {
    return {
      status: 'ok',
      fileCount,
      reviewedCount,
      label: 'Evidence OK',
      detail: 'Uploaded evidence passed review for this control.',
    };
  }

  return {
    status: 'unreviewed',
    fileCount,
    reviewedCount,
    label: 'Partially assessed',
    detail: `${reviewedCount}/${fileCount} files reviewed — complete AI evidence review for remaining uploads.`,
  };
}

export function evidenceHealthToRagPressure(
  health: EvidenceHealthStatus
): 'none' | 'amber' | 'red' {
  switch (health) {
    case 'mismatched':
    case 'missing':
      return 'red';
    case 'weak':
    case 'unreviewed':
      return 'amber';
    default:
      return 'none';
  }
}
