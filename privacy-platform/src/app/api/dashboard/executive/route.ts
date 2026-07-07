import { NextResponse } from 'next/server';
import { getExecutiveDashboard } from '@/lib/store';

export async function GET() {
  try {
    const dashboard = await getExecutiveDashboard();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('GET /api/dashboard/executive', error);
    const message = error instanceof Error ? error.message : 'Database unavailable';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
