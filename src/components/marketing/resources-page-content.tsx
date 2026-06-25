import Link from 'next/link';
import { ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { FaqAccordion } from '@/components/marketing/faq-accordion';
import { ResourcesPageHub } from '@/components/marketing/resources-page-hub';
import {
  FRAMEWORK_GUIDES,
  MARKETING_FAQS,
} from '@/lib/data/marketing-resources';
import { ORGANIZATION_NAME } from '@/lib/brand';
import { ComplAIBrandLink } from '@/components/marketing/complai-brand-link';

export function ResourcesPageContent() {
  return (
    <>
      <section className="bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">Resources</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            GRC knowledge base
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            FAQs, compliance framework guides, and practical information from {ORGANIZATION_NAME} to
            help you understand SOC 2, ISO 27001, GDPR, and more.
          </p>
        </div>
      </section>

      <ResourcesPageHub />

      <section id="faqs" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-scrut-gradient">
              <HelpCircle className="h-5 w-5 text-zinc-100" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">FAQs</h2>
              <p className="text-sm text-zinc-400">
                Common questions about GRC and <ComplAIBrandLink inheritWeight />
              </p>
            </div>
          </div>
          <div className="mt-8 max-w-3xl">
            <FaqAccordion items={MARKETING_FAQS} />
          </div>
        </div>
      </section>

      <section id="frameworks" className="scroll-mt-24 border-t border-white/10 bg-marketing-surface-alt py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-scrut-gradient">
              <BookOpen className="h-5 w-5 text-zinc-100" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
                Compliance framework guides
              </h2>
              <p className="text-sm text-zinc-400">
                Overview, scope, timelines, and how <ComplAIBrandLink inheritWeight /> supports
                each framework
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FRAMEWORK_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/resources/${guide.slug}`}
                className="group flex flex-col rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-6 shadow-sm transition-all hover:border-scrut-teal/30 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-scrut-teal">
                  {guide.shortName} Hub
                </p>
                <h3 className="mt-2 text-lg font-bold text-zinc-100 group-hover:text-scrut-blue">
                  {guide.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                  {guide.tagline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-100">
                  Read guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-zinc-400">
            Want help choosing a framework?{' '}
            <Link href="/company?contact=1" className="font-semibold text-zinc-100 hover:underline">
              Contact our team
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
