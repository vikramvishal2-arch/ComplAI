'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ComplAIStyled } from '@/components/marketing/complai-brand-link';
import { useMarketingPathname } from '@/hooks/use-marketing-pathname';
import { isMarketingNavActive, MARKETING_NAV_ITEMS } from '@/lib/marketing-nav-config';
import { DEMO_ENTRY_PATH } from '@/lib/demo-access';
import { cn } from '@/lib/utils';

const navLinkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors';

const navLinkActive =
  'bg-scrut-teal/15 text-scrut-teal ring-1 ring-scrut-teal/35 hover:bg-scrut-teal/20 hover:text-scrut-teal';

const navLinkInactive = 'text-white/80 hover:bg-white/10 hover:text-white';

const mobileNavLinkBase =
  'flex min-h-[52px] w-full items-center rounded-xl px-4 py-3.5 text-lg font-semibold leading-snug transition-colors';

function NavLink({
  href,
  label,
  styledLabel,
  active,
  onNavigate,
  variant = 'desktop',
}: {
  href: string;
  label: string;
  styledLabel?: boolean;
  active: boolean;
  onNavigate?: () => void;
  variant?: 'desktop' | 'mobile';
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        variant === 'mobile' ? mobileNavLinkBase : navLinkBase,
        active ? navLinkActive : navLinkInactive
      )}
    >
      {styledLabel ? (
        <>
          Why <ComplAIStyled className={cn('font-semibold', active && 'text-scrut-teal')} />
        </>
      ) : (
        label
      )}
    </Link>
  );
}

export function MarketingHeaderNav() {
  const pathname = useMarketingPathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  const mobileMenu =
    mobileOpen && mounted ? (
      <>
        <button
          type="button"
          aria-label="Close menu overlay"
          className="marketing-mobile-overlay fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
        <div
          id="marketing-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="marketing-mobile-drawer fixed inset-y-0 right-0 z-[210] flex h-[100dvh] w-[min(100vw,20rem)] max-w-full flex-col border-l border-white/10 bg-marketing-surface shadow-2xl lg:hidden"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
            <p className="text-base font-semibold text-white">Menu</p>
            <button
              type="button"
              onClick={closeMobile}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-zinc-300 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="shrink-0 space-y-3 border-b border-white/10 px-5 py-4">
            <Link
              href="/company?contact=1"
              prefetch={false}
              onClick={closeMobile}
              className="inline-flex w-full min-h-[48px] items-center justify-center rounded-full bg-scrut-gradient px-6 py-3.5 text-base font-semibold text-black shadow-sm transition-opacity hover:opacity-90"
            >
              Book a demo
            </Link>
            <Link
              href={DEMO_ENTRY_PATH}
              prefetch={false}
              onClick={closeMobile}
              className="inline-flex w-full min-h-[48px] items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Try live demo
            </Link>
          </div>

          <nav
            className="marketing-mobile-nav-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5"
            aria-label="Main"
          >
            <ul className="flex flex-col gap-2">
              {MARKETING_NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    styledLabel={'styledLabel' in item && item.styledLabel}
                    active={isMarketingNavActive(pathname, item.href)}
                    onNavigate={closeMobile}
                    variant="mobile"
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </>
    ) : null;

  return (
    <>
      <nav className="marketing-desktop-nav hidden items-center gap-1 lg:flex" aria-label="Main">
        {MARKETING_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            href={item.href}
            label={item.label}
            styledLabel={'styledLabel' in item && item.styledLabel}
            active={isMarketingNavActive(pathname, item.href)}
          />
        ))}
      </nav>

      <button
        type="button"
        className="marketing-mobile-menu-button inline-flex h-12 w-12 items-center justify-center rounded-xl text-white/90 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls="marketing-mobile-menu"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
