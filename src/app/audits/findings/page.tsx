'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { AUDIT_FINDINGS, FINDING_SEVERITY_STYLES } from '@/lib/data/audits-demo';
import { cn } from '@/lib/utils';

type SourceFilter = 'all' | 'internal' | 'external';

export default function AuditFindingsPage() {
  const [filter, setFilter] = useState<SourceFilter>('all');

  const findings = useMemo(() => {
    if (filter === 'all') return AUDIT_FINDINGS;
    return AUDIT_FINDINGS.filter((f) => f.source === filter);
  }, [filter]);

  return (
    <AppShell
      title="Audit findings"
      subtitle="Internal and external observations — severity, owners, and remediation tracking"
    >
      <AuditSubNav />

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            { id: 'all', label: 'All findings' },
            { id: 'internal', label: 'Internal audit' },
            { id: 'external', label: 'External audit' },
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
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Source</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Finding</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Control</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Owner</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {findings.map((finding) => (
              <tr key={finding.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{finding.id}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{finding.source}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{finding.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{finding.engagement}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{finding.controlRef}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                      FINDING_SEVERITY_STYLES[finding.severity]
                    )}
                  >
                    {finding.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{finding.owner}</td>
                <td className="px-4 py-3 capitalize text-slate-600">
                  {finding.status.replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-slate-600">{finding.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
