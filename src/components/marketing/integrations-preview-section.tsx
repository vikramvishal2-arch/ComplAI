import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INTEGRATION_HELP_BASE_URL } from '@/lib/brand';
import { ComplAIBrandLink } from '@/components/marketing/complai-brand-link';
import {
  INTEGRATION_DOMAINS,
  INTEGRATION_TOOLS,
} from '@/lib/data/integration-catalog';
import { ScrutOutlineButton, ScrutPrimaryButton } from '@/components/marketing/marketing-ui';

const featuredIds = [
  'okta',
  'microsoft-entra',
  'workday',
  'splunk-es',
  'crowdstrike-logscale',
  'google-chronicle',
  'cyberark',
  'microsoft-sentinel',
  'auth0',
  'darwinbox',
  'keka',
  'ping-identity',
];

const featuredTools = INTEGRATION_TOOLS.filter((t) => featuredIds.includes(t.id));

export function IntegrationsPreviewSection() {
  return (
    <section id="integrations" className="border-t border-white/10 bg-marketing-surface-alt py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            <ComplAIBrandLink inheritWeight /> works with everything in your tech stack{' '}
            <span className="text-zinc-500">(except those paper trails).</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Connect the <ComplAIBrandLink inheritWeight /> Platform to your tools. Automate control
            monitoring and evidence collection from the word &lsquo;go.&rsquo;
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {INTEGRATION_DOMAINS.map((domain) => (
            <span
              key={domain.id}
              className="rounded-full bg-scrut-navy-light px-4 py-1.5 text-sm font-medium text-zinc-100 ring-1 ring-white/10"
            >
              {domain.label}
            </span>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {featuredTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.helpGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl border border-white/10 bg-scrut-navy-light/80 px-3 py-4 text-center text-xs font-semibold text-zinc-100 transition-all hover:border-scrut-teal/40 hover:shadow-sm sm:text-sm"
            >
              {tool.name}
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Plus {INTEGRATION_TOOLS.length - featuredTools.length} more in the catalog
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ScrutPrimaryButton href={INTEGRATION_HELP_BASE_URL}>
            Explore all integrations
            <ArrowRight className="h-4 w-4" />
          </ScrutPrimaryButton>
          <ScrutOutlineButton href={INTEGRATION_HELP_BASE_URL}>Setup guides</ScrutOutlineButton>
        </div>
      </div>
    </section>
  );
}
