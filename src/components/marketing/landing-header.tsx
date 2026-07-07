import { PropelReadyLogo } from '@/components/brand/propel-ready-logo';
import { MarketingHeaderNav } from '@/components/marketing/marketing-header-nav';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { cn } from '@/lib/utils';

/** Header used only on `/` — Propel Ready branding. */
export function LandingHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-emerald-500/10 bg-marketing-header backdrop-blur-md',
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-[4.25rem] sm:gap-4 sm:px-6 lg:px-8">
        <PropelReadyLogo variant="compact" href="/" className="min-w-0 shrink" />

        <div className="flex items-center gap-2 sm:gap-3">
          <MarketingHeaderNav />
          <ScrutPrimaryButton
            href="/company?contact=1"
            className="hidden min-h-[44px] px-4 py-2 text-sm lg:inline-flex lg:px-5"
          >
            Book a demo
          </ScrutPrimaryButton>
        </div>
      </div>
    </header>
  );
}
