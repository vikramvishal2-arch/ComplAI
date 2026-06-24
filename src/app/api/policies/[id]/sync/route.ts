import { NextResponse } from 'next/server';
import { syncPolicyControls } from '@/lib/db/policy-repository';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await syncPolicyControls(id);
    if (!result) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/policies/[id]/sync', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 503 });
  }
}
