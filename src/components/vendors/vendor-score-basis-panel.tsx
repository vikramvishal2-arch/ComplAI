'use client';

import { Info } from 'lucide-react';
import type { ScoreComponent } from '@/lib/vendor/vendor-score-engine';
import { RATING_BAND_LEGEND } from '@/lib/vendor/vendor-score-engine';
import { RATING_BAND_CONFIG } from '@/lib/vendor/tprm-rating';
import type { RatingBand } from '@/lib/vendor/tprm-rating';
import { cn } from '@/lib/utils';

export function VendorScoreBasisPanel({
  components,
  band,
  certificationMetSecurityBaseline,
}: {
  components: ScoreComponent[];
  band: RatingBand;
  certificationMetSecurityBaseline?: boolean;
}) {
  const bandConfig = RATING_BAND_CONFIG[band];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">How this score is calculated</h3>
          <p className="mt-1 text-xs text-slate-500">
            Security rating (0–950 scale) combines public attack-surface intelligence, TPRM questionnaire
            results, and verified certifications. Scores refresh when you sync internet intelligence.
          </p>
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold uppercase text-white', bandConfig.bg)}>
          {bandConfig.label}
        </span>
      </div>

      {certificationMetSecurityBaseline && (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          Verified SOC 2 and/or ISO 27001 attestation detected — security requirements are presumed
          substantially met and the score is in the <strong>green</strong> band (701+).
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {components.map((c) => (
          <li key={c.id} className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{c.label}</p>
              <span className="text-xs font-medium text-slate-500">Weight: {c.weight}</span>
            </div>
            {c.score != null && (
              <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{c.score}/100</p>
            )}
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{c.detail}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rating bands</p>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
          {RATING_BAND_LEGEND.map((row) => (
            <li key={row.band} className="flex flex-wrap gap-x-2">
              <span className={cn('font-semibold', RATING_BAND_CONFIG[row.band].text)}>
                {RATING_BAND_CONFIG[row.band].label}
              </span>
              <span className="text-slate-400">({row.range})</span>
              <span>— {row.meaning}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
