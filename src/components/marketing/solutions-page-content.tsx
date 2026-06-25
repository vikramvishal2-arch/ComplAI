import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SolutionsPageHub } from '@/components/marketing/solutions-page-hub';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { MARKETING_SOLUTIONS } from '@/lib/data/marketing-resources';
import { ComplAIBrandLink } from '@/components/marketing/complai-brand-link';

export function SolutionsPageContent() {
  return (
    <>
      <section className="bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">Solutions</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Built to power every GRC workflow
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            <ComplAIBrandLink inheritWeight /> helps you simplify compliance, streamline audits,
            manage risk, and connect your security stack — from first framework to enterprise-scale
            programs.
          </p>
        </div>
      </section>

      <SolutionsPageHub />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {MARKETING_SOLUTIONS.map((solution) => (
              <Link
                key={solution.id}
                id={solution.id}
                href={`#${solution.id}`}
                className="group flex flex-col scroll-mt-24 rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-6 shadow-sm transition-all hover:border-scrut-teal/30 hover:shadow-md sm:p-8"
              >
                <h2 className="text-xl font-bold text-zinc-100 group-hover:text-scrut-blue">
                  {solution.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                  {solution.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-zinc-100">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ScrutPrimaryButton href="/company?contact=1">Talk to our team</ScrutPrimaryButton>
          </div>
        </div>
      </section>
    </>
  );
}
