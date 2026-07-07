/**
 * Wipe tenant data and re-seed a fresh demo environment.
 * Run: npm run demo:reset
 */
import { PrismaClient } from '@prisma/client';
import { seedDemoEnvironment } from './demo-seed';

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.organization.deleteMany();
  console.log(`Removed ${deleted.count} organization(s)`);

  const org = await seedDemoEnvironment();
  console.log(`Fresh demo ready: ${org.name} (${org.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
