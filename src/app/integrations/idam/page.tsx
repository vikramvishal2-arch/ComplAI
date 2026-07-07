import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { IdamAgentIntegrationsPanel } from '@/components/integrations/idam-agent-integrations-panel';
import { ArrowLeft, Server } from 'lucide-react';

export default function IdamIntegrationsPage() {
  return (
    <AppShell
      title="IDAM & Endpoint Agent"
      subtitle="Discover customer identity integrations and prepare the ComplAI agent for user machines"
    >
      <div className="mb-6">
        <Link
          href="/integrations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All integrations
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-100 p-2 text-violet-700">
            <Server className="h-5 w-5" />
          </div>
          <div className="text-sm text-slate-600">
            <p>
              ComplAI reads the customer&apos;s IDAM footprint from access-control remediations and
              org connector settings, then packages an endpoint agent installer with enrollment
              credentials and sync configuration.
            </p>
            <p className="mt-2">
              Hybrid and on-prem IDAM tools (CyberArk, Ping, AWS IAM) require the agent on a
              machine inside the customer network.
            </p>
          </div>
        </div>
      </div>

      <IdamAgentIntegrationsPanel />
    </AppShell>
  );
}
