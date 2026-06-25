import Link from 'next/link';
import {
  Building2,
  ClipboardCheck,
  Crown,
  FileText,
  Library,
  ListChecks,
  Plug,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { PlatformCapabilitiesTabs } from '@/components/marketing/platform-capabilities-tabs';
import { PlatformPillarsSection } from '@/components/marketing/platform-pillars-section';
import { IntegrationsPreviewSection } from '@/components/marketing/integrations-preview-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { PlatformPageHub } from '@/components/marketing/platform-page-hub';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { ComplAIBrandLink, ComplAIStyled } from '@/components/marketing/complai-brand-link';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { getIntegrationCatalogStats } from '@/lib/data/integration-catalog';
import { PLATFORM_CAPABILITIES } from '@/lib/data/marketing-platform';
import { POLICY_TEMPLATE_CATALOG } from '@/lib/data/policy-template-catalog';

const iconById: Record<string, LucideIcon> = {
  dashboard: Crown,
  policies: FileText,
  approvals: ClipboardCheck,
  frameworks: Library,
  controls: ListChecks,
  integrations: Plug,
  intelligence: Sparkles,
  risk: ShieldAlert,
  vendors: Building2,
};

export function PlatformPageContent() {
  const integrationStats = getIntegrationCatalogStats();

  return (
    <>
      <section className="bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">
            Platform
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Automate compliance. Customize your security program. Scale without friction.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Your organization evolves — <ComplAIBrandLink inheritWeight /> keeps up. Automate risk,
            compliance, and security controls with a platform built for growth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
            <Link
              href="/why-complai"
              className="inline-flex items-center justify-center rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/30"
            >
              Why <ComplAIStyled className="font-semibold" />
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            <li>Map controls to your unique risks</li>
            <li>Manage multiple frameworks</li>
            <li>Stay audit-ready 24/7</li>
          </ul>
        </div>
      </section>

      <PlatformPageHub />

      <section className="border-b border-white/10 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-3">
            <div className="text-center sm:text-left">
              <h3 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                {POLICY_TEMPLATE_CATALOG.length}+
              </h3>
              <p className="mt-2 text-lg text-zinc-400">Auditor-ready ISMS templates</p>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                {FRAMEWORKS.length}+
              </h3>
              <p className="mt-2 text-lg text-zinc-400">Security & privacy frameworks</p>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                {integrationStats.totalTools}+
              </h3>
              <p className="mt-2 text-lg text-zinc-400">Integration tools catalogued</p>
            </div>
          </div>
        </div>
      </section>

      <PlatformCapabilitiesTabs />

      <section id="capabilities" className="border-t border-white/10 bg-marketing-surface-alt py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Every capability in one platform
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              From leadership dashboards to vendor assessments — explore the full{' '}
              <ComplAIBrandLink inheritWeight /> product surface.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_CAPABILITIES.map((cap) => {
              const Icon = iconById[cap.id] ?? Crown;
              return (
                <div
                  key={cap.id}
                  id={cap.id}
                  className="scroll-mt-28 rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-6 transition-all hover:border-scrut-teal/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-scrut-teal/15 text-scrut-teal">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-100">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{cap.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PlatformPillarsSection />
      <IntegrationsPreviewSection />
      <CtaSection />
    </>
  );
}
