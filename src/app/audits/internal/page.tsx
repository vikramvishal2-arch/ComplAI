'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { cn } from '@/lib/utils';
import { Calendar, UserCircle2 } from 'lucide-react';

type AuditProgram = {
  id: string;
  name: string;
  scope: string;
  lead: string;
  status: 'scheduled' | 'in_progress' | 'complete';
  startDate: string | null;
  endDate: string | null;
  coverage: number;
};

const INTERNAL_PROGRAM_STATUS_LABELS: Record<AuditProgram['status'], string> = {
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  complete: 'Complete',
};

const statusStyles: Record<AuditProgram['status'], string> = {
  scheduled: 'bg-slate-100 text-slate-700 border-slate-200',
  in_progress: 'bg-brand-50 text-brand-700 border-brand-200',
  complete: 'bg-green-50 text-green-700 border-green-200',
};

export default function InternalAuditPage() {
  const [programs, setPrograms] = useState<AuditProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('/api/audits/internal')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load internal audit programs');
        setPrograms(d.programs ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = useMemo(
    () => programs.filter((p) => p.status === 'in_progress').length,
    [programs]
  );

  const createProgram = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/audits/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Internal audit — ${new Date().toISOString().slice(0, 10)}`,
          scope: 'Define scope for this internal audit program.',
          lead: 'Internal Audit',
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Failed to create program');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create program');
    } finally {
      setCreating(false);
    }
  };

  const updateProgram = async (id: string, patch: Partial<Pick<AuditProgram, 'status' | 'coverage'>>) => {
    const res = await fetch('/api/audits/internal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) load();
  };

  return (
    <AppShell
      title="Internal audit"
      subtitle="Scheduled internal reviews to validate controls before external audit fieldwork"
    >
      <AuditSubNav />

      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/50 p-5 text-sm text-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            Launch internal audit programs and update progress as fieldwork advances. Active programs:{' '}
            <strong>{activeCount}</strong>.
          </p>
          <button
            type="button"
            onClick={createProgram}
            disabled={creating}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {creating ? 'Launching…' : 'Launch internal audit'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          Loading programs…
        </div>
      ) : (
      <div className="space-y-4">
        {programs.map((program) => (
          <article
            key={program.id}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{program.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{program.scope}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={program.status}
                  onChange={(e) =>
                    updateProgram(program.id, { status: e.target.value as AuditProgram['status'] })
                  }
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold',
                    statusStyles[program.status]
                  )}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In progress</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-slate-400" />
                {program.lead}
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {program.startDate?.slice(0, 10) ?? '—'} → {program.endDate?.slice(0, 10) ?? '—'}
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
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={program.coverage}
                    onChange={(e) => updateProgram(program.id, { coverage: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
      )}
    </AppShell>
  );
}
