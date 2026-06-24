import { NextResponse } from 'next/server';
import { getApprovalInboxForMember } from '@/lib/db/policy-repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const filter = (searchParams.get('filter') ?? 'pending') as 'pending' | 'completed' | 'all';

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const result = await getApprovalInboxForMember(memberId, filter);
    if (!result) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/policies/approvals/inbox', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
