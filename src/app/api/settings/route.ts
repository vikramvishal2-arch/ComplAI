import { NextResponse } from 'next/server';
import { getOrganizationName, setOrganizationName } from '@/lib/store';
import { requireDemoAdmin } from '@/lib/server/require-demo-admin';

export async function GET() {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const organizationName = await getOrganizationName();
    return NextResponse.json({ organizationName });
  } catch (error) {
    console.error('GET /api/settings', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

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
