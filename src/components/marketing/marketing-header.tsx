import Link from 'next/link';
import { COMPLAI_ICON } from '@/lib/brand';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Platform', href: '/platform' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Resources', href: '/resources' },
  { label: 'Why ComplAI', href: '/why-complai' },
  { label: 'Company', href: '/company' },
];

export function MarketingHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn('sticky top-0 z-50 border-b border-white/10 bg-scrut-navy', className)}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={COMPLAI_ICON} alt="" aria-hidden className="h-9 w-9 shrink-0" />
          <span className="truncate text-lg font-bold tracking-tight text-white">
            Compl<span className="text-scrut-teal">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ScrutPrimaryButton href="/company?contact=1" className="px-4 py-2 text-sm sm:px-5">
          Book a demo
        </ScrutPrimaryButton>
      </div>
    </header>
  );
}
