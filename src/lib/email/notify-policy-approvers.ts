import 'server-only';
import { getOrganizationMembers } from '@/lib/db/member-repository';
import {
  parseApprovalMatrix,
  type PolicyApprovalStep,
} from '@/lib/policies/approval-matrix';
import {
  sendPolicyApprovalDecisionNotice,
  sendPolicyApprovalRequest,
} from './send-approval-email';

function nextPendingStep(matrix: PolicyApprovalStep[]): PolicyApprovalStep | null {
  const pending = matrix.filter((s) => s.status === 'pending' && s.required);
  return pending[0] ?? null;
}

async function memberIdByEmail(email: string): Promise<string | null> {
  const members = await getOrganizationMembers(true);
  const hit = members.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
  return hit?.id ?? null;
}

/** Email the assignee of the next open approval step. */
export async function notifyNextPolicyApprovers(input: {
  policyId: string;
  policyTitle: string;
  approvalMatrix: unknown;
  actorName: string;
}) {
  const matrix = parseApprovalMatrix(input.approvalMatrix);
  const step = nextPendingStep(matrix);
  if (!step?.assigneeEmail?.trim()) return [];

  const memberId = await memberIdByEmail(step.assigneeEmail);
  if (!memberId) {
    console.warn(
      `[approval-email] No organization member for ${step.assigneeEmail}; skipping request email`
    );
    return [];
  }

  const result = await sendPolicyApprovalRequest({
    policyTitle: input.policyTitle,
    policyId: input.policyId,
    stepLabel: step.role,
    recipientName: step.assigneeName || step.role,
    recipientEmail: step.assigneeEmail,
    memberId,
    actorName: input.actorName,
  });
  return [result];
}

/** Notify prior actors when a step is approved/rejected; then ping the next assignee if approved. */
export async function notifyAfterPolicyApprovalStep(input: {
  policyId: string;
  policyTitle: string;
  approvalMatrix: unknown;
  actorName: string;
  stepLabel: string;
  status: 'approved' | 'rejected' | 'pending';
  comments?: string;
}) {
  const matrix = parseApprovalMatrix(input.approvalMatrix);
  const results = [];

  const priorEmails = new Set<string>();
  for (const step of matrix) {
    if (step.status !== 'pending' && step.assigneeEmail?.trim()) {
      priorEmails.add(step.assigneeEmail.trim().toLowerCase());
    }
  }

  for (const email of priorEmails) {
    results.push(
      await sendPolicyApprovalDecisionNotice({
        policyTitle: input.policyTitle,
        policyId: input.policyId,
        stepLabel: input.stepLabel,
        status: input.status,
        recipientEmail: email,
        comments: input.comments,
      })
    );
  }

  if (input.status === 'approved') {
    const next = await notifyNextPolicyApprovers({
      policyId: input.policyId,
      policyTitle: input.policyTitle,
      approvalMatrix: input.approvalMatrix,
      actorName: input.actorName,
    });
    results.push(...next);
  }

  return results;
}
