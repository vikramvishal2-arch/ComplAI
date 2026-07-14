/**
 * Export Propel Ready Help Center framework guides as JSON.
 * Usage: npm run export:framework-help
 *    or: npx tsx scripts/export-framework-help-guides.ts
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync('npx', ['--yes', 'tsx', 'scripts/export-framework-help-guides.ts'], {
  cwd: root,
  encoding: 'utf8',
  shell: true,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
