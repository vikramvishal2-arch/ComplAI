import type { ComplianceStatus, ComplianceMethod, RagStatus, EvidenceHealthStatus } from '../types';
import { evidenceHealthToRagPressure } from '../evidence/evidence-health';

export type { RagStatus };

export interface ControlRagInput {
  status: ComplianceStatus;
  complianceMethod: ComplianceMethod | null;
  owner: string;
  openIssueCount: number;
  openRiskCount: number;
  evidenceHealth?: EvidenceHealthStatus;
}

function worseRag(a: RagStatus, b: RagStatus): RagStatus {
  const rank = { green: 0, amber: 1, red: 2 };
  return rank[a] >= rank[b] ? a : b;
}

export function classifyControlRag(input: ControlRagInput): RagStatus {
  const { status, complianceMethod, owner, openIssueCount, openRiskCount } = input;
  const hasRegisterBlockers = openIssueCount > 0 || openRiskCount > 0;

  let rag: RagStatus = 'amber';

  if (status === 'not_applicable') {
    rag = 'green';
  } else if (status === 'not_started') {
    rag = 'red';
  } else if (hasRegisterBlockers) {
    if (status === 'audit_ready' || status === 'implemented') {
      rag = 'amber';
    } else {
      rag = 'red';
    }
  } else if (status === 'audit_ready' || status === 'implemented') {
    rag = 'green';
  } else if (status === 'needs_review') {
    rag = 'amber';
  } else if (status === 'planning' || status === 'implementing') {
    if (!complianceMethod || !owner.trim()) {
      rag = 'red';
    } else {
      rag = 'amber';
    }
  }

  if (input.evidenceHealth) {
    const pressure = evidenceHealthToRagPressure(input.evidenceHealth);
    if (pressure === 'red') {
      rag = worseRag(rag, 'amber');
      if (
        input.evidenceHealth === 'mismatched' ||
        (input.evidenceHealth === 'missing' &&
          (status === 'implemented' || status === 'audit_ready' || status === 'needs_review'))
      ) {
        rag = worseRag(rag, 'red');
      }
    } else if (pressure === 'amber') {
      rag = worseRag(rag, 'amber');
    }
  }

  return rag;
}

export function getGoGreenActions(input: ControlRagInput): string[] {
  const actions: string[] = [];
  const rag = classifyControlRag(input);

  if (input.evidenceHealth === 'missing') {
    actions.push('Upload supporting evidence for this control');
  } else if (input.evidenceHealth === 'unreviewed') {
    actions.push('Run AI evidence review on uploaded files and replace weak artifacts');
  } else if (input.evidenceHealth === 'weak') {
    actions.push('Replace or supplement weak evidence with stronger audit artifacts');
  } else if (input.evidenceHealth === 'mismatched') {
    actions.push('Remove mismatched uploads and attach evidence that matches this control');
  }

  if (input.openRiskCount > 0) {
    actions.push(
      `Close or accept ${input.openRiskCount} linked risk${input.openRiskCount === 1 ? '' : 's'} in the risk register`
    );
  }
  if (input.openIssueCount > 0) {
    actions.push(
      `Resolve ${input.openIssueCount} open issue${input.openIssueCount === 1 ? '' : 's'} on the control`
    );
  }

  switch (input.status) {
    case 'not_started':
      actions.push('Define compliance method and implementation approach');
      actions.push('Assign a control owner and target date');
      break;
    case 'planning':
      if (!input.complianceMethod) {
        actions.push('Select how the organization will comply (policy, technical control, etc.)');
      }
      if (!input.owner.trim()) {
        actions.push('Assign an accountable control owner');
      }
      actions.push('Document the implementation plan and evidence approach');
      break;
    case 'implementing':
      if (!input.complianceMethod) {
        actions.push('Confirm compliance method before audit');
      }
      actions.push('Complete remediation actions and upload compliance evidence');
      actions.push('Move to Implemented or Audit Ready when evidence is in place');
      break;
    case 'needs_review':
      actions.push('Complete management review and update status');
      break;
    case 'implemented':
      actions.push('Upload final evidence and mark Audit Ready');
      break;
    case 'audit_ready':
      if (rag !== 'green') {
        actions.push('Resolve evidence and register blockers to maintain Audit Ready status');
      }
      break;
    default:
      break;
  }

  return [...new Set(actions)];
}

export const RAG_LABELS: Record<RagStatus, string> = {
  green: 'Green — Audit ready / compliant',
  amber: 'Amber — In progress / evidence gaps',
  red: 'Red — Needs action',
};
