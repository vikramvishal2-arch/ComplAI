import Link from 'next/link';
import { ORGANIZATION_NAME } from '@/lib/brand';

export function LandingCtaSection() {
  return (
    <section className="bg-marketing-surface-alt py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center sm:px-12 sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Strengthen Your Security Program?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            {ORGANIZATION_NAME} combines cybersecurity expertise with GRC technology to help you
            secure your business, simplify compliance, and build resilience—at every stage of your
            growth.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/company?contact=1"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition-opacity hover:bg-emerald-400"
            >
              Contact us
            </Link>
            <Link
              href="/company"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-zinc-100 transition-colors hover:border-emerald-500/40"
            >
              About {ORGANIZATION_NAME}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
