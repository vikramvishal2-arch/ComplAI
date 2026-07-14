import Link from 'next/link';
import { ArrowRight, BookOpen, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { ComplAIText } from '@/components/marketing/complai-brand-link';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { CATEGORY_LABELS, type FrameworkCategory } from '@/lib/types';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Help Center — Framework Guides | ${ORGANIZATION_NAME}`,
  description: `Read about each compliance framework supported by ${PRODUCT_NAME} — overview, who it’s for, and how to activate controls.`,
};

export default function FrameworkHelpIndexPage() {
  const byCategory = (Object.keys(CATEGORY_LABELS) as FrameworkCategory[])
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      frameworks: FRAMEWORKS.filter((f) => f.category === category),
    }))
    .filter((g) => g.frameworks.length > 0);

  return (
    <MarketingShell>
      <section className="bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">
            <Shield className="h-4 w-4" />
            Help Center
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Framework guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Learn each security and privacy framework available in{' '}
            <ComplAIText>{PRODUCT_NAME}</ComplAIText> — what it covers, who it applies to, and how
            to activate controls for audit readiness.
          </p>
          <Link
            href="/help"
            className="mt-6 inline-flex text-sm font-medium text-scrut-teal hover:underline"
          >
            ← Back to Help Center home
          </Link>
        </div>
      </section>

      <section className="bg-marketing-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-14 px-4 sm:px-6 lg:px-8">
          {byCategory.map((group) => (
            <div key={group.category} id={group.category}>
              <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-zinc-100">{group.label}</h2>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-400">
                  {group.frameworks.length} guide{group.frameworks.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.frameworks.map((fw) => (
                  <Link
                    key={fw.id}
                    href={`/help/frameworks/${fw.id}`}
                    className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-scrut-teal/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-2 text-scrut-teal">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Guide</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-zinc-100">{fw.shortName}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{fw.name}</p>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-zinc-400">
                      {fw.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-scrut-teal">
                      Read more
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Ready to activate controls?</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Open the Framework Library in {PRODUCT_NAME} to activate frameworks and start
                evidence collection.
              </p>
            </div>
            <ScrutPrimaryButton href="/frameworks">
              Framework Library
              <ArrowRight className="h-4 w-4" />
            </ScrutPrimaryButton>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
