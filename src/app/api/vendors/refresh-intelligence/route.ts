import { NextResponse } from 'next/server';
import { refreshAllVendorsInternetIntelligence } from '@/lib/db/vendor-intelligence';
import { formatVendorDbError } from '@/lib/db/prisma-errors';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';

export async function POST() {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const results = await refreshAllVendorsInternetIntelligence();
    const synced = results.filter((r) => r.ok).length;
    const withCerts = results.filter((r) => r.certificationsFound > 0).length;
    const liveBreach = results.filter(
      (r) => r.breachStatus === 'clear' || r.breachStatus === 'breaches_found'
    ).length;
    const breachErrors = results.filter((r) => r.breachStatus === 'error').length;
    return NextResponse.json({
      ok: true,
      message: `Refreshed ${synced} vendor(s): curated certs/demo profiles${withCerts > 0 ? ` (${withCerts} with certs)` : ''}; live HIBP breach checks succeeded for ${liveBreach}${breachErrors > 0 ? `, failed for ${breachErrors}` : ''}. Attack-surface vectors remain illustrative except live breach.`,
      results,
    });
  } catch (error) {
    const message = formatVendorDbError(error);
    if (message) return NextResponse.json({ error: message }, { status: 503 });
    console.error('POST /api/vendors/refresh-intelligence', error);
    return NextResponse.json({ error: 'Failed to refresh vendor intelligence' }, { status: 503 });
  }
}
