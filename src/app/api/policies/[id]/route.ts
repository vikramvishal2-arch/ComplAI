import { NextResponse } from 'next/server';
import { getPolicyWithControlRoadmap, updatePolicy, deletePolicy, PolicyApprovalValidationError } from '@/lib/db/policy-repository';
import { deletePolicyFile } from '@/lib/policies/storage';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await getPolicyWithControlRoadmap(id);
    if (!result) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/policies/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const policy = await updatePolicy(id, body);
    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }
    return NextResponse.json({ policy });
  } catch (error) {
    if (error instanceof PolicyApprovalValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PATCH /api/policies/[id]', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await deletePolicy(id);
    if (!existing) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }
    if (existing.storagePath) {
      await deletePolicyFile(existing.storagePath);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/policies/[id]', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 503 });
  }
}
