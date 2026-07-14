import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { auditModelsInGeneratedClient } from './verify-prisma-audit.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

try {
  execSync('node scripts/prisma-regenerate.mjs', { stdio: 'inherit', cwd: root, windowsHide: true });
} catch {
  console.warn('');
  console.warn('Prisma generate failed (often EPERM on Windows). Trying to continue…');
  console.warn('If audits fail, run: npm run db:generate:win');
  console.warn('');
}

if (!auditModelsInGeneratedClient()) {
  console.error('');
  console.error('Cannot start dev server: Prisma client is missing audit models.');
  console.error('');
  console.error('Fix:');
  console.error('  1. Stop every terminal running npm run dev');
  console.error('  2. Run: npm run db:generate:win');
  console.error('  3. Run: npm run dev');
  console.error('');
  process.exit(1);
}

const child = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  cwd: root,
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
