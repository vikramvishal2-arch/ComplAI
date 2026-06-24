import { NextResponse } from 'next/server';
import {
  getPolicyApprovalViewForMember,
  submitPolicyApprovalStep,
  submitPolicyAuthorPrepare,
  PolicyApprovalStepError,
} from '@/lib/db/policy-repository';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const result = await getPolicyApprovalViewForMember(id, memberId);
    if (!result) {
      return NextResponse.json({ error: 'Policy or assignment not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/policies/[id]/approval-view', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { memberId, stepId, status, comments, decisionDate, action } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    if (action === 'prepare_version') {
      const policy = await submitPolicyAuthorPrepare(id, memberId, comments);
      if (!policy) {
        return NextResponse.json({ error: 'Policy or member not found' }, { status: 404 });
      }
      return NextResponse.json({ policy });
    }

    if (!stepId || !status) {
      return NextResponse.json(
        { error: 'stepId and status are required for review actions' },
        { status: 400 }
      );
    }

    const policy = await submitPolicyApprovalStep(id, memberId, stepId, {
      status,
      comments,
      decisionDate,
    });

    if (!policy) {
      return NextResponse.json({ error: 'Policy or member not found' }, { status: 404 });
    }

    return NextResponse.json({ policy });
  } catch (error) {
    if (error instanceof PolicyApprovalStepError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PATCH /api/policies/[id]/approval-view', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 503 });
  }
}
