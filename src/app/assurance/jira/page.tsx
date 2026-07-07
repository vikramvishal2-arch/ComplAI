'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
import { JiraTicketLink } from '@/components/assurance/jira-ticket-link';
import {
  JIRA_PRIORITY_STYLES,
  JIRA_STATUS_STYLES,
  JIRA_TICKETS,
} from '@/lib/data/assurance-demo';
import { cn } from '@/lib/utils';
import { ExternalLink, MousePointerClick } from 'lucide-react';

type SourceFilter = 'all' | 'infrastructure' | 'dast';
type StatusFilter = 'all' | 'open' | 'done';

export default function AssuranceJiraPage() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const tickets = useMemo(() => {
    let rows = JIRA_TICKETS;
    if (sourceFilter !== 'all') {
      rows = rows.filter((t) => t.source === sourceFilter);
    }
    if (statusFilter === 'open') {
      rows = rows.filter((t) => t.status !== 'Done');
    } else if (statusFilter === 'done') {
      rows = rows.filter((t) => t.status === 'Done');
    }
    return rows;
  }, [sourceFilter, statusFilter]);

  return (
    <AppShell
      title="Jira tickets"
      subtitle="Service management tickets raised for identified vulnerabilities — linked to VM and DAST findings"
    >
      <AssuranceSubNav />

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <MousePointerClick className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold">Click any ticket to open in Jira</p>
            <p className="mt-1 text-blue-800">
              Ticket keys and the <strong>Open in Jira</strong> buttons link directly to your Jira
              project. Rows are also clickable — each opens the issue in a new browser tab.
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
              { id: 'infrastructure', label: 'Infrastructure VM' },
              { id: 'dast', label: 'Application DAST' },
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
              { id: 'all', label: 'All' },
              { id: 'open', label: 'Open' },
              { id: 'done', label: 'Done' },
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
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Priority</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Assignee</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">SLA due</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="group cursor-pointer hover:bg-blue-50/60"
                onClick={() => window.open(ticket.url, '_blank', 'noopener,noreferrer')}
                title={`Click to open ${ticket.key} in Jira`}
              >
                <td className="px-4 py-3">
                  <JiraTicketLink ticketKey={ticket.key} url={ticket.url} variant="chip" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 group-hover:text-brand-700">
                    {ticket.summary}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{ticket.project}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      ticket.source === 'infrastructure'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-teal-100 text-teal-800'
                    )}
                  >
                    {ticket.source === 'infrastructure' ? 'Infra VM' : 'DAST'}
                  </span>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{ticket.sourceFindingId}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{ticket.issueType}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                      JIRA_PRIORITY_STYLES[ticket.priority]
                    )}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{ticket.assignee}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                      JIRA_STATUS_STYLES[ticket.status]
                    )}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{ticket.slaDue}</td>
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
        Tickets open at propelready.atlassian.net — configure your Jira base URL in Settings.
      </p>
    </AppShell>
  );
}
