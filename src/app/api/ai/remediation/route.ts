import { NextResponse } from 'next/server';
import { completeChat } from '@/lib/ai/client';
import { buildControlContext } from '@/lib/ai/context';
import { REMEDIATION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { getAiConfig } from '@/lib/ai/config';
import { runGapAnalysis } from '@/lib/gap/analysis';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { controlId?: string };

    const ai = getAiConfig();

    if (body.controlId && ai.configured) {
      const context = await buildControlContext(body.controlId);
      const suggestion = await completeChat([
        { role: 'system', content: REMEDIATION_SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this control and provide remediation guidance:\n\n${context}` },
      ]);
      return NextResponse.json({ controlId: body.controlId, suggestion, source: 'ai' });
    }

    const report = await runGapAnalysis();
    const topGaps = report.priorityGaps.slice(0, 10).map((g) => ({
      controlId: g.controlId,
      controlReference: g.controlReference,
      title: g.controlTitle,
      severity: g.severity,
      message: g.message,
      suggestedActions: g.suggestedActions,
    }));

    if (body.controlId && !ai.configured) {
      const gap = report.allGaps.find((g) => g.controlId === body.controlId);
      if (gap) {
        return NextResponse.json({
          controlId: body.controlId,
          suggestion: [
            `**Priority:** ${gap.severity.toUpperCase()}`,
            `**Issue:** ${gap.message}`,
            '',
            '**Suggested actions:**',
            ...gap.suggestedActions.map((a, i) => `${i + 1}. ${a}`),
          ].join('\n'),
          source: 'rules',
        });
      }
    }

    return NextResponse.json({
      source: ai.configured ? 'ai' : 'rules',
      priorityGaps: topGaps,
      summary: report.summary,
    });
  } catch (error) {
    console.error('POST /api/ai/remediation', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Remediation assist failed' },
      { status: 500 }
    );
  }
}
