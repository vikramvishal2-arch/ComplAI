import { execSync } from 'node:child_process';

try {
  execSync('npx prisma generate', { stdio: 'inherit', windowsHide: true });
} catch (err) {
  const msg = String(err?.message ?? err);
  const stderr = String(err?.stderr ?? '');
  const combined = `${msg} ${stderr}`;
  if (combined.includes('EPERM') || combined.includes('operation not permitted')) {
    console.warn('');
    console.warn('Prisma generate skipped: query_engine file is locked (dev server running?).');
    console.warn('Stop `npm run dev` (Ctrl+C), then run: npm run db:generate');
    console.warn('');
    process.exit(0);
  }
  process.exit(1);
}
