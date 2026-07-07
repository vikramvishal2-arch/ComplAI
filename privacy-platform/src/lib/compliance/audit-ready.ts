import type { ControlIssue } from '../types';

export function isOpenIssueStatus(status: string): boolean {
  return status === 'open' || status === 'in_progress';
}

export function countOpenIssues(issues: ControlIssue[]): number {
  return issues.filter((issue) => isOpenIssueStatus(issue.status)).length;
}

export function getAuditReadyBlockers(issues: ControlIssue[]): string | null {
  const openIssueCount = countOpenIssues(issues);
  if (openIssueCount === 0) return null;
  return `Cannot mark as Audit Ready while ${openIssueCount} open issue${openIssueCount === 1 ? '' : 's'} remain. Resolve or close all issues first.`;
}

export class AuditReadyBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditReadyBlockedError';
  }
}
