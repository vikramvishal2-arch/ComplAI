import { NextResponse } from 'next/server';
import { searchVendorExternalIntel } from '@/lib/vendor/intel/elastic-sync';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';

/** Effective search over correlated vendor intel (Postgres → Elasticsearch). */
export async function GET(request: Request) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const size = Math.min(50, Math.max(1, Number(searchParams.get('size') ?? 25) || 25));

  const result = await searchVendorExternalIntel(q, size);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? 'Search unavailable', hits: [] },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, query: q, hits: result.hits });
}
