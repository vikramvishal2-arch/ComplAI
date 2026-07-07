'use client';

import type { VendorRemediationItem } from '@/lib/vendor/vendor-assessment-types';
import { cn } from '@/lib/utils';

const statusOptions = ['pending', 'in_progress', 'completed', 'waived'] as const;

export function VendorRemediationPanel({
  items,
  onUpdate,
  readOnly = false,
}: {
  items: VendorRemediationItem[];
  onUpdate?: (items: VendorRemediationItem[]) => void;
  readOnly?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        No remediation requests. Findings from assessments automatically create remediation items.
      </div>
    );
  }

  const updateItem = (id: string, patch: Partial<VendorRemediationItem>) => {
    if (!onUpdate) return;
    onUpdate(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                item.severity === 'critical' || item.severity === 'high'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              )}
            >
              {item.severity}
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-xs">
              <span className="font-medium text-slate-600">Status</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50"
                value={item.status}
                disabled={readOnly}
                onChange={(e) =>
                  updateItem(item.id, {
                    status: e.target.value as VendorRemediationItem['status'],
                    completedAt:
                      e.target.value === 'completed' ? new Date().toISOString() : item.completedAt,
                  })
                }
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span className="font-medium text-slate-600">Owner</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50"
                value={item.owner}
                disabled={readOnly}
                onChange={(e) => updateItem(item.id, { owner: e.target.value })}
                placeholder="Assign owner"
              />
            </label>
            <label className="text-xs">
              <span className="font-medium text-slate-600">Due date</span>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:bg-slate-50"
                value={item.dueDate ?? ''}
                disabled={readOnly}
                onChange={(e) => updateItem(item.id, { dueDate: e.target.value })}
              />
            </label>
          </div>
          {!readOnly && (
            <textarea
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              placeholder="Remediation notes and vendor correspondence…"
              value={item.notes}
              onChange={(e) => updateItem(item.id, { notes: e.target.value })}
            />
          )}
        </div>
      ))}
    </div>
  );
}
