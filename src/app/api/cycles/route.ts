import { NextResponse } from 'next/server';
import { getCycles, createCycle } from '@/lib/cycles/cycle-engine';
import type { ProgramType } from '@/lib/types';

export async function GET() {
  try {
    const cycles = await getCycles();
    return NextResponse.json({ cycles });
  } catch (error) {
    console.error('GET /api/cycles', error);
    const message = error instanceof Error ? error.message : 'Failed to load cycles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const VALID_PROGRAM_TYPES: ProgramType[] = [
  'internal_audit',
  'external_audit',
  'risk_assessment',
  'vendor_assessment',
  'risk_register_update',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { programType, title, description, periodStart, periodEnd, dueDate, owner, reminderDays, notes } = body;

    if (!programType || !VALID_PROGRAM_TYPES.includes(programType)) {
      return NextResponse.json({ error: 'Invalid programType' }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!periodStart || !periodEnd || !dueDate) {
      return NextResponse.json({ error: 'periodStart, periodEnd, and dueDate are required' }, { status: 400 });
    }

    const cycle = await createCycle({
      programType,
      title,
      description,
      periodStart,
      periodEnd,
      dueDate,
      owner,
      reminderDays,
      notes,
    });

    return NextResponse.json({ cycle }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cycles', error);
    const message = error instanceof Error ? error.message : 'Failed to create cycle';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
