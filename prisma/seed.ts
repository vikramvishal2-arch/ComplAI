import { PrismaClient } from '@prisma/client';
import { DEFAULT_APPROVAL_MEMBERS } from '../src/lib/data/approval-members';
import { ORGANIZATION_NAME } from '../src/lib/brand';

const prisma = new PrismaClient();

async function seedApprovalMembers(organizationId: string) {
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
        approvalRoles: member.approvalRoles,
      },
      update: {
        name: member.name,
        title: member.title,
        department: member.department,
        approvalRoles: member.approvalRoles,
        active: true,
      },
    });
  }
}

async function main() {
  let org = await prisma.organization.findFirst();

  if (!org) {
    org = await prisma.organization.create({
      data: { name: ORGANIZATION_NAME },
    });
    console.log(`Created organization: ${org.name} (${org.id})`);
  } else {
    console.log(`Using organization: ${org.name} (${org.id})`);
  }

  await seedApprovalMembers(org.id);
  const count = await prisma.organizationMember.count({
    where: { organizationId: org.id },
  });
  console.log(`Seeded ${count} approval members`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
