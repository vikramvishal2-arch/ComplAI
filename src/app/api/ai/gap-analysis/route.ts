import { NextResponse } from 'next/server';
import { runGapAnalysis } from '@/lib/gap/analysis';

export async function GET() {
  try {
    const report = await runGapAnalysis();
    return NextResponse.json(report);
  } catch (error) {
    console.error('GET /api/ai/gap-analysis', error);
    return NextResponse.json({ error: 'Gap analysis failed' }, { status: 503 });
  }
}
