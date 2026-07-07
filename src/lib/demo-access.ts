export const DEMO_SESSION_COOKIE = 'complai_demo_session';

const DEMO_SESSION_PREFIX = 'complai-demo:';

/** True when a shared password is required before using the product app or APIs. */
export function isDemoGateEnabled(): boolean {
  return Boolean(process.env.DEMO_ACCESS_PASSWORD?.trim());
}

export function isPublicDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isDemoGateEnabled();
}

/** Customer-facing entry point for the live product demo (middleware redirects when gate is off). */
export const DEMO_ENTRY_PATH = '/demo/access';

/** Use on marketing CTAs when you want to skip the access page when no password is configured. */
export function getDemoEntryPath(): string {
  return isDemoGateEnabled() ? DEMO_ENTRY_PATH : '/dashboard';
}

export async function createDemoSessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${DEMO_SESSION_PREFIX}${password}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function isValidDemoSession(cookieValue: string | undefined): Promise<boolean> {
  const password = process.env.DEMO_ACCESS_PASSWORD?.trim();
  if (!password || !cookieValue) return false;
  const expected = await createDemoSessionToken(password);
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
