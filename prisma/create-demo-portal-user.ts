/**
 * Create or update a ComplAI Lab demo portal account.
 *
 * Usage:
 *   npm run demo:create-user -- admin admin@propelreadysolutions.in "AdminPass123"
 *   npm run demo:create-user -- customer you@customer.com "SecurePass123" "Acme Corp"
 */
import { PrismaClient } from '@prisma/client';
import { hashDemoPassword } from '../src/lib/demo-password';
import type { DemoPortalRole } from '../src/lib/demo-session';

const prisma = new PrismaClient();

function assertDemoPortalModel() {
  const delegate = (prisma as PrismaClient & { demoPortalAccount?: unknown }).demoPortalAccount;
  if (!delegate || typeof (delegate as { upsert?: unknown }).upsert !== 'function') {
    console.error('');
    console.error('Prisma client is missing DemoPortalAccount.');
    console.error('Run these commands first:');
    console.error('  npx prisma generate');
    console.error('  npx prisma db push');
    console.error('');
    process.exit(1);
  }
}

async function upsertDemoPortalAccount(input: {
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

async function main() {
  assertDemoPortalModel();

  const [, , roleArg, email, password, displayName] = process.argv;
  const role: DemoPortalRole = roleArg === 'admin' ? 'admin' : 'customer';

  if (!email || !password) {
    console.error(
      'Usage: npm run demo:create-user -- <customer|admin> <email> <password> [displayName]'
    );
    process.exit(1);
  }

  await upsertDemoPortalAccount({
    email,
    password,
    displayName: displayName || email,
    role,
  });

  console.log(`Demo portal ${role} account ready: ${email.toLowerCase()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
