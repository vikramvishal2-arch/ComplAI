import Link from 'next/link';

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

      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        <PropelReadyLogo variant="compact" />



        <MarketingHeaderNav />



        <ScrutPrimaryButton

          href="/company?contact=1"

          className="hidden px-4 py-2 text-sm sm:inline-flex sm:px-5"

        >

          Book a demo

        </ScrutPrimaryButton>

        <Link

          href="/company?contact=1"

          className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black sm:hidden"

        >

          Contact

        </Link>

      </div>

    </header>

  );

}

