'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
import { VaToolIntegrationsPanel } from '@/components/assurance/va-tool-integrations-panel';
import { Plug } from 'lucide-react';

export default function AssuranceIntegrationsPage() {
  return (
    <AppShell
      title="VA tool integrations"
      subtitle="Connect Nessus, Qualys, HCL AppScan, and Nmap via API to import findings into Assurance"
    >
      <AssuranceSubNav />

      <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div className="flex items-start gap-3">
          <Plug className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div className="text-sm text-brand-900">
            <p className="font-semibold">API-based vulnerability ingestion</p>
            <p className="mt-1 text-brand-800">
              Each tool exposes a REST API. Enter credentials below, test the connection, then
              connect to start syncing. Open findings automatically create Jira tickets on your
              configured service management project.
            </p>
          </div>
        </div>
      </div>

      <VaToolIntegrationsPanel />
    </AppShell>
  );
}
