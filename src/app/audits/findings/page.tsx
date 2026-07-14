'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { cn } from '@/lib/utils';

type SourceFilter = 'all' | 'internal' | 'external';

type AuditFinding = {
  id: string;
  source: 'internal' | 'external';
  engagement: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  controlRef: string;
  owner: string;
  status: 'open' | 'in_progress' | 'remediated' | 'accepted';
  dueDate: string | null;
};

const FINDING_SEVERITY_STYLES: Record<AuditFinding['severity'], string> = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  low: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function AuditFindingsPage() {
  const [filter, setFilter] = useState<SourceFilter>('all');
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const qs = filter === 'all' ? '' : `?source=${filter}`;
    fetch(`/api/audits/findings${qs}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load findings');
        setFindings(d.findings ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateFinding = async (id: string, patch: Partial<Pick<AuditFinding, 'status' | 'owner' | 'dueDate'>>) => {
    const res = await fetch('/api/audits/findings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) load();
  };

  return (
    <AppShell
      title="Audit findings"
      subtitle="Internal and external observations — severity, owners, and remediation tracking"
    >
      <AuditSubNav />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

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

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          Loading findings…
        </div>
      ) : (
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
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {finding.controlRef}
                  </td>
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
                  <td className="px-4 py-3">
                    <input
                      value={finding.owner ?? ''}
                      onChange={(e) => updateFinding(finding.id, { owner: e.target.value })}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-700"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={finding.status}
                      onChange={(e) =>
                        updateFinding(finding.id, {
                          status: e.target.value as AuditFinding['status'],
                        })
                      }
                      className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-700"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="remediated">Remediated</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {finding.dueDate ? finding.dueDate.slice(0, 10) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
