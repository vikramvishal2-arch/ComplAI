import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { getDefaultOrganization } from './repository';
import { DEFAULT_APPROVAL_MEMBERS } from '../data/approval-members';

export interface OrganizationMemberRecord {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  approvalRoles: string[];
  active: boolean;
}

function mapMember(row: {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  approvalRoles: unknown;
  active: boolean;
}): OrganizationMemberRecord {
  const roles = Array.isArray(row.approvalRoles)
    ? row.approvalRoles.map(String)
    : [];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    title: row.title,
    department: row.department,
    approvalRoles: roles,
    active: row.active,
  };
}

export async function getOrganizationMemberById(id: string) {
  const org = await getDefaultOrganization();
  const row = await prisma.organizationMember.findFirst({
    where: { id, organizationId: org.id, active: true },
  });
  return row ? mapMember(row) : null;
}

export async function getOrganizationMembers(activeOnly = true) {
  const org = await getDefaultOrganization();
  const rows = await prisma.organizationMember.findMany({
    where: {
      organizationId: org.id,
      ...(activeOnly ? { active: true } : {}),
    },
    orderBy: [{ department: 'asc' }, { name: 'asc' }],
  });
  return rows.map(mapMember);
}

export async function seedApprovalMembers(organizationId: string) {
  for (const member of DEFAULT_APPROVAL_MEMBERS) {
    await prisma.organizationMember.upsert({
      where: {
        organizationId_email: {
          organizationId,
          email: member.email,
        },
      },
      create: {
        organizationId,
        name: member.name,
        email: member.email,
        title: member.title,
        department: member.department,
        approvalRoles: member.approvalRoles as unknown as Prisma.InputJsonValue,
      },
      update: {
        name: member.name,
        title: member.title,
        department: member.department,
        approvalRoles: member.approvalRoles as unknown as Prisma.InputJsonValue,
        active: true,
      },
    });
  }
}
