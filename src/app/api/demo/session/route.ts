import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  isDemoPortalEnabled,
  isLegacyDemoSession,
  parseDemoSession,
} from '@/lib/demo-portal-auth';

export async function GET() {
  if (!isDemoPortalEnabled()) {
    return NextResponse.json({
      signedIn: true,
      portalEnabled: false,
      role: 'admin',
      email: 'admin@complai.local',
      displayName: 'Administrator',
      readOnlyAreas: [],
      canAccessSettings: true,
      canManageFrameworkCatalog: true,
    });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  let session = await parseDemoSession(token);

  if (!session) {
    const legacyPassword = process.env.DEMO_ACCESS_PASSWORD?.trim();
    if (legacyPassword && (await isLegacyDemoSession(token, legacyPassword))) {
      session = {
        role: 'admin',
        email: 'admin@complai.local',
        displayName: 'Demo Admin',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
      };
    }
  }

  if (!session) {
    return NextResponse.json({ signedIn: false, portalEnabled: true });
  }

  return NextResponse.json({
    signedIn: true,
    portalEnabled: true,
    role: session.role,
    email: session.email,
    displayName: session.displayName,
    readOnlyAreas: session.role === 'customer' ? ['dashboard', 'frameworks'] : [],
    canAccessSettings: session.role === 'admin',
    canManageFrameworkCatalog: session.role === 'admin',
  });
}
