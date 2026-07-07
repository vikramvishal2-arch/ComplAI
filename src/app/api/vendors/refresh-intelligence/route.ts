import { NextResponse } from 'next/server';
import { refreshAllVendorsInternetIntelligence } from '@/lib/db/vendor-intelligence';
import { formatVendorDbError } from '@/lib/db/prisma-errors';

export async function POST() {
  try {
    const results = await refreshAllVendorsInternetIntelligence();
    const synced = results.filter((r) => r.ok).length;
    const withCerts = results.filter((r) => r.certificationsFound > 0).length;
    return NextResponse.json({
      ok: true,
      message: `Refreshed ${synced} vendor(s) from public internet intelligence${withCerts > 0 ? `; ${withCerts} with certifications` : ''}.`,
      results,
    });
  } catch (error) {
    const message = formatVendorDbError(error);
    if (message) return NextResponse.json({ error: message }, { status: 503 });
    console.error('POST /api/vendors/refresh-intelligence', error);
    return NextResponse.json({ error: 'Failed to refresh vendor intelligence' }, { status: 503 });
  }
}
