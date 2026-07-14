export const ASSURANCE_NAV_ITEMS = [
  { href: '/assurance', label: 'Overview', exact: true },
  { href: '/assurance/vulnerabilities', label: 'Open vulns' },
  { href: '/assurance/sast', label: 'SAST' },
  { href: '/assurance/dast', label: 'DAST' },
  { href: '/assurance/infrastructure', label: 'Infra' },
  { href: '/assurance/cloud', label: 'Cloud' },
  { href: '/assurance/integrations', label: 'VA integrations' },
  { href: '/assurance/jira', label: 'Jira tickets' },
] as const;

export function isAssuranceNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
