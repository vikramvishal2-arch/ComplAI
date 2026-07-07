'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { normalizeMarketingPath } from '@/lib/marketing-nav-config';

/** Reliable pathname for static export + GoDaddy (trailing slashes, soft/full navigations). */
export function useMarketingPathname() {
  const routerPath = usePathname();
  const [pathname, setPathname] = useState('/');

  useEffect(() => {
    const sync = () => setPathname(normalizeMarketingPath(window.location.pathname));

    sync();
    window.addEventListener('popstate', sync);

    const onDocumentClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      window.setTimeout(sync, 0);
      window.setTimeout(sync, 150);
    };

    document.addEventListener('click', onDocumentClick, true);

    return () => {
      window.removeEventListener('popstate', sync);
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, []);

  useEffect(() => {
    if (routerPath) {
      setPathname(normalizeMarketingPath(routerPath));
    }
  }, [routerPath]);

  return pathname;
}
