import { isOpenRiskStatus } from '../risk/status';
import type { ControlIssue, Risk } from '../types';

export function isOpenIssueStatus(status: string): boolean {
  return status === 'open' || status === 'in_progress';
}

export function countOpenIssues(issues: ControlIssue[]): number {
  return issues.filter((issue) => isOpenIssueStatus(issue.status)).length;
}

export function countOpenRisks(risks: Risk[]): number {
  return risks.filter((risk) => isOpenRiskStatus(risk.status)).length;
}

export function getAuditReadyBlockers(issues: ControlIssue[], risks: Risk[]): string | null {
  const openIssueCount = countOpenIssues(issues);
  const openRiskCount = countOpenRisks(risks);

  if (openIssueCount === 0 && openRiskCount === 0) {
    return null;
  }

  const parts: string[] = [];
  if (openIssueCount > 0) {
    parts.push(`${openIssueCount} open issue${openIssueCount === 1 ? '' : 's'}`);
  }
  if (openRiskCount > 0) {
    parts.push(`${openRiskCount} open risk${openRiskCount === 1 ? '' : 's'}`);
  }

  return `Cannot mark as Audit Ready while ${parts.join(' and ')} remain open. Resolve or close all linked issues and risks first.`;
}

export class AuditReadyBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditReadyBlockedError';
  }
}
