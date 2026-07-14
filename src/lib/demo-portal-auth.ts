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
  '/evidence',
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

/** Mutating / privileged API paths that demo customers must not call. */
export function isAdminOnlyApiWritePath(pathname: string): boolean {
  if (pathname === '/api/assurance/jira/sync' || pathname.startsWith('/api/assurance/jira/sync/')) {
    return true;
  }
  if (pathname === '/api/assurance/integrations' || pathname.startsWith('/api/assurance/integrations/')) {
    return true;
  }
  if (pathname === '/api/vendors/refresh-intelligence') return true;
  if (/^\/api\/vendors\/[^/]+\/refresh-intelligence\/?$/.test(pathname)) return true;
  if (/^\/api\/vendors\/[^/]+\/breach-check\/?$/.test(pathname)) return true;
  if (pathname === '/api/vendors/intel' || pathname.startsWith('/api/vendors/intel/')) return true;
  if (pathname === '/api/vendors/demo-portfolio' || pathname.startsWith('/api/vendors/demo-portfolio/')) {
    return true;
  }
  if (pathname === '/api/cycles/reminders' || pathname.startsWith('/api/cycles/reminders/')) {
    return true;
  }
  if (pathname === '/api/monitoring/run' || pathname.startsWith('/api/monitoring/run/')) {
    return true;
  }
  if (pathname === '/api/integrations/idam' || pathname.startsWith('/api/integrations/idam/')) {
    return true;
  }
  return false;
}

/**
 * True when a customer session must be denied for this API request.
 * Always-admin paths (settings/export/members) apply to all methods;
 * write-sensitive intel/assurance/mail paths apply to non-GET methods
 * (and to all methods for reminders / intel search).
 */
export function isAdminOnlyApiRequest(pathname: string, method: string): boolean {
  if (isAdminOnlyApiPath(pathname)) return true;

  const upper = method.toUpperCase();
  const isRead = upper === 'GET' || upper === 'HEAD' || upper === 'OPTIONS';

  // Reminder + intel search + assurance integrations: always admin.
  if (pathname === '/api/cycles/reminders' || pathname.startsWith('/api/cycles/reminders/')) {
    return true;
  }
  if (pathname === '/api/vendors/intel' || pathname.startsWith('/api/vendors/intel/')) {
    return true;
  }
  if (pathname === '/api/assurance/integrations' || pathname.startsWith('/api/assurance/integrations/')) {
    return true;
  }
  if (pathname === '/api/assurance/jira/sync' || pathname.startsWith('/api/assurance/jira/sync/')) {
    return true;
  }
  if (pathname === '/api/monitoring/run' || pathname.startsWith('/api/monitoring/run/')) {
    return true;
  }
  if (pathname === '/api/vendors/demo-portfolio' || pathname.startsWith('/api/vendors/demo-portfolio/')) {
    return !isRead;
  }
  if (pathname === '/api/integrations/idam' || pathname.startsWith('/api/integrations/idam/')) {
    return !isRead;
  }

  if (isRead) return false;
  return isAdminOnlyApiWritePath(pathname);
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
  const appUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || '';
  const secureByUrl = appUrl.startsWith('https://');
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production' || secureByUrl,
    path: '/',
    maxAge: demoSessionMaxAgeSeconds(),
  };
}
