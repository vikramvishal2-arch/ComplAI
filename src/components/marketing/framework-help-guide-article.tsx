import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ListChecks,
  Shield,
  Target,
  Users,
} from 'lucide-react';
import type { Framework } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/types';
import type { FrameworkGuide } from '@/lib/data/framework-guides';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { PRODUCT_NAME } from '@/lib/brand';

type FrameworkHelpGuideArticleProps = {
  framework: Framework;
  guide: FrameworkGuide;
  backHref?: string;
  backLabel?: string;
};

export function FrameworkHelpGuideArticle({
  framework,
  guide,
  backHref = '/help/frameworks',
  backLabel = 'All framework guides',
}: FrameworkHelpGuideArticleProps) {
  return (
    <article className="bg-marketing-surface py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-scrut-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-scrut-teal">
          Help Center · Framework guide
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          {framework.name}
        </h1>
        <p className="mt-2 text-lg text-zinc-400">
          {framework.shortName} · {CATEGORY_LABELS[framework.category]} · {framework.region} · v
          {framework.version}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {guide.relatedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-10">
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <BookOpen className="h-5 w-5 text-scrut-teal" />
              Overview
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-400">{guide.overview}</p>
            <p className="mt-4 text-sm text-zinc-500">
              {framework.controlCount} controls available in {PRODUCT_NAME} for this framework.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <Users className="h-5 w-5 text-scrut-teal" />
              Who it&apos;s for
            </h2>
            <ul className="mt-4 space-y-2">
              {guide.whoItsFor.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-scrut-teal" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <Target className="h-5 w-5 text-scrut-teal" />
              Why it matters
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-400">{guide.whyItMatters}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {guide.keyThemes.map((theme) => (
                <span
                  key={theme}
                  className="rounded-lg border border-scrut-teal/20 bg-scrut-teal/[0.08] px-3 py-1.5 text-xs font-medium text-scrut-teal"
                >
                  {theme}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <Shield className="h-5 w-5 text-scrut-teal" />
              How {PRODUCT_NAME} helps
            </h2>
            <ul className="mt-4 space-y-2">
              {guide.howComplAIHelps.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-scrut-teal" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {guide.sampleControls.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
                <ListChecks className="h-5 w-5 text-scrut-teal" />
                Sample controls
              </h2>
              <ul className="mt-4 divide-y divide-white/5">
                {guide.sampleControls.map((c) => (
                  <li key={c.reference} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-xs font-semibold text-scrut-teal">{c.reference}</p>
                      <p className="text-sm text-zinc-200">{c.title}</p>
                    </div>
                    <span className="text-xs capitalize text-zinc-500">
                      {c.domain.replace(/_/g, ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="text-xl font-bold text-zinc-100">Getting started</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              {guide.gettingStarted.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <ScrutPrimaryButton href="/frameworks">
                Open Framework Library
              </ScrutPrimaryButton>
              <Link
                href="/help"
                className="inline-flex items-center rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-scrut-teal/40 hover:text-scrut-teal"
              >
                Back to Help Center
              </Link>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
