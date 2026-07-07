import { NextResponse } from 'next/server';
import { createDpiaRecord, listDpiaRecords } from '@/lib/store';

export async function GET() {
  try {
    const dpias = await listDpiaRecords();
    return NextResponse.json({ dpias });
  } catch (error) {
    console.error('GET /api/dpias', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.processingActivityName?.trim()) {
      return NextResponse.json(
        { error: 'Processing activity name is required' },
        { status: 400 }
      );
    }
    const dpia = await createDpiaRecord(body);
    return NextResponse.json({ dpia }, { status: 201 });
  } catch (error) {
    console.error('POST /api/dpias', error);
    return NextResponse.json({ error: 'Failed to create DPIA' }, { status: 503 });
  }
}
