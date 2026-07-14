import { prisma } from '@/lib/db/prisma';
import {
  RISK_ASSESSMENT_DOMAINS,
  defaultStageProgress,
  resolveDomainControlRefs,
  type DomainRiskItem,
  type RiskAssessmentStageKey,
  type StageProgress,
} from '@/lib/data/risk-assessment-domains';
import {
  countDomainRisksBySeverity,
  createDomainRiskItem,
  normalizeDomainRiskItem,
  parseDomainRiskItem,
} from '@/lib/risk/domain-risk-item';

export type SerializedRiskDomain = {
  id: string;
  domainKey: string;
  name: string;
  owner: string;
  status: string;
  controlRefs: string[];
  identification: StageProgress;
  analysis: StageProgress;
  evaluation: StageProgress;
  riskItems: DomainRiskItem[];
  severityCounts: Record<'critical' | 'high' | 'medium' | 'low', number>;
  updatedAt: string;
};

function parseStageProgress(raw: unknown): StageProgress {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const status = String(o.status ?? 'not_started');
  const validStatus =
    status === 'not_started' || status === 'in_progress' || status === 'complete'
      ? status
      : 'not_started';
  const checklistRaw = o.checklist && typeof o.checklist === 'object' ? o.checklist : {};
  const checklist = Object.fromEntries(
    Object.entries(checklistRaw as Record<string, unknown>).map(([k, v]) => [k, Boolean(v)])
  );
  return {
    status: validStatus,
    notes: String(o.notes ?? ''),
    completedAt: o.completedAt ? String(o.completedAt) : null,
    checklist,
  };
}

function parseRiskItems(raw: unknown): DomainRiskItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => parseDomainRiskItem(item))
    .filter((item): item is DomainRiskItem => item !== null);
}

function countBySeverity(items: DomainRiskItem[]) {
  return countDomainRisksBySeverity(items);
}

function computeDomainStatus(
  identification: StageProgress,
  analysis: StageProgress,
  evaluation: StageProgress
): string {
  if (evaluation.status === 'complete') return 'complete';
  if (
    identification.status === 'in_progress' ||
    analysis.status === 'in_progress' ||
    evaluation.status === 'in_progress' ||
    identification.status === 'complete' ||
    analysis.status === 'complete'
  ) {
    return 'in_progress';
  }
  return 'not_started';
}

export function serializeRiskDomain(domain: {
  id: string;
  domainKey: string;
  name: string;
  owner: string;
  status: string;
  controlRefs: unknown;
  identification: unknown;
  analysis: unknown;
  evaluation: unknown;
  riskItems: unknown;
  updatedAt: Date;
}): SerializedRiskDomain {
  const identification = parseStageProgress(domain.identification);
  const analysis = parseStageProgress(domain.analysis);
  const evaluation = parseStageProgress(domain.evaluation);
  const riskItems = parseRiskItems(domain.riskItems);
  return {
    id: domain.id,
    domainKey: domain.domainKey,
    name: domain.name,
    owner: domain.owner,
    status: domain.status,
    controlRefs: Array.isArray(domain.controlRefs)
      ? (domain.controlRefs as unknown[]).map(String)
      : [],
    identification,
    analysis,
    evaluation,
    riskItems,
    severityCounts: countBySeverity(riskItems),
    updatedAt: domain.updatedAt.toISOString(),
  };
}

function assertRiskDomainModelPresent() {
  const p = prisma as unknown as Record<string, unknown>;
  if (!('auditRiskDomain' in p)) {
    throw new Error(
      'Audit risk domain Prisma client is out of date (missing: auditRiskDomain). Stop the dev server, run: npm run db:generate:win, then restart npm run dev.'
    );
  }
}

export async function launchRiskAssessmentDomains(organizationId: string) {
  assertRiskDomainModelPresent();

  const existing = await prisma.auditRiskDomain.findMany({
    where: { organizationId },
    select: { id: true, domainKey: true },
  });
  const existingKeys = new Set(existing.map((row) => row.domainKey));

  const legacyDomain = existing.find((row) => row.domainKey === 'end-user-training-awareness');
  const renamedDef = RISK_ASSESSMENT_DOMAINS.find((d) => d.key === 'user-training-awareness');
  if (legacyDomain && renamedDef && !existingKeys.has('user-training-awareness')) {
    await prisma.auditRiskDomain.update({
      where: { id: legacyDomain.id },
      data: {
        domainKey: renamedDef.key,
        name: renamedDef.name,
        owner: renamedDef.owner,
      },
    });
    existingKeys.delete('end-user-training-awareness');
    existingKeys.add('user-training-awareness');
  }

  const created = [];
  for (const def of RISK_ASSESSMENT_DOMAINS) {
    if (existingKeys.has(def.key)) continue;

    const domain = await prisma.auditRiskDomain.create({
      data: {
        organizationId,
        domainKey: def.key,
        name: def.name,
        owner: def.owner,
        controlRefs: resolveDomainControlRefs(def),
        status: 'not_started',
        identification: defaultStageProgress('identification'),
        analysis: defaultStageProgress('analysis'),
        evaluation: defaultStageProgress('evaluation'),
        riskItems: [],
      },
    });
    created.push(domain);
    existingKeys.add(def.key);
  }

  const domains = await prisma.auditRiskDomain.findMany({
    where: { organizationId },
    orderBy: [{ name: 'asc' }],
  });

  return {
    created: created.length,
    domains: domains.map(serializeRiskDomain),
  };
}

export async function listRiskAssessmentDomains(organizationId: string) {
  assertRiskDomainModelPresent();
  const domains = await prisma.auditRiskDomain.findMany({
    where: { organizationId },
    orderBy: [{ name: 'asc' }],
  });
  return domains.map(serializeRiskDomain);
}

export async function getRiskAssessmentDomain(organizationId: string, id: string) {
  assertRiskDomainModelPresent();
  const domain = await prisma.auditRiskDomain.findFirst({
    where: { id, organizationId },
  });
  if (!domain) return null;
  return serializeRiskDomain(domain);
}

export async function getRiskAssessmentDashboard(organizationId: string) {
  const domains = await listRiskAssessmentDomains(organizationId);
  const totals = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    domains: domains.length,
    complete: domains.filter((d) => d.status === 'complete').length,
    inProgress: domains.filter((d) => d.status === 'in_progress').length,
  };

  for (const domain of domains) {
    totals.critical += domain.severityCounts.critical;
    totals.high += domain.severityCounts.high;
    totals.medium += domain.severityCounts.medium;
    totals.low += domain.severityCounts.low;
  }

  return { domains, totals };
}

type DomainPatch = {
  owner?: string;
  identification?: Partial<StageProgress>;
  analysis?: Partial<StageProgress>;
  evaluation?: Partial<StageProgress>;
  riskItems?: DomainRiskItem[];
  addRiskItem?: Omit<DomainRiskItem, 'id'> & { id?: string };
  updateRiskItem?: Partial<DomainRiskItem> & { id: string };
  removeRiskItemId?: string;
};

function mergeStage(existing: StageProgress, patch?: Partial<StageProgress>): StageProgress {
  if (!patch) return existing;
  const merged: StageProgress = {
    status: patch.status ?? existing.status,
    notes: patch.notes !== undefined ? patch.notes : existing.notes,
    completedAt: patch.completedAt !== undefined ? patch.completedAt : existing.completedAt,
    checklist: patch.checklist ? { ...existing.checklist, ...patch.checklist } : existing.checklist,
  };
  if (merged.status === 'complete' && !merged.completedAt) {
    merged.completedAt = new Date().toISOString();
  }
  return merged;
}

export async function updateRiskAssessmentDomain(
  organizationId: string,
  id: string,
  patch: DomainPatch
) {
  assertRiskDomainModelPresent();
  const existing = await prisma.auditRiskDomain.findFirst({
    where: { id, organizationId },
  });
  if (!existing) return null;

  const current = serializeRiskDomain(existing);
  let riskItems = [...current.riskItems];

  if (patch.addRiskItem) {
    riskItems.push(
      normalizeDomainRiskItem(
        createDomainRiskItem({
          id: patch.addRiskItem.id,
          ...patch.addRiskItem,
        })
      )
    );
  }

  if (patch.updateRiskItem?.id) {
    riskItems = riskItems.map((item) =>
      item.id === patch.updateRiskItem!.id ? { ...item, ...patch.updateRiskItem } : item
    );
  }

  if (patch.removeRiskItemId) {
    riskItems = riskItems.filter((item) => item.id !== patch.removeRiskItemId);
  }

  if (patch.riskItems) {
    riskItems = patch.riskItems.map((item) => normalizeDomainRiskItem(item));
  }

  const identification = mergeStage(current.identification, patch.identification);
  const analysis = mergeStage(current.analysis, patch.analysis);
  const evaluation = mergeStage(current.evaluation, patch.evaluation);
  const status = computeDomainStatus(identification, analysis, evaluation);

  const updated = await prisma.auditRiskDomain.update({
    where: { id },
    data: {
      ...(patch.owner !== undefined ? { owner: String(patch.owner) } : {}),
      identification,
      analysis,
      evaluation,
      riskItems,
      status,
    },
  });

  return serializeRiskDomain(updated);
}

export async function getRiskDomainsForElasticSync(organizationId: string) {
  assertRiskDomainModelPresent();
  const domains = await prisma.auditRiskDomain.findMany({
    where: { organizationId },
    orderBy: [{ name: 'asc' }],
  });
  return domains.map(serializeRiskDomain);
}
