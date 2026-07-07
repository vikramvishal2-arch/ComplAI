'use client';

import { cn } from '@/lib/utils';

export function VendorSecurityRatingGauge({
  score,
  grade,
  upguardScale,
  size = 'lg',
}: {
  score: number | null;
  grade: string;
  upguardScale: number | null;
  size?: 'sm' | 'lg';
}) {
  const display = score ?? 0;
  const color =
    display >= 80 ? 'text-emerald-600' : display >= 60 ? 'text-amber-600' : 'text-red-600';
  const ring =
    display >= 80 ? 'stroke-emerald-500' : display >= 60 ? 'stroke-amber-500' : 'stroke-red-500';

  const dim = size === 'lg' ? 120 : 80;
  const r = size === 'lg' ? 52 : 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (display / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg className="-rotate-90" width={dim} height={dim}>
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            className={ring}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', color, size === 'lg' ? 'text-3xl' : 'text-xl')}>
            {score != null ? grade || display : '—'}
          </span>
          {score != null && size === 'lg' && (
            <span className="text-xs text-slate-500">{display}/100</span>
          )}
        </div>
      </div>
      {upguardScale != null && size === 'lg' && (
        <p className="mt-2 text-xs text-slate-500">Security rating: {upguardScale}/950</p>
      )}
    </div>
  );
}
