import { NextResponse } from 'next/server';
import {
  applyPolicyRecommendation,
  dismissPolicyRecommendation,
  PolicyReviewActionError,
} from '@/lib/db/policy-repository';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string; recId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id, recId } = await context.params;
    const body = await request.json();
    const action = body?.action as string;

    if (action !== 'apply' && action !== 'dismiss') {
      return NextResponse.json({ error: 'action must be "apply" or "dismiss"' }, { status: 400 });
    }

    const result =
      action === 'apply'
        ? await applyPolicyRecommendation(id, recId)
        : await dismissPolicyRecommendation(id, recId);

    if (!result) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PolicyReviewActionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PATCH /api/policies/[id]/review/recommendations/[recId]', error);
    const message = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
