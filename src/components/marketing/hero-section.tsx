import Link from 'next/link';
import { PRODUCT_NAME } from '@/lib/brand';
import { HeroDashboardPreview } from '@/components/marketing/hero-dashboard-preview';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-scrut-navy bg-scrut-hero text-white">
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Your risks are unique.{' '}
            <span className="bg-scrut-gradient bg-clip-text text-transparent">
              Make sure your security program is too.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
            Run your AI-powered, security-first GRC program with {PRODUCT_NAME} Intelligence.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
            <Link
              href="/solutions"
              className="inline-flex items-center rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/30"
            >
              Explore solutions
            </Link>
          </div>

          <p className="mt-6">
            <Link
              href="/solutions#intelligence"
              className="text-sm font-medium text-scrut-teal hover:underline"
            >
              Meet {PRODUCT_NAME} Intelligence →
            </Link>
          </p>
        </div>

        <div className="mt-12 lg:mt-14">
          <HeroDashboardPreview />
        </div>
      </div>
    </section>
  );
}
