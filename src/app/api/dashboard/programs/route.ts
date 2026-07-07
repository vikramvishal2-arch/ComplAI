import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getLeadershipProgramSummaries } from '@/lib/dashboard/leadership-program-summaries';

const getCachedPrograms = unstable_cache(
  () => getLeadershipProgramSummaries(),
  ['leadership-program-summaries'],
  { revalidate: 30 }
);

export async function GET() {
  try {
    const programs = await getCachedPrograms();
    return NextResponse.json({ programs });
  } catch (error) {
    console.error('GET /api/dashboard/programs', error);
    const message = error instanceof Error ? error.message : 'Failed to load program summaries';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
