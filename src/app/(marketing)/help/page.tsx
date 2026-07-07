import Link from 'next/link';
import { ArrowRight, BookOpen, LifeBuoy } from 'lucide-react';
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { ComplAIText } from '@/components/marketing/complai-brand-link';
import { INTEGRATION_DOMAINS, INTEGRATION_TOOLS } from '@/lib/data/integration-catalog';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Help Center — Integration Guides | ${ORGANIZATION_NAME}`,
  description: `Step-by-step setup guides for connecting HRMS, identity, SIEM, VAPT, and SSO tools to ${PRODUCT_NAME} for audit-ready GRC evidence.`,
};

export default function HelpCenterPage() {
  const domains = INTEGRATION_DOMAINS.map((domain) => ({
    ...domain,
    tools: INTEGRATION_TOOLS.filter((tool) => tool.domains.includes(domain.id)),
  })).filter((domain) => domain.tools.length > 0);

  return (
    <MarketingShell>
      <section className="bg-scrut-hero py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-scrut-teal">
            <LifeBuoy className="h-4 w-4" />
            Help Center
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Integration setup guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">
            Complete product reference and step-by-step setup guides for connecting your security
            and HR tools to <ComplAIText>{PRODUCT_NAME}</ComplAIText> — product details, connection
            methods, documentation topics, and GRC evidence mapping for every integration.
          </p>
        </div>
      </section>

      <section className="bg-marketing-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-14 px-4 sm:px-6 lg:px-8">
          {domains.map((domain) => (
            <div key={domain.id} id={domain.id}>
              <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100">{domain.label}</h2>
                  {domain.description && (
                    <p className="mt-1 max-w-2xl text-sm text-zinc-400">{domain.description}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-400">
                  {domain.tools.length} guide{domain.tools.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {domain.tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/help/integrations/${tool.id}`}
                    className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-scrut-teal/40 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-2 text-scrut-teal">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Guide</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-zinc-100">{tool.name}</h3>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-zinc-400">
                      {tool.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-scrut-teal">
                      Read setup guide
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8">
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Can&apos;t find your tool?</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Our team can help you connect any HRMS, identity, SIEM, VAPT, or SSO platform.
              </p>
            </div>
            <ScrutPrimaryButton href="/company?contact=1">
              Contact our team
              <ArrowRight className="h-4 w-4" />
            </ScrutPrimaryButton>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
