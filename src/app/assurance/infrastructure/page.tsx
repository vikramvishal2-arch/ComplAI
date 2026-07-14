'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
import { OpenVulnerabilitiesPanel } from '@/components/assurance/open-vulnerabilities-panel';
import { Plug } from 'lucide-react';

export default function InfrastructureVmPage() {
  return (
    <AppShell
      title="Infrastructure vulnerability management"
      subtitle="Server, network, and host findings — open vulnerabilities tracked in Jira"
    >
      <AssuranceSubNav />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <p className="text-slate-600">
          Label Jira issues with <strong>infra</strong> or <strong>vm</strong> (or set{' '}
          <code className="text-xs">JIRA_JQL_INFRA</code>). Import findings via API from{' '}
          <strong>Nessus</strong>, <strong>Qualys VMDR</strong>, or <strong>Nmap</strong>.
        </p>
        <Link
          href="/assurance/integrations"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
        >
          <Plug className="h-4 w-4" />
          Connect VA tools
        </Link>
      </div>

      <OpenVulnerabilitiesPanel fixedSource="infra" />
    </AppShell>
  );
}
