import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { getDefaultOrganization } from './repository';
import { isStaleVendorClientError, isPrismaConnectionError, isMissingSchemaError } from './prisma-errors';
import { ensureVendorSchema, resetVendorSchemaCache } from './ensure-vendor-schema';
import {
  parseDomainScores,
  parseFindings,
  parseRemediationItems,
  type VendorDomainScore,
  type VendorFinding,
  type VendorRemediationItem,
} from '../vendor/vendor-assessment-types';
import {
  aggregateAssessmentScore,
  domainScoresToRecord,
  scoreToGrade,
  toUpguardScale,
} from '../vendor/vendor-rating';

export interface VendorInput {
  name: string;
  description?: string;
  tier?: string;
  dataAccess?: string;
  status?: string;
  contactEmail?: string;
  website?: string;
  primaryDomain?: string;
  industry?: string;
  inherentRiskScore?: number;
  labels?: string[];
}

export type VendorRecord = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  tier: string;
  dataAccess: string;
  status: string;
  contactEmail: string;
  website: string;
  primaryDomain: string;
  industry: string;
  inherentRiskScore: number;
  aiRiskScore: number | null;
  aiRiskSummary: string;
  securityRating: number | null;
  ratingGrade: string;
  domainScores: unknown;
  labels: unknown;
  certifications: unknown;
  lastAssessedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type VendorAssessmentRecord = {
  id: string;
  organizationId: string;
  vendorId: string;
  status: string;
  templateId: string;
  templateName: string;
  questionnaireStatus: string;
  questions: unknown;
  responses: unknown;
  aiScore: number | null;
  aiSummary: string;
  domainScores: unknown;
  gaps: unknown;
  findings: unknown;
  remediationItems: unknown;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type VendorWithAssessments = VendorRecord & { assessments: VendorAssessmentRecord[] };

type VendorRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  tier: string;
  data_access: string;
  status: string;
  contact_email: string;
  website: string;
  primary_domain: string;
  industry: string;
  inherent_risk_score: number;
  ai_risk_score: number | null;
  ai_risk_summary: string;
  security_rating: number | null;
  rating_grade: string;
  domain_scores: unknown;
  labels: unknown;
  certifications?: unknown;
  last_assessed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

type VendorAssessmentRow = {
  id: string;
  organization_id: string;
  vendor_id: string;
  status: string;
  template_id: string;
  template_name: string;
  questionnaire_status: string;
  questions: unknown;
  responses: unknown;
  ai_score: number | null;
  ai_summary: string;
  domain_scores: unknown;
  gaps: unknown;
  findings: unknown;
  remediation_items: unknown;
  due_date: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

function normalizeVendorFields<T extends VendorRecord>(vendor: T): T {
  return {
    ...vendor,
    primaryDomain: vendor.primaryDomain ?? '',
    industry: vendor.industry ?? '',
    ratingGrade: vendor.ratingGrade ?? '',
    website: vendor.website ?? '',
    contactEmail: vendor.contactEmail ?? '',
    description: vendor.description ?? '',
    certifications: vendor.certifications ?? [],
  };
}

function normalizeAssessmentFields<T extends VendorAssessmentRecord>(assessment: T): T {
  return {
    ...assessment,
    templateId: assessment.templateId ?? 'tprm-standard',
    templateName: assessment.templateName ?? 'TPRM Standard',
    questionnaireStatus: assessment.questionnaireStatus ?? 'internal',
  };
}
function mapVendorRow(row: VendorRow): VendorRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    tier: row.tier,
    dataAccess: row.data_access,
    status: row.status,
    contactEmail: row.contact_email,
    website: row.website,
    primaryDomain: row.primary_domain ?? '',
    industry: row.industry ?? '',
    inherentRiskScore: row.inherent_risk_score,
    aiRiskScore: row.ai_risk_score,
    aiRiskSummary: row.ai_risk_summary,
    securityRating: row.security_rating,
    ratingGrade: row.rating_grade ?? '',
    domainScores: row.domain_scores,
    labels: row.labels,
    certifications: row.certifications ?? [],
    lastAssessedAt: row.last_assessed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVendorAssessmentRow(row: VendorAssessmentRow): VendorAssessmentRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    vendorId: row.vendor_id,
    status: row.status,
    templateId: row.template_id,
    templateName: row.template_name,
    questionnaireStatus: row.questionnaire_status,
    questions: row.questions,
    responses: row.responses,
    aiScore: row.ai_score,
    aiSummary: row.ai_summary,
    domainScores: row.domain_scores,
    gaps: row.gaps,
    findings: row.findings,
    remediationItems: row.remediation_items,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getVendorsRaw(organizationId: string): Promise<VendorWithAssessments[]> {
  const vendorRows = await prisma.$queryRaw<VendorRow[]>`
    SELECT * FROM vendors
    WHERE organization_id = ${organizationId}
    ORDER BY updated_at DESC
  `;
  const assessmentRows = await prisma.$queryRaw<VendorAssessmentRow[]>`
    SELECT * FROM vendor_assessments
    WHERE organization_id = ${organizationId}
    ORDER BY updated_at DESC
  `;

  const assessmentsByVendor = new Map<string, VendorAssessmentRecord[]>();
  for (const row of assessmentRows) {
    const assessment = mapVendorAssessmentRow(row);
    const list = assessmentsByVendor.get(row.vendor_id) ?? [];
    list.push(assessment);
    assessmentsByVendor.set(row.vendor_id, list);
  }

  return vendorRows.map((row) => ({
    ...mapVendorRow(row),
    assessments: assessmentsByVendor.get(row.id) ?? [],
  }));
}

async function createVendorRaw(organizationId: string, input: VendorInput): Promise<VendorRecord> {
  const id = randomUUID();
  const labelsJson = JSON.stringify(input.labels ?? []);

  const rows = await prisma.$queryRaw<VendorRow[]>`
    INSERT INTO vendors (
      id,
      organization_id,
      name,
      description,
      tier,
      data_access,
      status,
      contact_email,
      website,
      primary_domain,
      industry,
      inherent_risk_score,
      labels,
      created_at,
      updated_at
    ) VALUES (
      ${id},
      ${organizationId},
      ${input.name.trim()},
      ${input.description?.trim() ?? ''},
      ${input.tier ?? 'medium'},
      ${input.dataAccess ?? 'none'},
      ${input.status ?? 'active'},
      ${input.contactEmail?.trim() ?? ''},
      ${input.website?.trim() ?? ''},
      ${input.primaryDomain?.trim() ?? ''},
      ${input.industry?.trim() ?? ''},
      ${input.inherentRiskScore ?? 50},
      ${labelsJson}::jsonb,
      NOW(),
      NOW()
    )
    RETURNING *
  `;

  return mapVendorRow(rows[0]);
}

export async function getVendors() {
  const org = await getDefaultOrganization();
  try {
    await ensureVendorSchema();
    const rows = await prisma.vendor.findMany({
      where: { organizationId: org.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        assessments: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    });
    return rows.map((row) => ({
      ...normalizeVendorFields(row as unknown as VendorRecord),
      assessments: (row.assessments ?? []).map((a) =>
        normalizeAssessmentFields(a as unknown as VendorAssessmentRecord)
      ),
    }));
  } catch (error) {
    if (isMissingSchemaError(error)) {
      try {
        resetVendorSchemaCache();
        await ensureVendorSchema(true);
        const rows = await prisma.vendor.findMany({
          where: { organizationId: org.id },
          orderBy: { updatedAt: 'desc' },
          include: {
            assessments: {
              orderBy: { updatedAt: 'desc' },
            },
          },
        });
        return rows.map((row) => ({
          ...normalizeVendorFields(row as unknown as VendorRecord),
          assessments: (row.assessments ?? []).map((a) =>
            normalizeAssessmentFields(a as unknown as VendorAssessmentRecord)
          ),
        }));
      } catch {
        // fall through to raw query
      }
    }
    if (!isStaleVendorClientError(error) && !isPrismaConnectionError(error) && !isMissingSchemaError(error)) {
      throw error;
    }
    return (await getVendorsRaw(org.id)).map((row) => ({
      ...normalizeVendorFields(row),
      assessments: row.assessments.map(normalizeAssessmentFields),
    }));
  }
}

async function getVendorByIdRaw(organizationId: string, id: string): Promise<VendorWithAssessments | null> {
  const vendorRows = await prisma.$queryRaw<VendorRow[]>`
    SELECT * FROM vendors
    WHERE organization_id = ${organizationId} AND id = ${id}
    LIMIT 1
  `;
  if (!vendorRows[0]) return null;

  const assessmentRows = await prisma.$queryRaw<VendorAssessmentRow[]>`
    SELECT * FROM vendor_assessments
    WHERE organization_id = ${organizationId} AND vendor_id = ${id}
    ORDER BY updated_at DESC
  `;

  return {
    ...mapVendorRow(vendorRows[0]),
    assessments: assessmentRows.map(mapVendorAssessmentRow),
  };
}

export async function getVendorById(id: string) {
  const org = await getDefaultOrganization();
  try {
    return await prisma.vendor.findFirst({
      where: { id, organizationId: org.id },
      include: {
        assessments: { orderBy: { updatedAt: 'desc' } },
      },
    });
  } catch (error) {
    if (!isStaleVendorClientError(error) && !isPrismaConnectionError(error)) throw error;
    return getVendorByIdRaw(org.id, id);
  }
}

export async function getVendorDetail(id: string) {
  const raw = await getVendorById(id);
  if (!raw) return null;

  const assessments = (raw.assessments ?? []).map((a) =>
    normalizeAssessmentFields(a as unknown as VendorAssessmentRecord)
  );
  const vendor = {
    ...normalizeVendorFields(raw as unknown as VendorRecord),
    assessments,
  };

  const latestCompleted = assessments.find((a) => a.status === 'completed');
  const openFindings = assessments.flatMap((a) =>
    parseFindings(a.findings).filter((f) => f.status !== 'resolved' && f.status !== 'accepted')
  );
  const remediationItems = assessments.flatMap((a) => parseRemediationItems(a.remediationItems));
  const domainScores = parseDomainScores(vendor.domainScores);

  return {
    vendor,
    latestCompleted,
    openFindingsCount: openFindings.length,
    openRemediationCount: remediationItems.filter((r) => r.status !== 'completed' && r.status !== 'waived').length,
    domainScores,
    rating: {
      score: vendor.securityRating ?? vendor.aiRiskScore ?? null,
      grade: vendor.ratingGrade || (vendor.securityRating != null ? scoreToGrade(vendor.securityRating) : ''),
      upguardScale: vendor.securityRating != null ? toUpguardScale(vendor.securityRating) : null,
    },
  };
}

export async function createVendor(input: VendorInput) {
  const org = await getDefaultOrganization();
  const data = {
    organizationId: org.id,
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    tier: input.tier ?? 'medium',
    dataAccess: input.dataAccess ?? 'none',
    status: input.status ?? 'active',
    contactEmail: input.contactEmail?.trim() ?? '',
    website: input.website?.trim() ?? '',
    primaryDomain: input.primaryDomain?.trim() ?? '',
    industry: input.industry?.trim() ?? '',
    inherentRiskScore: input.inherentRiskScore ?? 50,
    labels: (input.labels ?? []) as unknown as Prisma.InputJsonValue,
  };

  try {
    return await prisma.vendor.create({ data });
  } catch (error) {
    if (!isStaleVendorClientError(error) && !isPrismaConnectionError(error)) throw error;
    return createVendorRaw(org.id, input);
  }
}

export async function updateVendor(id: string, input: Partial<VendorInput>) {
  const org = await getDefaultOrganization();
  const existing = await prisma.vendor.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  return prisma.vendor.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.tier !== undefined && { tier: input.tier }),
      ...(input.dataAccess !== undefined && { dataAccess: input.dataAccess }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail.trim() }),
      ...(input.website !== undefined && { website: input.website.trim() }),
      ...(input.primaryDomain !== undefined && { primaryDomain: input.primaryDomain.trim() }),
      ...(input.industry !== undefined && { industry: input.industry.trim() }),
      ...(input.inherentRiskScore !== undefined && { inherentRiskScore: input.inherentRiskScore }),
      ...(input.labels !== undefined && { labels: input.labels as unknown as Prisma.InputJsonValue }),
    },
  });
}

export async function deleteVendor(id: string) {
  const org = await getDefaultOrganization();
  const existing = await prisma.vendor.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return false;
  await prisma.vendor.delete({ where: { id } });
  return true;
}

export async function createVendorAssessment(vendorId: string, templateId = 'tprm-standard', templateName = 'TPRM Standard') {
  const org = await getDefaultOrganization();
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, organizationId: org.id },
  });
  if (!vendor) return null;

  const due = new Date();
  due.setDate(due.getDate() + 14);

  return prisma.vendorAssessment.create({
    data: {
      organizationId: org.id,
      vendorId,
      status: 'draft',
      templateId,
      templateName,
      questionnaireStatus: 'internal',
      dueDate: due,
    },
  });
}

export async function getVendorAssessment(id: string) {
  const org = await getDefaultOrganization();
  return prisma.vendorAssessment.findFirst({
    where: { id, organizationId: org.id },
    include: { vendor: true },
  });
}

export async function updateVendorAssessment(
  id: string,
  data: {
    status?: string;
    questions?: unknown;
    responses?: unknown;
    aiScore?: number | null;
    aiSummary?: string;
    gaps?: unknown;
    domainScores?: unknown;
    findings?: unknown;
    remediationItems?: unknown;
    completedAt?: Date | null;
    questionnaireStatus?: string;
  }
) {
  const org = await getDefaultOrganization();
  const existing = await prisma.vendorAssessment.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  const updated = await prisma.vendorAssessment.update({
    where: { id },
    include: { vendor: true },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.questions !== undefined && {
        questions: data.questions as unknown as Prisma.InputJsonValue,
      }),
      ...(data.responses !== undefined && {
        responses: data.responses as unknown as Prisma.InputJsonValue,
      }),
      ...(data.aiScore !== undefined && { aiScore: data.aiScore }),
      ...(data.aiSummary !== undefined && { aiSummary: data.aiSummary }),
      ...(data.gaps !== undefined && { gaps: data.gaps as unknown as Prisma.InputJsonValue }),
      ...(data.domainScores !== undefined && {
        domainScores: data.domainScores as unknown as Prisma.InputJsonValue,
      }),
      ...(data.findings !== undefined && {
        findings: data.findings as unknown as Prisma.InputJsonValue,
      }),
      ...(data.remediationItems !== undefined && {
        remediationItems: data.remediationItems as unknown as Prisma.InputJsonValue,
      }),
      ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
      ...(data.questionnaireStatus !== undefined && { questionnaireStatus: data.questionnaireStatus }),
    },
  });

  if (data.aiScore !== undefined || data.domainScores !== undefined) {
    const score = data.aiScore ?? existing.aiScore;
    const domainRecord =
      data.domainScores !== undefined
        ? (data.domainScores as Record<string, number>)
        : parseDomainScores(existing.domainScores);

    await prisma.vendor.update({
      where: { id: existing.vendorId },
      data: {
        aiRiskScore: score ?? undefined,
        aiRiskSummary: data.aiSummary ?? undefined,
        securityRating: score ?? undefined,
        ratingGrade: score != null ? scoreToGrade(score) : undefined,
        domainScores: domainRecord as unknown as Prisma.InputJsonValue,
        lastAssessedAt: data.completedAt ?? (data.status === 'completed' ? new Date() : undefined),
      },
    });
  }

  return updated;
}

export async function updateVendorRemediation(
  assessmentId: string,
  remediationItems: VendorRemediationItem[]
) {
  return updateVendorAssessment(assessmentId, {
    remediationItems,
  });
}

export async function updateVendorFindings(assessmentId: string, findings: VendorFinding[]) {
  return updateVendorAssessment(assessmentId, { findings });
}

export async function finalizeVendorAssessment(
  assessmentId: string,
  payload: {
    responses: unknown;
    aiScore: number;
    aiSummary: string;
    gaps: unknown;
    domainScores: VendorDomainScore[];
    findings: VendorFinding[];
    remediationItems: VendorRemediationItem[];
  }
) {
  return updateVendorAssessment(assessmentId, {
    status: 'completed',
    responses: payload.responses,
    aiScore: payload.aiScore,
    aiSummary: payload.aiSummary,
    gaps: payload.gaps,
    domainScores: domainScoresToRecord(payload.domainScores),
    findings: payload.findings,
    remediationItems: payload.remediationItems,
    completedAt: new Date(),
    questionnaireStatus: 'completed',
  });
}
