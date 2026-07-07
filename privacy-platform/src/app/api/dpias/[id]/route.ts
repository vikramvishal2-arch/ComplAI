import { NextResponse } from 'next/server';
import { deleteDpiaRecord, getDpiaById, updateDpiaRecord } from '@/lib/store';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const dpia = await getDpiaById(id);
    if (!dpia) {
      return NextResponse.json({ error: 'DPIA not found' }, { status: 404 });
    }
    return NextResponse.json({ dpia });
  } catch (error) {
    console.error('GET /api/dpias/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const dpia = await updateDpiaRecord(id, body);
    if (!dpia) {
      return NextResponse.json({ error: 'DPIA not found' }, { status: 404 });
    }
    return NextResponse.json({ dpia });
  } catch (error) {
    console.error('PATCH /api/dpias/[id]', error);
    return NextResponse.json({ error: 'Failed to update DPIA' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ok = await deleteDpiaRecord(id);
    if (!ok) {
      return NextResponse.json({ error: 'DPIA not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/dpias/[id]', error);
    return NextResponse.json({ error: 'Failed to delete DPIA' }, { status: 503 });
  }
}
