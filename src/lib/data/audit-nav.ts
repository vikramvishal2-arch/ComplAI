export const AUDIT_NAV_ITEMS = [
  { href: '/audits', label: 'Overview', exact: true },
  { href: '/audits/internal', label: 'Internal audit' },
  { href: '/audits/risk-assessment', label: 'Risk assessment' },
  { href: '/audits/findings', label: 'Findings' },
  { href: '/audits/external-readiness', label: 'External preparedness' },
] as const;

export function isAuditNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
