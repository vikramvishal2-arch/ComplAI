import { NextResponse } from 'next/server';
import {
  deletePrivacyRisk,
  getPrivacyRiskById,
  updatePrivacyRisk,
} from '@/lib/store';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const risk = await getPrivacyRiskById(id);
    if (!risk) {
      return NextResponse.json({ error: 'Privacy risk not found' }, { status: 404 });
    }
    return NextResponse.json({ risk });
  } catch (error) {
    console.error('GET /api/privacy-risks/[id]', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const risk = await updatePrivacyRisk(id, body);
    if (!risk) {
      return NextResponse.json({ error: 'Privacy risk not found' }, { status: 404 });
    }
    return NextResponse.json({ risk });
  } catch (error) {
    console.error('PATCH /api/privacy-risks/[id]', error);
    return NextResponse.json({ error: 'Failed to update privacy risk' }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ok = await deletePrivacyRisk(id);
    if (!ok) {
      return NextResponse.json({ error: 'Privacy risk not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/privacy-risks/[id]', error);
    return NextResponse.json({ error: 'Failed to delete privacy risk' }, { status: 503 });
  }
}
