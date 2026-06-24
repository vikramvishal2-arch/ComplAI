'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { GapAnalysisReport } from '@/lib/gap/types';
import { AlertTriangle, FileWarning, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const severityStyles = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function GapAnalysisPanel({ compact = false }: { compact?: boolean }) {
  const [report, setReport] = useState<GapAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Running gap analysis…
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        {error ?? 'Gap analysis unavailable'}
      </div>
    );
  }

  const gaps = compact ? report.priorityGaps.slice(0, 5) : report.priorityGaps;

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
                    <Link
                      href={`/controls/${gap.controlId}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {gap.controlReference} — {gap.controlTitle}
                    </Link>
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
