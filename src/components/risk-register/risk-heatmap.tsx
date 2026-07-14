'use client';

import { cn } from '@/lib/utils';
import {
  RISK_IMPACT_LABELS,
  RISK_LIKELIHOOD_LABELS,
  type RiskImpact,
  type RiskLikelihood,
} from '@/lib/types';
import { calculateRiskScore, riskScoreLabel } from '@/lib/risk/scoring';

const LIKELIHOOD_ORDER: RiskLikelihood[] = [
  'almost_certain',
  'likely',
  'possible',
  'unlikely',
  'rare',
];

const IMPACT_ORDER: RiskImpact[] = [
  'negligible',
  'minor',
  'moderate',
  'major',
  'critical',
];

function cellTone(likelihood: RiskLikelihood, impact: RiskImpact, count: number): string {
  if (count === 0) return 'bg-slate-50 border-slate-200';
  const label = riskScoreLabel(calculateRiskScore(likelihood, impact));
  if (label === 'Critical') return 'bg-red-100 border-red-200';
  if (label === 'High') return 'bg-orange-100 border-orange-200';
  if (label === 'Medium') return 'bg-amber-100 border-amber-200';
  return 'bg-emerald-100 border-emerald-200';
}

function cellFill(likelihood: RiskLikelihood, impact: RiskImpact): string {
  const label = riskScoreLabel(calculateRiskScore(likelihood, impact));
  if (label === 'Critical') return 'bg-red-600';
  if (label === 'High') return 'bg-orange-500';
  if (label === 'Medium') return 'bg-amber-400';
  return 'bg-emerald-500';
}

export function RiskHeatmap({
  counts,
  title = 'Open risks heatmap',
  subtitle = 'Present risk — likelihood (rows) × impact (columns)',
}: {
  counts: Map<string, number>;
  title?: string;
  subtitle?: string;
}) {
  const values = LIKELIHOOD_ORDER.flatMap((l) =>
    IMPACT_ORDER.map((i) => counts.get(`${l}:${i}`) ?? 0)
  );
  const max = Math.max(...values, 1);
  const total = values.reduce((sum, n) => sum + n, 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
        <p className="text-xs font-medium text-slate-600">{total} open risk{total === 1 ? '' : 's'}</p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="mb-2 grid grid-cols-[140px_repeat(5,1fr)] gap-2">
            <div />
            <div className="col-span-5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Impact →
            </div>
          </div>
          <div className="grid grid-cols-[140px_repeat(5,1fr)] gap-2">
            <div className="flex items-end justify-end pb-1 pr-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Likelihood ↑
            </div>
            {IMPACT_ORDER.map((impact) => (
              <div
                key={impact}
                className="text-center text-[10px] font-semibold text-slate-600"
              >
                {RISK_IMPACT_LABELS[impact]}
              </div>
            ))}

            {LIKELIHOOD_ORDER.map((likelihood) => (
              <div key={likelihood} className="contents">
                <div className="flex items-center text-[10px] font-semibold text-slate-600">
                  {RISK_LIKELIHOOD_LABELS[likelihood]}
                </div>
                {IMPACT_ORDER.map((impact) => {
                  const count = counts.get(`${likelihood}:${impact}`) ?? 0;
                  const intensity = count / max;
                  return (
                    <div
                      key={`${likelihood}-${impact}`}
                      className={cn(
                        'relative h-12 overflow-hidden rounded-lg border',
                        cellTone(likelihood, impact, count)
                      )}
                      title={`${RISK_LIKELIHOOD_LABELS[likelihood]} × ${RISK_IMPACT_LABELS[impact]}: ${count} (${riskScoreLabel(calculateRiskScore(likelihood, impact))})`}
                    >
                      {count > 0 && (
                        <div
                          className={cn('absolute inset-0', cellFill(likelihood, impact))}
                          style={{ opacity: Math.min(0.75, Math.max(0.2, intensity)) }}
                        />
                      )}
                      <div className="relative z-10 flex h-full items-center justify-center text-xs font-bold text-slate-900">
                        {count || ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Low
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Medium
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> High
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-600" /> Critical
        </span>
      </div>
    </section>
  );
}
