'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CalendarDays,
  ClipboardCheck,
  ShieldCheck,
  Target,
  Building2,
  ShieldAlert,
  Plus,
  Bell,
  BellOff,
  Pencil,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CycleWithReminders, ProgramType, CycleStatus } from '@/lib/types';
import { PROGRAM_TYPE_LABELS, CYCLE_STATUS_LABELS } from '@/lib/types';

const ICON_MAP: Record<ProgramType, LucideIcon> = {
  internal_audit: ClipboardCheck,
  external_audit: ShieldCheck,
  risk_assessment: Target,
  vendor_assessment: Building2,
  risk_register_update: ShieldAlert,
};

const STATUS_STYLES: Record<CycleStatus, string> = {
  upcoming: 'bg-brand-100 text-brand-800 border-brand-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_ICONS: Record<CycleStatus, LucideIcon> = {
  upcoming: CalendarDays,
  in_progress: Clock,
  completed: CheckCircle2,
  overdue: AlertTriangle,
};

const ROW_BORDER: Record<CycleStatus, string> = {
  upcoming: 'border-brand-200',
  in_progress: 'border-amber-200',
  completed: 'border-emerald-200',
  overdue: 'border-red-200',
};

type FilterStatus = CycleStatus | 'all';

export function AnnualCyclesManager() {
  const [cycles, setCycles] = useState<CycleWithReminders[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showCreate, setShowCreate] = useState(false);

  const loadCycles = useCallback(() => {
    setLoading(true);
    fetch('/api/cycles')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d.cycles as CycleWithReminders[];
      })
      .then(setCycles)
      .catch(() => setCycles([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCycles(); }, [loadCycles]);

  const filtered = filter === 'all'
    ? cycles
    : cycles.filter((c) => c.status === filter);

  const counts = {
    all: cycles.length,
    overdue: cycles.filter((c) => c.status === 'overdue').length,
    in_progress: cycles.filter((c) => c.status === 'in_progress').length,
    upcoming: cycles.filter((c) => c.status === 'upcoming').length,
    completed: cycles.filter((c) => c.status === 'completed').length,
  };

  async function handleStatusChange(cycleId: string, newStatus: CycleStatus) {
    await fetch(`/api/cycles/${cycleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadCycles();
  }

  async function handleDelete(cycleId: string) {
    if (!confirm('Delete this cycle? This action cannot be undone.')) return;
    await fetch(`/api/cycles/${cycleId}`, { method: 'DELETE' });
    loadCycles();
  }

  async function handleAcknowledge(cycleId: string, reminderId: string) {
    await fetch(`/api/cycles/${cycleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgeReminderId: reminderId }),
    });
    loadCycles();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All'],
              ['overdue', 'Overdue'],
              ['in_progress', 'Active'],
              ['upcoming', 'Upcoming'],
              ['completed', 'Completed'],
            ] as [FilterStatus, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                filter === key
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {label}
              {counts[key] > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-white/30 px-1 text-[10px]">
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-3.5 w-3.5" /> New cycle
        </button>
      </div>

      {counts.overdue > 0 && filter !== 'completed' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {counts.overdue} overdue cycle{counts.overdue !== 1 ? 's' : ''} need attention
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            {filter === 'all' ? 'No program cycles defined yet.' : `No ${filter.replace('_', ' ')} cycles.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cycle) => (
            <CycleRow
              key={cycle.id}
              cycle={cycle}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateCycleDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadCycles(); }}
        />
      )}
    </div>
  );
}

function CycleRow({
  cycle,
  onStatusChange,
  onDelete,
  onAcknowledge,
}: {
  cycle: CycleWithReminders;
  onStatusChange: (id: string, s: CycleStatus) => void;
  onDelete: (id: string) => void;
  onAcknowledge: (cycleId: string, reminderId: string) => void;
}) {
  const Icon = ICON_MAP[cycle.programType] ?? CalendarClock;
  const StatusIcon = STATUS_ICONS[cycle.status];
  const unacked = cycle.reminders.filter((r) => !r.acknowledged);

  const dueLine =
    cycle.status === 'completed'
      ? `Completed ${cycle.completedAt ?? ''}`
      : cycle.status === 'overdue'
        ? `Overdue by ${Math.abs(cycle.daysUntilDue)} days`
        : cycle.daysUntilDue <= 14
          ? `Due in ${cycle.daysUntilDue} day${cycle.daysUntilDue !== 1 ? 's' : ''}`
          : `Due ${cycle.dueDate}`;

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-5 shadow-sm transition',
        ROW_BORDER[cycle.status]
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'mt-0.5 rounded-lg p-2',
              cycle.status === 'overdue' ? 'bg-red-100' : 'bg-brand-100'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                cycle.status === 'overdue' ? 'text-red-600' : 'text-brand-600'
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">{PROGRAM_TYPE_LABELS[cycle.programType]}</p>
            <h3 className="text-sm font-semibold text-slate-900">{cycle.title}</h3>
            {cycle.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{cycle.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Period: {cycle.periodStart} → {cycle.periodEnd}</span>
              <span className="font-medium">{dueLine}</span>
              {cycle.owner && <span>Owner: {cycle.owner}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase',
              STATUS_STYLES[cycle.status]
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {CYCLE_STATUS_LABELS[cycle.status]}
          </span>
          {cycle.status !== 'completed' && (
            <select
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
              value=""
              onChange={(e) => {
                if (e.target.value) onStatusChange(cycle.id, e.target.value as CycleStatus);
              }}
            >
              <option value="">Move to…</option>
              {cycle.status !== 'in_progress' && <option value="in_progress">In Progress</option>}
              <option value="completed">Completed</option>
            </select>
          )}
          <button
            type="button"
            onClick={() => onDelete(cycle.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Delete cycle"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {unacked.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
            <Bell className="h-3 w-3" /> Active reminders
          </p>
          <div className="flex flex-wrap gap-2">
            {unacked.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onAcknowledge(cycle.id, r.id)}
                className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800 hover:bg-amber-100"
                title="Click to dismiss"
              >
                <Bell className="h-3 w-3" />
                {r.reminderType} ({r.channel})
                <BellOff className="h-3 w-3 ml-0.5 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const PROGRAM_TYPES: ProgramType[] = [
  'internal_audit',
  'external_audit',
  'risk_assessment',
  'vendor_assessment',
  'risk_register_update',
];

function CreateCycleDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const body = {
      programType: fd.get('programType') as string,
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      periodStart: fd.get('periodStart') as string,
      periodEnd: fd.get('periodEnd') as string,
      dueDate: fd.get('dueDate') as string,
      owner: fd.get('owner') as string,
      notes: fd.get('notes') as string,
      reminderDays: [30, 14, 7],
    };

    try {
      const res = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Failed to create cycle');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  const year = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">New annual cycle</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="col-span-2 block">
              <span className="text-xs font-medium text-slate-700">Program type</span>
              <select name="programType" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {PROGRAM_TYPES.map((t) => (
                  <option key={t} value={t}>{PROGRAM_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-medium text-slate-700">Title</span>
              <input name="title" required defaultValue={`FY${year} `} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Period start</span>
              <input type="date" name="periodStart" required defaultValue={`${year}-01-01`} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Period end</span>
              <input type="date" name="periodEnd" required defaultValue={`${year}-12-31`} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Due date</span>
              <input type="date" name="dueDate" required defaultValue={`${year}-09-30`} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-700">Owner</span>
              <input name="owner" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Jane Doe" />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-medium text-slate-700">Description</span>
              <textarea name="description" rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs font-medium text-slate-700">Notes</span>
              <textarea name="notes" rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? 'Creating…' : 'Create cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
