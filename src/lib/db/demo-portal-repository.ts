import { prisma } from '@/lib/db/prisma';
import type { DemoPortalRole } from '@/lib/demo-portal-auth';
import { hashDemoPassword, verifyDemoPassword } from '@/lib/demo-password';

export type DemoPortalAccountRecord = {
  email: string;
  displayName: string;
  role: DemoPortalRole;
};

export async function findDemoPortalAccount(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return prisma.demoPortalAccount.findFirst({
    where: { email: normalized, active: true },
  });
}

export async function verifyDemoPortalCredentials(
  email: string,
  password: string
): Promise<DemoPortalAccountRecord | null> {
  const account = await findDemoPortalAccount(email);
  if (!account) return null;
  if (!verifyDemoPassword(password, account.passwordHash)) return null;
  return {
    email: account.email,
    displayName: account.displayName || account.email,
    role: account.role === 'admin' ? 'admin' : 'customer',
  };
}

export async function upsertDemoPortalAccount(input: {
  email: string;
  password: string;
  displayName: string;
  role: DemoPortalRole;
}) {
  const email = input.email.trim().toLowerCase();
  return prisma.demoPortalAccount.upsert({
    where: { email },
    create: {
      email,
      passwordHash: hashDemoPassword(input.password),
      displayName: input.displayName,
      role: input.role,
      active: true,
    },
    update: {
      passwordHash: hashDemoPassword(input.password),
      displayName: input.displayName,
      role: input.role,
      active: true,
    },
  });
}

export async function hasActiveDemoPortalAccounts(): Promise<boolean> {
  const count = await prisma.demoPortalAccount.count({ where: { active: true } });
  return count > 0;
}
