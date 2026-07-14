'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
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
import { ExternalLink, MousePointerClick } from 'lucide-react';

type SourceFilter = 'all' | AssuranceSource;

const SOURCE_STYLES: Record<AssuranceSource, string> = {
  sast: 'bg-violet-100 text-violet-800',
  dast: 'bg-teal-100 text-teal-800',
  infra: 'bg-indigo-100 text-indigo-800',
  cloud: 'bg-sky-100 text-sky-800',
};

export default function AssuranceJiraPage() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'open' | 'all'>('open');
  const [rows, setRows] = useState<AssuranceVulnerability[]>([]);
  const [mode, setMode] = useState<AssuranceDataMode | null>(null);
  const [configured, setConfigured] = useState(false);
  const [message, setMessage] = useState('Loading…');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        source: sourceFilter,
        status: statusFilter,
      });
      if (refresh) params.set('refresh', '1');
      const res = await fetch(`/api/assurance/vulnerabilities?${params.toString()}`);
      const data = await res.json();
      setRows(data.vulnerabilities ?? []);
      setMode(data.mode);
      setConfigured(Boolean(data.configured));
      setMessage(data.message ?? '');
    } catch {
      setMessage('Failed to load Jira tickets');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const tickets = useMemo(() => rows, [rows]);

  return (
    <AppShell
      title="Jira tickets"
      subtitle="Service management tickets for SAST, DAST, infra, and cloud vulnerabilities"
    >
      <AssuranceSubNav />

      <JiraConnectionBanner
        mode={mode}
        configured={configured}
        message={message}
        loading={loading}
        onRefresh={() => void load(true)}
      />

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <MousePointerClick className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold">Click any ticket to open in Jira</p>
            <p className="mt-1 text-blue-800">
              Ticket keys link directly to your Jira project. Classify issues with labels{' '}
              <strong>sast</strong>, <strong>dast</strong>, <strong>infra</strong>, or{' '}
              <strong>cloud</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium uppercase tracking-wide text-slate-500">
            Source
          </span>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'sast', label: 'SAST' },
              { id: 'dast', label: 'DAST' },
              { id: 'infra', label: 'Infra' },
              { id: 'cloud', label: 'Cloud' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSourceFilter(tab.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                sourceFilter === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium uppercase tracking-wide text-slate-500">
            Status
          </span>
          {(
            [
              { id: 'open', label: 'Open' },
              { id: 'all', label: 'All (incl. resolved query)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                statusFilter === tab.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Ticket</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Summary</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Source</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Assignee</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Updated</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Loading tickets…
                </td>
              </tr>
            ) : null}
            {!loading && tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No tickets for this filter.
                </td>
              </tr>
            ) : null}
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="group cursor-pointer hover:bg-blue-50/60"
                onClick={() => window.open(ticket.url, '_blank', 'noopener,noreferrer')}
                title={`Click to open ${ticket.key} in Jira`}
              >
                <td className="px-4 py-3">
                  <JiraTicketLink ticketKey={ticket.key} url={ticket.url} variant="chip" />
                  {ticket.demo ? (
                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                      Demo
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 group-hover:text-brand-700">
                    {ticket.summary}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{ticket.priority} priority</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      SOURCE_STYLES[ticket.source]
                    )}
                  >
                    {ASSURANCE_SOURCE_LABELS[ticket.source]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                      VULNERABILITY_SEVERITY_STYLES[ticket.severity]
                    )}
                  >
                    {ticket.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{ticket.assignee ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{ticket.status}</td>
                <td className="px-4 py-3 text-slate-600">
                  {ticket.updatedAt ? ticket.updatedAt.slice(0, 10) : '—'}
                </td>
                <td className="px-4 py-3">
                  <JiraTicketLink
                    ticketKey={ticket.key}
                    url={ticket.url}
                    variant="button"
                    className="whitespace-nowrap"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <ExternalLink className="h-3.5 w-3.5" />
        Configure <code className="rounded bg-slate-100 px-1">JIRA_BASE_URL</code> and credentials in
        your environment to sync live issues.
      </p>
    </AppShell>
  );
}
