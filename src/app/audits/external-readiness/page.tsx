'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import {
  AUDIT_ENGAGEMENTS,
  AUDIT_MILESTONES,
  AUDIT_STATUS_LABELS,
  EVIDENCE_REQUESTS,
  EXTERNAL_READINESS_CHECKLIST,
  READINESS_STATUS_LABELS,
  READINESS_STATUS_STYLES,
} from '@/lib/data/audits-demo';
import { cn } from '@/lib/utils';
import { Calendar, CheckCircle2, Circle, Clock, FileText } from 'lucide-react';

const milestoneIcon = {
  complete: CheckCircle2,
  in_progress: Clock,
  upcoming: Circle,
} as const;

export default function ExternalAuditReadinessPage() {
  const externalEngagements = AUDIT_ENGAGEMENTS.filter((e) => e.type === 'external');
  const avgReadiness =
    externalEngagements.length > 0
      ? Math.round(
          externalEngagements.reduce((sum, e) => sum + e.readiness, 0) / externalEngagements.length
        )
      : 0;

  return (
    <AppShell
      title="External audit preparedness"
      subtitle="Readiness checklist, evidence requests, and milestones for SOC 2 and ISO engagements"
    >
      <AuditSubNav />

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
            {EVIDENCE_REQUESTS.filter((e) => e.status === 'pending').length}
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Readiness checklist</h2>
        <div className="grid gap-3">
          {EXTERNAL_READINESS_CHECKLIST.map((item) => (
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
                    {item.framework} · Owner: {item.owner}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    READINESS_STATUS_STYLES[item.status]
                  )}
                >
                  {READINESS_STATUS_LABELS[item.status]}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">Due {item.dueDate}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText className="h-5 w-5 text-brand-500" />
          Evidence requests
        </h2>
        <div className="grid gap-3">
          {EVIDENCE_REQUESTS.map((request) => (
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
                Status: {request.status} · Due {request.dueDate}
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
          {AUDIT_MILESTONES.map((milestone) => {
            const Icon = milestoneIcon[milestone.status];
            return (
              <div key={milestone.id} className="flex gap-4 pl-2">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-brand-500" />
                <div>
                  <p className="font-medium text-slate-900">{milestone.label}</p>
                  <p className="text-sm text-slate-500">
                    {milestone.engagement} · {milestone.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
