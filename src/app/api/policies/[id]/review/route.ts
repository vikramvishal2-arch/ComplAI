import { NextResponse } from 'next/server';
import { runAndSavePolicyStandardsReview } from '@/lib/db/policy-repository';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const review = await runAndSavePolicyStandardsReview(id);
    if (!review) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }
    return NextResponse.json({ review });
  } catch (error) {
    console.error('POST /api/policies/[id]/review', error);
    const message = error instanceof Error ? error.message : 'Review failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
