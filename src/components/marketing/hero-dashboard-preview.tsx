'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PRODUCT_NAME } from '@/lib/brand';

type ViewMode = 'before' | 'after';

const beforeMetrics = [
  { label: 'Policy versions', value: 'Unknown' },
  { label: 'Framework coverage', value: 'Manual' },
  { label: 'Open audit gaps', value: '???' },
  { label: 'Evidence status', value: 'Scattered' },
  { label: 'Approval state', value: 'Email' },
  { label: 'Risk visibility', value: 'Low' },
];

const afterMetrics = [
  { label: 'Open Risks', value: '8' },
  { label: 'Vendors not Assessed', value: '2' },
  { label: 'Employees at Risk', value: '18' },
  { label: 'Audits in Progress', value: '1' },
  { label: 'Pending Approvals', value: '5' },
  { label: 'Framework Readiness', value: '78%' },
];

export function HeroDashboardPreview() {
  const [mode, setMode] = useState<ViewMode>('after');
  const metrics = mode === 'before' ? beforeMetrics : afterMetrics;

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="mb-5 flex justify-center gap-2">
        <ToggleButton active={mode === 'before'} onClick={() => setMode('before')}>
          Before
        </ToggleButton>
        <ToggleButton active={mode === 'after'} onClick={() => setMode('after')}>
          After {PRODUCT_NAME}
        </ToggleButton>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-scrut-navy-light/90 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs text-white/50">
              {mode === 'before' ? 'Spreadsheets & shared drives' : PRODUCT_NAME}
            </span>
          </div>
          {mode === 'after' && (
            <span className="rounded-full bg-scrut-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-scrut-navy">
              Live
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className={cn(
                  'rounded-xl border p-3 sm:p-4',
                  mode === 'before'
                    ? 'border-white/5 bg-white/5'
                    : 'border-white/10 bg-white/[0.07]'
                )}
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
                  {m.label}
                </p>
                <p
                  className={cn(
                    'mt-1.5 text-2xl font-bold tabular-nums',
                    mode === 'after' ? 'text-white' : 'text-white/60'
                  )}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {mode === 'after' && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
                  RAG by domain
                </p>
                <div className="mt-3 space-y-2">
                  <BarRow label="Access & identity" pct={92} color="bg-emerald-400" />
                  <BarRow label="Vendor risk" pct={68} color="bg-amber-400" />
                  <BarRow label="Detection & response" pct={45} color="bg-red-400" />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
                  Active frameworks
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['SOC 2', 'ISO 27001', 'GDPR', 'SEBI CSCRF'].map((fw) => (
                    <span
                      key={fw}
                      className="rounded-md bg-scrut-gradient/20 px-2 py-1 text-xs font-medium text-scrut-teal"
                    >
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'before' && (
            <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center text-sm text-white/45">
              Policies in Word · Controls in spreadsheets · Evidence in email threads
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-5 py-2 text-xs font-semibold transition-all',
        active
          ? 'bg-scrut-gradient text-scrut-navy shadow-md'
          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function BarRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-medium text-white">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-white/10">
        <div className={cn('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
