'use client';

import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, ShieldAlert } from 'lucide-react';
import type { VendorBreachIntel } from '@/lib/vendor/breach-intelligence-types';
import { cn, formatDateTime } from '@/lib/utils';

export function TprmBreachHistoryPanel({
  intel,
  checking,
  onCheck,
  className,
}: {
  intel: VendorBreachIntel | null;
  checking?: boolean;
  onCheck?: () => void;
  className?: string;
}) {
  const status = intel?.status ?? 'skipped';

  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Breach history (live)</h3>
          <p className="mt-1 text-xs text-slate-500">
            Publicly disclosed breaches for this vendor domain via Have I Been Pwned — live fetch, not
            curated demo data.
          </p>
        </div>
        {onCheck && (
          <button
            type="button"
            onClick={onCheck}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-60"
          >
            {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {checking ? 'Checking…' : 'Check breaches now'}
          </button>
        )}
      </div>

      {!intel && (
        <p className="mt-4 text-sm text-slate-500">
          No live breach check yet. Run “Check breaches now” or refresh internet intelligence.
        </p>
      )}

      {intel && (
        <div className="mt-4 space-y-4">
          <div
            className={cn(
              'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm',
              status === 'clear' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
              status === 'breaches_found' && 'border-red-200 bg-red-50 text-red-900',
              (status === 'error' || status === 'skipped') && 'border-amber-200 bg-amber-50 text-amber-900'
            )}
          >
            {status === 'clear' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              <p className="font-medium">{intel.message}</p>
              <p className="mt-0.5 text-xs opacity-80">
                {intel.live ? 'Live source: Have I Been Pwned' : 'Check incomplete'}
                {intel.checkedAt ? ` · ${formatDateTime(intel.checkedAt)}` : ''}
                {intel.domain ? ` · ${intel.domain}` : ''}
              </p>
            </div>
          </div>

          {intel.breaches.length > 0 && (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {intel.breaches.map((b) => (
                <li key={b.name} className="px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{b.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Breach date {b.breachDate || '—'}
                        {b.pwnCount > 0 ? ` · ${b.pwnCount.toLocaleString()} accounts` : ''}
                        {b.isVerified ? ' · verified' : ''}
                      </p>
                    </div>
                    <a
                      href={b.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                    >
                      HIBP <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {b.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{b.description}</p>
                  )}
                  {b.dataClasses.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {b.dataClasses.slice(0, 8).map((c) => (
                        <span
                          key={c}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
