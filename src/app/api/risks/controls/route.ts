import { NextResponse } from 'next/server';
import { getLinkableControlsForOrganization } from '@/lib/controls/validate';

export async function GET() {
  try {
    const controls = await getLinkableControlsForOrganization();
    return NextResponse.json({ controls });
  } catch (error) {
    console.error('GET /api/risks/controls', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
