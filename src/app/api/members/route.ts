import { NextResponse } from 'next/server';
import { getOrganizationMembers } from '@/lib/db/member-repository';

export async function GET() {
  try {
    const members = await getOrganizationMembers();
    return NextResponse.json({ members });
  } catch (error) {
    console.error('GET /api/members', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
