import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

const prismaClient = globalForPrisma.prisma ?? createPrismaClient();
const hasAuditModels = 'auditProgram' in prismaClient && 'auditRiskDomain' in prismaClient;

if (process.env.NODE_ENV !== 'production') {
  if (hasAuditModels) {
    globalForPrisma.prisma = prismaClient;
  } else {
    globalForPrisma.prisma = undefined;
    console.error(
      '[prisma] Audit models missing from Prisma Client. Stop the server, run: npm run db:generate:win, then npm run dev'
    );
  }
}

export const prisma = prismaClient;
