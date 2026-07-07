import { NextResponse } from 'next/server';
import { createPrivacyRisk, listPrivacyRisks } from '@/lib/store';

export async function GET() {
  try {
    const risks = await listPrivacyRisks();
    return NextResponse.json({ risks });
  } catch (error) {
    console.error('GET /api/privacy-risks', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.description?.trim() && !body.affectedIndividualsAssets?.trim()) {
      return NextResponse.json(
        { error: 'Risk description or affected individuals/assets is required' },
        { status: 400 }
      );
    }
    const risk = await createPrivacyRisk(body);
    return NextResponse.json({ risk }, { status: 201 });
  } catch (error) {
    console.error('POST /api/privacy-risks', error);
    return NextResponse.json({ error: 'Failed to create privacy risk' }, { status: 503 });
  }
}
