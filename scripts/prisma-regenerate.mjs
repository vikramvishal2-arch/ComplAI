/**
 * Windows-safe Prisma generate: clears cache, uses binary engine (see schema.prisma).
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const prismaDir = join(root, 'node_modules', '.prisma');
const prismaCli = join(root, 'node_modules', 'prisma', 'build', 'index.js');

function rmSafe(dir, label) {
  if (!existsSync(dir)) return;
  try {
    rmSync(dir, { recursive: true, force: true });
    console.log(`Cleared ${label}`);
  } catch {
    console.error(`Could not delete ${label} — file is locked.`);
    throw new Error('LOCKED');
  }
}

function printHelp() {
  console.error('');
  console.error('EPERM fix on Windows:');
  console.error('  1. Ctrl+C in every terminal running `npm run dev`');
  console.error('  2. Task Manager → end all "Node.js JavaScript Runtime"');
  console.error('  3. Double-click: scripts\\prisma-generate.cmd');
  console.error('     OR run: npm run db:generate');
  console.error('');
  console.error('If OneDrive syncs this folder, pause sync or move the project outside OneDrive.');
  console.error('');
}

function verifyAuditModels() {
  const clientTypes = join(root, 'node_modules', '.prisma', 'client', 'index.d.ts');
  if (!existsSync(clientTypes)) return false;
  const content = readFileSync(clientTypes, 'utf8');
  return content.includes('auditProgram');
}

try {
  execSync(`node "${prismaCli}" generate`, { stdio: 'inherit', cwd: root, windowsHide: true });
  if (!verifyAuditModels()) {
    console.error('');
    console.error('Prisma generate finished but audit models are still missing from the client.');
    console.error('Run: npm run db:generate:win (stops dev servers and regenerates).');
    console.error('');
    process.exit(1);
  }
  console.log('Prisma Client generated successfully (audit models present).');
} catch (error) {
  const msg = String(error?.message ?? error);
  if (msg.includes('EPERM') || msg.includes('operation not permitted') || msg === 'LOCKED') {
    printHelp();
    process.exit(1);
  }
  process.exit(1);
}

// Optional cache clear after a successful generate (never delete before generate — that leaves no client).
try {
  rmSafe(join(root, 'node_modules', '.cache', 'prisma'), 'node_modules/.cache/prisma');
} catch {
  // non-fatal
}
