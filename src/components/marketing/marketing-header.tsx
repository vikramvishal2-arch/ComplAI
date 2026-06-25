import { PropelReadyLogo } from '@/components/brand/propel-ready-logo';
import { MarketingHeaderNav } from '@/components/marketing/marketing-header-nav';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { cn } from '@/lib/utils';

export function MarketingHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn('sticky top-0 z-50 border-b border-white/10 bg-marketing-header backdrop-blur-md', className)}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <PropelReadyLogo variant="compact" href="/" />

        <MarketingHeaderNav />

        <ScrutPrimaryButton href="/company?contact=1" className="px-4 py-2 text-sm sm:px-5">
          Book a demo
        </ScrutPrimaryButton>
      </div>
    </header>
  );
}
