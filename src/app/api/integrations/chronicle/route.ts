import { NextResponse } from 'next/server';
import { buildChronicleIntelligenceReport } from '@/lib/integrations/chronicle/intelligence';

export async function GET() {
  try {
    const report = await buildChronicleIntelligenceReport();
    return NextResponse.json(report);
  } catch (error) {
    console.error('GET /api/integrations/chronicle', error);
    return NextResponse.json({ error: 'Chronicle intelligence unavailable' }, { status: 503 });
  }
}
