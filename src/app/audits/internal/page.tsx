'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import {
  INTERNAL_AUDIT_PROGRAMS,
  INTERNAL_PROGRAM_STATUS_LABELS,
} from '@/lib/data/audits-demo';
import { cn } from '@/lib/utils';
import { Calendar, UserCircle2 } from 'lucide-react';

const statusStyles: Record<(typeof INTERNAL_AUDIT_PROGRAMS)[number]['status'], string> = {
  scheduled: 'bg-slate-100 text-slate-700 border-slate-200',
  in_progress: 'bg-brand-50 text-brand-700 border-brand-200',
  complete: 'bg-green-50 text-green-700 border-green-200',
};

export default function InternalAuditPage() {
  return (
    <AppShell
      title="Internal audit"
      subtitle="Scheduled internal reviews to validate controls before external audit fieldwork"
    >
      <AuditSubNav />

      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/50 p-5 text-sm text-slate-700">
        Internal audit programs test high-risk areas first — access, change management, and vendor
        due diligence — so gaps are closed before the external auditor arrives.
      </div>

      <div className="space-y-4">
        {INTERNAL_AUDIT_PROGRAMS.map((program) => (
          <article
            key={program.id}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{program.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{program.scope}</p>
              </div>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  statusStyles[program.status]
                )}
              >
                {INTERNAL_PROGRAM_STATUS_LABELS[program.status]}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-slate-400" />
                {program.lead}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {program.startDate} → {program.endDate}
              </span>
            </div>

            {program.status !== 'scheduled' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Coverage</span>
                  <span className="font-semibold text-slate-900">{program.coverage}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${program.coverage}%` }}
                  />
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </AppShell>
  );
}
