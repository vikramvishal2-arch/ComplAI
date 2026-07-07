'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
import { JiraTicketLink } from '@/components/assurance/jira-ticket-link';
import {
  INFRASTRUCTURE_VULNERABILITIES,
  VULNERABILITY_SEVERITY_STYLES,
} from '@/lib/data/assurance-demo';
import { cn } from '@/lib/utils';
import { Plug } from 'lucide-react';

type StatusFilter = 'all' | 'open' | 'in_progress' | 'remediated';

export default function InfrastructureVmPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');

  const findings = useMemo(() => {
    if (filter === 'all') return INFRASTRUCTURE_VULNERABILITIES;
    return INFRASTRUCTURE_VULNERABILITIES.filter((v) => v.status === filter);
  }, [filter]);

  return (
    <AppShell
      title="Infrastructure vulnerability management"
      subtitle="Server, network, container, and cloud findings from continuous VM scanning"
    >
      <AssuranceSubNav />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
        <p className="text-slate-600">
          Import findings via API from <strong>Nessus</strong>, <strong>Qualys VMDR</strong>, or{' '}
          <strong>Nmap</strong>.
        </p>
        <Link
          href="/assurance/integrations"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
        >
          <Plug className="h-4 w-4" />
          Connect VA tools
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { id: 'all', label: 'All findings' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In progress' },
            { id: 'remediated', label: 'Remediated' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filter === tab.id
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">CVE / ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Finding</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Asset</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Env</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">CVSS</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Scanner</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Jira</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {findings.map((finding) => (
              <tr key={finding.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{finding.cve}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{finding.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Last seen {finding.lastSeen}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700">{finding.asset}</p>
                  <p className="text-xs capitalize text-slate-500">{finding.assetType}</p>
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">{finding.environment}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                      VULNERABILITY_SEVERITY_STYLES[finding.severity]
                    )}
                  >
                    {finding.severity}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-700">{finding.cvss.toFixed(1)}</td>
                <td className="px-4 py-3 text-slate-600">{finding.scanner}</td>
                <td className="px-4 py-3 capitalize text-slate-600">
                  {finding.status.replace('_', ' ')}
                </td>
                <td className="px-4 py-3">
                  {finding.jiraTicketId ? (
                    <JiraTicketLink ticketKey={finding.jiraTicketId} variant="chip" />
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      No ticket
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
