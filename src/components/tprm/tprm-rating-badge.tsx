'use client';

import { cn } from '@/lib/utils';
import {
  getRatingBand,
  RATING_BAND_CONFIG,
  toUpguardRating,
  type RatingBand,
} from '@/lib/vendor/tprm-rating';

export function TprmRatingBadge({
  score100,
  score950: score950Prop,
  size = 'md',
  showBand = true,
}: {
  score100?: number | null;
  score950?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBand?: boolean;
}) {
  const score950 = score950Prop ?? toUpguardRating(score100 ?? null);
  const band = getRatingBand(score950);
  const config = RATING_BAND_CONFIG[band];

  if (score950 == null) {
    return (
      <div
        className={cn(
          'inline-flex flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-500',
          size === 'hero' ? 'h-28 w-28' : size === 'lg' ? 'h-20 w-20' : size === 'md' ? 'h-16 w-16' : 'h-12 w-12'
        )}
      >
        <span className={cn('font-bold', size === 'hero' ? 'text-2xl' : 'text-lg')}>—</span>
        <span className="text-[10px]">Unrated</span>
      </div>
    );
  }

  const pct = score950 / 950;
  const dim = size === 'hero' ? 112 : size === 'lg' ? 80 : size === 'md' ? 64 : 48;
  const r = dim / 2 - 6;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg className="-rotate-90" width={dim} height={dim}>
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={size === 'hero' ? 10 : 6}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            className={config.ring}
            strokeWidth={size === 'hero' ? 10 : 6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-bold tabular-nums',
              config.text,
              size === 'hero' ? 'text-3xl' : size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-sm'
            )}
          >
            {score950}
          </span>
          {size !== 'sm' && <span className="text-[10px] text-slate-400">/ 950</span>}
        </div>
      </div>
      {showBand && (
        <span
          className={cn(
            'mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white',
            config.bg
          )}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

export function TprmRatingPill({ score100 }: { score100: number | null }) {
  const score950 = toUpguardRating(score100);
  const band = getRatingBand(score950);
  const config = RATING_BAND_CONFIG[band];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold tabular-nums text-white',
        config.bg
      )}
    >
      {score950 ?? '—'}
    </span>
  );
}

export function TprmRatingDistribution({
  distribution,
}: {
  distribution: { band: RatingBand; count: number }[];
}) {
  const total = distribution.reduce((s, d) => s + d.count, 0) || 1;
  return (
    <div className="space-y-2">
      {distribution
        .filter((d) => d.band !== 'unrated' || d.count > 0)
        .map(({ band, count }) => {
          const config = RATING_BAND_CONFIG[band];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={band} className="flex items-center gap-3 text-xs">
              <span className="w-20 font-medium text-slate-600">{config.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', config.bar)} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right tabular-nums text-slate-500">{count}</span>
            </div>
          );
        })}
    </div>
  );
}

export function TprmRatingTrend({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <p className="text-xs text-slate-400">Complete multiple assessments to see trend</p>;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  const trend = points[points.length - 1] - points[0];

  return (
    <div>
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          fill="none"
          stroke={trend >= 0 ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          points={coords}
        />
      </svg>
      <p className={cn('mt-1 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-600')}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} pts over {points.length} assessments
      </p>
    </div>
  );
}
