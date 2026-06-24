import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { getDefaultOrganization } from './repository';

export interface VendorInput {
  name: string;
  description?: string;
  tier?: string;
  dataAccess?: string;
  status?: string;
  contactEmail?: string;
  website?: string;
  inherentRiskScore?: number;
}

export async function getVendors() {
  const org = await getDefaultOrganization();
  return prisma.vendor.findMany({
    where: { organizationId: org.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      assessments: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  });
}

export async function getVendorById(id: string) {
  const org = await getDefaultOrganization();
  return prisma.vendor.findFirst({
    where: { id, organizationId: org.id },
    include: {
      assessments: { orderBy: { updatedAt: 'desc' } },
    },
  });
}

export async function createVendor(input: VendorInput) {
  const org = await getDefaultOrganization();
  return prisma.vendor.create({
    data: {
      organizationId: org.id,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      tier: input.tier ?? 'medium',
      dataAccess: input.dataAccess ?? 'none',
      status: input.status ?? 'active',
      contactEmail: input.contactEmail?.trim() ?? '',
      website: input.website?.trim() ?? '',
      inherentRiskScore: input.inherentRiskScore ?? 50,
    },
  });
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
      ...(input.inherentRiskScore !== undefined && { inherentRiskScore: input.inherentRiskScore }),
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

export async function createVendorAssessment(vendorId: string) {
  const org = await getDefaultOrganization();
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, organizationId: org.id },
  });
  if (!vendor) return null;

  return prisma.vendorAssessment.create({
    data: {
      organizationId: org.id,
      vendorId,
      status: 'draft',
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
  }
) {
  const org = await getDefaultOrganization();
  const existing = await prisma.vendorAssessment.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) return null;

  const updated = await prisma.vendorAssessment.update({
    where: { id },
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
    },
  });

  if (data.aiScore !== undefined || data.aiSummary !== undefined) {
    await prisma.vendor.update({
      where: { id: existing.vendorId },
      data: {
        aiRiskScore: data.aiScore ?? undefined,
        aiRiskSummary: data.aiSummary ?? undefined,
        lastAssessedAt: new Date(),
      },
    });
  }

  return updated;
}
