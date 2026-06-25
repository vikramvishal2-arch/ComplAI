import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COMPLAI_ICON, ORGANIZATION_NAME } from '@/lib/brand';
import { ComplAIBrandLink, ComplAIStyled } from '@/components/marketing/complai-brand-link';

/** Short ComplAI intro on landing — full product story lives on /platform. */
export function LandingComplaiTeaser() {
  return (
    <section
      id="complai"
      className="scroll-mt-28 border-b border-white/10 bg-marketing-surface-alt py-16 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-scrut-gradient/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={COMPLAI_ICON} alt="" aria-hidden className="h-9 w-9" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-scrut-teal">
          Our GRC platform
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Introducing <ComplAIBrandLink inheritWeight className="text-3xl sm:text-4xl" />
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
          <ComplAIBrandLink inheritWeight /> is the AI-powered compliance and risk platform from{' '}
          {ORGANIZATION_NAME}. It turns the organization-wide view above into a live workspace —
          policies, controls, evidence, risk, vendors, and leadership dashboards in one place.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500">
          For capabilities, integrations, and product depth, visit the dedicated platform page — built
          for teams running SOC 2, ISO 27001, and multi-framework GRC programs.
        </p>

        <Link
          href="/platform"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-3.5 text-sm font-semibold text-zinc-100 shadow-sm ring-1 ring-white/15 transition-colors hover:bg-white/15"
        >
          Explore the <ComplAIStyled className="text-sm font-semibold text-zinc-100" /> platform
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
