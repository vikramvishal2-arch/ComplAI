'use client';

import type { VendorFinding } from '@/lib/vendor/vendor-assessment-types';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { key: 'critical', label: 'Critical', header: 'bg-red-600' },
  { key: 'high', label: 'High', header: 'bg-orange-500' },
  { key: 'medium', label: 'Medium', header: 'bg-amber-500' },
  { key: 'low', label: 'Low', header: 'bg-slate-400' },
] as const;

export function TprmFindingsBoard({ findings }: { findings: VendorFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
        No risks identified. Complete a security questionnaire to auto-detect vendor risks.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = findings.filter((f) => f.severity === col.key);
        return (
          <div key={col.key} className="rounded-xl border border-slate-200 bg-slate-50/50">
            <div className={cn('rounded-t-xl px-3 py-2 text-xs font-bold uppercase tracking-wide text-white', col.header)}>
              {col.label} ({items.length})
            </div>
            <div className="space-y-2 p-2">
              {items.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-slate-400">None</p>
              ) : (
                items.map((f) => (
                  <div key={f.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{f.title}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {f.controlRefs.map((ref) => (
                            <span key={ref} className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-medium text-slate-600">
                              {ref}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">{f.recommendation}</p>
                        <span className="mt-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] capitalize text-slate-600">
                          {f.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
