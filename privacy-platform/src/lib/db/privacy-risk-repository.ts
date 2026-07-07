import { prisma } from './prisma';
import { getDefaultOrganization } from './repository';
import {
  formatPrivacyRiskRating,
  resolveResidualRiskRating,
} from '../privacy-risk/scoring';
import type {
  PrivacyRiskRegisterEntry,
  DpiaRecord,
  PrivacyRiskLikelihood,
  PrivacyRiskImpact,
  PrivacyRiskSource,
  DataLifecyclePhase,
  PrivacyTreatmentStrategy,
  PrivacyRiskStatus,
  DpiaStatus,
} from '../types';

function toDateString(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function parseDateString(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
}

function mapPrivacyRisk(row: {
  id: string;
  riskReference: string;
  source: string;
  affectedIndividualsAssets: string;
  description: string;
  dataLifecyclePhase: string;
  inherentLikelihood: string;
  inherentImpact: string;
  inherentRiskRating: string;
  existingControls: string;
  treatmentPlan: string;
  treatmentStrategy: string;
  owner: string;
  targetDueDate: Date | null;
  residualLikelihood: string | null;
  residualImpact: string | null;
  residualRiskRating: string;
  status: string;
  lastReviewDate: Date | null;
  nextReviewDate: Date | null;
  linkedRopaRefs: string;
  linkedDpiaRefs: string;
  createdAt: Date;
  updatedAt: Date;
}): PrivacyRiskRegisterEntry {
  return {
    id: row.id,
    riskReference: row.riskReference,
    source: row.source as PrivacyRiskSource,
    affectedIndividualsAssets: row.affectedIndividualsAssets,
    description: row.description,
    dataLifecyclePhase: row.dataLifecyclePhase as DataLifecyclePhase,
    inherentLikelihood: row.inherentLikelihood as PrivacyRiskLikelihood,
    inherentImpact: row.inherentImpact as PrivacyRiskImpact,
    inherentRiskRating: row.inherentRiskRating,
    existingControls: row.existingControls,
    treatmentPlan: row.treatmentPlan,
    treatmentStrategy: row.treatmentStrategy as PrivacyTreatmentStrategy,
    owner: row.owner,
    targetDueDate: toDateString(row.targetDueDate),
    residualLikelihood: row.residualLikelihood as PrivacyRiskLikelihood | null,
    residualImpact: row.residualImpact as PrivacyRiskImpact | null,
    residualRiskRating: row.residualRiskRating,
    status: row.status as PrivacyRiskStatus,
    lastReviewDate: toDateString(row.lastReviewDate),
    nextReviewDate: toDateString(row.nextReviewDate),
    linkedRopaRefs: row.linkedRopaRefs,
    linkedDpiaRefs: row.linkedDpiaRefs,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapDpia(row: {
  id: string;
  dpiaReference: string;
  processingActivityName: string;
  description: string;
  triggerReason: string;
  necessityProportionality: string;
  dataCategories: string;
  affectedIndividuals: string;
  riskDescription: string;
  dataLifecyclePhase: string;
  inherentLikelihood: string;
  inherentImpact: string;
  inherentRiskRating: string;
  measuresToMitigate: string;
  dpoConsultation: string;
  residualLikelihood: string | null;
  residualImpact: string | null;
  residualRiskRating: string;
  status: string;
  owner: string;
  initiatedDate: Date | null;
  targetCompletionDate: Date | null;
  completedDate: Date | null;
  lastReviewDate: Date | null;
  nextReviewDate: Date | null;
  linkedRopaRefs: string;
  linkedRiskRefs: string;
  createdAt: Date;
  updatedAt: Date;
}): DpiaRecord {
  return {
    id: row.id,
    dpiaReference: row.dpiaReference,
    processingActivityName: row.processingActivityName,
    description: row.description,
    triggerReason: row.triggerReason,
    necessityProportionality: row.necessityProportionality,
    dataCategories: row.dataCategories,
    affectedIndividuals: row.affectedIndividuals,
    riskDescription: row.riskDescription,
    dataLifecyclePhase: row.dataLifecyclePhase as DataLifecyclePhase,
    inherentLikelihood: row.inherentLikelihood as PrivacyRiskLikelihood,
    inherentImpact: row.inherentImpact as PrivacyRiskImpact,
    inherentRiskRating: row.inherentRiskRating,
    measuresToMitigate: row.measuresToMitigate,
    dpoConsultation: row.dpoConsultation,
    residualLikelihood: row.residualLikelihood as PrivacyRiskLikelihood | null,
    residualImpact: row.residualImpact as PrivacyRiskImpact | null,
    residualRiskRating: row.residualRiskRating,
    status: row.status as DpiaStatus,
    owner: row.owner,
    initiatedDate: toDateString(row.initiatedDate),
    targetCompletionDate: toDateString(row.targetCompletionDate),
    completedDate: toDateString(row.completedDate),
    lastReviewDate: toDateString(row.lastReviewDate),
    nextReviewDate: toDateString(row.nextReviewDate),
    linkedRopaRefs: row.linkedRopaRefs,
    linkedRiskRefs: row.linkedRiskRefs,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function nextRiskReference(orgId: string): Promise<string> {
  const count = await prisma.pcPrivacyRisk.count({ where: { organizationId: orgId } });
  return `PR-${String(count + 1).padStart(4, '0')}`;
}

async function nextDpiaReference(orgId: string): Promise<string> {
  const count = await prisma.pcDpiaRecord.count({ where: { organizationId: orgId } });
  return `DPIA-${String(count + 1).padStart(4, '0')}`;
}

function computeRiskRatings(input: {
  inherentLikelihood: PrivacyRiskLikelihood;
  inherentImpact: PrivacyRiskImpact;
  residualLikelihood?: PrivacyRiskLikelihood | null;
  residualImpact?: PrivacyRiskImpact | null;
}) {
  const inherentRiskRating = formatPrivacyRiskRating(
    input.inherentLikelihood,
    input.inherentImpact
  );
  const residualRiskRating = resolveResidualRiskRating(
    input.inherentLikelihood,
    input.inherentImpact,
    input.residualLikelihood ?? null,
    input.residualImpact ?? null
  );
  return { inherentRiskRating, residualRiskRating };
}

export async function listPrivacyRisks(): Promise<PrivacyRiskRegisterEntry[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.pcPrivacyRisk.findMany({
    where: { organizationId: org.id },
    orderBy: { riskReference: 'asc' },
  });
  return rows.map(mapPrivacyRisk);
}

export async function getPrivacyRiskById(id: string): Promise<PrivacyRiskRegisterEntry | null> {
  const org = await getDefaultOrganization();
  const row = await prisma.pcPrivacyRisk.findFirst({
    where: { id, organizationId: org.id },
  });
  return row ? mapPrivacyRisk(row) : null;
}

export type PrivacyRiskInput = Omit<
  PrivacyRiskRegisterEntry,
  'id' | 'inherentRiskRating' | 'residualRiskRating' | 'createdAt' | 'updatedAt'
> & { riskReference?: string };

export async function createPrivacyRisk(
  input: Partial<PrivacyRiskInput>
): Promise<PrivacyRiskRegisterEntry> {
  const org = await getDefaultOrganization();
  const inherentLikelihood = (input.inherentLikelihood ?? 'possible') as PrivacyRiskLikelihood;
  const inherentImpact = (input.inherentImpact ?? 'moderate') as PrivacyRiskImpact;
  const residualLikelihood = (input.residualLikelihood ?? null) as PrivacyRiskLikelihood | null;
  const residualImpact = (input.residualImpact ?? null) as PrivacyRiskImpact | null;
  const ratings = computeRiskRatings({
    inherentLikelihood,
    inherentImpact,
    residualLikelihood,
    residualImpact,
  });

  const row = await prisma.pcPrivacyRisk.create({
    data: {
      organizationId: org.id,
      riskReference: input.riskReference ?? (await nextRiskReference(org.id)),
      source: input.source ?? 'other',
      affectedIndividualsAssets: input.affectedIndividualsAssets ?? '',
      description: input.description ?? '',
      dataLifecyclePhase: input.dataLifecyclePhase ?? 'processing',
      inherentLikelihood,
      inherentImpact,
      inherentRiskRating: ratings.inherentRiskRating,
      existingControls: input.existingControls ?? '',
      treatmentPlan: input.treatmentPlan ?? '',
      treatmentStrategy: input.treatmentStrategy ?? 'mitigate',
      owner: input.owner ?? '',
      targetDueDate: parseDateString(input.targetDueDate),
      residualLikelihood,
      residualImpact,
      residualRiskRating: ratings.residualRiskRating,
      status: input.status ?? 'open',
      lastReviewDate: parseDateString(input.lastReviewDate),
      nextReviewDate: parseDateString(input.nextReviewDate),
      linkedRopaRefs: input.linkedRopaRefs ?? '',
      linkedDpiaRefs: input.linkedDpiaRefs ?? '',
    },
  });
  return mapPrivacyRisk(row);
}

export async function updatePrivacyRisk(
  id: string,
  input: Partial<PrivacyRiskInput>
): Promise<PrivacyRiskRegisterEntry | null> {
  const org = await getDefaultOrganization();
  const existing = await prisma.pcPrivacyRisk.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  const inherentLikelihood = (input.inherentLikelihood ??
    existing.inherentLikelihood) as PrivacyRiskLikelihood;
  const inherentImpact = (input.inherentImpact ?? existing.inherentImpact) as PrivacyRiskImpact;
  const residualLikelihood = (input.residualLikelihood !== undefined
    ? input.residualLikelihood
    : existing.residualLikelihood) as PrivacyRiskLikelihood | null;
  const residualImpact = (input.residualImpact !== undefined
    ? input.residualImpact
    : existing.residualImpact) as PrivacyRiskImpact | null;
  const ratings = computeRiskRatings({
    inherentLikelihood,
    inherentImpact,
    residualLikelihood,
    residualImpact,
  });

  const row = await prisma.pcPrivacyRisk.update({
    where: { id },
    data: {
      riskReference: input.riskReference ?? existing.riskReference,
      source: input.source ?? existing.source,
      affectedIndividualsAssets:
        input.affectedIndividualsAssets ?? existing.affectedIndividualsAssets,
      description: input.description ?? existing.description,
      dataLifecyclePhase: input.dataLifecyclePhase ?? existing.dataLifecyclePhase,
      inherentLikelihood,
      inherentImpact,
      inherentRiskRating: ratings.inherentRiskRating,
      existingControls: input.existingControls ?? existing.existingControls,
      treatmentPlan: input.treatmentPlan ?? existing.treatmentPlan,
      treatmentStrategy: input.treatmentStrategy ?? existing.treatmentStrategy,
      owner: input.owner ?? existing.owner,
      targetDueDate:
        input.targetDueDate !== undefined
          ? parseDateString(input.targetDueDate)
          : existing.targetDueDate,
      residualLikelihood,
      residualImpact,
      residualRiskRating: ratings.residualRiskRating,
      status: input.status ?? existing.status,
      lastReviewDate:
        input.lastReviewDate !== undefined
          ? parseDateString(input.lastReviewDate)
          : existing.lastReviewDate,
      nextReviewDate:
        input.nextReviewDate !== undefined
          ? parseDateString(input.nextReviewDate)
          : existing.nextReviewDate,
      linkedRopaRefs: input.linkedRopaRefs ?? existing.linkedRopaRefs,
      linkedDpiaRefs: input.linkedDpiaRefs ?? existing.linkedDpiaRefs,
    },
  });
  return mapPrivacyRisk(row);
}

export async function deletePrivacyRisk(id: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const existing = await prisma.pcPrivacyRisk.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return false;
  await prisma.pcPrivacyRisk.delete({ where: { id } });
  return true;
}

export async function listDpiaRecords(): Promise<DpiaRecord[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.pcDpiaRecord.findMany({
    where: { organizationId: org.id },
    orderBy: { dpiaReference: 'asc' },
  });
  return rows.map(mapDpia);
}

export async function getDpiaById(id: string): Promise<DpiaRecord | null> {
  const org = await getDefaultOrganization();
  const row = await prisma.pcDpiaRecord.findFirst({
    where: { id, organizationId: org.id },
  });
  return row ? mapDpia(row) : null;
}

export type DpiaInput = Omit<
  DpiaRecord,
  'id' | 'inherentRiskRating' | 'residualRiskRating' | 'createdAt' | 'updatedAt'
> & { dpiaReference?: string };

export async function createDpiaRecord(
  input: Partial<DpiaInput>
): Promise<DpiaRecord> {
  const org = await getDefaultOrganization();
  const inherentLikelihood = (input.inherentLikelihood ?? 'possible') as PrivacyRiskLikelihood;
  const inherentImpact = (input.inherentImpact ?? 'moderate') as PrivacyRiskImpact;
  const residualLikelihood = (input.residualLikelihood ?? null) as PrivacyRiskLikelihood | null;
  const residualImpact = (input.residualImpact ?? null) as PrivacyRiskImpact | null;
  const ratings = computeRiskRatings({
    inherentLikelihood,
    inherentImpact,
    residualLikelihood,
    residualImpact,
  });

  const row = await prisma.pcDpiaRecord.create({
    data: {
      organizationId: org.id,
      dpiaReference: input.dpiaReference ?? (await nextDpiaReference(org.id)),
      processingActivityName: input.processingActivityName ?? 'New processing activity',
      description: input.description ?? '',
      triggerReason: input.triggerReason ?? '',
      necessityProportionality: input.necessityProportionality ?? '',
      dataCategories: input.dataCategories ?? '',
      affectedIndividuals: input.affectedIndividuals ?? '',
      riskDescription: input.riskDescription ?? '',
      dataLifecyclePhase: input.dataLifecyclePhase ?? 'processing',
      inherentLikelihood,
      inherentImpact,
      inherentRiskRating: ratings.inherentRiskRating,
      measuresToMitigate: input.measuresToMitigate ?? '',
      dpoConsultation: input.dpoConsultation ?? '',
      residualLikelihood,
      residualImpact,
      residualRiskRating: ratings.residualRiskRating,
      status: input.status ?? 'draft',
      owner: input.owner ?? '',
      initiatedDate: parseDateString(input.initiatedDate),
      targetCompletionDate: parseDateString(input.targetCompletionDate),
      completedDate: parseDateString(input.completedDate),
      lastReviewDate: parseDateString(input.lastReviewDate),
      nextReviewDate: parseDateString(input.nextReviewDate),
      linkedRopaRefs: input.linkedRopaRefs ?? '',
      linkedRiskRefs: input.linkedRiskRefs ?? '',
    },
  });
  return mapDpia(row);
}

export async function updateDpiaRecord(
  id: string,
  input: Partial<DpiaInput>
): Promise<DpiaRecord | null> {
  const org = await getDefaultOrganization();
  const existing = await prisma.pcDpiaRecord.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  const inherentLikelihood = (input.inherentLikelihood ??
    existing.inherentLikelihood) as PrivacyRiskLikelihood;
  const inherentImpact = (input.inherentImpact ?? existing.inherentImpact) as PrivacyRiskImpact;
  const residualLikelihood = (input.residualLikelihood !== undefined
    ? input.residualLikelihood
    : existing.residualLikelihood) as PrivacyRiskLikelihood | null;
  const residualImpact = (input.residualImpact !== undefined
    ? input.residualImpact
    : existing.residualImpact) as PrivacyRiskImpact | null;
  const ratings = computeRiskRatings({
    inherentLikelihood,
    inherentImpact,
    residualLikelihood,
    residualImpact,
  });

  const row = await prisma.pcDpiaRecord.update({
    where: { id },
    data: {
      dpiaReference: input.dpiaReference ?? existing.dpiaReference,
      processingActivityName:
        input.processingActivityName ?? existing.processingActivityName,
      description: input.description ?? existing.description,
      triggerReason: input.triggerReason ?? existing.triggerReason,
      necessityProportionality:
        input.necessityProportionality ?? existing.necessityProportionality,
      dataCategories: input.dataCategories ?? existing.dataCategories,
      affectedIndividuals: input.affectedIndividuals ?? existing.affectedIndividuals,
      riskDescription: input.riskDescription ?? existing.riskDescription,
      dataLifecyclePhase: input.dataLifecyclePhase ?? existing.dataLifecyclePhase,
      inherentLikelihood,
      inherentImpact,
      inherentRiskRating: ratings.inherentRiskRating,
      measuresToMitigate: input.measuresToMitigate ?? existing.measuresToMitigate,
      dpoConsultation: input.dpoConsultation ?? existing.dpoConsultation,
      residualLikelihood,
      residualImpact,
      residualRiskRating: ratings.residualRiskRating,
      status: input.status ?? existing.status,
      owner: input.owner ?? existing.owner,
      initiatedDate:
        input.initiatedDate !== undefined
          ? parseDateString(input.initiatedDate)
          : existing.initiatedDate,
      targetCompletionDate:
        input.targetCompletionDate !== undefined
          ? parseDateString(input.targetCompletionDate)
          : existing.targetCompletionDate,
      completedDate:
        input.completedDate !== undefined
          ? parseDateString(input.completedDate)
          : existing.completedDate,
      lastReviewDate:
        input.lastReviewDate !== undefined
          ? parseDateString(input.lastReviewDate)
          : existing.lastReviewDate,
      nextReviewDate:
        input.nextReviewDate !== undefined
          ? parseDateString(input.nextReviewDate)
          : existing.nextReviewDate,
      linkedRopaRefs: input.linkedRopaRefs ?? existing.linkedRopaRefs,
      linkedRiskRefs: input.linkedRiskRefs ?? existing.linkedRiskRefs,
    },
  });
  return mapDpia(row);
}

export async function deleteDpiaRecord(id: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const existing = await prisma.pcDpiaRecord.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return false;
  await prisma.pcDpiaRecord.delete({ where: { id } });
  return true;
}
