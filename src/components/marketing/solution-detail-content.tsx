import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ComplAIBrandLink, ComplAIText } from '@/components/marketing/complai-brand-link';
import { MarketingPageLink } from '@/components/marketing/marketing-page-link';
import { ScrutOutlineButton, ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import type { SolutionGuide } from '@/lib/data/marketing-solutions';

export function SolutionDetailContent({ solution }: { solution: SolutionGuide }) {
  return (
    <article className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/solutions"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-scrut-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          All solutions
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-scrut-teal">Solution</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          {solution.title}
        </h1>
        <p className="mt-3 text-lg text-zinc-400">{solution.tagline}</p>

        <div className="mt-10 max-w-none space-y-10">
          <Section title="Overview">{solution.overview}</Section>
          <Section title="Who it's for">{solution.whoItsFor}</Section>

          <div>
            <h2 className="text-xl font-bold text-zinc-100">Key capabilities</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              {solution.keyCapabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-100">
              How <ComplAIBrandLink inheritWeight className="text-xl" /> helps
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              {solution.howComplAIHelps.map((item) => (
                <li key={item}>
                  <ComplAIText>{item}</ComplAIText>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-10">
          <ScrutPrimaryButton href="/company?contact=1">
            Talk to us about {solution.title.toLowerCase()}
            <ArrowRight className="h-4 w-4" />
          </ScrutPrimaryButton>
          <MarketingPageLink
            href={solution.platformHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-scrut-teal/40 hover:bg-white/5"
          >
            {solution.platformLabel}
          </MarketingPageLink>
          <ScrutOutlineButton href="/platform">View full platform</ScrutOutlineButton>
        </div>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
      <p className="mt-3 leading-relaxed text-zinc-400">{children}</p>
    </div>
  );
}
