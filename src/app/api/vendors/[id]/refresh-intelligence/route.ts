import { NextResponse } from 'next/server';
import { refreshVendorInternetIntelligence } from '@/lib/db/vendor-intelligence';
import { formatVendorDbError } from '@/lib/db/prisma-errors';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const result = await refreshVendorInternetIntelligence(id);
    if (!result) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const intel = result.externalIntel;
    const liveSources = intel.providers.filter((p) => p.live).map((p) => p.source);
    const unconfigured = intel.providers.filter((p) => p.status === 'unconfigured').map((p) => p.source);
    const errors = intel.providers.filter((p) => p.status === 'error').map((p) => p.source);

    const parts = [
      `Correlated ${intel.findings.length} finding(s)`,
      liveSources.length ? `live: ${liveSources.join(', ')}` : 'no live sources succeeded',
      unconfigured.length ? `not configured: ${unconfigured.join(', ')}` : null,
      errors.length ? `errors: ${errors.join(', ')}` : null,
      result.elastic.ok
        ? `Elasticsearch indexed ${result.elastic.indexed} doc(s)`
        : `Elasticsearch sync skipped (${result.elastic.error ?? 'unavailable'})`,
    ].filter(Boolean);

    return NextResponse.json({
      ok: true,
      message: parts.join(' · '),
      ...result,
    });
  } catch (error) {
    const message = formatVendorDbError(error);
    if (message) return NextResponse.json({ error: message }, { status: 503 });
    console.error('POST /api/vendors/[id]/refresh-intelligence', error);
    return NextResponse.json({ error: 'Failed to refresh vendor intelligence' }, { status: 503 });
  }
}
