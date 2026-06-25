import Link from 'next/link';
import {
  Bot,
  ClipboardCheck,
  Layers,
  Shield,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { COMPLAI_ICON, ORGANIZATION_NAME } from '@/lib/brand';
import { ComplAIBrandLink, ComplAIStyled } from '@/components/marketing/complai-brand-link';
import { ScrutPrimaryButton, ScrutOutlineButton } from '@/components/marketing/marketing-ui';

const highlights: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Shield,
    title: 'Unified security & GRC',
    description:
      'Policies, frameworks, controls, risk, vendors, and evidence in one workspace — built for security-first teams.',
  },
  {
    icon: Layers,
    title: 'Risk profile across every dimension',
    description:
      'See people, cloud, data, vendors, compliance, and operations in a single organizational view — not scattered spreadsheets.',
  },
  {
    icon: ClipboardCheck,
    title: 'Continuous audit readiness',
    description:
      'Track approvals, collect evidence automatically, and stay ready for SOC 2, ISO 27001, GDPR, and regional frameworks.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered intelligence',
    description:
      'Gap analysis, questionnaire assistance, and remediation guidance so your team focuses on reducing risk, not chasing documents.',
  },
];

export function ComplaiIntroSection() {
  return (
    <section id="complai" className="scroll-mt-28 border-b border-white/10 bg-marketing-surface-alt py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scrut-teal">
              Introducing <ComplAIBrandLink inheritWeight className="text-xs" />
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              The GRC platform from {ORGANIZATION_NAME}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              <ComplAIBrandLink inheritWeight /> is an AI-powered compliance and risk platform that
              gives your organization a live security posture — across every dimension — so leaders
              can act before audits, incidents, or deals force the issue.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              From first framework to enterprise-scale programs, teams use <ComplAIBrandLink inheritWeight />{' '}
              to map controls to real risks, automate evidence collection, and keep executives informed
              with leadership dashboards.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ScrutPrimaryButton href="/platform">Explore the platform</ScrutPrimaryButton>
              <ScrutOutlineButton href="/company?contact=1">Book a demo</ScrutOutlineButton>
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              Learn more on the{' '}
              <Link href="/platform" className="font-medium text-scrut-teal hover:underline">
                platform page
              </Link>{' '}
              or read{' '}
              <Link href="/why-complai" className="font-medium text-scrut-teal hover:underline">
                why teams choose <ComplAIStyled className="font-medium" />
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={COMPLAI_ICON} alt="" aria-hidden className="h-11 w-11 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-zinc-100">
                  <ComplAIBrandLink inheritWeight /> Platform
                </p>
                <p className="text-xs text-zinc-500">Connect. Secure. Advance.</p>
              </div>
            </div>

            <ul className="mt-6 space-y-5">
              {highlights.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-scrut-teal/15 text-scrut-teal">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-400">
              <Bot className="h-4 w-4 shrink-0 text-scrut-teal" />
              Powered by <ComplAIBrandLink inheritWeight /> Intelligence for gap analysis and audit prep
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
