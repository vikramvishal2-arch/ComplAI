export type PolicyApprovalStatus = 'pending' | 'approved' | 'rejected';

export const AUTHOR_STEP_ID = 'author';

export interface PolicyDocumentContext {
  content?: string;
  storagePath?: string | null;
  originalFileName?: string | null;
}

export interface PolicyApprovalStep {
  id: string;
  role: string;
  description: string;
  required: boolean;
  assigneeName: string;
  assigneeTitle: string;
  assigneeEmail: string;
  status: PolicyApprovalStatus;
  decisionDate: string | null;
  comments: string;
}

export const DEFAULT_POLICY_APPROVAL_MATRIX: PolicyApprovalStep[] = [
  {
    id: 'author',
    role: 'Author',
    description: 'Prepares and submits the document version for review',
    required: true,
    assigneeName: '',
    assigneeTitle: '',
    assigneeEmail: '',
    status: 'pending',
    decisionDate: null,
    comments: '',
  },
  {
    id: 'reviewer',
    role: 'Reviewer',
    description: 'Reviews content for accuracy and completeness',
    required: true,
    assigneeName: '',
    assigneeTitle: '',
    assigneeEmail: '',
    status: 'pending',
    decisionDate: null,
    comments: '',
  },
  {
    id: 'isms-owner',
    role: 'ISMS Owner / CISO',
    description: 'Confirms alignment with the ISMS and risk treatment',
    required: true,
    assigneeName: '',
    assigneeTitle: '',
    assigneeEmail: '',
    status: 'pending',
    decisionDate: null,
    comments: '',
  },
  {
    id: 'legal',
    role: 'Legal & Compliance Reviewer',
    description: 'Reviews regulatory and contractual obligations',
    required: false,
    assigneeName: '',
    assigneeTitle: '',
    assigneeEmail: '',
    status: 'pending',
    decisionDate: null,
    comments: '',
  },
  {
    id: 'executive',
    role: 'Executive Approver',
    description: 'Management approval for publication and enforcement',
    required: true,
    assigneeName: '',
    assigneeTitle: '',
    assigneeEmail: '',
    status: 'pending',
    decisionDate: null,
    comments: '',
  },
];

export interface ApprovalMemberPick {
  name: string;
  email: string;
  title: string;
  approvalRoles: string[];
}

export function getDefaultApprovalMatrix(
  categoryId?: string,
  members: ApprovalMemberPick[] = []
): PolicyApprovalStep[] {
  const matrix = DEFAULT_POLICY_APPROVAL_MATRIX.map((step) => ({ ...step }));
  if (categoryId === 'privacy-legal') {
    const legal = matrix.find((s) => s.id === 'legal');
    if (legal) legal.required = true;
  }

  for (const step of matrix) {
    const match = members.find((m) => m.approvalRoles.includes(step.id));
    if (match) {
      step.assigneeName = match.name;
      step.assigneeTitle = match.title;
      step.assigneeEmail = match.email;
    }
  }

  return matrix;
}

export function parseApprovalMatrix(value: unknown): PolicyApprovalStep[] {
  if (!Array.isArray(value) || value.length === 0) {
    return getDefaultApprovalMatrix();
  }
  return value.map((row) => {
    const r = row as Partial<PolicyApprovalStep>;
    return {
      id: String(r.id ?? ''),
      role: String(r.role ?? ''),
      description: String(r.description ?? ''),
      required: Boolean(r.required),
      assigneeName: String(r.assigneeName ?? ''),
      assigneeTitle: String(r.assigneeTitle ?? ''),
      assigneeEmail: String(r.assigneeEmail ?? ''),
      status: (r.status as PolicyApprovalStatus) ?? 'pending',
      decisionDate: r.decisionDate ? String(r.decisionDate) : null,
      comments: String(r.comments ?? ''),
    };
  });
}

export function isAuthorStep(step: Pick<PolicyApprovalStep, 'id'>): boolean {
  return step.id === AUTHOR_STEP_ID;
}

export function hasPolicyDocumentVersion(doc?: PolicyDocumentContext): boolean {
  if (!doc) return false;
  if (doc.storagePath || doc.originalFileName) return true;
  return (doc.content?.trim().length ?? 0) >= 50;
}

/** Author completes by preparing/submitting the version — not approve/reject. */
export function isAuthorVersionPrepared(
  step: PolicyApprovalStep,
  doc?: PolicyDocumentContext
): boolean {
  if (!isAuthorStep(step)) return false;
  if (step.status === 'approved' && Boolean(step.decisionDate)) return true;
  return hasPolicyDocumentVersion(doc);
}

export function getStepStatusLabel(step: PolicyApprovalStep): string {
  if (isAuthorStep(step) && step.status === 'approved') return 'Prepared';
  if (step.status === 'approved') return 'Approved';
  if (step.status === 'rejected') return 'Rejected';
  return 'Pending';
}

export function markAuthorVersionPrepared(
  step: PolicyApprovalStep,
  comments?: string
): PolicyApprovalStep {
  return {
    ...step,
    status: 'approved',
    decisionDate: new Date().toISOString().slice(0, 10),
    comments: comments ?? step.comments,
  };
}

export function isApprovalStepComplete(
  step: PolicyApprovalStep,
  doc?: PolicyDocumentContext
): boolean {
  if (isAuthorStep(step)) {
    if (!step.required) return true;
    if (!step.assigneeName.trim()) return false;
    return isAuthorVersionPrepared(step, doc);
  }
  if (!step.required) {
    if (!step.assigneeName.trim()) return true;
    return step.status === 'approved' && Boolean(step.decisionDate);
  }
  return (
    step.assigneeName.trim().length > 0 &&
    step.status === 'approved' &&
    Boolean(step.decisionDate)
  );
}

export function isApprovalMatrixComplete(
  matrix: PolicyApprovalStep[],
  doc?: PolicyDocumentContext
): boolean {
  return matrix.filter((s) => s.required).every((step) => isApprovalStepComplete(step, doc));
}

export function approvalMatrixProgress(
  matrix: PolicyApprovalStep[],
  doc?: PolicyDocumentContext
): {
  completed: number;
  required: number;
  percent: number;
} {
  const required = matrix.filter((s) => s.required);
  const completed = required.filter((step) => isApprovalStepComplete(step, doc)).length;
  const percent = required.length ? Math.round((completed / required.length) * 100) : 0;
  return { completed, required: required.length, percent };
}

export function validatePolicyStatusWithMatrix(
  status: string,
  matrix: PolicyApprovalStep[],
  doc?: PolicyDocumentContext
): string | null {
  if (status !== 'approved') return null;
  if (isApprovalMatrixComplete(matrix, doc)) return null;

  const pending = matrix
    .filter((s) => s.required && !isApprovalStepComplete(s, doc))
    .map((s) => (isAuthorStep(s) ? `${s.role} (version not prepared)` : s.role));
  return `Cannot approve policy until the approval matrix is complete. Pending: ${pending.join(', ')}.`;
}

export function syncAuthorStepFromDocument(
  matrix: PolicyApprovalStep[],
  doc: PolicyDocumentContext
): PolicyApprovalStep[] {
  if (!hasPolicyDocumentVersion(doc)) return matrix;
  return matrix.map((step) => {
    if (!isAuthorStep(step) || isAuthorVersionPrepared(step, doc)) return step;
    if (!step.assigneeName.trim()) return step;
    return markAuthorVersionPrepared(step);
  });
}

export function formatApprovalMatrixMarkdown(
  matrix: PolicyApprovalStep[],
  documentTitle: string
): string {
  const lines = [
    `## Document approval matrix — ${documentTitle}`,
    '',
    '| Role | Name | Title | Status | Date | Comments |',
    '|------|------|-------|--------|------|----------|',
  ];
  for (const step of matrix) {
    if (!step.required && !step.assigneeName.trim()) continue;
    lines.push(
      `| ${step.role} | ${step.assigneeName || '—'} | ${step.assigneeTitle || '—'} | ${getStepStatusLabel(step)} | ${step.decisionDate ?? '—'} | ${step.comments || '—'} |`
    );
  }
  return lines.join('\n');
}
