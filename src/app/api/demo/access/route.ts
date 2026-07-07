import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  createDemoSessionToken,
  isDemoGateEnabled,
} from '@/lib/demo-access';

export async function GET() {
  return NextResponse.json({ gateEnabled: isDemoGateEnabled() });
}

export async function POST(request: Request) {
  if (!isDemoGateEnabled()) {
    return NextResponse.json({ ok: true, gateEnabled: false });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const password = body.password?.trim() ?? '';
  const expectedPassword = process.env.DEMO_ACCESS_PASSWORD!.trim();

  if (password !== expectedPassword) {
    return NextResponse.json({ error: 'Incorrect demo password' }, { status: 401 });
  }

  const token = await createDemoSessionToken(expectedPassword);
  const response = NextResponse.json({ ok: true, gateEnabled: true });

  response.cookies.set(DEMO_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}
