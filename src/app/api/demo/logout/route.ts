import { NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE, demoSessionCookieOptions } from '@/lib/demo-portal-auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_SESSION_COOKIE, '', {
    ...demoSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
