import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const clientTypes = join(root, 'node_modules', '.prisma', 'client', 'index.d.ts');

export function auditModelsInGeneratedClient() {
  if (!existsSync(clientTypes)) return false;
  const content = readFileSync(clientTypes, 'utf8');
  return content.includes('auditProgram') && content.includes('auditRiskDomain');
}

if (process.argv[1]?.endsWith('verify-prisma-audit.mjs')) {
  if (auditModelsInGeneratedClient()) {
    console.log('Prisma client includes audit models.');
    process.exit(0);
  }
  console.error('');
  console.error('Prisma client is missing audit models (auditProgram, auditRiskDomain, etc.).');
  console.error('Stop all dev servers, then run: npm run db:generate:win');
  console.error('');
  process.exit(1);
}
