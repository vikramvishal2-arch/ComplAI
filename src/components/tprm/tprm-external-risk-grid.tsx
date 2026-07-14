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

export type AttackSurfaceMode = 'curated_demo' | 'simulated' | 'live_correlated';

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
        'mb-4 flex flex-wrap items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950',
        className
      )}
    >
      <Radar className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          Demo / illustrative profile — not a live attack-surface scan
        </p>
        <p className="mt-0.5 text-xs text-amber-900/90">
          Curated trust-center notes may still appear for demo domains. Live Shodan / Censys / VirusTotal /
          NVD / EPSS / HIBP results are shown in the External intelligence panel when API keys are
          configured and refresh succeeds.
        </p>
        <ul className="mt-2 space-y-1 text-xs">
          {sources.map((source) => (
            <li key={source.url} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-amber-800 underline-offset-2 hover:underline"
              >
                {source.name}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-amber-700">· curated {source.verifiedAt}</span>
              {source.note && <span className="text-amber-800/80">— {source.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TprmExternalRiskGrid({
  vectors,
  mode = 'simulated',
}: {
  vectors: ExternalRiskVector[];
  /** curated_demo = known public profile; simulated = heuristic preview; live_correlated = API overlays */
  mode?: AttackSurfaceMode;
}) {
  return (
    <div>
      {mode === 'simulated' && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span className="font-semibold">Demo / illustrative — not live scanned.</span> These
          attack-surface scores are simulated until you refresh intelligence with provider API keys.
        </p>
      )}
      {mode === 'curated_demo' && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          <span className="font-semibold">Demo / illustrative baseline.</span> Non-live vectors may
          come from a curated demo profile. Refresh intelligence to overlay Shodan / Censys / VirusTotal /
          NVD / EPSS / HIBP.
        </p>
      )}
      {mode === 'live_correlated' && (
        <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <span className="font-semibold">Live correlated overlays applied.</span> Vectors below
          include successful provider responses. Unconfigured providers remain excluded (not marked
          clear).
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
