'use client';

import { useCallback, useEffect, useState } from 'react';
import { JiraTicketLink } from '@/components/assurance/jira-ticket-link';
import { JiraConnectionBanner } from '@/components/assurance/jira-connection-banner';
import {
  ASSURANCE_SOURCE_LABELS,
  type AssuranceDataMode,
  type AssuranceSource,
  type AssuranceVulnerability,
} from '@/lib/assurance/types';
import { VULNERABILITY_SEVERITY_STYLES } from '@/lib/data/assurance-demo';
import { cn } from '@/lib/utils';

const SOURCE_STYLES: Record<AssuranceSource, string> = {
  sast: 'bg-violet-100 text-violet-800',
  dast: 'bg-teal-100 text-teal-800',
  infra: 'bg-indigo-100 text-indigo-800',
  cloud: 'bg-sky-100 text-sky-800',
};

type Props = {
  /** When set, locks the source filter (e.g. SAST page). */
  fixedSource?: AssuranceSource;
  showSourceFilter?: boolean;
  title?: string;
};

export function OpenVulnerabilitiesPanel({
  fixedSource,
  showSourceFilter = !fixedSource,
}: Props) {
  const [source, setSource] = useState<AssuranceSource | 'all'>(fixedSource ?? 'all');
  const [rows, setRows] = useState<AssuranceVulnerability[]>([]);
  const [mode, setMode] = useState<AssuranceDataMode | null>(null);
  const [configured, setConfigured] = useState(false);
  const [message, setMessage] = useState('Loading…');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (refresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          source: fixedSource ?? source,
          status: 'open',
        });
        if (refresh) params.set('refresh', '1');
        const res = await fetch(`/api/assurance/vulnerabilities?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load vulnerabilities');
        const data = await res.json();
        setRows(data.vulnerabilities ?? []);
        setMode(data.mode);
        setConfigured(Boolean(data.configured));
        setMessage(data.message ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [fixedSource, source]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <JiraConnectionBanner
        mode={mode}
        configured={configured}
        message={message}
        loading={loading}
        onRefresh={() => void load(true)}
      />

      {showSourceFilter ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium uppercase tracking-wide text-slate-500">
            Source
          </span>
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'sast' as const, label: 'SAST' },
              { id: 'dast' as const, label: 'DAST' },
              { id: 'infra' as const, label: 'Infra' },
              { id: 'cloud' as const, label: 'Cloud' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSource(tab.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                source === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Jira</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Summary</th>
              {!fixedSource ? (
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Source</th>
              ) : null}
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Assignee</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={fixedSource ? 6 : 7} className="px-4 py-8 text-center text-slate-500">
                  Loading open vulnerabilities…
                </td>
              </tr>
            ) : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={fixedSource ? 6 : 7} className="px-4 py-8 text-center text-slate-500">
                  No open vulnerabilities for this filter.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <JiraTicketLink ticketKey={row.key} url={row.url} variant="chip" />
                  {row.demo ? (
                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                      Demo
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{row.summary}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{row.priority} priority</p>
                </td>
                {!fixedSource ? (
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        SOURCE_STYLES[row.source]
                      )}
                    >
                      {ASSURANCE_SOURCE_LABELS[row.source]}
                    </span>
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                      VULNERABILITY_SEVERITY_STYLES[row.severity]
                    )}
                  >
                    {row.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.status}</td>
                <td className="px-4 py-3 text-slate-600">{row.assignee ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {row.updatedAt ? row.updatedAt.slice(0, 10) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
