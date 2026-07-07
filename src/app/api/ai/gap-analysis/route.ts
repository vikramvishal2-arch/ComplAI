import { NextResponse } from 'next/server';
import { runGapAnalysis } from '@/lib/gap/analysis';
import type { GapAnalysisReport } from '@/lib/gap/types';

const CACHE_TTL_MS = 120_000;
let cache: { expiresAt: number; report: GapAnalysisReport } | null = null;

export async function GET() {
  try {
    const now = Date.now();
    if (cache && cache.expiresAt > now) {
      return NextResponse.json(cache.report, {
        headers: { 'X-Gap-Analysis-Cache': 'hit' },
      });
    }

    const report = await runGapAnalysis();
    cache = { report, expiresAt: now + CACHE_TTL_MS };

    return NextResponse.json(report, {
      headers: { 'X-Gap-Analysis-Cache': 'miss' },
    });
  } catch (error) {
    console.error('GET /api/ai/gap-analysis', error);
    return NextResponse.json({ error: 'Gap analysis failed' }, { status: 503 });
  }
}
