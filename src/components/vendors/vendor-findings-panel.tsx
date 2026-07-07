'use client';

import type { VendorFinding } from '@/lib/vendor/vendor-assessment-types';
import { cn } from '@/lib/utils';

const severityClass = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusClass = {
  open: 'text-red-700',
  remediation_requested: 'text-amber-700',
  in_progress: 'text-blue-700',
  resolved: 'text-emerald-700',
  accepted: 'text-slate-500',
};

export function VendorFindingsPanel({ findings }: { findings: VendorFinding[] }) {
  if (findings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        No findings — complete a questionnaire assessment to auto-detect risks.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Finding</th>
            <th className="px-4 py-3">Domain</th>
            <th className="px-4 py-3">Controls</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {findings.map((f) => (
            <tr key={f.id} className="hover:bg-slate-50/80">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{f.title}</p>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{f.recommendation}</p>
              </td>
              <td className="px-4 py-3 capitalize text-slate-600">{f.domain}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {f.controlRefs.map((ref) => (
                    <span
                      key={ref}
                      className="rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                    severityClass[f.severity]
                  )}
                >
                  {f.severity}
                </span>
              </td>
              <td className={cn('px-4 py-3 text-xs font-medium capitalize', statusClass[f.status])}>
                {f.status.replace(/_/g, ' ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
