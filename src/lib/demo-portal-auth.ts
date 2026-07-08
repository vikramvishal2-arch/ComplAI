export const DEMO_SESSION_COOKIE = 'complai_demo_session';

import type { DemoSession } from '@/lib/demo-session';
import { demoSessionMaxAgeSeconds } from '@/lib/demo-session';

export type { DemoPortalRole, DemoSession } from '@/lib/demo-session';
export { createDemoSession, demoSessionMaxAgeSeconds, parseDemoSession } from '@/lib/demo-session';

export function isDemoPortalEnabled(): boolean {
  return (
    process.env.DEMO_PORTAL_ENABLED === 'true' ||
    Boolean(process.env.DEMO_ACCESS_PASSWORD?.trim())
  );
}

export function isPublicDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isDemoPortalEnabled();
}

export const DEMO_ENTRY_PATH = '/demo/access';

export function getDemoEntryPath(): string {
  return isDemoPortalEnabled() ? DEMO_ENTRY_PATH : '/dashboard';
}

/** Legacy shared-password cookie (pre–per-customer accounts). */
export async function createLegacyDemoSessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`complai-demo:${password}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function isLegacyDemoSession(
  cookieValue: string | undefined,
  password: string
): Promise<boolean> {
  if (!cookieValue || !password) return false;
  const expected = await createLegacyDemoSessionToken(password);
  return cookieValue === expected;
}

const APP_ROUTE_PREFIXES = [
  '/dashboard',
  '/controls',
  '/frameworks',
  '/policies',
  '/risk-register',
  '/vendors',
  '/intelligence',
  '/integrations',
  '/settings',
  '/audits',
  '/assurance',
  '/security-learning',
  '/program',
  '/cycles',
] as const;

const ADMIN_ONLY_PAGE_PREFIXES = ['/settings'] as const;

const CUSTOMER_READ_ONLY_API_PREFIXES = ['/api/frameworks', '/api/elastic/sync'] as const;

export function isProtectedAppPath(pathname: string): boolean {
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/contact')) return false;
    if (pathname.startsWith('/api/demo/')) return false;
    if (pathname.startsWith('/api/training/')) return false;
    if (pathname.startsWith('/api/agents/')) return false;
    if (pathname === '/api/health') return false;
    return true;
  }

  return APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAdminOnlyPagePath(pathname: string): boolean {
  return ADMIN_ONLY_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAdminOnlyApiPath(pathname: string): boolean {
  if (pathname === '/api/settings' || pathname.startsWith('/api/settings/')) return true;
  if (pathname === '/api/export' || pathname.startsWith('/api/export/')) return true;
  if (pathname === '/api/members' || pathname.startsWith('/api/members/')) return true;
  return false;
}

export function isCustomerReadOnlyApiWrite(pathname: string, method: string): boolean {
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false;
  return CUSTOMER_READ_ONLY_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isCustomerRole(session: DemoSession | null): boolean {
  return session?.role === 'customer';
}

export function demoSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: demoSessionMaxAgeSeconds(),
  };
}
