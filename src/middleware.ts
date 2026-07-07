import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  createDemoSessionToken,
  isDemoGateEnabled,
  isProtectedAppPath,
} from '@/lib/demo-access';

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const gateEnabled = isDemoGateEnabled();

  if (pathname === '/demo/access' || pathname.startsWith('/demo/access/')) {
    if (!gateEnabled) {
      return redirectToNext(request);
    }

    const password = process.env.DEMO_ACCESS_PASSWORD!.trim();
    const expected = await createDemoSessionToken(password);
    const session = request.cookies.get(DEMO_SESSION_COOKIE)?.value;

    if (session === expected) {
      return redirectToNext(request);
    }

    return NextResponse.next();
  }

  if (!gateEnabled) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  if (!isProtectedAppPath(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.DEMO_ACCESS_PASSWORD!.trim();
  const expected = await createDemoSessionToken(password);
  const session = request.cookies.get(DEMO_SESSION_COOKIE)?.value;

  if (session === expected) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Demo access required' }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/demo/access';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
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
