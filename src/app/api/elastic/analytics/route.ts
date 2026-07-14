import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/elastic/analytics-queries';
import { requireDemoSession } from '@/lib/server/require-demo-admin';

export async function GET() {
  const auth = await requireDemoSession();
  if ('error' in auth) return auth.error;

  const summary = await getAnalyticsSummary();
  if (!summary) {
    return NextResponse.json(
      { error: 'Elasticsearch is not reachable. Start it with: npm run analytics:up' },
      { status: 503 }
    );
  }
  return NextResponse.json(summary);
}
