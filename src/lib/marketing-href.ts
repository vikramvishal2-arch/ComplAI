/** Build hrefs with optional trailing slash before hash (static hosting + dev). */
export function marketingHref(href: string) {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('http') || trimmed.startsWith('mailto:')) {
    return trimmed;
  }

  const hashIndex = trimmed.indexOf('#');
  const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : '';
  const path = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;

  if (!path || path === '/') {
    return `/${hash}`;
  }

  const normalizedPath = path.endsWith('/') ? path : `${path}/`;
  return `${normalizedPath}${hash}`;
}
