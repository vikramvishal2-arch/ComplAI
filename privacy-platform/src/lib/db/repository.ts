import type { Prisma } from '@prisma/client';
import type { PrivacyFrameworkId } from '../types';
import { PRIVACY_FRAMEWORKS } from '../data/frameworks';
import { PRIVACY_CONTROLS } from '../data/controls';
import { PRIVACY_MODULES } from '../data/modules';
import { prisma } from './prisma';
import { ORGANIZATION_NAME } from '../brand';
import { saveEvidenceFile, deleteEvidenceFile } from '../evidence/storage';
import { classifyControlRag, getGoGreenActions } from '../compliance/rag-status';
import { getAuditReadyBlockers, AuditReadyBlockedError } from '../compliance/audit-ready';
import type {
  ControlCompliance,
  ControlRemediation,
  ControlIssue,
  ControlEvidence,
  RemediationAction,
  ControlIssueSeverity,
  ControlIssueStatus,
  EvidenceContext,
  DashboardSummary,
  ExecutiveDashboard,
  ExecutiveFrameworkView,
  ExecutiveModuleSummary,
  LeadershipAttentionItem,
} from '../types';

const DEFAULT_FRAMEWORKS: PrivacyFrameworkId[] = [
  'nist-privacy',
  'iso27701',
  'gdpr',
  'india-dpdp',
];

const READY_STATUSES = ['implemented', 'audit_ready', 'not_applicable'] as const;

function toDateString(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function parseDateString(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
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

export function getAllControlsForActivatedFrameworks(activatedIds: string[]) {
  if (!activatedIds.length) return [];
  return PRIVACY_CONTROLS.filter((c) =>
    c.frameworkMappings.some((m) => activatedIds.includes(m.frameworkId))
  );
}

export function getControlsByFramework(frameworkId: string) {
  return PRIVACY_CONTROLS.filter((c) =>
    c.frameworkMappings.some((m) => m.frameworkId === frameworkId)
  );
}

export async function getDefaultOrganization() {
  let org = await prisma.pcOrganization.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!org) {
    org = await prisma.pcOrganization.create({ data: { name: ORGANIZATION_NAME } });
    await seedOrganization(org.id);
  }
  return org;
}

export async function seedOrganization(orgId: string) {
  for (const frameworkId of DEFAULT_FRAMEWORKS) {
    await prisma.pcFrameworkActivation.upsert({
      where: {
        organizationId_frameworkId: { organizationId: orgId, frameworkId },
      },
      create: { organizationId: orgId, frameworkId },
      update: {},
    });
  }
}

export async function getActivatedFrameworkIds(): Promise<string[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.pcFrameworkActivation.findMany({
    where: { organizationId: org.id },
  });
  return rows.map((r) => r.frameworkId);
}

export async function activateFramework(frameworkId: string) {
  const org = await getDefaultOrganization();
  return prisma.pcFrameworkActivation.upsert({
    where: {
      organizationId_frameworkId: { organizationId: org.id, frameworkId },
    },
    create: { organizationId: org.id, frameworkId },
    update: {},
  });
}

export async function deactivateFramework(frameworkId: string) {
  const org = await getDefaultOrganization();
  await prisma.pcFrameworkActivation.deleteMany({
    where: { organizationId: org.id, frameworkId },
  });
}

export async function getControlCompliance(controlId: string): Promise<ControlCompliance> {
  const org = await getDefaultOrganization();
  const row = await prisma.pcControlCompliance.findUnique({
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
  const rows = await prisma.pcControlCompliance.findMany({
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

  const row = await prisma.pcControlCompliance.upsert({
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

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const activatedIds = await getActivatedFrameworkIds();
  const controls = getAllControlsForActivatedFrameworks(activatedIds);
  const complianceMap = await getControlComplianceBatch(controls.map((c) => c.id));

  let auditReady = 0;
  let implementing = 0;
  let notStarted = 0;
  let notApplicable = 0;

  for (const control of controls) {
    const compliance = complianceMap.get(control.id) ?? createDefaultCompliance(control.id);
    if (compliance.status === 'not_applicable') notApplicable++;
    else if (READY_STATUSES.includes(compliance.status as (typeof READY_STATUSES)[number]))
      auditReady++;
    else if (compliance.status === 'implementing' || compliance.status === 'planning')
      implementing++;
    else notStarted++;
  }

  const byFramework = activatedIds.map((frameworkId) => {
    const fwControls = getControlsByFramework(frameworkId);
    const fw = PRIVACY_FRAMEWORKS.find((f) => f.id === frameworkId);
    let ready = 0;
    for (const c of fwControls) {
      const comp = complianceMap.get(c.id) ?? createDefaultCompliance(c.id);
      if (READY_STATUSES.includes(comp.status as (typeof READY_STATUSES)[number])) ready++;
    }
    return {
      frameworkId,
      frameworkName: fw?.shortName ?? frameworkId,
      readiness: fwControls.length ? Math.round((ready / fwControls.length) * 100) : 0,
      total: fwControls.length,
      ready,
    };
  });

  const byModule = Array.from(new Set(controls.map((c) => c.moduleId))).map((moduleId) => {
    const modControls = controls.filter((c) => c.moduleId === moduleId);
    let ready = 0;
    for (const c of modControls) {
      const comp = complianceMap.get(c.id) ?? createDefaultCompliance(c.id);
      if (READY_STATUSES.includes(comp.status as (typeof READY_STATUSES)[number])) ready++;
    }
    return {
      moduleId,
      readiness: modControls.length ? Math.round((ready / modControls.length) * 100) : 0,
      total: modControls.length,
      ready,
    };
  });

  return {
    activatedFrameworks: activatedIds.length,
    totalControls: controls.length,
    auditReady,
    implementing,
    notStarted,
    notApplicable,
    overallReadiness: controls.length ? Math.round((auditReady / controls.length) * 100) : 0,
    byFramework,
    byModule,
  };
}

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function createDefaultRemediation(controlId: string): ControlRemediation {
  return { controlId, actions: [], lastUpdated: new Date().toISOString() };
}

function mapRemediation(row: {
  controlId: string;
  actions: unknown;
  updatedAt: Date;
}): ControlRemediation {
  return {
    controlId: row.controlId,
    actions: (Array.isArray(row.actions) ? row.actions : []) as RemediationAction[],
    lastUpdated: row.updatedAt.toISOString(),
  };
}

export async function getOrganizationName(): Promise<string> {
  const org = await getDefaultOrganization();
  return org.name;
}

export async function setOrganizationName(name: string): Promise<string> {
  const org = await getDefaultOrganization();
  const updated = await prisma.pcOrganization.update({
    where: { id: org.id },
    data: { name: name.trim() },
  });
  return updated.name;
}

export async function getControlRemediation(controlId: string): Promise<ControlRemediation> {
  const org = await getDefaultOrganization();
  const row = await prisma.pcControlRemediation.findUnique({
    where: { organizationId_controlId: { organizationId: org.id, controlId } },
  });
  if (row) return mapRemediation(row);
  return createDefaultRemediation(controlId);
}

export async function updateControlRemediation(
  controlId: string,
  updates: { actions?: RemediationAction[] }
): Promise<ControlRemediation> {
  const org = await getDefaultOrganization();
  const current = await getControlRemediation(controlId);
  const row = await prisma.pcControlRemediation.upsert({
    where: { organizationId_controlId: { organizationId: org.id, controlId } },
    create: {
      organizationId: org.id,
      controlId,
      actions: toJsonValue(updates.actions ?? current.actions),
    },
    update: {
      actions: updates.actions ? toJsonValue(updates.actions) : undefined,
    },
  });
  return mapRemediation(row);
}

function mapIssue(row: {
  id: string;
  controlId: string;
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
  const org = await getDefaultOrganization();
  const rows = await prisma.pcControlIssue.findMany({
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
  const rows = await prisma.pcControlIssue.groupBy({
    by: ['controlId'],
    where: {
      organizationId: org.id,
      controlId: { in: controlIds },
      status: { in: ['open', 'in_progress'] },
    },
    _count: { _all: true },
  });
  for (const row of rows) counts.set(row.controlId, row._count._all);
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
  }
): Promise<ControlIssue> {
  const org = await getDefaultOrganization();
  const row = await prisma.pcControlIssue.create({
    data: {
      organizationId: org.id,
      controlId,
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
  const existing = await prisma.pcControlIssue.findFirst({
    where: { id: issueId, organizationId: org.id },
  });
  if (!existing) return null;
  const row = await prisma.pcControlIssue.update({
    where: { id: issueId },
    data: {
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
      ...(updates.severity !== undefined ? { severity: updates.severity } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.raisedBy !== undefined ? { raisedBy: updates.raisedBy.trim() } : {}),
      ...(updates.assignee !== undefined ? { assignee: updates.assignee.trim() } : {}),
      ...(updates.dueDate !== undefined ? { dueDate: parseDateString(updates.dueDate) } : {}),
      ...(updates.resolutionNotes !== undefined
        ? { resolutionNotes: updates.resolutionNotes.trim() }
        : {}),
    },
  });
  return mapIssue(row);
}

export async function deleteControlIssue(issueId: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const existing = await prisma.pcControlIssue.findFirst({
    where: { id: issueId, organizationId: org.id },
  });
  if (!existing) return false;
  await prisma.pcControlIssue.delete({ where: { id: issueId } });
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
}): ControlEvidence {
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
  };
}

export async function getControlEvidence(
  controlId: string,
  context?: EvidenceContext
): Promise<ControlEvidence[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.pcControlEvidence.findMany({
    where: {
      organizationId: org.id,
      controlId,
      ...(context ? { context } : {}),
    },
    orderBy: { uploadedAt: 'desc' },
  });
  return rows.map(mapEvidence);
}

export async function hasControlEvidenceForContext(
  controlId: string,
  context: EvidenceContext
): Promise<boolean> {
  const org = await getDefaultOrganization();
  const count = await prisma.pcControlEvidence.count({
    where: { organizationId: org.id, controlId, context },
  });
  return count > 0;
}

export async function getControlEvidenceById(
  evidenceId: string
): Promise<(ControlEvidence & { storagePath: string }) | null> {
  const org = await getDefaultOrganization();
  const row = await prisma.pcControlEvidence.findFirst({
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
  const row = await prisma.pcControlEvidence.create({
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
  return mapEvidence(row);
}

export async function deleteControlEvidence(evidenceId: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const row = await prisma.pcControlEvidence.findFirst({
    where: { id: evidenceId, organizationId: org.id },
  });
  if (!row) return false;
  await deleteEvidenceFile(row.storagePath);
  await prisma.pcControlEvidence.delete({ where: { id: evidenceId } });
  return true;
}

export async function updateControlComplianceWithValidation(
  controlId: string,
  updates: Partial<Omit<ControlCompliance, 'controlId'>>,
  issues: ControlIssue[]
): Promise<ControlCompliance> {
  if (updates.status === 'audit_ready') {
    const blocker = getAuditReadyBlockers(issues);
    if (blocker) throw new AuditReadyBlockedError(blocker);
  }
  return updateControlCompliance(controlId, updates);
}

export async function getExecutiveDashboard(): Promise<ExecutiveDashboard> {
  const org = await getDefaultOrganization();
  const activatedIds = await getActivatedFrameworkIds();
  const controls = getAllControlsForActivatedFrameworks(activatedIds);
  const controlIds = controls.map((c) => c.id);

  const [complianceMap, issueCountMap] = await Promise.all([
    getControlComplianceBatch(controlIds),
    getOpenIssueCountByControlIds(controlIds),
  ]);

  const leadershipAttention: LeadershipAttentionItem[] = [];
  const priorityActionSet = new Set<string>();
  let totalGreen = 0;
  let totalAmber = 0;
  let totalRed = 0;

  const frameworks: ExecutiveFrameworkView[] = activatedIds.map((frameworkId) => {
    const fwControls = getControlsByFramework(frameworkId);
    const fw = PRIVACY_FRAMEWORKS.find((f) => f.id === frameworkId);
    const moduleMap = new Map<
      string,
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
      };
      const rag = classifyControlRag(ragInput);
      if (rag === 'green') fwGreen++;
      else if (rag === 'amber') fwAmber++;
      else fwRed++;

      const modEntry = moduleMap.get(control.moduleId) ?? {
        green: 0,
        amber: 0,
        red: 0,
        actionCounts: new Map<string, number>(),
      };
      modEntry[rag]++;
      for (const action of getGoGreenActions(ragInput)) {
        modEntry.actionCounts.set(action, (modEntry.actionCounts.get(action) ?? 0) + 1);
        if (rag !== 'green') priorityActionSet.add(action);
      }
      moduleMap.set(control.moduleId, modEntry);

      if (rag === 'red') {
        leadershipAttention.push({
          id: `control-red-${control.id}`,
          severity: !compliance.owner.trim() ? 'high' : 'medium',
          category: 'control',
          title: `${control.reference} — ${control.title}`,
          description: getGoGreenActions(ragInput)[0] ?? 'Control requires immediate action',
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

    const modules: ExecutiveModuleSummary[] = [...moduleMap.entries()]
      .map(([moduleId, counts]) => {
        const mod = PRIVACY_MODULES.find((m) => m.id === moduleId);
        const total = counts.green + counts.amber + counts.red;
        const goGreenActions = [...counts.actionCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([action]) => action);
        return {
          moduleId,
          moduleLabel: mod?.shortName ?? moduleId,
          green: counts.green,
          amber: counts.amber,
          red: counts.red,
          total,
          readinessPercent: total ? Math.round((counts.green / total) * 100) : 0,
          goGreenActions,
        };
      })
      .sort((a, b) => b.red - a.red);

    const fwTotal = fwControls.length;
    return {
      frameworkId,
      frameworkName: fw?.shortName ?? frameworkId,
      green: fwGreen,
      amber: fwAmber,
      red: fwRed,
      total: fwTotal,
      readinessPercent: fwTotal ? Math.round((fwGreen / fwTotal) * 100) : 0,
      modules,
    };
  });

  const total = controls.length;
  const healthScore = total ? Math.round((totalGreen / total) * 100) : 0;

  return {
    organizationName: org.name,
    totalControls: total,
    green: totalGreen,
    amber: totalAmber,
    red: totalRed,
    healthScore,
    frameworks,
    leadershipAttention: leadershipAttention.slice(0, 12),
    priorityActions: [...priorityActionSet].slice(0, 8),
  };
}

export async function seedSampleCompliance(orgId: string) {
  const samples: Array<{
    controlId: string;
    status: ControlCompliance['status'];
    complianceMethod: ControlCompliance['complianceMethod'];
    owner: string;
    implementationApproach: string;
  }> = [
    {
      controlId: 'pc-gov-01',
      status: 'implementing',
      complianceMethod: 'policy',
      owner: 'DPO Team',
      implementationApproach: 'Privacy program charter drafted and under executive review.',
    },
    {
      controlId: 'pc-gov-02',
      status: 'planning',
      complianceMethod: 'procedure',
      owner: 'Privacy Lead',
      implementationApproach: 'RACI matrix for privacy roles being finalized.',
    },
    {
      controlId: 'pc-inv-01',
      status: 'planning',
      complianceMethod: 'manual_process',
      owner: 'Data Governance',
      implementationApproach: 'RoPA template created; department interviews scheduled.',
    },
    {
      controlId: 'pc-dsar-01',
      status: 'not_started',
      complianceMethod: null,
      owner: '',
      implementationApproach: '',
    },
  ];

  for (const sample of samples) {
    await prisma.pcControlCompliance.upsert({
      where: {
        organizationId_controlId: { organizationId: orgId, controlId: sample.controlId },
      },
      create: {
        organizationId: orgId,
        controlId: sample.controlId,
        status: sample.status,
        complianceMethod: sample.complianceMethod,
        owner: sample.owner,
        implementationApproach: sample.implementationApproach,
      },
      update: {},
    });
  }
}
