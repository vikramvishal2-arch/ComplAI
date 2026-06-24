import type { PolicyApprovalStep, PolicyApprovalStatus, PolicyDocumentContext } from './approval-matrix';
import {
  isApprovalStepComplete,
  approvalMatrixProgress,
  isAuthorStep,
  isAuthorVersionPrepared,
  hasPolicyDocumentVersion,
  markAuthorVersionPrepared,
  AUTHOR_STEP_ID,
} from './approval-matrix';

export const APPROVAL_STEP_ORDER = [
  AUTHOR_STEP_ID,
  'reviewer',
  'isms-owner',
  'legal',
  'executive',
] as const;

export interface ApprovalMemberRef {
  id: string;
  name: string;
  email: string;
  title: string;
  approvalRoles: string[];
}

export interface PolicyApprovalSummary {
  id: string;
  title: string;
  status: string;
  version: string;
  categoryId: string;
  isoReference: string;
  updatedAt: string;
  content?: string;
  storagePath?: string | null;
  originalFileName?: string | null;
  approvalMatrix: PolicyApprovalStep[];
}

export type ApprovalInboxActionType = 'prepare' | 'review';

export interface ApprovalInboxItem {
  policyId: string;
  title: string;
  status: string;
  version: string;
  categoryId: string;
  isoReference: string;
  updatedAt: string;
  stepId: string;
  stepRole: string;
  stepStatus: PolicyApprovalStatus;
  actionType: ApprovalInboxActionType;
  actionable: boolean;
  blockedReason: string | null;
  hasDocument: boolean;
  progress: { completed: number; required: number; percent: number };
}

export function memberMatchesStep(
  step: PolicyApprovalStep,
  member: Pick<ApprovalMemberRef, 'name' | 'email'>
): boolean {
  if (member.email && step.assigneeEmail) {
    return step.assigneeEmail.toLowerCase() === member.email.toLowerCase();
  }
  if (member.name && step.assigneeName) {
    return step.assigneeName.toLowerCase() === member.name.toLowerCase();
  }
  return false;
}

export function getStepsForMember(
  matrix: PolicyApprovalStep[],
  member: ApprovalMemberRef
): PolicyApprovalStep[] {
  return matrix.filter((step) => memberMatchesStep(step, member));
}

function policyDocumentContext(policy: PolicyApprovalSummary): PolicyDocumentContext {
  return {
    content: policy.content,
    storagePath: policy.storagePath,
    originalFileName: policy.originalFileName,
  };
}

function priorRequiredStepsComplete(
  matrix: PolicyApprovalStep[],
  stepId: string,
  doc?: PolicyDocumentContext
): { ok: boolean; reason: string | null } {
  const stepIndex = APPROVAL_STEP_ORDER.indexOf(stepId as (typeof APPROVAL_STEP_ORDER)[number]);
  if (stepIndex <= 0) return { ok: true, reason: null };

  for (let i = 0; i < stepIndex; i++) {
    const priorId = APPROVAL_STEP_ORDER[i];
    const prior = matrix.find((s) => s.id === priorId);
    if (!prior || !prior.required) continue;
    if (!isApprovalStepComplete(prior, doc)) {
      const label = isAuthorStep(prior)
        ? `${prior.role} to prepare version`
        : prior.role;
      return {
        ok: false,
        reason: `Waiting for ${label} (${prior.assigneeName || 'unassigned'})`,
      };
    }
  }
  return { ok: true, reason: null };
}

export function isReviewStepActionable(
  matrix: PolicyApprovalStep[],
  step: PolicyApprovalStep,
  doc?: PolicyDocumentContext
): { actionable: boolean; reason: string | null } {
  if (isAuthorStep(step)) {
    return { actionable: false, reason: 'Author prepares the version — no approve/reject' };
  }
  if (step.status !== 'pending') {
    return { actionable: false, reason: `Already ${step.status}` };
  }
  if (!step.assigneeName.trim()) {
    return { actionable: false, reason: 'No assignee on this step' };
  }
  const prior = priorRequiredStepsComplete(matrix, step.id, doc);
  if (!prior.ok) return { actionable: false, reason: prior.reason };
  return { actionable: true, reason: null };
}

export function isAuthorPrepareActionable(
  matrix: PolicyApprovalStep[],
  step: PolicyApprovalStep,
  doc: PolicyDocumentContext
): { actionable: boolean; reason: string | null } {
  if (!isAuthorStep(step)) {
    return { actionable: false, reason: 'Not an author step' };
  }
  if (isAuthorVersionPrepared(step, doc)) {
    return { actionable: false, reason: 'Version already prepared' };
  }
  if (!step.assigneeName.trim()) {
    return { actionable: false, reason: 'No author assigned' };
  }
  if (!hasPolicyDocumentVersion(doc)) {
    return {
      actionable: false,
      reason: 'Add document content or upload a file before submitting the version',
    };
  }
  return { actionable: true, reason: null };
}

export function isStepActionable(
  matrix: PolicyApprovalStep[],
  step: PolicyApprovalStep,
  doc?: PolicyDocumentContext
): { actionable: boolean; reason: string | null } {
  if (isAuthorStep(step)) {
    return isAuthorPrepareActionable(matrix, step, doc ?? {});
  }
  return isReviewStepActionable(matrix, step, doc);
}

export function isStepCompleteForInbox(
  step: PolicyApprovalStep,
  doc?: PolicyDocumentContext
): boolean {
  if (isAuthorStep(step)) {
    return isAuthorVersionPrepared(step, doc);
  }
  return step.status === 'approved' || step.status === 'rejected';
}

export function buildApprovalInbox(
  policies: PolicyApprovalSummary[],
  member: ApprovalMemberRef,
  filter: 'pending' | 'completed' | 'all' = 'pending'
): ApprovalInboxItem[] {
  const items: ApprovalInboxItem[] = [];

  for (const policy of policies) {
    if (policy.status === 'archived') continue;
    const doc = policyDocumentContext(policy);

    for (const step of getStepsForMember(policy.approvalMatrix, member)) {
      const { actionable, reason } = isStepActionable(policy.approvalMatrix, step, doc);
      const isComplete = isStepCompleteForInbox(step, doc);
      const actionType: ApprovalInboxActionType = isAuthorStep(step) ? 'prepare' : 'review';

      if (filter === 'pending' && isComplete) continue;
      if (filter === 'completed' && !isComplete) continue;

      items.push({
        policyId: policy.id,
        title: policy.title,
        status: policy.status,
        version: policy.version,
        categoryId: policy.categoryId,
        isoReference: policy.isoReference,
        updatedAt: policy.updatedAt,
        stepId: step.id,
        stepRole: step.role,
        stepStatus: step.status,
        actionType,
        actionable,
        blockedReason: reason,
        hasDocument: hasPolicyDocumentVersion(doc),
        progress: approvalMatrixProgress(policy.approvalMatrix, doc),
      });
    }
  }

  return items.sort((a, b) => {
    if (a.actionable !== b.actionable) return a.actionable ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function updateMemberApprovalStep(
  matrix: PolicyApprovalStep[],
  member: ApprovalMemberRef,
  stepId: string,
  input: { status: PolicyApprovalStatus; comments?: string; decisionDate?: string | null },
  doc?: PolicyDocumentContext
): PolicyApprovalStep[] {
  const step = matrix.find((s) => s.id === stepId);
  if (!step) throw new Error('Approval step not found');
  if (isAuthorStep(step)) {
    throw new Error('Author prepares the document version — use prepare version instead of approve/reject');
  }
  if (!memberMatchesStep(step, member)) {
    throw new Error('You are not assigned to this approval step');
  }
  const { actionable, reason } = isReviewStepActionable(matrix, step, doc);
  if (!actionable && input.status !== 'pending') {
    throw new Error(reason ?? 'This step is not ready for action');
  }

  return matrix.map((s) => {
    if (s.id !== stepId) return s;
    const decisionDate =
      input.status === 'approved' || input.status === 'rejected'
        ? input.decisionDate ?? new Date().toISOString().slice(0, 10)
        : null;
    return {
      ...s,
      status: input.status,
      comments: input.comments ?? s.comments,
      decisionDate,
    };
  });
}

export function submitAuthorVersionPrepared(
  matrix: PolicyApprovalStep[],
  member: ApprovalMemberRef,
  doc: PolicyDocumentContext,
  comments?: string
): PolicyApprovalStep[] {
  const step = matrix.find((s) => s.id === AUTHOR_STEP_ID);
  if (!step) throw new Error('Author step not found');
  if (!memberMatchesStep(step, member)) {
    throw new Error('You are not assigned as the author for this document');
  }
  const { actionable, reason } = isAuthorPrepareActionable(matrix, step, doc);
  if (!actionable) {
    throw new Error(reason ?? 'Version cannot be prepared yet');
  }
  return matrix.map((s) =>
    s.id === AUTHOR_STEP_ID ? markAuthorVersionPrepared(s, comments) : s
  );
}
