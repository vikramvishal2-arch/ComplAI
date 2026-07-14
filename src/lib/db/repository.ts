import { Prisma } from '@prisma/client';
import type {
  ControlCompliance,
  ControlRemediation,
  ControlIssue,
  ControlIssueSeverity,
  ControlIssueStatus,
  ControlEvidence,
  EvidenceContext,
  Risk,
  RiskLikelihood,
  RiskImpact,
  RiskTreatment,
  RiskStatus,
  RiskRegisterEntry,
  RiskControlMapping,
  ControlEffectiveness,
  RemediationAction,
  AccessConnection,
  FrameworkActivation,
  DashboardSummary,
  DashboardRiskSummary,
  ExecutiveDashboard,
  ExecutiveDomainSummary,
  ExecutiveFrameworkView,
  LeadershipAttentionItem,
  ControlDomain,
  ComplianceStatus,
} from '../types';
import { ISSUE_SEVERITY_LABELS, DOMAIN_LABELS, DEVIATION_EFFECTIVENESS } from '../types';
import { ACCESS_INTEGRATION_PROVIDERS } from '../data/access-integrations';
import { FRAMEWORKS } from '../data/frameworks';
import {
  getAllControlsForActivatedFrameworks,
  getControlsByFramework,
  getControlById,
} from '../data/controls';
import { calculateRiskScore, formatRiskScoreDisplay, getPresentRiskScore, resolvePresentRiskDisplay, isHighOrCriticalDisplay, parseRiskScoreValue } from '../risk/scoring';
import { validateClosedRiskResidual, resolvePresentRiskFields } from '../risk/validate';
import { ensureRiskSchema } from './ensure-risk-schema';
import {
  AuditReadyBlockedError,
  getAuditReadyBlockers,
} from '../compliance/audit-ready';
import { classifyControlRag, getGoGreenActions } from '../compliance/rag-status';
import { prisma } from './prisma';
import {
  ensureMvpFrameworks,
  MVP_REQUIRED_FRAMEWORKS,
  seedOrganizationData as seedOrganizationDataCore,
} from './organization-seed';
import {
  saveEvidenceFile,
  deleteEvidenceFile,
} from '../evidence/storage';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '../brand';
import { mkdir, writeFile, copyFile, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const READY_STATUSES: ComplianceStatus[] = ['implemented', 'audit_ready', 'not_applicable'];
export { MVP_REQUIRED_FRAMEWORKS };

const DEFAULT_ORG_NAME = ORGANIZATION_NAME;

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

function toDateString(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function parseDateString(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
}

export function createDefaultCompliance(controlId: string): ControlCompliance {
  return {
    controlId,
    status: 'not_started',
    complianceMethod: null,
    implementationApproach: '',
    owner: '',
    targetDate: null,
    evidenceNotes: '',
    naJustification: '',
    lastUpdated: new Date().toISOString(),
  };
}

export function createDefaultAccessConnections(): AccessConnection[] {
  return ACCESS_INTEGRATION_PROVIDERS.map((provider) => ({
    providerId: provider.id,
    status: 'not_connected' as const,
    accountIdentifier: '',
    adminContact: '',
    connectedAt: null,
    notes: '',
  }));
}

function createDefaultRemediation(controlId: string): ControlRemediation {
  return {
    controlId,
    actions: [],
    accessConnections: [],
    lastUpdated: new Date().toISOString(),
  };
}

function mapCompliance(row: {
  controlId: string;
  status: string;
  complianceMethod: string | null;
  implementationApproach: string;
  owner: string;
  targetDate: Date | null;
  evidenceNotes: string;
  naJustification: string;
  updatedAt: Date;
}): ControlCompliance {
  return {
    controlId: row.controlId,
    status: row.status as ControlCompliance['status'],
    complianceMethod: row.complianceMethod as ControlCompliance['complianceMethod'],
    implementationApproach: row.implementationApproach,
    owner: row.owner,
    targetDate: toDateString(row.targetDate),
    evidenceNotes: row.evidenceNotes,
    naJustification: row.naJustification,
    lastUpdated: row.updatedAt.toISOString(),
  };
}

function mapRemediation(row: {
  controlId: string;
  actions: unknown;
  accessConnections: unknown;
  updatedAt: Date;
}): ControlRemediation {
  return {
    controlId: row.controlId,
    actions: (row.actions as RemediationAction[]) ?? [],
    accessConnections: (row.accessConnections as AccessConnection[]) ?? [],
    lastUpdated: row.updatedAt.toISOString(),
  };
}

async function ensureMvpFrameworksForOrg(orgId: string): Promise<void> {
  await ensureMvpFrameworks(prisma, orgId);
}

let cachedDefaultOrg: Awaited<ReturnType<typeof prisma.organization.findFirst>> | null =
  null;
let mvpFrameworksEnsured = false;
let cachedActivatedFrameworkIds: string[] | null = null;

/** Drop process caches after org/framework mutations (or tests). */
export function resetOrganizationCaches(): void {
  cachedDefaultOrg = null;
  mvpFrameworksEnsured = false;
  cachedActivatedFrameworkIds = null;
}

export async function getDefaultOrganization() {
  if (cachedDefaultOrg && mvpFrameworksEnsured) {
    return cachedDefaultOrg;
  }

  let org = cachedDefaultOrg;
  if (!org) {
    // Prefer the org that already holds operational data when lab deploys
    // accidentally create duplicate "Propel Ready" rows.
    const ranked = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT o.id
      FROM organizations o
      LEFT JOIN vendors v ON v.organization_id = o.id
      LEFT JOIN control_evidence e ON e.organization_id = o.id
      GROUP BY o.id, o.created_at
      ORDER BY (COUNT(DISTINCT v.id) + COUNT(DISTINCT e.id)) DESC, o.created_at ASC
      LIMIT 1
    `;
    if (ranked[0]?.id) {
      org = await prisma.organization.findUnique({ where: { id: ranked[0].id } });
    }
    if (!org) {
      org = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
    }
    if (!org) {
      org = await prisma.organization.create({ data: { name: DEFAULT_ORG_NAME } });
      await seedOrganizationData(org.id);
      mvpFrameworksEnsured = true;
      cachedActivatedFrameworkIds = null;
    }
  }

  if (!mvpFrameworksEnsured) {
    await ensureMvpFrameworksForOrg(org.id);
    mvpFrameworksEnsured = true;
    cachedActivatedFrameworkIds = null;
  }

  // Heal columns/tables if a deploy skipped prisma db push (stale tools image).
  await ensureRiskSchema();

  cachedDefaultOrg = org;
  return org;
}

export async function seedOrganizationData(orgId: string): Promise<void> {
  await seedOrganizationDataCore(prisma, orgId);
}

export async function getOrganizationName(): Promise<string> {
  const org = await getDefaultOrganization();
  return org.name;
}

export async function setOrganizationName(name: string): Promise<string> {
  const org = await getDefaultOrganization();
  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: { name: name.trim() },
  });
  return updated.name;
}

export async function getActivatedFrameworkIds(): Promise<string[]> {
  if (cachedActivatedFrameworkIds) return cachedActivatedFrameworkIds;
  const org = await getDefaultOrganization();
  const rows = await prisma.frameworkActivation.findMany({
    where: { organizationId: org.id },
  });
  cachedActivatedFrameworkIds = rows.map((r) => r.frameworkId);
  return cachedActivatedFrameworkIds;
}

export async function getActivations(): Promise<FrameworkActivation[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.frameworkActivation.findMany({
    where: { organizationId: org.id },
    orderBy: { activatedAt: 'asc' },
  });
  return rows.map((r) => ({
    frameworkId: r.frameworkId,
    activatedAt: r.activatedAt.toISOString(),
    targetAuditDate: toDateString(r.targetAuditDate),
  }));
}

export async function activateFramework(
  frameworkId: string,
  targetAuditDate?: string | null
): Promise<FrameworkActivation> {
  const org = await getDefaultOrganization();
  const row = await prisma.frameworkActivation.upsert({
    where: {
      organizationId_frameworkId: { organizationId: org.id, frameworkId },
    },
    create: {
      organizationId: org.id,
      frameworkId,
      targetAuditDate: parseDateString(targetAuditDate ?? null),
    },
    update: {
      targetAuditDate: targetAuditDate !== undefined ? parseDateString(targetAuditDate) : undefined,
    },
  });
  cachedActivatedFrameworkIds = null;
  return {
    frameworkId: row.frameworkId,
    activatedAt: row.activatedAt.toISOString(),
    targetAuditDate: toDateString(row.targetAuditDate),
  };
}

export async function deactivateFramework(frameworkId: string): Promise<void> {
  if (MVP_REQUIRED_FRAMEWORKS.includes(frameworkId)) return;
  const org = await getDefaultOrganization();
  await prisma.frameworkActivation.deleteMany({
    where: { organizationId: org.id, frameworkId },
  });
  cachedActivatedFrameworkIds = null;
}

export function isMvpRequiredFramework(frameworkId: string): boolean {
  return MVP_REQUIRED_FRAMEWORKS.includes(frameworkId);
}

export async function getControlCompliance(controlId: string): Promise<ControlCompliance> {
  const org = await getDefaultOrganization();
  const row = await prisma.controlCompliance.findUnique({
    where: {
      organizationId_controlId: { organizationId: org.id, controlId },
    },
  });
  if (!row) return createDefaultCompliance(controlId);
  return mapCompliance(row);
}

export async function getControlComplianceBatch(
  controlIds: string[]
): Promise<Map<string, ControlCompliance>> {
  const org = await getDefaultOrganization();
  const rows = await prisma.controlCompliance.findMany({
    where: { organizationId: org.id, controlId: { in: controlIds } },
  });
  const map = new Map<string, ControlCompliance>();
  for (const row of rows) {
    map.set(row.controlId, mapCompliance(row));
  }
  return map;
}

export async function updateControlCompliance(
  controlId: string,
  updates: Partial<Omit<ControlCompliance, 'controlId'>>
): Promise<ControlCompliance> {
  const org = await getDefaultOrganization();
  const existing = await getControlCompliance(controlId);

  if (updates.status === 'audit_ready') {
    const [issues, risks] = await Promise.all([
      getControlIssues(controlId),
      getRisksByControlId(controlId),
    ]);
    const blocker = getAuditReadyBlockers(issues, risks);
    if (blocker) {
      throw new AuditReadyBlockedError(blocker);
    }
  }

  const row = await prisma.controlCompliance.upsert({
    where: {
      organizationId_controlId: { organizationId: org.id, controlId },
    },
    create: {
      organizationId: org.id,
      controlId,
      status: updates.status ?? existing.status,
      complianceMethod: updates.complianceMethod ?? existing.complianceMethod,
      implementationApproach: updates.implementationApproach ?? existing.implementationApproach,
      owner: updates.owner ?? existing.owner,
      targetDate: parseDateString(
        updates.targetDate !== undefined ? updates.targetDate : existing.targetDate
      ),
      evidenceNotes: updates.evidenceNotes ?? existing.evidenceNotes,
      naJustification: updates.naJustification ?? existing.naJustification,
    },
    update: {
      status: updates.status,
      complianceMethod: updates.complianceMethod,
      implementationApproach: updates.implementationApproach,
      owner: updates.owner,
      targetDate:
        updates.targetDate !== undefined ? parseDateString(updates.targetDate) : undefined,
      evidenceNotes: updates.evidenceNotes,
      naJustification: updates.naJustification,
    },
  });

  return mapCompliance(row);
}

export async function getControlRemediation(
  controlId: string,
  isAccessControl: boolean
): Promise<ControlRemediation> {
  const org = await getDefaultOrganization();
  const row = await prisma.controlRemediation.findUnique({
    where: {
      organizationId_controlId: { organizationId: org.id, controlId },
    },
  });

  if (row) {
    const remediation = mapRemediation(row);
    if (isAccessControl && remediation.accessConnections.length === 0) {
      remediation.accessConnections = createDefaultAccessConnections();
    }
    return remediation;
  }

  const created = createDefaultRemediation(controlId);
  if (isAccessControl) {
    created.accessConnections = createDefaultAccessConnections();
  }
  return created;
}

export async function updateControlRemediation(
  controlId: string,
  updates: {
    actions?: RemediationAction[];
    accessConnections?: AccessConnection[];
  }
): Promise<ControlRemediation> {
  const org = await getDefaultOrganization();
  const current = await getControlRemediation(controlId, false);

  const row = await prisma.controlRemediation.upsert({
    where: {
      organizationId_controlId: { organizationId: org.id, controlId },
    },
    create: {
      organizationId: org.id,
      controlId,
      actions: toJsonValue(updates.actions ?? current.actions),
      accessConnections: toJsonValue(updates.accessConnections ?? current.accessConnections),
    },
    update: {
      actions: updates.actions ? toJsonValue(updates.actions) : undefined,
      accessConnections: updates.accessConnections
        ? toJsonValue(updates.accessConnections)
        : undefined,
    },
  });

  return mapRemediation(row);
}

function mapIssue(row: {
  id: string;
  controlId: string;
  riskId?: string | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  raisedBy: string;
  assignee: string;
  dueDate: Date | null;
  resolutionNotes: string;
  createdAt: Date;
  updatedAt: Date;
}): ControlIssue {
  return {
    id: row.id,
    controlId: row.controlId,
    riskId: row.riskId ?? null,
    title: row.title,
    description: row.description,
    severity: row.severity as ControlIssueSeverity,
    status: row.status as ControlIssueStatus,
    raisedBy: row.raisedBy,
    assignee: row.assignee,
    dueDate: toDateString(row.dueDate),
    resolutionNotes: row.resolutionNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getControlIssues(controlId: string): Promise<ControlIssue[]> {
  await ensureRiskSchema();
  const org = await getDefaultOrganization();
  const rows = await prisma.controlIssue.findMany({
    where: { organizationId: org.id, controlId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapIssue);
}

export async function getOpenIssueCountByControlIds(
  controlIds: string[]
): Promise<Map<string, number>> {
  const org = await getDefaultOrganization();
  const counts = new Map<string, number>();
  if (controlIds.length === 0) return counts;

  const rows = await prisma.controlIssue.groupBy({
    by: ['controlId'],
    where: {
      organizationId: org.id,
      controlId: { in: controlIds },
      status: { in: ['open', 'in_progress'] },
    },
    _count: { _all: true },
  });

  for (const row of rows) {
    counts.set(row.controlId, row._count._all);
  }
  return counts;
}

export async function createControlIssue(
  controlId: string,
  input: {
    title: string;
    description?: string;
    severity?: ControlIssueSeverity;
    raisedBy?: string;
    assignee?: string;
    dueDate?: string | null;
    riskId?: string | null;
  }
): Promise<ControlIssue> {
  const org = await getDefaultOrganization();
  const row = await prisma.controlIssue.create({
    data: {
      organizationId: org.id,
      controlId,
      riskId: input.riskId?.trim() || null,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      severity: input.severity ?? 'medium',
      raisedBy: input.raisedBy?.trim() ?? '',
      assignee: input.assignee?.trim() ?? '',
      dueDate: parseDateString(input.dueDate),
    },
  });
  return mapIssue(row);
}

export async function updateControlIssue(
  issueId: string,
  updates: Partial<{
    title: string;
    description: string;
    severity: ControlIssueSeverity;
    status: ControlIssueStatus;
    raisedBy: string;
    assignee: string;
    dueDate: string | null;
    resolutionNotes: string;
  }>
): Promise<ControlIssue | null> {
  const org = await getDefaultOrganization();
  const existing = await prisma.controlIssue.findFirst({
    where: { id: issueId, organizationId: org.id },
  });
  if (!existing) return null;

  const row = await prisma.controlIssue.update({
    where: { id: issueId },
    data: {
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.description !== undefined
        ? { description: updates.description.trim() }
        : {}),
      ...(updates.severity !== undefined ? { severity: updates.severity } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.raisedBy !== undefined ? { raisedBy: updates.raisedBy.trim() } : {}),
      ...(updates.assignee !== undefined ? { assignee: updates.assignee.trim() } : {}),
      ...(updates.dueDate !== undefined
        ? { dueDate: parseDateString(updates.dueDate) }
        : {}),
      ...(updates.resolutionNotes !== undefined
        ? { resolutionNotes: updates.resolutionNotes.trim() }
        : {}),
    },
  });
  return mapIssue(row);
}

export async function deleteControlIssue(issueId: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const existing = await prisma.controlIssue.findFirst({
    where: { id: issueId, organizationId: org.id },
  });
  if (!existing) return false;
  await prisma.controlIssue.delete({ where: { id: issueId } });
  return true;
}

function mapEvidence(row: {
  id: string;
  controlId: string;
  context: string;
  issueId: string | null;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  description: string;
  uploadedAt: Date;
  validationVerdict?: string | null;
  validationScore?: number | null;
  validationSummary?: string | null;
  validationAction?: string | null;
  validatedAt?: Date | null;
}): ControlEvidence {
  const verdict = row.validationVerdict;
  const action = row.validationAction;
  return {
    id: row.id,
    controlId: row.controlId,
    context: row.context as EvidenceContext,
    issueId: row.issueId,
    fileName: row.fileName,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    description: row.description,
    uploadedAt: row.uploadedAt.toISOString(),
    validationVerdict:
      verdict === 'strong' ||
      verdict === 'acceptable' ||
      verdict === 'weak' ||
      verdict === 'mismatched'
        ? verdict
        : null,
    validationScore: row.validationScore ?? null,
    validationSummary: row.validationSummary ?? null,
    validationAction:
      action === 'keep' || action === 'replace' || action === 'supplement' ? action : null,
    validatedAt: row.validatedAt?.toISOString() ?? null,
  };
}

export async function getControlEvidence(
  controlId: string,
  context?: EvidenceContext
): Promise<ControlEvidence[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.controlEvidence.findMany({
    where: {
      organizationId: org.id,
      controlId,
      ...(context ? { context } : {}),
    },
    orderBy: { uploadedAt: 'desc' },
  });
  return rows.map(mapEvidence);
}

export async function getEvidenceSummariesByControlIds(
  controlIds: string[]
): Promise<Map<string, ControlEvidence[]>> {
  const map = new Map<string, ControlEvidence[]>();
  if (controlIds.length === 0) return map;

  const org = await getDefaultOrganization();
  const rows = await prisma.controlEvidence.findMany({
    where: {
      organizationId: org.id,
      controlId: { in: controlIds },
    },
    orderBy: { uploadedAt: 'desc' },
  });

  for (const row of rows) {
    const list = map.get(row.controlId) ?? [];
    list.push(mapEvidence(row));
    map.set(row.controlId, list);
  }
  return map;
}

export async function saveControlEvidenceValidation(
  evidenceId: string,
  review: {
    verdict: string;
    score: number;
    summary: string;
    action: string;
  }
): Promise<ControlEvidence | null> {
  const org = await getDefaultOrganization();
  const existing = await prisma.controlEvidence.findFirst({
    where: { id: evidenceId, organizationId: org.id },
  });
  if (!existing) return null;

  const row = await prisma.controlEvidence.update({
    where: { id: evidenceId },
    data: {
      validationVerdict: review.verdict,
      validationScore: review.score,
      validationSummary: review.summary,
      validationAction: review.action,
      validatedAt: new Date(),
    },
  });
  return mapEvidence(row);
}

export async function hasControlEvidenceForContext(
  controlId: string,
  context: EvidenceContext
): Promise<boolean> {
  const org = await getDefaultOrganization();
  const count = await prisma.controlEvidence.count({
    where: { organizationId: org.id, controlId, context },
  });
  return count > 0;
}

/** One query for many controls — used by gap analysis instead of N sequential counts. */
export async function getControlIdsWithEvidenceForContext(
  controlIds: string[],
  context: EvidenceContext
): Promise<Set<string>> {
  if (controlIds.length === 0) return new Set();
  const org = await getDefaultOrganization();
  const rows = await prisma.controlEvidence.findMany({
    where: {
      organizationId: org.id,
      controlId: { in: controlIds },
      context,
    },
    select: { controlId: true },
    distinct: ['controlId'],
  });
  return new Set(rows.map((r) => r.controlId));
}

export async function getControlEvidenceById(
  evidenceId: string
): Promise<(ControlEvidence & { storagePath: string }) | null> {
  const org = await getDefaultOrganization();
  const row = await prisma.controlEvidence.findFirst({
    where: { id: evidenceId, organizationId: org.id },
  });
  if (!row) return null;
  return { ...mapEvidence(row), storagePath: row.storagePath };
}

export async function createControlEvidence(
  controlId: string,
  input: {
    context: EvidenceContext;
    file: File;
    description?: string;
    issueId?: string | null;
  }
): Promise<ControlEvidence> {
  const org = await getDefaultOrganization();
  const { storagePath, fileName } = await saveEvidenceFile(org.id, controlId, input.file);

  const row = await prisma.controlEvidence.create({
    data: {
      organizationId: org.id,
      controlId,
      context: input.context,
      issueId: input.issueId ?? null,
      fileName,
      originalName: input.file.name,
      mimeType: input.file.type || 'application/octet-stream',
      sizeBytes: input.file.size,
      description: input.description?.trim() ?? '',
      storagePath,
    },
  });
  const { invalidateEvidenceBriefcaseCache } = await import('../evidence/briefcase-cache');
  invalidateEvidenceBriefcaseCache();
  return mapEvidence(row);
}

const POLICY_EVIDENCE_TAG = 'policy-link:';

export async function createControlEvidenceFromPolicy(
  controlId: string,
  policy: {
    id: string;
    title: string;
    content: string;
    storagePath?: string | null;
    originalFileName?: string | null;
    mimeType?: string | null;
    version?: string;
  }
): Promise<ControlEvidence> {
  const org = await getDefaultOrganization();
  const tag = `${POLICY_EVIDENCE_TAG}${policy.id}`;

  const existing = await prisma.controlEvidence.findFirst({
    where: {
      organizationId: org.id,
      controlId,
      context: 'compliance',
      description: { contains: tag },
    },
  });
  if (existing) return mapEvidence(existing);

  const evidenceRoot = path.join(process.cwd(), 'uploads', 'evidence');
  const dir = path.join(evidenceRoot, org.id, controlId);
  await mkdir(dir, { recursive: true });

  let storagePath: string;
  let fileName: string;
  let originalName: string;
  let mimeType: string;
  let sizeBytes: number;

  if (policy.storagePath) {
    const ext = path.extname(policy.originalFileName ?? '') || '.pdf';
    fileName = `${randomUUID()}${ext}`;
    storagePath = path.join(dir, fileName);
    await copyFile(policy.storagePath, storagePath);
    originalName = policy.originalFileName ?? `${policy.title}${ext}`;
    mimeType = policy.mimeType ?? 'application/octet-stream';
    const buf = await readFile(storagePath);
    sizeBytes = buf.length;
  } else {
    fileName = `${randomUUID()}.md`;
    storagePath = path.join(dir, fileName);
    const body = policy.content?.trim()
      ? policy.content
      : `# ${policy.title}\n\nISMS policy document (v${policy.version ?? '1.0'}).`;
    const buf = Buffer.from(body, 'utf8');
    await writeFile(storagePath, buf);
    originalName = `${policy.title.replace(/[^a-zA-Z0-9._-]/g, '_')}.md`;
    mimeType = 'text/markdown';
    sizeBytes = buf.length;
  }

  const row = await prisma.controlEvidence.create({
    data: {
      organizationId: org.id,
      controlId,
      context: 'compliance',
      issueId: null,
      fileName,
      originalName,
      mimeType,
      sizeBytes,
      description: `${tag} ${policy.title}`,
      storagePath,
    },
  });
  return mapEvidence(row);
}

export async function deleteControlEvidence(evidenceId: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const row = await prisma.controlEvidence.findFirst({
    where: { id: evidenceId, organizationId: org.id },
  });
  if (!row) return false;

  await deleteEvidenceFile(row.storagePath);
  await prisma.controlEvidence.delete({ where: { id: evidenceId } });
  const { invalidateEvidenceBriefcaseCache } = await import('../evidence/briefcase-cache');
  invalidateEvidenceBriefcaseCache();
  return true;
}

function buildRiskResidualWriteData(
  residualLikelihood: RiskLikelihood | null,
  residualImpact: RiskImpact | null,
  residualRiskScore: number | null
): {
  residualLikelihood?: RiskLikelihood | null;
  residualImpact?: RiskImpact | null;
  residualRiskScore?: number | null;
} {
  if (!residualLikelihood && !residualImpact && residualRiskScore == null) {
    return {};
  }

  return {
    ...(residualLikelihood != null ? { residualLikelihood } : {}),
    ...(residualImpact != null ? { residualImpact } : {}),
    ...(residualRiskScore != null ? { residualRiskScore } : {}),
  };
}

function resolveResidualRiskScore(
  residualLikelihood: RiskLikelihood | null,
  residualImpact: RiskImpact | null,
  storedScore: number | null
): number | null {
  if (residualLikelihood && residualImpact) {
    return calculateRiskScore(residualLikelihood, residualImpact);
  }
  return storedScore;
}

function mapRisk(row: {
  id: string;
  controlId: string;
  title: string;
  description: string;
  category: string;
  likelihood: string;
  impact: string;
  riskScore: number;
  residualLikelihood: string | null;
  residualImpact: string | null;
  residualRiskScore: number | null;
  treatment: string;
  status: string;
  owner: string;
  reviewer?: string | null;
  approver?: string | null;
  dueDate: Date | null;
  mitigationPlan: string;
  createdAt: Date;
  updatedAt: Date;
}): Risk {
  const residualLikelihood = row.residualLikelihood as RiskLikelihood | null;
  const residualImpact = row.residualImpact as RiskImpact | null;
  const likelihood = row.likelihood as RiskLikelihood;
  const impact = row.impact as RiskImpact;

  return {
    id: row.id,
    controlId: row.controlId,
    title: row.title,
    description: row.description,
    category: row.category,
    likelihood,
    impact,
    riskScore: calculateRiskScore(likelihood, impact),
    residualLikelihood,
    residualImpact,
    residualRiskScore: resolveResidualRiskScore(
      residualLikelihood,
      residualImpact,
      row.residualRiskScore
    ),
    treatment: row.treatment as RiskTreatment,
    status: row.status as RiskStatus,
    owner: row.owner,
    reviewer: row.reviewer ?? '',
    approver: row.approver ?? '',
    dueDate: toDateString(row.dueDate),
    mitigationPlan: row.mitigationPlan,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Load reviewer/approver even when the Prisma client predates those columns. */
async function loadRiskAssigneeMap(
  riskIds: string[]
): Promise<Map<string, { reviewer: string; approver: string }>> {
  const map = new Map<string, { reviewer: string; approver: string }>();
  if (riskIds.length === 0) return map;

  const rows = await prisma.$queryRaw<
    { id: string; reviewer: string | null; approver: string | null }[]
  >`
    SELECT id, reviewer, approver
    FROM risks
    WHERE id IN (${Prisma.join(riskIds)})
  `;

  for (const row of rows) {
    map.set(row.id, {
      reviewer: row.reviewer ?? '',
      approver: row.approver ?? '',
    });
  }
  return map;
}

async function mapRisksWithAssignees(
  rows: Parameters<typeof mapRisk>[0][]
): Promise<Risk[]> {
  const assignees = await loadRiskAssigneeMap(rows.map((r) => r.id));
  return rows.map((row) => {
    const hit = assignees.get(row.id);
    return mapRisk({
      ...row,
      reviewer: hit?.reviewer ?? row.reviewer ?? '',
      approver: hit?.approver ?? row.approver ?? '',
    });
  });
}

function controlMeta(controlId: string) {
  const control = getControlById(controlId);
  const framework = control ? FRAMEWORKS.find((f) => f.id === control.frameworkId) : null;
  return {
    control,
    frameworkShortName: framework?.shortName ?? control?.frameworkId ?? 'Unknown',
    frameworkId: control?.frameworkId ?? '',
  };
}

export async function getRisksByControlId(controlId: string): Promise<Risk[]> {
  const org = await getDefaultOrganization();
  const mapped = await prisma.riskControl.findMany({
    where: { organizationId: org.id, controlId },
    select: { riskId: true },
  });
  const mappedIds = mapped.map((m) => m.riskId);
  const rows = await prisma.risk.findMany({
    where: {
      organizationId: org.id,
      OR: [{ controlId }, ...(mappedIds.length > 0 ? [{ id: { in: mappedIds } }] : [])],
    },
    orderBy: { updatedAt: 'desc' },
  });
  return mapRisksWithAssignees(rows);
}

export async function getOpenRiskCountByControlIds(
  controlIds: string[]
): Promise<Map<string, number>> {
  const org = await getDefaultOrganization();
  const counts = new Map<string, number>();
  if (controlIds.length === 0) return counts;

  const [primaryRows, mappedRows] = await Promise.all([
    prisma.risk.findMany({
      where: {
        organizationId: org.id,
        controlId: { in: controlIds },
        status: { notIn: ['closed', 'accepted'] },
      },
      select: { id: true, controlId: true },
    }),
    prisma.riskControl.findMany({
      where: {
        organizationId: org.id,
        controlId: { in: controlIds },
        risk: { status: { notIn: ['closed', 'accepted'] } },
      },
      select: { controlId: true, riskId: true },
    }),
  ]);

  const seen = new Set<string>();
  for (const row of primaryRows) {
    const key = `${row.controlId}:${row.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(row.controlId, (counts.get(row.controlId) ?? 0) + 1);
  }
  for (const row of mappedRows) {
    const key = `${row.controlId}:${row.riskId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(row.controlId, (counts.get(row.controlId) ?? 0) + 1);
  }
  return counts;
}

export async function getRisks(): Promise<Risk[]> {
  await ensureRiskSchema();
  const org = await getDefaultOrganization();
  const rows = await prisma.risk.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
  });
  return mapRisksWithAssignees(rows);
}

export async function getRiskById(riskId: string): Promise<Risk | null> {
  await ensureRiskSchema();
  const org = await getDefaultOrganization();
  const row = await prisma.risk.findFirst({
    where: { id: riskId, organizationId: org.id },
  });
  if (!row) return null;
  const [mapped] = await mapRisksWithAssignees([row]);
  return mapped ?? null;
}

export async function createRisk(input: {
  controlId: string;
  controlIds?: string[];
  title: string;
  description?: string;
  category?: string;
  likelihood?: RiskLikelihood;
  impact?: RiskImpact;
  residualLikelihood?: RiskLikelihood | null;
  residualImpact?: RiskImpact | null;
  treatment?: RiskTreatment;
  status?: RiskStatus;
  owner?: string;
  reviewer?: string;
  approver?: string;
  dueDate?: string | null;
  mitigationPlan?: string;
}): Promise<Risk> {
  await ensureRiskSchema();
  const org = await getDefaultOrganization();
  const likelihood = input.likelihood ?? 'possible';
  const impact = input.impact ?? 'moderate';
  const status = input.status ?? 'identified';
  const { residualLikelihood, residualImpact } = resolvePresentRiskFields(
    status,
    input.residualLikelihood,
    input.residualImpact
  );

  validateClosedRiskResidual(status, residualLikelihood, residualImpact);

  const residualRiskScore = resolveResidualRiskScore(
    residualLikelihood,
    residualImpact,
    null
  );

  const primaryControlId = input.controlId.trim();
  const extraIds = (input.controlIds ?? [])
    .map((id) => id.trim())
    .filter((id) => id && id !== primaryControlId);
  const allControlIds = [primaryControlId, ...Array.from(new Set(extraIds))];

  const row = await prisma.risk.create({
    data: {
      organizationId: org.id,
      controlId: primaryControlId,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      category: input.category ?? 'compliance',
      likelihood,
      impact,
      riskScore: calculateRiskScore(likelihood, impact),
      ...buildRiskResidualWriteData(residualLikelihood, residualImpact, residualRiskScore),
      treatment: input.treatment ?? 'mitigate',
      status,
      owner: input.owner?.trim() ?? '',
      dueDate: parseDateString(input.dueDate),
      mitigationPlan: input.mitigationPlan?.trim() ?? '',
      controlMappings: {
        create: allControlIds.map((controlId) => ({
          organizationId: org.id,
          controlId,
          effectiveness: 'not_assessed',
        })),
      },
    },
  });

  const reviewer = input.reviewer?.trim() ?? '';
  const approver = input.approver?.trim() ?? '';
  if (reviewer || approver) {
    await prisma.$executeRaw`
      UPDATE risks
      SET reviewer = ${reviewer}, approver = ${approver}
      WHERE id = ${row.id}
    `;
  }

  return mapRisk({ ...row, reviewer, approver });
}

export async function updateRisk(
  riskId: string,
  updates: Partial<{
    title: string;
    description: string;
    category: string;
    likelihood: RiskLikelihood;
    impact: RiskImpact;
    residualLikelihood: RiskLikelihood | null;
    residualImpact: RiskImpact | null;
    treatment: RiskTreatment;
    status: RiskStatus;
    owner: string;
    reviewer: string;
    approver: string;
    dueDate: string | null;
    mitigationPlan: string;
    controlId: string;
    controlIds: string[];
  }>
): Promise<Risk | null> {
  await ensureRiskSchema();
  const org = await getDefaultOrganization();
  const existing = await prisma.risk.findFirst({
    where: { id: riskId, organizationId: org.id },
  });
  if (!existing) return null;

  const status = (updates.status ?? existing.status) as RiskStatus;
  const likelihood = (updates.likelihood ?? existing.likelihood) as RiskLikelihood;
  const impact = (updates.impact ?? existing.impact) as RiskImpact;
  const mergedPresent = resolvePresentRiskFields(
    status,
    updates.residualLikelihood !== undefined
      ? updates.residualLikelihood
      : (existing.residualLikelihood as RiskLikelihood | null),
    updates.residualImpact !== undefined
      ? updates.residualImpact
      : (existing.residualImpact as RiskImpact | null)
  );
  const { residualLikelihood, residualImpact } = mergedPresent;

  validateClosedRiskResidual(status, residualLikelihood, residualImpact);

  const residualRiskScore = resolveResidualRiskScore(
    residualLikelihood,
    residualImpact,
    null
  );

  const nextPrimary =
    updates.controlId?.trim() ||
    (updates.controlIds && updates.controlIds[0]?.trim()) ||
    existing.controlId;

  const row = await prisma.risk.update({
    where: { id: riskId },
    data: {
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.description !== undefined
        ? { description: updates.description.trim() }
        : {}),
      ...(updates.category !== undefined ? { category: updates.category } : {}),
      ...(updates.likelihood !== undefined ? { likelihood: updates.likelihood } : {}),
      ...(updates.impact !== undefined ? { impact: updates.impact } : {}),
      ...(updates.likelihood !== undefined || updates.impact !== undefined
        ? { riskScore: calculateRiskScore(likelihood, impact) }
        : {}),
      ...(updates.residualLikelihood !== undefined ||
      updates.residualImpact !== undefined ||
      updates.status !== undefined ||
      (status === 'closed' && (!existing.residualLikelihood || !existing.residualImpact))
        ? buildRiskResidualWriteData(residualLikelihood, residualImpact, residualRiskScore)
        : {}),
      ...(updates.treatment !== undefined ? { treatment: updates.treatment } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.owner !== undefined ? { owner: updates.owner.trim() } : {}),
      ...(updates.dueDate !== undefined
        ? { dueDate: parseDateString(updates.dueDate) }
        : {}),
      ...(updates.mitigationPlan !== undefined
        ? { mitigationPlan: updates.mitigationPlan.trim() }
        : {}),
      ...(updates.controlId !== undefined || updates.controlIds !== undefined
        ? { controlId: nextPrimary }
        : {}),
    },
  });

  const existingAssignees = await loadRiskAssigneeMap([riskId]);
  const prior = existingAssignees.get(riskId);
  const nextReviewer =
    updates.reviewer !== undefined ? updates.reviewer.trim() : (prior?.reviewer ?? '');
  const nextApprover =
    updates.approver !== undefined ? updates.approver.trim() : (prior?.approver ?? '');
  if (updates.reviewer !== undefined || updates.approver !== undefined) {
    await prisma.$executeRaw`
      UPDATE risks
      SET reviewer = ${nextReviewer}, approver = ${nextApprover}
      WHERE id = ${riskId}
    `;
  }

  if (updates.controlIds !== undefined || updates.controlId !== undefined) {
    const ids =
      updates.controlIds !== undefined
        ? updates.controlIds
        : Array.from(
            new Set([
              nextPrimary,
              ...(await prisma.riskControl.findMany({
                where: { riskId, organizationId: org.id },
                select: { controlId: true },
              })).map((m) => m.controlId),
            ])
          );
    await setRiskControlMappings(riskId, ids, nextPrimary);
  }

  const [mapped] = await mapRisksWithAssignees([
    {
      ...row,
      reviewer: nextReviewer,
      approver: nextApprover,
    },
  ]);
  return mapped ?? null;
}

export async function deleteRisk(riskId: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const existing = await prisma.risk.findFirst({
    where: { id: riskId, organizationId: org.id },
  });
  if (!existing) return false;
  await prisma.risk.delete({ where: { id: riskId } });
  return true;
}

const LIKELIHOOD_ORDER: RiskLikelihood[] = [
  'rare',
  'unlikely',
  'possible',
  'likely',
  'almost_certain',
];

function bumpLikelihood(current: RiskLikelihood): RiskLikelihood {
  const idx = LIKELIHOOD_ORDER.indexOf(current);
  if (idx < 0 || idx >= LIKELIHOOD_ORDER.length - 1) return current;
  return LIKELIHOOD_ORDER[idx + 1];
}

function severityFromEffectiveness(
  effectiveness: ControlEffectiveness
): ControlIssueSeverity {
  if (effectiveness === 'failed') return 'critical';
  if (effectiveness === 'non_compliant') return 'high';
  return 'medium';
}

async function ensurePrimaryRiskControlMapping(
  orgId: string,
  riskId: string,
  primaryControlId: string
): Promise<void> {
  const count = await prisma.riskControl.count({
    where: { organizationId: orgId, riskId },
  });
  if (count > 0) return;
  await prisma.riskControl.create({
    data: {
      organizationId: orgId,
      riskId,
      controlId: primaryControlId,
      effectiveness: 'not_assessed',
    },
  });
}

export async function setRiskControlMappings(
  riskId: string,
  controlIds: string[],
  primaryControlId?: string
): Promise<RiskControlMapping[]> {
  const org = await getDefaultOrganization();
  const risk = await prisma.risk.findFirst({
    where: { id: riskId, organizationId: org.id },
  });
  if (!risk) throw new Error('Risk not found');

  const unique = Array.from(
    new Set(
      controlIds
        .map((id) => id.trim())
        .filter(Boolean)
        .concat(primaryControlId?.trim() || risk.controlId)
    )
  );
  if (unique.length === 0) {
    throw new Error('At least one mapped control is required');
  }

  const primary = (primaryControlId?.trim() || unique[0] || risk.controlId).trim();
  if (!unique.includes(primary)) unique.unshift(primary);

  const existing = await prisma.riskControl.findMany({
    where: { organizationId: org.id, riskId },
  });
  const existingByControl = new Map(existing.map((e) => [e.controlId, e]));
  const keep = new Set(unique);

  const toDelete = existing.filter((e) => !keep.has(e.controlId));
  if (toDelete.length > 0) {
    await prisma.riskControl.deleteMany({
      where: { id: { in: toDelete.map((e) => e.id) } },
    });
  }

  const toCreate = unique.filter((controlId) => !existingByControl.has(controlId));
  if (toCreate.length > 0) {
    await prisma.riskControl.createMany({
      data: toCreate.map((controlId) => ({
        organizationId: org.id,
        riskId,
        controlId,
        effectiveness: 'not_assessed',
      })),
      skipDuplicates: true,
    });
  }

  if (risk.controlId !== primary) {
    await prisma.risk.update({
      where: { id: riskId },
      data: { controlId: primary },
    });
  }

  return getRiskControlMappings(riskId);
}

export async function getRiskControlMappings(riskId: string): Promise<RiskControlMapping[]> {
  const org = await getDefaultOrganization();
  const risk = await prisma.risk.findFirst({
    where: { id: riskId, organizationId: org.id },
  });
  if (!risk) return [];

  await ensurePrimaryRiskControlMapping(org.id, riskId, risk.controlId);

  const rows = await prisma.riskControl.findMany({
    where: { organizationId: org.id, riskId },
    orderBy: { createdAt: 'asc' },
  });

  const issueIds = rows
    .map((r) => r.linkedIssueId)
    .filter((id): id is string => Boolean(id));
  const issues =
    issueIds.length > 0
      ? await prisma.controlIssue.findMany({
          where: { organizationId: org.id, id: { in: issueIds } },
        })
      : [];
  const issueById = new Map(issues.map((i) => [i.id, mapIssue(i)]));

  return rows.map((row) => {
    const meta = controlMeta(row.controlId);
    return {
      id: row.id,
      riskId: row.riskId,
      controlId: row.controlId,
      controlReference: meta.control?.reference ?? row.controlId,
      controlTitle: meta.control?.title ?? 'Unknown control',
      frameworkShortName: meta.frameworkShortName,
      effectiveness: row.effectiveness as ControlEffectiveness,
      assessmentNotes: row.assessmentNotes,
      lastAssessedAt: row.lastAssessedAt?.toISOString() ?? null,
      linkedIssueId: row.linkedIssueId,
      linkedIssue: row.linkedIssueId ? issueById.get(row.linkedIssueId) ?? null : null,
      isPrimary: row.controlId === risk.controlId,
    };
  });
}

export async function getRiskWorkflow(riskId: string): Promise<{
  risk: Risk;
  mappings: RiskControlMapping[];
} | null> {
  const risk = await getRiskById(riskId);
  if (!risk) return null;
  const mappings = await getRiskControlMappings(riskId);
  return {
    risk: {
      ...risk,
      controlIds: mappings.map((m) => m.controlId),
    },
    mappings,
  };
}

export async function assessRiskControl(
  riskId: string,
  controlId: string,
  input: {
    effectiveness: ControlEffectiveness;
    notes?: string;
    assignee?: string;
  }
): Promise<{
  mapping: RiskControlMapping;
  issue: ControlIssue | null;
  issueCreated: boolean;
  risk: Risk;
}> {
  const org = await getDefaultOrganization();
  const risk = await prisma.risk.findFirst({
    where: { id: riskId, organizationId: org.id },
  });
  if (!risk) throw new Error('Risk not found');

  await ensurePrimaryRiskControlMapping(org.id, riskId, risk.controlId);

  let mapping = await prisma.riskControl.findFirst({
    where: { organizationId: org.id, riskId, controlId },
  });
  if (!mapping) {
    mapping = await prisma.riskControl.create({
      data: {
        organizationId: org.id,
        riskId,
        controlId,
        effectiveness: 'not_assessed',
      },
    });
  }

  const notes = input.notes?.trim() ?? '';
  const isDeviation = DEVIATION_EFFECTIVENESS.includes(input.effectiveness);
  let issue: ControlIssue | null = null;
  let issueCreated = false;
  let linkedIssueId = mapping.linkedIssueId;

  if (isDeviation) {
    if (linkedIssueId) {
      const existingIssue = await prisma.controlIssue.findFirst({
        where: { id: linkedIssueId, organizationId: org.id },
      });
      if (
        existingIssue &&
        (existingIssue.status === 'open' || existingIssue.status === 'in_progress')
      ) {
        issue = mapIssue(existingIssue);
      } else {
        linkedIssueId = null;
      }
    }

    if (!issue) {
      const openExisting = await prisma.controlIssue.findFirst({
        where: {
          organizationId: org.id,
          controlId,
          riskId,
          status: { in: ['open', 'in_progress'] },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (openExisting) {
        issue = mapIssue(openExisting);
        linkedIssueId = openExisting.id;
      } else {
        const control = getControlById(controlId);
        const created = await createControlIssue(controlId, {
          title: `Control deviation: ${control?.reference ?? controlId} — ${risk.title}`,
          description:
            notes ||
            `Mapped control assessed as ${input.effectiveness.replace(/_/g, ' ')} for risk "${risk.title}". Remediation and re-test required.`,
          severity: severityFromEffectiveness(input.effectiveness),
          raisedBy: 'Risk workflow',
          assignee: input.assignee?.trim() || risk.owner || '',
          riskId,
        });
        issue = created;
        linkedIssueId = created.id;
        issueCreated = true;
      }
    }

    if (risk.status === 'identified' || risk.status === 'accepted') {
      await prisma.risk.update({
        where: { id: riskId },
        data: { status: 'treating' },
      });
    }
  } else if (input.effectiveness === 'effective' && linkedIssueId) {
    const linked = await prisma.controlIssue.findFirst({
      where: { id: linkedIssueId, organizationId: org.id },
    });
    if (linked && (linked.status === 'open' || linked.status === 'in_progress')) {
      // Keep open issues until explicit retest pass — only update assessment.
    }
  }

  await prisma.riskControl.update({
    where: { id: mapping.id },
    data: {
      effectiveness: input.effectiveness,
      assessmentNotes: notes || mapping.assessmentNotes,
      lastAssessedAt: new Date(),
      linkedIssueId,
    },
  });

  const mappings = await getRiskControlMappings(riskId);
  const updatedMapping = mappings.find((m) => m.controlId === controlId)!;
  const updatedRisk = (await getRiskById(riskId))!;

  return {
    mapping: updatedMapping,
    issue: updatedMapping.linkedIssue ?? issue,
    issueCreated,
    risk: updatedRisk,
  };
}

export async function retestRiskControl(
  riskId: string,
  controlId: string,
  input: {
    result: 'passed' | 'failed';
    notes?: string;
  }
): Promise<{
  mapping: RiskControlMapping;
  issue: ControlIssue | null;
  risk: Risk;
  escalated: boolean;
}> {
  const org = await getDefaultOrganization();
  const risk = await prisma.risk.findFirst({
    where: { id: riskId, organizationId: org.id },
  });
  if (!risk) throw new Error('Risk not found');

  const mapping = await prisma.riskControl.findFirst({
    where: { organizationId: org.id, riskId, controlId },
  });
  if (!mapping) throw new Error('Control is not mapped to this risk');

  const notes = input.notes?.trim() ?? '';
  let escalated = false;
  let issue: ControlIssue | null = null;

  if (input.result === 'passed') {
    if (mapping.linkedIssueId) {
      const existing = await prisma.controlIssue.findFirst({
        where: { id: mapping.linkedIssueId, organizationId: org.id },
      });
      if (existing) {
        const closed = await prisma.controlIssue.update({
          where: { id: existing.id },
          data: {
            status: 'closed',
            resolutionNotes:
              notes ||
              existing.resolutionNotes ||
              'Control re-test passed; issue closed by risk workflow.',
          },
        });
        issue = mapIssue(closed);
      }
    }

    await prisma.riskControl.update({
      where: { id: mapping.id },
      data: {
        effectiveness: 'effective',
        assessmentNotes: notes || mapping.assessmentNotes,
        lastAssessedAt: new Date(),
        linkedIssueId: null,
      },
    });
  } else {
    escalated = true;
    const nextLikelihood = bumpLikelihood(risk.likelihood as RiskLikelihood);
    await prisma.risk.update({
      where: { id: riskId },
      data: {
        status: 'treating',
        likelihood: nextLikelihood,
        riskScore: calculateRiskScore(nextLikelihood, risk.impact as RiskImpact),
      },
    });

    if (mapping.linkedIssueId) {
      const existing = await prisma.controlIssue.findFirst({
        where: { id: mapping.linkedIssueId, organizationId: org.id },
      });
      if (existing) {
        const updated = await prisma.controlIssue.update({
          where: { id: existing.id },
          data: {
            status: 'in_progress',
            severity:
              existing.severity === 'critical' ? 'critical' : 'high',
            resolutionNotes:
              notes ||
              `${existing.resolutionNotes ? existing.resolutionNotes + '\n' : ''}Re-test failed — risk escalated.`,
          },
        });
        issue = mapIssue(updated);
      }
    }

    await prisma.riskControl.update({
      where: { id: mapping.id },
      data: {
        effectiveness: 'failed',
        assessmentNotes: notes || mapping.assessmentNotes,
        lastAssessedAt: new Date(),
      },
    });
  }

  const mappings = await getRiskControlMappings(riskId);
  const updatedMapping = mappings.find((m) => m.controlId === controlId)!;
  const updatedRisk = (await getRiskById(riskId))!;

  return {
    mapping: updatedMapping,
    issue: updatedMapping.linkedIssue ?? issue,
    risk: updatedRisk,
    escalated,
  };
}

export async function getAllControlIssuesForOrg(): Promise<ControlIssue[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.controlIssue.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map(mapIssue);
}

export async function getRiskRegister(): Promise<RiskRegisterEntry[]> {
  const org = await getDefaultOrganization();
  await prisma.risk.updateMany({
    where: {
      organizationId: org.id,
      status: 'closed',
      OR: [{ residualLikelihood: null }, { residualImpact: null }],
    },
    data: {
      residualLikelihood: 'unlikely',
      residualImpact: 'minor',
      residualRiskScore: calculateRiskScore('unlikely', 'minor'),
    },
  });

  const activatedIds = await getActivatedFrameworkIds();
  const linkableControlIds = new Set(
    getAllControlsForActivatedFrameworks(activatedIds).map((c) => c.id)
  );

  const [risks, issues] = await Promise.all([getRisks(), getAllControlIssuesForOrg()]);
  const entries: RiskRegisterEntry[] = [];

  for (const risk of risks) {
    if (!linkableControlIds.has(risk.controlId)) continue;
    const meta = controlMeta(risk.controlId);
    if (!meta.control) continue;
    const presentScore = getPresentRiskScore(risk);
    entries.push({
      id: risk.id,
      entryType: 'risk',
      controlId: risk.controlId,
      controlReference: meta.control.reference,
      controlTitle: meta.control.title,
      frameworkId: meta.frameworkId,
      frameworkShortName: meta.frameworkShortName,
      title: risk.title,
      description: risk.description,
      severityOrScore: formatRiskScoreDisplay(presentScore ?? risk.riskScore),
      inherentRisk: formatRiskScoreDisplay(risk.riskScore),
      presentRisk:
        presentScore != null ? formatRiskScoreDisplay(presentScore) : '—',
      likelihood: risk.likelihood,
      impact: risk.impact,
      residualLikelihood: risk.residualLikelihood,
      residualImpact: risk.residualImpact,
      status: risk.status,
      owner: risk.owner,
      assignee: '',
      dueDate: risk.dueDate,
      createdAt: risk.createdAt,
      updatedAt: risk.updatedAt,
    });
  }

  for (const issue of issues) {
    if (!linkableControlIds.has(issue.controlId)) continue;
    const meta = controlMeta(issue.controlId);
    if (!meta.control) continue;
    entries.push({
      id: issue.id,
      entryType: 'issue',
      controlId: issue.controlId,
      controlReference: meta.control.reference,
      controlTitle: meta.control.title,
      frameworkId: meta.frameworkId,
      frameworkShortName: meta.frameworkShortName,
      title: issue.title,
      description: issue.description,
      severityOrScore: ISSUE_SEVERITY_LABELS[issue.severity],
      inherentRisk: null,
      presentRisk: ISSUE_SEVERITY_LABELS[issue.severity],
      status: issue.status,
      owner: issue.raisedBy,
      assignee: issue.assignee,
      dueDate: issue.dueDate,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    });
  }

  return entries.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getDashboardRiskSummary(): Promise<DashboardRiskSummary> {
  const entries = await getRiskRegister();
  const risks = entries.filter((entry) => entry.entryType === 'risk');

  const items = risks
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      status: entry.status,
      frameworkShortName: entry.frameworkShortName,
      controlReference: entry.controlReference,
      inherentRisk: entry.inherentRisk ?? '—',
      presentRisk: resolvePresentRiskDisplay(entry),
    }))
    .sort((a, b) => {
      const openStatuses = ['closed', 'accepted'];
      const aOpen = !openStatuses.includes(a.status);
      const bOpen = !openStatuses.includes(b.status);
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      return (parseRiskScoreValue(b.presentRisk) ?? -1) - (parseRiskScoreValue(a.presentRisk) ?? -1);
    })
    .slice(0, 8);

  return {
    totalRisks: risks.length,
    openRisks: risks.filter((entry) => !['closed', 'accepted'].includes(entry.status)).length,
    inherentHighOrCritical: risks.filter((entry) =>
      isHighOrCriticalDisplay(entry.inherentRisk)
    ).length,
    presentHighOrCritical: risks.filter((entry) =>
      isHighOrCriticalDisplay(resolvePresentRiskDisplay(entry))
    ).length,
    items,
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const activatedIds = await getActivatedFrameworkIds();
  const controls = getAllControlsForActivatedFrameworks(activatedIds);
  const controlIds = controls.map((c) => c.id);
  const complianceMap = await getControlComplianceBatch(controlIds);

  let auditReady = 0;
  let implementing = 0;
  let notStarted = 0;
  let notApplicable = 0;

  for (const control of controls) {
    const compliance = complianceMap.get(control.id) ?? createDefaultCompliance(control.id);
    if (compliance.status === 'not_applicable') notApplicable++;
    else if (READY_STATUSES.includes(compliance.status)) auditReady++;
    else if (compliance.status === 'implementing' || compliance.status === 'planning')
      implementing++;
    else notStarted++;
  }

  const byFramework = activatedIds.map((frameworkId) => {
    const fwControls = getControlsByFramework(frameworkId);
    const fw = FRAMEWORKS.find((f) => f.id === frameworkId);
    let ready = 0;
    for (const c of fwControls) {
      const comp = complianceMap.get(c.id) ?? createDefaultCompliance(c.id);
      if (READY_STATUSES.includes(comp.status)) ready++;
    }
    return {
      frameworkId,
      frameworkName: fw?.shortName ?? frameworkId,
      readiness: fwControls.length ? Math.round((ready / fwControls.length) * 100) : 0,
      total: fwControls.length,
      ready,
    };
  });

  const overallReadiness = controls.length
    ? Math.round((auditReady / controls.length) * 100)
    : 0;

  const riskSummary = await getDashboardRiskSummary();

  return {
    activatedFrameworks: activatedIds.length,
    totalControls: controls.length,
    auditReady,
    implementing,
    notStarted,
    notApplicable,
    overallReadiness,
    byFramework,
    riskSummary,
  };
}

const LEADERSHIP_PRIORITY_DOMAINS: ControlDomain[] = [
  'access_control',
  'audit_logging',
  'vulnerability_management',
  'network_security',
  'incident_response',
  'governance',
];

export async function getExecutiveDashboard(): Promise<ExecutiveDashboard> {
  const org = await getDefaultOrganization();
  const activatedIds = await getActivatedFrameworkIds();
  const controls = getAllControlsForActivatedFrameworks(activatedIds);
  const controlIds = controls.map((c) => c.id);

  const [complianceMap, issueCountMap, riskCountMap, allIssues, risks] = await Promise.all([
    getControlComplianceBatch(controlIds),
    getOpenIssueCountByControlIds(controlIds),
    getOpenRiskCountByControlIds(controlIds),
    getAllControlIssuesForOrg(),
    getRisks(),
  ]);

  const leadershipAttention: LeadershipAttentionItem[] = [];
  const priorityActionSet = new Set<string>();

  let totalGreen = 0;
  let totalAmber = 0;
  let totalRed = 0;

  const frameworks: ExecutiveFrameworkView[] = activatedIds.map((frameworkId) => {
    const fwControls = getControlsByFramework(frameworkId);
    const fw = FRAMEWORKS.find((f) => f.id === frameworkId);
    const domainMap = new Map<
      ControlDomain,
      { green: number; amber: number; red: number; actionCounts: Map<string, number> }
    >();

    let fwGreen = 0;
    let fwAmber = 0;
    let fwRed = 0;

    for (const control of fwControls) {
      const compliance = complianceMap.get(control.id) ?? createDefaultCompliance(control.id);
      const ragInput = {
        status: compliance.status,
        complianceMethod: compliance.complianceMethod,
        owner: compliance.owner,
        openIssueCount: issueCountMap.get(control.id) ?? 0,
        openRiskCount: riskCountMap.get(control.id) ?? 0,
      };
      const rag = classifyControlRag(ragInput);

      if (rag === 'green') fwGreen++;
      else if (rag === 'amber') fwAmber++;
      else fwRed++;

      const domainEntry = domainMap.get(control.domain) ?? {
        green: 0,
        amber: 0,
        red: 0,
        actionCounts: new Map<string, number>(),
      };
      domainEntry[rag]++;
      for (const action of getGoGreenActions(ragInput)) {
        domainEntry.actionCounts.set(action, (domainEntry.actionCounts.get(action) ?? 0) + 1);
        if (rag !== 'green') {
          priorityActionSet.add(action);
        }
      }
      domainMap.set(control.domain, domainEntry);

      if (rag === 'red' && LEADERSHIP_PRIORITY_DOMAINS.includes(control.domain)) {
        leadershipAttention.push({
          id: `control-red-${control.id}`,
          severity: !compliance.owner.trim() ? 'high' : 'medium',
          category: 'control',
          title: `${control.reference} — ${control.title}`,
          description: getGoGreenActions(ragInput)[0] ?? 'Control requires immediate remediation',
          frameworkShortName: fw?.shortName ?? frameworkId,
          controlId: control.id,
          controlReference: control.reference,
          href: `/controls/${control.id}`,
        });
      }
    }

    totalGreen += fwGreen;
    totalAmber += fwAmber;
    totalRed += fwRed;

    const domains: ExecutiveDomainSummary[] = [...domainMap.entries()]
      .map(([domain, counts]) => {
        const total = counts.green + counts.amber + counts.red;
        const goGreenActions = [...counts.actionCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([action]) => action);

        const redPercent = total ? Math.round((counts.red / total) * 100) : 0;
        if (redPercent >= 40 && counts.red >= 2) {
          leadershipAttention.push({
            id: `domain-${frameworkId}-${domain}`,
            severity: LEADERSHIP_PRIORITY_DOMAINS.includes(domain) ? 'high' : 'medium',
            category: 'domain',
            title: `${DOMAIN_LABELS[domain]} — ${counts.red} of ${total} controls red`,
            description: `Domain is ${redPercent}% red in ${fw?.shortName ?? frameworkId}. Focus: ${goGreenActions[0] ?? 'Assign owners and define compliance approach'}`,
            frameworkShortName: fw?.shortName ?? frameworkId,
            href: `/frameworks/${frameworkId}`,
          });
        }

        return {
          domain,
          domainLabel: DOMAIN_LABELS[domain],
          green: counts.green,
          amber: counts.amber,
          red: counts.red,
          total,
          readinessPercent: total ? Math.round((counts.green / total) * 100) : 0,
          goGreenActions,
        };
      })
      .sort((a, b) => b.red - a.red || a.readinessPercent - b.readinessPercent);

    const fwTotal = fwControls.length;
    const readiness = fwTotal ? Math.round((fwGreen / fwTotal) * 100) : 0;

    if (readiness < 50 && fwTotal > 0) {
      leadershipAttention.push({
        id: `framework-low-${frameworkId}`,
        severity: 'high',
        category: 'domain',
        title: `${fw?.shortName ?? frameworkId} readiness at ${readiness}%`,
        description: `${fwRed} controls red and ${fwAmber} amber — executive sponsorship needed to accelerate compliance program`,
        frameworkShortName: fw?.shortName ?? frameworkId,
        href: `/frameworks/${frameworkId}`,
      });
    }

    return {
      frameworkId,
      frameworkName: fw?.shortName ?? frameworkId,
      readiness,
      green: fwGreen,
      amber: fwAmber,
      red: fwRed,
      total: fwTotal,
      domains,
    };
  });

  for (const risk of risks) {
    if (['closed', 'accepted'].includes(risk.status)) continue;
    const presentScore = getPresentRiskScore(risk);
    const present =
      presentScore != null
        ? formatRiskScoreDisplay(presentScore)
        : formatRiskScoreDisplay(risk.riskScore);
    if (!isHighOrCriticalDisplay(present)) continue;

    const meta = controlMeta(risk.controlId);
    const isCritical = present.includes('Critical');
    leadershipAttention.push({
      id: `risk-${risk.id}`,
      severity: isCritical ? 'critical' : 'high',
      category: 'risk',
      title: risk.title,
      description: `Open risk at ${present} present severity on ${meta.control?.reference ?? 'linked control'}`,
      frameworkShortName: meta.frameworkShortName,
      controlId: risk.controlId,
      controlReference: meta.control?.reference,
      href: `/risk-register/risks/${risk.id}`,
    });
  }

  for (const issue of allIssues) {
    if (!['open', 'in_progress'].includes(issue.status)) continue;
    if (issue.severity !== 'critical' && issue.severity !== 'high') continue;

    const control = getControlById(issue.controlId);
    const framework = control ? FRAMEWORKS.find((f) => f.id === control.frameworkId) : null;
    leadershipAttention.push({
      id: `issue-${issue.id}`,
      severity: issue.severity === 'critical' ? 'critical' : 'high',
      category: 'issue',
      title: issue.title,
      description: `${ISSUE_SEVERITY_LABELS[issue.severity as ControlIssueSeverity]} open issue on ${control?.reference ?? issue.controlId}`,
      frameworkShortName: framework?.shortName ?? 'Unknown',
      controlId: issue.controlId,
      controlReference: control?.reference,
      href: `/controls/${issue.controlId}?tab=issues`,
    });
  }

  const severityOrder = { critical: 0, high: 1, medium: 2 };
  leadershipAttention.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  const total = totalGreen + totalAmber + totalRed;
  const riskSummary = await getDashboardRiskSummary();

  return {
    organizationName: org.name,
    frameworks,
    totals: {
      green: totalGreen,
      amber: totalAmber,
      red: totalRed,
      total,
      readinessPercent: total ? Math.round((totalGreen / total) * 100) : 0,
    },
    leadershipAttention: leadershipAttention.slice(0, 12),
    priorityGoGreenActions: [...priorityActionSet].slice(0, 8),
    riskSummary,
  };
}
