import { NextResponse } from 'next/server';
import { getControlById } from '@/lib/data/controls';
import { validateStoredControlEvidence } from '@/lib/evidence/validate-with-ai';
import { saveControlEvidenceValidation } from '@/lib/store';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string; evidenceId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id, evidenceId } = await context.params;
    const control = getControlById(id);
    if (!control) {
      return NextResponse.json({ error: 'Control not found' }, { status: 404 });
    }

    const review = await validateStoredControlEvidence(id, evidenceId);
    await saveControlEvidenceValidation(evidenceId, {
      verdict: review.verdict,
      score: review.score,
      summary: review.summary,
      action: review.action,
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('POST /api/controls/[id]/evidence/[evidenceId]/validate', error);
    const message = error instanceof Error ? error.message : 'Validation failed';
    const status = message === 'Evidence not found' ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
