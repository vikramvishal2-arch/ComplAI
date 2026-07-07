import Link from 'next/link';
import { CtaSection } from '@/components/marketing/cta-section';
import {
  DeferredIntegrationsPreviewSection,
  DeferredPlatformCapabilitiesTabs,
  DeferredPlatformPillarsSection,
} from '@/components/marketing/platform-deferred-sections';
import { PlatformPageHub } from '@/components/marketing/platform-page-hub';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { ComplAIBrandLink, ComplAIStyled } from '@/components/marketing/complai-brand-link';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { getIntegrationCatalogStats } from '@/lib/data/integration-catalog';
import { POLICY_TEMPLATE_CATALOG } from '@/lib/data/policy-template-catalog';

export function PlatformPageContent() {
  const integrationStats = getIntegrationCatalogStats();

  return (
    <>
      <section className="bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">
            Platform
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
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

      <DeferredPlatformCapabilitiesTabs />

      <DeferredPlatformPillarsSection />
      <DeferredIntegrationsPreviewSection />
      <CtaSection />
    </>
  );
}
