import Link from 'next/link';
import { Compass } from 'lucide-react';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';

export function ComplianceCompassSection() {
  return (
    <section className="bg-scrut-navy-light py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-scrut-navy-light/70 shadow-sm lg:flex lg:items-stretch">
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-10 lg:p-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-scrut-teal">
              <Compass className="h-3.5 w-3.5" />
              Compliance compass
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Unsure which framework applies to you?
            </h2>
            <p className="mt-3 max-w-lg text-zinc-400 leading-relaxed">
              Use our compliance compass to know which compliance frameworks align with your business
              priorities — {FRAMEWORKS.length} prebuilt frameworks ready to go.
            </p>
            <div className="mt-6">
              <ScrutPrimaryButton href="/resources#frameworks">Begin your free assessment</ScrutPrimaryButton>
            </div>
          </div>
          <div className="hidden w-72 shrink-0 bg-scrut-gradient lg:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}
