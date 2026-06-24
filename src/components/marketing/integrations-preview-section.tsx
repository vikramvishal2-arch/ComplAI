import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INTEGRATION_HELP_BASE_URL, PRODUCT_NAME } from '@/lib/brand';
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
    <section id="integrations" className="border-t border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
            {PRODUCT_NAME} works with everything in your tech stack{' '}
            <span className="text-slate-500">(except those paper trails).</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Connect the {PRODUCT_NAME} Platform to your tools. Automate control monitoring and
            evidence collection from the word &lsquo;go.&rsquo;
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {INTEGRATION_DOMAINS.map((domain) => (
            <span
              key={domain.id}
              className="rounded-full bg-[#f4f7fb] px-4 py-1.5 text-sm font-medium text-scrut-navy ring-1 ring-slate-200"
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
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-4 text-center text-xs font-semibold text-scrut-navy transition-all hover:border-scrut-teal/40 hover:shadow-sm sm:text-sm"
            >
              {tool.name}
            </Link>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
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
