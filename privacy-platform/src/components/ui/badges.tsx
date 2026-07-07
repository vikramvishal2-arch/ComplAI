import { cn } from '@/lib/utils';
import type { ComplianceStatus, ComplianceMethod } from '@/lib/types';
import { COMPLIANCE_STATUS_LABELS, COMPLIANCE_METHOD_LABELS } from '@/lib/types';

const statusStyles: Record<ComplianceStatus, string> = {
  not_started: 'bg-slate-100 text-slate-700 border-slate-200',
  planning: 'bg-brand-50 text-brand-700 border-brand-200',
  implementing: 'bg-amber-50 text-amber-800 border-amber-200',
  implemented: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  needs_review: 'bg-orange-50 text-orange-800 border-orange-200',
  audit_ready: 'bg-green-100 text-green-800 border-green-300',
  not_applicable: 'bg-gray-100 text-gray-500 border-gray-200',
};

export function StatCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn('privacy-card', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-zinc-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
    </div>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: ComplianceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {COMPLIANCE_STATUS_LABELS[status]}
    </span>
  );
}

export function MethodBadge({ method }: { method: ComplianceMethod | null }) {
  if (!method) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-xs text-slate-500">
        Not selected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600">
      {COMPLIANCE_METHOD_LABELS[method]}
    </span>
  );
}

export function NistBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
      {label}
    </span>
  );
}

export function FrameworkBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
      {name}
    </span>
  );
}

export function ReadinessBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>Readiness</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
