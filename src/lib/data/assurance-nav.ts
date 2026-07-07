export const ASSURANCE_NAV_ITEMS = [
  { href: '/assurance', label: 'Overview', exact: true },
  { href: '/assurance/integrations', label: 'VA integrations' },
  { href: '/assurance/infrastructure', label: 'Infrastructure VM' },
  { href: '/assurance/dast', label: 'Application DAST' },
  { href: '/assurance/jira', label: 'Jira tickets' },
] as const;

export function isAssuranceNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
