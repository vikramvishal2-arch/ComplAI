import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';
import { CtaSection } from '@/components/marketing/cta-section';
import { MarketingPageHub } from '@/components/marketing/marketing-page-hub';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';
import {
  WHY_COMPLAI_DIFFERENTIATORS,
  WHY_COMPLAI_HERO,
  WHY_COMPLAI_OUTCOMES,
  WHY_COMPLAI_STAGES,
  WHY_COMPLAI_VS_MANUAL,
} from '@/lib/data/marketing-platform';
import { WHY_COMPLAI_PAGE_HUB } from '@/lib/data/marketing-page-hubs';

export function WhyComplaiPageContent() {
  return (
    <>
      <section className="bg-scrut-navy bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">
            {WHY_COMPLAI_HERO.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {WHY_COMPLAI_HERO.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">{WHY_COMPLAI_HERO.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
            <Link
              href="/platform"
              className="inline-flex items-center justify-center rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/30"
            >
              Explore the platform
            </Link>
          </div>
        </div>
      </section>

      <MarketingPageHub groups={WHY_COMPLAI_PAGE_HUB} />

      <section id="outcomes" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-3">
            {WHY_COMPLAI_OUTCOMES.map((outcome) => (
              <div key={outcome.label} className="text-center sm:text-left">
                <h3 className="text-4xl font-bold tracking-tight text-scrut-navy sm:text-5xl">
                  {outcome.stat}
                </h3>
                <p className="mt-2 text-lg font-semibold text-scrut-navy">{outcome.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{outcome.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="differentiators" className="scroll-mt-24 border-y border-slate-200 bg-[#f4f7fb] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
              What makes {PRODUCT_NAME} different
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {ORGANIZATION_NAME} built {PRODUCT_NAME} for teams who need more than a checklist —
              they need a program that scales.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {WHY_COMPLAI_DIFFERENTIATORS.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
              >
                <h3 className="text-lg font-bold text-scrut-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="comparison" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
              Manual GRC vs. {PRODUCT_NAME}
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              See how a unified platform replaces the patchwork of spreadsheets, email, and
              disconnected tools.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_auto_1fr] bg-slate-50 text-sm font-semibold text-scrut-navy">
              <div className="px-4 py-3 sm:px-6">Manual approach</div>
              <div className="px-2 py-3" aria-hidden />
              <div className="px-4 py-3 sm:px-6">With {PRODUCT_NAME}</div>
            </div>
            {WHY_COMPLAI_VS_MANUAL.map((row) => (
              <div
                key={row.manual}
                className="grid grid-cols-[1fr_auto_1fr] border-t border-slate-200 bg-white"
              >
                <div className="flex items-start gap-2 px-4 py-4 text-sm text-slate-600 sm:px-6">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden />
                  {row.manual}
                </div>
                <div className="flex items-center px-2" aria-hidden>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                </div>
                <div className="flex items-start gap-2 px-4 py-4 text-sm text-slate-700 sm:px-6">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-scrut-teal" aria-hidden />
                  {row.complai}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stages" className="scroll-mt-24 border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
              Your goals, your stage. We help you level up.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Whether you need first audit readiness or enterprise-scale GRC, {PRODUCT_NAME} adapts
              to where you are today.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {WHY_COMPLAI_STAGES.map((stage) => (
              <Link
                key={stage.title}
                href={stage.href}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-[#f4f7fb] p-6 transition-all hover:border-scrut-teal/30 hover:shadow-md sm:p-8"
              >
                <h3 className="text-lg font-bold text-scrut-navy group-hover:text-scrut-blue">
                  {stage.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {stage.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-scrut-navy">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
