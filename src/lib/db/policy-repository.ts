import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { getDefaultOrganization } from './repository';
import { getPolicyTemplate } from '../data/policy-templates';
import { resolvePolicyControlIds } from '../policies/iso-control-map';
import {
  syncPolicyToControls,
  getPolicyControlRoadmap,
  type PolicySyncInput,
  type PolicyControlSyncResult,
} from '../policies/control-sync';
import {
  getDefaultApprovalMatrix,
  parseApprovalMatrix,
  validatePolicyStatusWithMatrix,
  approvalMatrixProgress,
  syncAuthorStepFromDocument,
  hasPolicyDocumentVersion,
  isAuthorStep,
  type PolicyApprovalStep,
  type PolicyDocumentContext,
} from '../policies/approval-matrix';
import { getOrganizationMembers, getOrganizationMemberById } from './member-repository';
import {
  buildApprovalInbox,
  getStepsForMember,
  isStepActionable,
  memberMatchesStep,
  submitAuthorVersionPrepared,
  updateMemberApprovalStep,
  type ApprovalInboxItem,
} from '../policies/approval-inbox';
import {
  applyRecommendationToContent,
  dismissRecommendation,
} from '../policies/recommendation-apply';
import {
  extractPolicyTextFromBuffer,
  extractPolicyTextFromFile,
  extractPolicyTextFromUpload,
} from '../policies/extract-policy-text';
import { runPolicyStandardsReview } from '../policies/policy-standards-review';
import {
  parseStandardsReview,
  type PolicyStandardsReview,
} from '../policies/policy-review-types';

function toJsonMatrix(matrix: PolicyApprovalStep[]): Prisma.InputJsonValue {
  return matrix as unknown as Prisma.InputJsonValue;
}

function toJsonReview(review: PolicyStandardsReview): Prisma.InputJsonValue {
  return review as unknown as Prisma.InputJsonValue;
}

function isStandardsReviewClientError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    String(error.message).includes('standardsReview')
  );
}

/** Persist review JSON — raw SQL fallback when Prisma client is stale (missing standardsReview field). */
async function persistStandardsReview(id: string, review: PolicyStandardsReview): Promise<void> {
  try {
    await prisma.policy.update({
      where: { id },
      data: { standardsReview: toJsonReview(review) },
    });
  } catch (error) {
    if (!isStandardsReviewClientError(error)) throw error;
    await prisma.$executeRaw`
      UPDATE policies
      SET standards_review = ${JSON.stringify(review)}::jsonb, updated_at = NOW()
      WHERE id = ${id}
    `;
  }
}

async function fetchStandardsReview(id: string): Promise<PolicyStandardsReview | null> {
  try {
    const row = await prisma.policy.findFirst({
      where: { id },
      select: { standardsReview: true },
    });
    if (row) return parseStandardsReview(row.standardsReview);
  } catch (error) {
    if (!isStandardsReviewClientError(error)) throw error;
  }

  const rows = await prisma.$queryRaw<Array<{ standards_review: unknown }>>`
    SELECT standards_review FROM policies WHERE id = ${id} LIMIT 1
  `;
  return parseStandardsReview(rows[0]?.standards_review);
}

async function attachStandardsReview<T extends { id: string; standardsReview?: unknown }>(
  policy: T
): Promise<T & { standardsReview: unknown }> {
  if (policy.standardsReview != null) return policy as T & { standardsReview: unknown };
  const review = await fetchStandardsReview(policy.id);
  return { ...policy, standardsReview: review };
}

function parseLinkedControlIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String);
}

function policyToReviewInput(row: {
  title: string;
  content: string;
  documentType: string;
  templateId: string | null;
  isoReference: string;
  owner: string;
  reviewDate: Date | null;
  linkedControlIds: unknown;
}): Parameters<typeof runPolicyStandardsReview>[0] {
  return {
    title: row.title,
    content: row.content,
    documentType: row.documentType,
    templateId: row.templateId,
    isoReference: row.isoReference,
    owner: row.owner,
    reviewDate: row.reviewDate,
    linkedControlIds: parseLinkedControlIds(row.linkedControlIds),
  };
}

function toPolicyDocumentContext(row: {
  content: string;
  storagePath: string | null;
  originalFileName: string | null;
}): PolicyDocumentContext {
  return {
    content: row.content,
    storagePath: row.storagePath,
    originalFileName: row.originalFileName,
  };
}

async function buildDefaultMatrix(categoryId?: string) {
  const members = await getOrganizationMembers();
  return getDefaultApprovalMatrix(categoryId, members);
}

export class PolicyApprovalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyApprovalValidationError';
  }
}

export interface PolicyInput {
  title: string;
  categoryId: string;
  templateId?: string | null;
  content?: string;
  status?: string;
  version?: string;
  owner?: string;
  source?: string;
  isoReference?: string;
  reviewDate?: string | null;
  documentType?: string;
  approvalMatrix?: PolicyApprovalStep[];
}

function toSyncInput(row: {
  id: string;
  templateId: string | null;
  isoReference: string;
  linkedControlIds: unknown;
  title: string;
  content: string;
  status: string;
  owner: string;
  source: string;
  storagePath: string | null;
  originalFileName: string | null;
  mimeType: string | null;
  version: string;
  documentType: string;
  approvalMatrix: unknown;
}): PolicySyncInput {
  return {
    id: row.id,
    templateId: row.templateId,
    isoReference: row.isoReference,
    linkedControlIds: row.linkedControlIds,
    title: row.title,
    content: row.content,
    status: row.status,
    owner: row.owner,
    source: row.source,
    storagePath: row.storagePath,
    originalFileName: row.originalFileName,
    mimeType: row.mimeType,
    version: row.version,
    documentType: row.documentType,
    approvalMatrix: row.approvalMatrix,
  };
}

function resolveLinks(templateId: string | null | undefined, isoReference: string) {
  return resolvePolicyControlIds({ templateId, isoReference });
}

async function maybeSyncControls(
  row: Parameters<typeof toSyncInput>[0]
): Promise<PolicyControlSyncResult[]> {
  return syncPolicyToControls(toSyncInput(row));
}

export async function getPolicies(categoryId?: string) {
  const org = await getDefaultOrganization();
  return prisma.policy.findMany({
    where: {
      organizationId: org.id,
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ categoryId: 'asc' }, { updatedAt: 'desc' }],
  });
}

export async function getPolicyById(id: string) {
  const org = await getDefaultOrganization();
  return prisma.policy.findFirst({
    where: { id, organizationId: org.id },
  });
}

export async function getPolicyWithControlRoadmap(id: string) {
  const policy = await getPolicyById(id);
  if (!policy) return null;
  const withReview = await attachStandardsReview(policy);
  const matrix = parseApprovalMatrix(withReview.approvalMatrix);
  const doc = toPolicyDocumentContext(withReview);
  const roadmap = await getPolicyControlRoadmap(
    toSyncInput({ ...withReview, approvalMatrix: withReview.approvalMatrix })
  );
  return {
    policy: { ...withReview, approvalMatrix: matrix },
    roadmap,
    approvalProgress: approvalMatrixProgress(matrix, doc),
  };
}

export async function createPolicyFromTemplate(templateId: string, owner?: string) {
  const template = getPolicyTemplate(templateId);
  if (!template) return null;

  const org = await getDefaultOrganization();
  const linkedControlIds = template.controlIds;

  const row = await prisma.policy.create({
    data: {
      organizationId: org.id,
      templateId: template.id,
      categoryId: template.categoryId,
      title: template.title,
      content: template.content,
      isoReference: template.isoReference,
      documentType: template.documentType,
      linkedControlIds,
      approvalMatrix: toJsonMatrix(await buildDefaultMatrix(template.categoryId)),
      source: 'template',
      owner: owner?.trim() ?? '',
      status: 'draft',
    },
  });

  return prisma.policy.findUnique({ where: { id: row.id } });
}

export async function createBlankPolicy(input: PolicyInput) {
  const org = await getDefaultOrganization();
  const linkedControlIds = resolveLinks(input.templateId ?? null, input.isoReference ?? '');

  const row = await prisma.policy.create({
    data: {
      organizationId: org.id,
      categoryId: input.categoryId,
      title: input.title.trim(),
      content: input.content?.trim() ?? '',
      templateId: input.templateId ?? null,
      status: input.status ?? 'draft',
      version: input.version ?? '1.0',
      owner: input.owner?.trim() ?? '',
      source: input.source ?? 'blank',
      isoReference: input.isoReference?.trim() ?? '',
      documentType: input.documentType ?? 'policy',
      linkedControlIds,
      approvalMatrix: toJsonMatrix(await buildDefaultMatrix(input.categoryId)),
      reviewDate: input.reviewDate ? new Date(input.reviewDate) : null,
    },
  });

  return row;
}

export async function createUploadedPolicy(input: {
  title: string;
  categoryId: string;
  templateId?: string | null;
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  owner?: string;
  isoReference?: string;
}) {
  const template = input.templateId ? getPolicyTemplate(input.templateId) : null;
  const linkedControlIds = input.templateId
    ? (template?.controlIds ?? resolveLinks(input.templateId, input.isoReference ?? ''))
    : resolveLinks(null, input.isoReference ?? '');

  const org = await getDefaultOrganization();
  const row = await prisma.policy.create({
    data: {
      organizationId: org.id,
      categoryId: input.categoryId,
      title: input.title.trim(),
      templateId: input.templateId ?? null,
      source: 'upload',
      storagePath: input.storagePath,
      originalFileName: input.originalFileName,
      mimeType: input.mimeType,
      owner: input.owner?.trim() ?? '',
      isoReference: input.isoReference?.trim() ?? template?.isoReference ?? '',
      documentType: template?.documentType ?? 'policy',
      linkedControlIds,
      approvalMatrix: toJsonMatrix(await buildDefaultMatrix(input.categoryId)),
      status: 'draft',
    },
  });

  return row;
}

export async function updatePolicy(id: string, input: Partial<PolicyInput>) {
  const org = await getDefaultOrganization();
  const existing = await prisma.policy.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  const nextStatus = input.status ?? existing.status;
  let matrix = parseApprovalMatrix(input.approvalMatrix ?? existing.approvalMatrix);
  const nextContent = input.content !== undefined ? input.content : existing.content;
  const doc: PolicyDocumentContext = {
    content: nextContent,
    storagePath: existing.storagePath,
    originalFileName: existing.originalFileName,
  };
  if (input.content !== undefined) {
    matrix = syncAuthorStepFromDocument(matrix, doc);
  }
  const matrixError = validatePolicyStatusWithMatrix(nextStatus, matrix, doc);
  if (matrixError) {
    throw new PolicyApprovalValidationError(matrixError);
  }

  const updated = await prisma.policy.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.version !== undefined && { version: input.version }),
      ...(input.owner !== undefined && { owner: input.owner.trim() }),
      ...(input.isoReference !== undefined && { isoReference: input.isoReference.trim() }),
      ...(input.approvalMatrix !== undefined && {
        approvalMatrix: toJsonMatrix(input.approvalMatrix),
      }),
      ...(input.content !== undefined && { approvalMatrix: toJsonMatrix(matrix) }),
      ...(input.reviewDate !== undefined && {
        reviewDate: input.reviewDate ? new Date(input.reviewDate) : null,
      }),
      ...(nextStatus === 'approved' && { approvedAt: new Date() }),
    },
  });

  await maybeSyncControls({ ...updated, approvalMatrix: updated.approvalMatrix });
  return { ...updated, approvalMatrix: matrix };
}

export async function updatePolicyFile(
  id: string,
  data: { storagePath: string; originalFileName: string; mimeType: string }
) {
  const org = await getDefaultOrganization();
  const existing = await prisma.policy.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  let matrix = parseApprovalMatrix(existing.approvalMatrix);
  matrix = syncAuthorStepFromDocument(matrix, {
    content: existing.content,
    storagePath: data.storagePath,
    originalFileName: data.originalFileName,
  });

  const updated = await prisma.policy.update({
    where: { id },
    data: {
      storagePath: data.storagePath,
      originalFileName: data.originalFileName,
      mimeType: data.mimeType,
      source: 'upload',
      approvalMatrix: toJsonMatrix(matrix),
    },
  });

  await maybeSyncControls({ ...updated, approvalMatrix: updated.approvalMatrix });
  return updated;
}

export async function syncPolicyControls(id: string) {
  const policy = await getPolicyById(id);
  if (!policy) return null;
  const syncResults = await syncPolicyToControls(toSyncInput(policy));
  const refreshed = await getPolicyById(id);
  return { policy: refreshed, syncResults };
}

export class PolicyApprovalStepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyApprovalStepError';
  }
}

export async function getApprovalInboxForMember(
  memberId: string,
  filter: 'pending' | 'completed' | 'all' = 'pending'
): Promise<{ member: Awaited<ReturnType<typeof getOrganizationMemberById>>; items: ApprovalInboxItem[] } | null> {
  const member = await getOrganizationMemberById(memberId);
  if (!member) return null;

  const policies = await getPolicies();
  const summaries = policies.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    version: p.version,
    categoryId: p.categoryId,
    isoReference: p.isoReference,
    updatedAt: p.updatedAt.toISOString(),
    content: p.content,
    storagePath: p.storagePath,
    originalFileName: p.originalFileName,
    approvalMatrix: parseApprovalMatrix(p.approvalMatrix),
  }));

  return {
    member,
    items: buildApprovalInbox(summaries, member, filter),
  };
}

export async function getPolicyApprovalViewForMember(policyId: string, memberId: string) {
  const member = await getOrganizationMemberById(memberId);
  if (!member) return null;

  const policy = await getPolicyById(policyId);
  if (!policy) return null;

  const matrix = parseApprovalMatrix(policy.approvalMatrix);
  const doc = toPolicyDocumentContext(policy);
  const mySteps = getStepsForMember(matrix, member);
  if (mySteps.length === 0) return null;

  const stepsWithState = matrix.map((step) => {
    const { actionable, reason } = isStepActionable(matrix, step, doc);
    return {
      ...step,
      isMine: memberMatchesStep(step, member),
      isAuthor: isAuthorStep(step),
      actionable: memberMatchesStep(step, member) ? actionable : false,
      blockedReason: memberMatchesStep(step, member) ? reason : null,
    };
  });

  return {
    member,
    policy: {
      id: policy.id,
      title: policy.title,
      status: policy.status,
      version: policy.version,
      categoryId: policy.categoryId,
      isoReference: policy.isoReference,
      content: policy.content,
      owner: policy.owner,
      originalFileName: policy.originalFileName,
      storagePath: policy.storagePath,
      updatedAt: policy.updatedAt.toISOString(),
    },
    hasDocument: hasPolicyDocumentVersion(doc),
    steps: stepsWithState,
    mySteps,
    progress: approvalMatrixProgress(matrix, doc),
  };
}

export async function submitPolicyApprovalStep(
  policyId: string,
  memberId: string,
  stepId: string,
  input: { status: 'pending' | 'approved' | 'rejected'; comments?: string; decisionDate?: string | null }
) {
  const member = await getOrganizationMemberById(memberId);
  if (!member) return null;

  const existing = await getPolicyById(policyId);
  if (!existing) return null;

  const doc = toPolicyDocumentContext(existing);
  const matrix = parseApprovalMatrix(existing.approvalMatrix);
  let nextMatrix: ReturnType<typeof parseApprovalMatrix>;
  try {
    nextMatrix = updateMemberApprovalStep(matrix, member, stepId, input, doc);
  } catch (err) {
    throw new PolicyApprovalStepError(err instanceof Error ? err.message : 'Approval failed');
  }

  return updatePolicy(policyId, { approvalMatrix: nextMatrix });
}

export async function submitPolicyAuthorPrepare(
  policyId: string,
  memberId: string,
  comments?: string
) {
  const member = await getOrganizationMemberById(memberId);
  if (!member) return null;

  const existing = await getPolicyById(policyId);
  if (!existing) return null;

  const doc = toPolicyDocumentContext(existing);
  const matrix = parseApprovalMatrix(existing.approvalMatrix);
  let nextMatrix: ReturnType<typeof parseApprovalMatrix>;
  try {
    nextMatrix = submitAuthorVersionPrepared(matrix, member, doc, comments);
  } catch (err) {
    throw new PolicyApprovalStepError(err instanceof Error ? err.message : 'Prepare failed');
  }

  return updatePolicy(policyId, { approvalMatrix: nextMatrix });
}

export async function extractAndSavePolicyContent(
  id: string,
  source:
    | { storagePath: string; originalFileName: string; mimeType?: string | null }
    | { buffer: Buffer; originalFileName: string; mimeType?: string | null }
    | File
): Promise<string> {
  const org = await getDefaultOrganization();
  const existing = await prisma.policy.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) throw new Error('Policy not found');

  const text =
    source instanceof File
      ? await extractPolicyTextFromUpload(source)
      : 'buffer' in source
        ? await extractPolicyTextFromBuffer(
            source.buffer,
            source.originalFileName,
            source.mimeType
          )
        : await extractPolicyTextFromFile(
            source.storagePath,
            source.originalFileName,
            source.mimeType
          );

  if (text) {
    let matrix = parseApprovalMatrix(existing.approvalMatrix);
    matrix = syncAuthorStepFromDocument(matrix, {
      content: text,
      storagePath: existing.storagePath,
      originalFileName: existing.originalFileName,
    });
    await prisma.policy.update({
      where: { id },
      data: {
        content: text,
        approvalMatrix: toJsonMatrix(matrix),
      },
    });
  }

  return text;
}

export async function runAndSavePolicyStandardsReview(id: string): Promise<PolicyStandardsReview | null> {
  const policy = await getPolicyById(id);
  if (!policy) return null;

  const review = runPolicyStandardsReview(policyToReviewInput(policy));
  await persistStandardsReview(id, review);
  return review;
}

export async function getPolicyStandardsReview(id: string): Promise<PolicyStandardsReview | null> {
  return fetchStandardsReview(id);
}

export class PolicyReviewActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyReviewActionError';
  }
}

export async function applyPolicyRecommendation(
  policyId: string,
  recId: string
): Promise<{ policy: Awaited<ReturnType<typeof getPolicyById>>; review: PolicyStandardsReview } | null> {
  const policy = await getPolicyById(policyId);
  if (!policy) return null;

  const review = await fetchStandardsReview(policyId);
  if (!review) throw new PolicyReviewActionError('No standards review found');

  const recIndex = review.recommendations.findIndex((r) => r.id === recId);
  if (recIndex === -1) throw new PolicyReviewActionError('Recommendation not found');

  const rec = review.recommendations[recIndex];
  const { content, recommendation } = applyRecommendationToContent(policy.content, rec);

  const nextReview: PolicyStandardsReview = {
    ...review,
    recommendations: review.recommendations.map((r, i) => (i === recIndex ? recommendation : r)),
  };

  const updated = await prisma.policy.update({
    where: { id: policyId },
    data: { content },
  });
  await persistStandardsReview(policyId, nextReview);

  await maybeSyncControls({ ...updated, approvalMatrix: updated.approvalMatrix });
  const refreshedPolicy = await getPolicyById(policyId);
  if (!refreshedPolicy) return null;
  return { policy: refreshedPolicy, review: nextReview };
}

export async function dismissPolicyRecommendation(
  policyId: string,
  recId: string
): Promise<{ review: PolicyStandardsReview } | null> {
  const policy = await getPolicyById(policyId);
  if (!policy) return null;

  const review = await fetchStandardsReview(policyId);
  if (!review) throw new PolicyReviewActionError('No standards review found');

  const recIndex = review.recommendations.findIndex((r) => r.id === recId);
  if (recIndex === -1) throw new PolicyReviewActionError('Recommendation not found');

  const nextReview: PolicyStandardsReview = {
    ...review,
    recommendations: review.recommendations.map((r, i) =>
      i === recIndex ? dismissRecommendation(r) : r
    ),
  };

  await persistStandardsReview(policyId, nextReview);

  return { review: nextReview };
}

export async function deletePolicy(id: string) {
  const org = await getDefaultOrganization();
  const existing = await prisma.policy.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  await prisma.policy.delete({ where: { id } });
  return existing;
}
