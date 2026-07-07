export const MARKETING_NAV_ITEMS = [
  { label: 'Platform', href: '/platform' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Resources', href: '/resources' },
  { label: 'Why ComplAI', href: '/why-complai', styledLabel: true as const },
  { label: 'Company', href: '/company' },
] as const;

/** Strip query/hash and trailing slashes so /platform/ matches /platform. */
export function normalizeMarketingPath(path: string) {
  const base = path.split('?')[0]?.split('#')[0] ?? '/';
  if (base === '/' || base === '') return '/';
  return base.replace(/\/+$/, '');
}

export function isMarketingNavActive(pathname: string, href: string) {
  const path = normalizeMarketingPath(pathname);
  const target = normalizeMarketingPath(href);

  if (path === '/') return false;

  if (target === '/resources') {
    return path === '/resources' || path.startsWith('/resources/');
  }
  if (target === '/solutions') {
    return path === '/solutions' || path.startsWith('/solutions/');
  }

  return path === target || path.startsWith(`${target}/`);
}
