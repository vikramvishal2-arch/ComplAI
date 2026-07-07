'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  ShieldCheck,
  Target,
  Building2,
  ShieldAlert,
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
  upcoming: 'bg-brand-100 text-brand-800',
  in_progress: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<CycleStatus, LucideIcon> = {
  upcoming: CalendarDays,
  in_progress: Clock,
  completed: CheckCircle2,
  overdue: AlertTriangle,
};

export function AnnualCyclesPanel({ compact = false }: { compact?: boolean }) {
  const [cycles, setCycles] = useState<CycleWithReminders[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock className={cn('text-brand-500', compact ? 'h-4 w-4' : 'h-5 w-5')} />
          <h2
            className={cn(
              'font-semibold text-slate-900',
              compact ? 'text-sm font-bold uppercase tracking-wide text-slate-500' : 'text-lg'
            )}
          >
            Annual program cycles
          </h2>
        </div>
        <div className={cn('grid gap-3', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3')}>
          {Array.from({ length: compact ? 4 : 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (cycles.length === 0) return null;

  const overdue = cycles.filter((c) => c.status === 'overdue');
  const active = cycles.filter((c) => c.status === 'in_progress');
  const upcoming = cycles.filter((c) => c.status === 'upcoming');
  const completed = cycles.filter((c) => c.status === 'completed');

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarClock className={cn('text-brand-500', compact ? 'h-4 w-4' : 'h-5 w-5')} />
          <h2
            className={cn(
              compact ? 'text-sm font-bold uppercase tracking-wide text-slate-500' : 'text-lg font-semibold text-slate-900'
            )}
          >
            Annual program cycles
          </h2>
        </div>
        <Link
          href="/cycles"
          className="text-xs font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          Manage cycles <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {overdue.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {overdue.length} overdue cycle{overdue.length !== 1 ? 's' : ''} — action required
          </div>
        </div>
      )}

      <div className={cn('grid gap-3', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3')}>
        {[...overdue, ...active, ...upcoming, ...completed].map((cycle) => (
          <CycleCard key={cycle.id} cycle={cycle} />
        ))}
      </div>
    </section>
  );
}

function CycleCard({ cycle }: { cycle: CycleWithReminders }) {
  const Icon = ICON_MAP[cycle.programType] ?? CalendarClock;
  const StatusIcon = STATUS_ICONS[cycle.status];

  const dueLine =
    cycle.status === 'completed'
      ? `Completed ${cycle.completedAt ?? ''}`
      : cycle.status === 'overdue'
        ? `Overdue by ${Math.abs(cycle.daysUntilDue)} day${Math.abs(cycle.daysUntilDue) !== 1 ? 's' : ''}`
        : cycle.daysUntilDue <= 14
          ? `Due in ${cycle.daysUntilDue} day${cycle.daysUntilDue !== 1 ? 's' : ''}`
          : `Due ${cycle.dueDate}`;

  const programHref = {
    internal_audit: '/audits/internal',
    external_audit: '/audits/external-readiness',
    risk_assessment: '/audits/risk-assessment',
    vendor_assessment: '/vendors',
    risk_register_update: '/risk-register',
  }[cycle.programType] ?? '/cycles';

  return (
    <Link
      href={programHref}
      className={cn(
        'group rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md',
        cycle.status === 'overdue'
          ? 'border-red-200 hover:border-red-300'
          : 'border-slate-200 hover:border-brand-300'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'rounded-lg p-1.5',
              cycle.status === 'overdue' ? 'bg-red-100' : 'bg-brand-100'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                cycle.status === 'overdue' ? 'text-red-600' : 'text-brand-600'
              )}
            />
          </div>
          <span className="text-xs text-slate-500">
            {PROGRAM_TYPE_LABELS[cycle.programType]}
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
            STATUS_STYLES[cycle.status]
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {CYCLE_STATUS_LABELS[cycle.status]}
        </span>
      </div>

      <p className="mt-2.5 text-sm font-semibold text-slate-900 group-hover:text-brand-700 line-clamp-1">
        {cycle.title}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p
          className={cn(
            'text-xs',
            cycle.status === 'overdue' ? 'text-red-700 font-semibold' : 'text-slate-500'
          )}
        >
          {dueLine}
        </p>
        {cycle.activeReminderCount > 0 && (
          <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
            {cycle.activeReminderCount}
          </span>
        )}
      </div>

      {cycle.owner && (
        <p className="mt-1 text-[11px] text-slate-400 truncate">{cycle.owner}</p>
      )}
    </Link>
  );
}
