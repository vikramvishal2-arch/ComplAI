import { NextResponse } from 'next/server';
import { getOrganizationName, setOrganizationName } from '@/lib/store';

export async function GET() {
  try {
    const organizationName = await getOrganizationName();
    return NextResponse.json({ organizationName });
  } catch (error) {
    console.error('GET /api/settings', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    let organizationName = await getOrganizationName();
    if (typeof body.organizationName === 'string' && body.organizationName.trim()) {
      organizationName = await setOrganizationName(body.organizationName.trim());
    }
    return NextResponse.json({ organizationName });
  } catch (error) {
    console.error('PATCH /api/settings', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
