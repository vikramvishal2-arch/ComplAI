'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { cn } from '@/lib/utils';
import { Calendar, FileText } from 'lucide-react';

type Engagement = {
  id: string;
  name: string;
  auditor: string;
  readiness: number;
  status: string;
};

type ReadinessItem = {
  id: string;
  category: string;
  task: string;
  framework: string;
  owner: string;
  status: 'not_started' | 'in_progress' | 'ready' | 'blocked';
  dueDate: string | null;
};

type EvidenceRequest = {
  id: string;
  engagement: string;
  request: string;
  controlRef: string;
  assignee: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  dueDate: string | null;
};

const READINESS_STATUS_LABELS: Record<ReadinessItem['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
  blocked: 'Blocked',
};

const READINESS_STATUS_STYLES: Record<ReadinessItem['status'], string> = {
  not_started: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-brand-50 text-brand-700',
  ready: 'bg-green-50 text-green-700',
  blocked: 'bg-red-50 text-red-700',
};

const AUDIT_STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  fieldwork: 'Fieldwork',
  reporting: 'Reporting',
  closed: 'Closed',
};

export default function ExternalAuditReadinessPage() {
  const [items, setItems] = useState<ReadinessItem[]>([]);
  const [requests, setRequests] = useState<EvidenceRequest[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('/api/audits/external-readiness')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load external readiness');
        setItems(d.items ?? []);
        setRequests(d.requests ?? []);
        setEngagements(d.engagements ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const externalEngagements = engagements;
  const avgReadiness =
    externalEngagements.length > 0
      ? Math.round(
          externalEngagements.reduce((sum, e) => sum + e.readiness, 0) / externalEngagements.length
        )
      : 0;

  const openRequests = useMemo(
    () => requests.filter((e) => e.status === 'pending').length,
    [requests]
  );

  const updateReadinessItem = async (id: string, patch: Partial<Pick<ReadinessItem, 'status' | 'owner'>>) => {
    const res = await fetch('/api/audits/external-readiness', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'item', id, ...patch }),
    });
    if (res.ok) load();
  };

  const updateRequest = async (id: string, patch: Partial<Pick<EvidenceRequest, 'status'>>) => {
    const res = await fetch('/api/audits/external-readiness', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'request', id, ...patch }),
    });
    if (res.ok) load();
  };

  return (
    <AppShell
      title="External audit preparedness"
      subtitle="Readiness checklist, evidence requests, and milestones for SOC 2 and ISO engagements"
    >
      <AuditSubNav />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">External engagements</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{externalEngagements.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average readiness</p>
          <p className="mt-1 text-3xl font-bold text-brand-600">{avgReadiness}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open evidence requests</p>
          <p className="mt-1 text-3xl font-bold text-orange-600">
            {openRequests}
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Readiness checklist</h2>
        <div className="grid gap-3">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading checklist…
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.category}
                    </p>
                    <h3 className="mt-1 font-medium text-slate-900">{item.task}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.framework} · Owner:{' '}
                      <input
                        value={item.owner ?? ''}
                        onChange={(e) => updateReadinessItem(item.id, { owner: e.target.value })}
                        className="ml-1 inline-flex w-44 rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-700"
                      />
                    </p>
                  </div>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      updateReadinessItem(item.id, {
                        status: e.target.value as ReadinessItem['status'],
                      })
                    }
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      READINESS_STATUS_STYLES[item.status]
                    )}
                  >
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="ready">Ready</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <p className="mt-3 text-sm text-slate-600">Due {item.dueDate}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText className="h-5 w-5 text-brand-500" />
          Evidence requests
        </h2>
        <div className="grid gap-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="font-mono text-xs text-slate-500">{request.id}</p>
              <p className="mt-1 font-medium text-slate-900">{request.request}</p>
              <p className="mt-1 text-sm text-slate-500">
                {request.engagement} · {request.controlRef} · {request.assignee}
              </p>
              <p className="mt-2 text-xs capitalize text-slate-600">
                Status:{' '}
                <select
                  value={request.status}
                  onChange={(e) =>
                    updateRequest(
                      request.id,
                      { status: e.target.value as EvidenceRequest['status'] }
                    )
                  }
                  className="ml-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
                >
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>{' '}
                · Due {request.dueDate}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Calendar className="h-5 w-5 text-brand-500" />
          External audit timeline
        </h2>
        <div className="space-y-4">
          {externalEngagements.map((engagement) => (
            <div
              key={engagement.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{engagement.name}</h3>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {AUDIT_STATUS_LABELS[engagement.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {engagement.auditor} · {engagement.readiness}% ready
              </p>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Timeline milestones are static in this MVP. Engagement and evidence request statuses are live and editable.
          </div>
        </div>
      </section>
    </AppShell>
  );
}
