'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComplAIStyled } from '@/components/marketing/complai-brand-link';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Platform', href: '/platform' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Resources', href: '/resources' },
  { label: 'Why ComplAI', href: '/why-complai', styledLabel: true },
  { label: 'Company', href: '/company' },
] as const;

function isNavActive(pathname: string, href: string) {
  if (pathname === '/') return false;
  if (href === '/resources') {
    return pathname === '/resources' || pathname.startsWith('/resources/');
  }
  return pathname === href;
}

export function MarketingHeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {navItems.map((item) => {
        const active = isNavActive(pathname, item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-scrut-teal/15 text-scrut-teal ring-1 ring-scrut-teal/35'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            )}
          >
            {'styledLabel' in item && item.styledLabel ? (
              <>
                Why <ComplAIStyled className="font-medium" />
              </>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </nav>
  );
}
