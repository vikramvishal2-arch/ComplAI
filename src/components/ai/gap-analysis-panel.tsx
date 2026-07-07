'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { GapAnalysisReport } from '@/lib/gap/types';
import { ControlReference } from '@/components/controls/control-reference';
import { AlertTriangle, CheckCircle2, FileSearch, FileWarning, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const severityStyles = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function GapAnalysisPanel({
  compact = false,
  variant = 'default',
}: {
  compact?: boolean;
  variant?: 'default' | 'sidebar';
}) {
  const isSidebar = variant === 'sidebar';
  const autoLoad = !compact || isSidebar;
  const [report, setReport] = useState<GapAnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(autoLoad);

  const loadReport = useCallback(() => {
    setRequested(true);
    setLoading(true);
    setError(null);
    fetch('/api/ai/gap-analysis')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed');
        return d as GapAnalysisReport;
      })
      .then(setReport)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadReport();
      return;
    }
    const idle = window.requestIdleCallback?.(() => loadReport(), { timeout: 3000 });
    const timer = idle == null ? window.setTimeout(loadReport, 2000) : undefined;
    return () => {
      if (idle != null) window.cancelIdleCallback(idle);
      if (timer != null) window.clearTimeout(timer);
    };
  }, [autoLoad, loadReport]);

  if (!autoLoad && !requested) {
    return null;
  }

  if (loading) {
    if (isSidebar) {
      return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Running gap analysis…
          </div>
        </section>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Running gap analysis…
      </div>
    );
  }

  if (error || !report) {
    if (isSidebar) {
      return (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm text-amber-900">{error ?? 'Gap analysis unavailable'}</p>
          <button
            type="button"
            onClick={loadReport}
            className="mt-2 text-xs font-medium text-brand-600 hover:underline"
          >
            Retry
          </button>
        </section>
      );
    }
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p>{error ?? 'Gap analysis unavailable'}</p>
        <button
          type="button"
          onClick={loadReport}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-200"
        >
          <FileSearch className="h-3.5 w-3.5" />
          Retry analysis
        </button>
      </div>
    );
  }

  const gaps = isSidebar
    ? report.priorityGaps.slice(0, 4)
    : compact
      ? report.priorityGaps.slice(0, 5)
      : report.priorityGaps;

  if (isSidebar) {
    return (
      <section className="rounded-xl border border-orange-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileSearch className="h-4 w-4 text-orange-600" />
            Compliance gaps
            {report.summary.gapsFound > 0 ? ` (${report.summary.gapsFound})` : ''}
          </h3>
          <Link href="/intelligence?tab=gaps" className="text-xs text-brand-600 hover:underline">
            All gaps →
          </Link>
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <SidebarStat label="Gaps" value={report.summary.gapsFound} />
          <SidebarStat label="Critical" value={report.summary.critical} tone="red" />
        </div>
        {gaps.length === 0 ? (
          <p className="text-sm text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            No priority gaps detected.
          </p>
        ) : (
          <ul className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
            {gaps.map((gap) => (
              <li key={`${gap.controlId}-${gap.category}`}>
                <Link
                  href={`/controls/${gap.controlId}`}
                  className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-orange-50/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{gap.controlTitle}</p>
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize',
                        severityStyles[gap.severity]
                      )}
                    >
                      {gap.severity}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{gap.message}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Gaps found" value={report.summary.gapsFound} />
        <Stat label="Critical" value={report.summary.critical} tone="red" />
        <Stat label="Policy gaps" value={report.policyGaps.length} />
        <Stat label="Evidence gaps" value={report.evidenceGaps.length} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-semibold text-slate-900">
            {compact ? 'Priority gaps' : 'Policy & evidence gaps — fix before audit'}
          </h3>
          <p className="text-xs text-slate-500">
            Generated {new Date(report.generatedAt).toLocaleString()} · {report.organizationName}
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {gaps.length === 0 ? (
            <li className="p-6 text-sm text-slate-500">No priority gaps detected.</li>
          ) : (
            gaps.map((gap) => (
              <li key={`${gap.controlId}-${gap.category}`} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <ControlReference
                      controlId={gap.controlId}
                      reference={gap.controlReference}
                      frameworkId={gap.frameworkId}
                      title={gap.controlTitle}
                      showTitle
                      className="font-medium text-sm font-sans"
                    />
                    <p className="mt-1 text-sm text-slate-600">{gap.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {gap.frameworkName} · {gap.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                      severityStyles[gap.severity]
                    )}
                  >
                    {gap.severity}
                  </span>
                </div>
                {gap.suggestedActions.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {gap.suggestedActions.map((a) => (
                      <li key={a} className="flex items-start gap-1.5">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))
          )}
        </ul>
        {compact && report.summary.gapsFound > 5 && (
          <div className="border-t border-slate-100 p-3 text-center">
            <Link href="/intelligence?tab=gaps" className="text-sm text-brand-600 hover:underline">
              View all {report.summary.gapsFound} gaps →
            </Link>
          </div>
        )}
      </div>

      {!compact && report.evidenceGaps.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
            <FileWarning className="h-4 w-4" />
            {report.evidenceGaps.length} control
            {report.evidenceGaps.length === 1 ? '' : 's'} marked ready but missing evidence
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'red';
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
      <p className={cn('text-lg font-bold tabular-nums', tone === 'red' ? 'text-red-700' : 'text-slate-900')}>
        {value}
      </p>
      <p className="text-[10px] uppercase text-slate-500">{label}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'red';
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          'text-2xl font-bold',
          tone === 'red' ? 'text-red-600' : 'text-slate-900'
        )}
      >
        {value}
      </p>
    </div>
  );
}
