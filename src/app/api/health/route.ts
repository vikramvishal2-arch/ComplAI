import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, status: 'healthy' });
  } catch {
    return NextResponse.json({ ok: false, status: 'database_unreachable' }, { status: 503 });
  }
}
