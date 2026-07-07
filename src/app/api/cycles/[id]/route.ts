import { NextResponse } from 'next/server';
import { getCycleById, updateCycle, deleteCycle, acknowledgeReminder } from '@/lib/cycles/cycle-engine';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cycle = await getCycleById(id);
    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }
    return NextResponse.json({ cycle });
  } catch (error) {
    console.error('GET /api/cycles/[id]', error);
    return NextResponse.json({ error: 'Failed to load cycle' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.acknowledgeReminderId) {
      const ok = await acknowledgeReminder(body.acknowledgeReminderId);
      if (!ok) {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
      }
      const cycle = await getCycleById(id);
      return NextResponse.json({ cycle });
    }

    const cycle = await updateCycle(id, body);
    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }
    return NextResponse.json({ cycle });
  } catch (error) {
    console.error('PATCH /api/cycles/[id]', error);
    return NextResponse.json({ error: 'Failed to update cycle' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCycle(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cycles/[id]', error);
    return NextResponse.json({ error: 'Failed to delete cycle' }, { status: 500 });
  }
}
