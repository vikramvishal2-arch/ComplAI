import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  createDemoSession,
  createLegacyDemoSessionToken,
  demoSessionCookieOptions,
  isDemoPortalEnabled,
} from '@/lib/demo-portal-auth';
import { verifyDemoPortalCredentials } from '@/lib/db/demo-portal-repository';

export async function GET() {
  return NextResponse.json({ portalEnabled: isDemoPortalEnabled() });
}

export async function POST(request: Request) {
  if (!isDemoPortalEnabled()) {
    return NextResponse.json({ ok: true, portalEnabled: false });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? '';
  const password = body.password?.trim() ?? '';

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 });
  }

  if (email) {
    const account = await verifyDemoPortalCredentials(email, password);
    if (!account) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createDemoSession({
      role: account.role,
      email: account.email,
      displayName: account.displayName,
    });
    const response = NextResponse.json({
      ok: true,
      role: account.role,
      displayName: account.displayName,
    });
    response.cookies.set(DEMO_SESSION_COOKIE, token, demoSessionCookieOptions());
    return response;
  }

  const legacyPassword = process.env.DEMO_ACCESS_PASSWORD?.trim();
  if (!legacyPassword || password !== legacyPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await createLegacyDemoSessionToken(legacyPassword);
  const response = NextResponse.json({
    ok: true,
    role: 'admin',
    displayName: 'Demo Admin',
  });
  response.cookies.set(DEMO_SESSION_COOKIE, token, demoSessionCookieOptions());
  return response;
}
