'use client';

import { ExternalLink, Radar } from 'lucide-react';
import type { ExternalRiskVector } from '@/lib/vendor/tprm-rating';
import type { PublicIntelligenceSource } from '@/lib/vendor/public-vendor-profiles';
import { cn } from '@/lib/utils';

const STATUS_ICON = {
  pass: '✓',
  warn: '!',
  fail: '✕',
} as const;

const STATUS_COLOR = {
  pass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  warn: 'text-amber-600 bg-amber-50 border-amber-200',
  fail: 'text-red-600 bg-red-50 border-red-200',
};

export function TprmIntelligenceBanner({
  sources,
  className,
}: {
  sources: PublicIntelligenceSource[];
  className?: string;
}) {
  if (sources.length === 0) return null;

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900',
        className
      )}
    >
      <Radar className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Public internet intelligence profile</p>
        <p className="mt-0.5 text-xs text-sky-800/90">
          Attack-surface scores below are sourced from publicly observable data — not simulated — for
          customer demo walkthroughs.
        </p>
        <ul className="mt-2 space-y-1 text-xs">
          {sources.map((source) => (
            <li key={source.url} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-sky-700 underline-offset-2 hover:underline"
              >
                {source.name}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-sky-600">· verified {source.verifiedAt}</span>
              {source.note && <span className="text-sky-700/80">— {source.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TprmExternalRiskGrid({
  vectors,
  simulated,
}: {
  vectors: ExternalRiskVector[];
  simulated?: boolean;
}) {
  return (
    <div>
      {simulated && (
        <p className="mb-3 text-xs text-slate-500">
          Simulated preview — add a known public domain (e.g. stripe.com, policybazaar.com) or load
          the demo portfolio for real internet intelligence.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vectors.map((v) => (
          <div key={v.id} className={cn('rounded-xl border p-4', STATUS_COLOR[v.status])}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{v.label}</p>
                <p className="mt-1 text-xs opacity-80">{v.detail}</p>
              </div>
              <span className="text-lg font-bold leading-none" aria-hidden>
                {STATUS_ICON[v.status]}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/60">
                <div
                  className="h-full rounded-full bg-current opacity-60"
                  style={{ width: `${v.score}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums">{v.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
