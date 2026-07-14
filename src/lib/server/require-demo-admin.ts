import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  isDemoPortalEnabled,
  isLegacyDemoSession,
  parseDemoSession,
  type DemoSession,
} from '@/lib/demo-portal-auth';

async function resolveSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  const session = await parseDemoSession(token);
  if (session) return session;

  const legacyPassword = process.env.DEMO_ACCESS_PASSWORD?.trim();
  if (legacyPassword && (await isLegacyDemoSession(token, legacyPassword))) {
    return {
      role: 'admin',
      email: 'admin@complai.local',
      displayName: 'Demo Admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    };
  }

  return null;
}

/** Any signed-in demo user (customer or admin). No-ops when portal is disabled (local). */
export async function requireDemoSession():
  Promise<{ session: DemoSession } | { error: NextResponse }> {
  if (!isDemoPortalEnabled()) {
    return { session: { role: 'admin', email: 'local', displayName: 'Local', exp: 0 } };
  }

  const session = await resolveSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: 'Demo sign-in required' }, { status: 401 }),
    };
  }

  return { session };
}

export async function requireDemoAdmin():
  Promise<{ session: DemoSession } | { error: NextResponse }> {
  const auth = await requireDemoSession();
  if ('error' in auth) return auth;

  if (auth.session.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return auth;
}

/**
 * Authorize cron-style endpoints: Bearer/X-Cron-Secret matching CRON_SECRET,
 * or a demo admin session when the portal is enabled.
 * In production without CRON_SECRET and without the demo portal, rejects.
 */
export async function requireCronOrDemoAdmin(request: Request):
  Promise<{ ok: true } | { error: NextResponse }> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    const auth = request.headers.get('authorization')?.trim() ?? '';
    const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
    const header = request.headers.get('x-cron-secret')?.trim() ?? '';
    if (bearer === cronSecret || header === cronSecret) {
      return { ok: true };
    }
    // Fall through to demo admin when portal is on (manual trigger from UI).
  }

  if (isDemoPortalEnabled()) {
    const admin = await requireDemoAdmin();
    if ('error' in admin) return admin;
    return { ok: true };
  }

  if (cronSecret) {
    return {
      error: NextResponse.json({ error: 'Invalid or missing cron credentials' }, { status: 401 }),
    };
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      error: NextResponse.json(
        { error: 'Set CRON_SECRET (or enable demo portal) before calling this endpoint' },
        { status: 401 }
      ),
    };
  }

  // Local development without portal / cron secret.
  return { ok: true };
}
