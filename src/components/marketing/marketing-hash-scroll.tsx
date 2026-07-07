'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const HEADER_OFFSET = 112;

function scrollToHashTarget() {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;

  const id = decodeURIComponent(hash.slice(1));

  const attempt = (retries = 0) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: retries === 0 ? 'smooth' : 'auto' });
      return;
    }
    if (retries < 24) {
      window.setTimeout(() => attempt(retries + 1), 75);
    }
  };

  attempt();
}

export function MarketingHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHashTarget();
    window.addEventListener('hashchange', scrollToHashTarget);
    return () => window.removeEventListener('hashchange', scrollToHashTarget);
  }, [pathname]);

  return null;
}
