import { NextResponse } from 'next/server';
import { getExecutiveDashboard } from '@/lib/store';

export async function GET() {
  try {
    const dashboard = await getExecutiveDashboard();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('GET /api/dashboard/executive', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
