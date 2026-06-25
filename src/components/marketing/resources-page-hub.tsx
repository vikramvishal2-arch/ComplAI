import Link from 'next/link';
import { BookOpen, HelpCircle } from 'lucide-react';
import { ComplAIStyled, ComplAIText } from '@/components/marketing/complai-brand-link';
import { FRAMEWORK_GUIDES } from '@/lib/data/marketing-resources';

export function ResourcesPageHub() {
  return (
    <section className="border-b border-white/10 bg-marketing-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr_minmax(0,200px)] lg:gap-10">
          <Link
            href="#faqs"
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-scrut-teal/30 hover:bg-white/[0.07] sm:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-scrut-gradient/20">
              <HelpCircle className="h-6 w-6 text-scrut-teal" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-base font-bold text-white group-hover:text-scrut-teal">
              FAQs
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              <ComplAIText linked={false}>
                Common questions about GRC, frameworks, and ComplAI.
              </ComplAIText>
            </p>
          </Link>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
              Framework hubs
            </p>
            <div className="grid gap-1 sm:grid-cols-2">
              {FRAMEWORK_GUIDES.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/resources/${guide.slug}`}
                  className="group flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.06] sm:px-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 group-hover:border-scrut-teal/30 group-hover:text-scrut-teal">
                    <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                      {guide.shortName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/50">{guide.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="#frameworks"
              className="mt-4 inline-flex text-sm font-semibold text-scrut-teal hover:underline"
            >
              View all framework guides →
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/platform"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:border-scrut-teal/30 hover:bg-white/[0.07]"
            >
              Explore platform
            </Link>
            <Link
              href="/why-complai"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:border-scrut-teal/30 hover:bg-white/[0.07]"
            >
              Why <ComplAIStyled className="font-semibold" />
            </Link>
            <Link
              href="/company?contact=1"
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:border-scrut-teal/30 hover:bg-white/[0.07]"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
