import type { ComplianceStatus, ComplianceMethod, RagStatus } from '../types';

export type { RagStatus };

export interface ControlRagInput {
  status: ComplianceStatus;
  complianceMethod: ComplianceMethod | null;
  owner: string;
  openIssueCount: number;
  openRiskCount: number;
}

export function classifyControlRag(input: ControlRagInput): RagStatus {
  const { status, complianceMethod, owner, openIssueCount, openRiskCount } = input;
  const hasRegisterBlockers = openIssueCount > 0 || openRiskCount > 0;

  if (status === 'not_applicable') {
    return 'green';
  }

  if (status === 'not_started') {
    return 'red';
  }

  if (hasRegisterBlockers) {
    if (status === 'audit_ready' || status === 'implemented') {
      return 'amber';
    }
    if (status === 'needs_review' || status === 'implementing' || status === 'planning') {
      return 'red';
    }
    return 'red';
  }

  if (status === 'audit_ready' || status === 'implemented') {
    return 'green';
  }

  if (status === 'needs_review') {
    return 'amber';
  }

  if (status === 'planning' || status === 'implementing') {
    if (!complianceMethod || !owner.trim()) {
      return 'red';
    }
    return 'amber';
  }

  return 'amber';
}

export function getGoGreenActions(input: ControlRagInput): string[] {
  const actions: string[] = [];
  const rag = classifyControlRag(input);

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
        actions.push('Resolve register blockers to maintain Audit Ready status');
      }
      break;
    default:
      break;
  }

  return [...new Set(actions)];
}

export const RAG_LABELS: Record<RagStatus, string> = {
  green: 'Green — Audit ready / compliant',
  amber: 'Amber — In progress',
  red: 'Red — Needs action',
};
