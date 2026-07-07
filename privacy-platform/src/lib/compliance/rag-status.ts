import type { ComplianceStatus, ComplianceMethod, RagStatus } from '../types';

export interface ControlRagInput {
  status: ComplianceStatus;
  complianceMethod: ComplianceMethod | null;
  owner: string;
  openIssueCount: number;
}

export function classifyControlRag(input: ControlRagInput): RagStatus {
  const { status, complianceMethod, owner, openIssueCount } = input;

  if (status === 'not_applicable') return 'green';
  if (status === 'not_started') return 'red';

  if (openIssueCount > 0) {
    if (status === 'audit_ready' || status === 'implemented') return 'amber';
    return 'red';
  }

  if (status === 'audit_ready' || status === 'implemented') return 'green';
  if (status === 'needs_review') return 'amber';
  if (status === 'planning' || status === 'implementing') {
    if (!complianceMethod || !owner.trim()) return 'red';
    return 'amber';
  }

  return 'amber';
}

export function getGoGreenActions(input: ControlRagInput): string[] {
  const actions: string[] = [];

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
      if (!input.complianceMethod) actions.push('Select a compliance method');
      if (!input.owner.trim()) actions.push('Assign an accountable control owner');
      actions.push('Document the implementation plan and upload evidence');
      break;
    case 'implementing':
      actions.push('Complete remediation actions and upload compliance evidence');
      actions.push('Move to Implemented or Audit Ready when evidence is in place');
      break;
    case 'needs_review':
      actions.push('Complete management review and update status');
      break;
    case 'implemented':
      actions.push('Upload final evidence and mark Audit Ready');
      break;
    default:
      break;
  }

  return [...new Set(actions)];
}
