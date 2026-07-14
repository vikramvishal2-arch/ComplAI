'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
import { OpenVulnerabilitiesPanel } from '@/components/assurance/open-vulnerabilities-panel';
import { Plug } from 'lucide-react';

export default function OpenVulnerabilitiesPage() {
  return (
    <AppShell
      title="Open vulnerabilities"
      subtitle="Unified view of open issues across SAST, DAST, Infra, and Cloud — backed by Jira when configured"
    >
      <AssuranceSubNav />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <p className="text-slate-600">
          Filter by source type. Live data uses Jira labels (<code className="text-xs">sast</code>,{' '}
          <code className="text-xs">dast</code>, <code className="text-xs">infra</code>,{' '}
          <code className="text-xs">cloud</code>) or per-source JQL overrides.
        </p>
        <Link
          href="/assurance/integrations"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
        >
          <Plug className="h-4 w-4" />
          VA tools
        </Link>
      </div>

      <OpenVulnerabilitiesPanel showSourceFilter />
    </AppShell>
  );
}
