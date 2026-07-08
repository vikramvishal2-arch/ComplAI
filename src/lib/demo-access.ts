export {
  DEMO_SESSION_COOKIE,
  DEMO_ENTRY_PATH,
  createDemoSession,
  createLegacyDemoSessionToken,
  createLegacyDemoSessionToken as createDemoSessionToken,
  demoSessionCookieOptions,
  getDemoEntryPath,
  isAdminOnlyApiPath,
  isAdminOnlyPagePath,
  isCustomerReadOnlyApiWrite,
  isCustomerRole,
  isDemoPortalEnabled,
  isDemoPortalEnabled as isDemoGateEnabled,
  isLegacyDemoSession,
  isProtectedAppPath,
  isPublicDemoMode,
  parseDemoSession,
  type DemoPortalRole,
  type DemoSession,
} from '@/lib/demo-portal-auth';

import {
  isDemoPortalEnabled,
  isLegacyDemoSession,
  parseDemoSession,
} from '@/lib/demo-portal-auth';

/** @deprecated Use parseDemoSession */
export async function isValidDemoSession(cookieValue: string | undefined): Promise<boolean> {
  if (await parseDemoSession(cookieValue)) return true;
  const password = process.env.DEMO_ACCESS_PASSWORD?.trim();
  if (!isDemoPortalEnabled() || !password) return false;
  return isLegacyDemoSession(cookieValue, password);
}
