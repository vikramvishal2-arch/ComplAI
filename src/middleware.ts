import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  isAdminOnlyApiPath,
  isAdminOnlyPagePath,
  isCustomerReadOnlyApiWrite,
  isDemoPortalEnabled,
  isLegacyDemoSession,
  isProtectedAppPath,
  parseDemoSession,
} from '@/lib/demo-portal-auth';

function resolveNextPath(request: NextRequest): string {
  const next = request.nextUrl.searchParams.get('next') || '/dashboard';
  return next.startsWith('/') ? next : '/dashboard';
}

function redirectToNext(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = resolveNextPath(request);
  url.search = '';
  return NextResponse.redirect(url);
}

async function resolveSession(request: NextRequest) {
  const token = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  const session = await parseDemoSession(token);
  if (session) return session;

  const legacyPassword = process.env.DEMO_ACCESS_PASSWORD?.trim();
  if (legacyPassword && (await isLegacyDemoSession(token, legacyPassword))) {
    return {
      role: 'admin' as const,
      email: 'admin@complai.local',
      displayName: 'Demo Admin',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    };
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const portalEnabled = isDemoPortalEnabled();

  if (pathname === '/demo/access' || pathname.startsWith('/demo/access/')) {
    if (!portalEnabled) {
      return redirectToNext(request);
    }

    const session = await resolveSession(request);
    if (session) {
      return redirectToNext(request);
    }

    return NextResponse.next();
  }

  if (!portalEnabled) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  if (!isProtectedAppPath(pathname)) {
    return NextResponse.next();
  }

  const session = await resolveSession(request);

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Demo sign-in required' }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/demo/access';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role === 'customer') {
    if (isAdminOnlyPagePath(pathname) || isAdminOnlyApiPath(pathname)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
      const denied = request.nextUrl.clone();
      denied.pathname = '/dashboard';
      denied.searchParams.set('demo', 'admin-denied');
      return NextResponse.redirect(denied);
    }

    if (isCustomerReadOnlyApiWrite(pathname, request.method)) {
      return NextResponse.json(
        { error: 'This area is view-only in the demo portal' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/demo/access',
    '/dashboard/:path*',
    '/controls/:path*',
    '/frameworks/:path*',
    '/policies/:path*',
    '/risk-register/:path*',
    '/vendors/:path*',
    '/intelligence/:path*',
    '/integrations/:path*',
    '/settings/:path*',
    '/audits/:path*',
    '/assurance/:path*',
    '/security-learning',
    '/security-learning/:path*',
    '/program/:path*',
    '/cycles/:path*',
    '/api/:path*',
  ],
};
