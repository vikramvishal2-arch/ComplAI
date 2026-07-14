import { NextResponse } from 'next/server';
import { getMonitoringStatus } from '@/lib/monitoring/config';
import { getMonitorDashboard } from '@/lib/monitoring/runner';
import { requireDemoSession } from '@/lib/server/require-demo-admin';

export async function GET() {
  const auth = await requireDemoSession();
  if ('error' in auth) return auth.error;

  try {
    const config = getMonitoringStatus();
    const dashboard = await getMonitorDashboard();
    return NextResponse.json({ config, dashboard });
  } catch (error) {
    console.error('GET /api/monitoring/status', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
