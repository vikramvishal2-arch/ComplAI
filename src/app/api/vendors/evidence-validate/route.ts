import { NextResponse } from 'next/server';
import { validateTprmEvidenceAnswer } from '@/lib/evidence/validate-with-ai';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body.question ?? '').trim();
    const answer = String(body.answer ?? '').trim();
    if (!question) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const review = await validateTprmEvidenceAnswer({
      question,
      answer,
      evidenceGuidance: typeof body.evidenceGuidance === 'string' ? body.evidenceGuidance : undefined,
      controlRefs: Array.isArray(body.controlRefs) ? body.controlRefs.map(String) : undefined,
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('POST /api/vendors/evidence-validate', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }
}
