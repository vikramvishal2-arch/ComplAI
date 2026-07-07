'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ASSURANCE_NAV_ITEMS, isAssuranceNavActive } from '@/lib/data/assurance-nav';

export function AssuranceSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4"
      aria-label="Assurance sections"
    >
      {ASSURANCE_NAV_ITEMS.map((item) => {
        const active = isAssuranceNavActive(pathname, item.href, 'exact' in item && item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
