import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getExecutiveDashboard } from '@/lib/store';

const getCachedExecutiveDashboard = unstable_cache(
  () => getExecutiveDashboard(),
  ['executive-dashboard'],
  { revalidate: 30 }
);

export async function GET() {
  try {
    const dashboard = await getCachedExecutiveDashboard();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('GET /api/dashboard/executive', error);
    const message = error instanceof Error ? error.message : 'Database unavailable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
