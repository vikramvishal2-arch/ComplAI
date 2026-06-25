'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ComplAIBrandLink, ComplAIStyled } from '@/components/marketing/complai-brand-link';

type RagLevel = 'green' | 'amber' | 'red';

type RiskDimension = {
  id: string;
  label: string;
  score: number;
  level: RagLevel;
  openItems: number;
};

const RISK_DIMENSIONS: RiskDimension[] = [
  { id: 'people', label: 'People & identity', score: 86, level: 'green', openItems: 3 },
  { id: 'cloud', label: 'Cloud & infrastructure', score: 72, level: 'amber', openItems: 5 },
  { id: 'apps', label: 'Applications & APIs', score: 68, level: 'amber', openItems: 4 },
  { id: 'data', label: 'Data & privacy', score: 81, level: 'green', openItems: 2 },
  { id: 'vendors', label: 'Vendor & third-party', score: 58, level: 'red', openItems: 7 },
  { id: 'compliance', label: 'Compliance & audit', score: 78, level: 'amber', openItems: 6 },
  { id: 'detection', label: 'Detection & response', score: 74, level: 'amber', openItems: 4 },
  { id: 'governance', label: 'Governance & policies', score: 88, level: 'green', openItems: 2 },
];

const SUMMARY = {
  overallScore: 76,
  openRisks: 8,
  highCritical: 3,
  frameworksActive: 4,
  vendorGaps: 2,
};

const levelColor: Record<RagLevel, string> = {
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-400',
};

const levelText: Record<RagLevel, string> = {
  green: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
};

export function HeroDashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-scrut-navy-light/90 shadow-2xl shadow-black/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-medium text-white/60">
              Organization security & risk profile
            </span>
          </div>
          <Link
            href="/platform"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-zinc-300 transition-colors hover:border-scrut-teal/40 hover:text-white"
          >
            Powered by <ComplAIStyled className="text-[11px] font-semibold" />
          </Link>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45">
                Overall posture
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular-nums text-white sm:text-5xl">
                  {SUMMARY.overallScore}%
                </span>
                <span className="text-sm font-medium text-amber-400">Needs attention</span>
              </div>
              <p className="mt-1 text-xs text-white/50">
                Aggregated across all security dimensions for your organization
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <SummaryPill label="Open risks" value={String(SUMMARY.openRisks)} />
              <SummaryPill label="High / critical" value={String(SUMMARY.highCritical)} highlight />
              <SummaryPill label="Frameworks" value={String(SUMMARY.frameworksActive)} />
              <SummaryPill label="Vendor gaps" value={String(SUMMARY.vendorGaps)} />
            </div>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
            Risk profile by dimension
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {RISK_DIMENSIONS.map((dim) => (
              <DimensionRow key={dim.id} dimension={dim} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-sm text-zinc-400">
              See every dimension in one view with{' '}
              <ComplAIBrandLink inheritWeight className="text-sm" /> — leadership dashboards, risk
              register, and live control status.
            </p>
            <Link
              href="/platform"
              className="shrink-0 text-sm font-semibold text-scrut-teal hover:underline"
            >
              Open platform →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-center',
        highlight ? 'border-red-400/30 bg-red-400/10' : 'border-white/10 bg-white/[0.05]'
      )}
    >
      <p className="text-lg font-bold tabular-nums text-white">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">{label}</p>
    </div>
  );
}

function DimensionRow({ dimension }: { dimension: RiskDimension }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-white/90">{dimension.label}</p>
          <p className="mt-0.5 text-[11px] text-white/45">
            {dimension.openItems} open item{dimension.openItems === 1 ? '' : 's'}
          </p>
        </div>
        <span className={cn('text-sm font-bold tabular-nums', levelText[dimension.level])}>
          {dimension.score}%
        </span>
      </div>
      <div className="mt-2.5 h-1.5 rounded-full bg-white/10">
        <div
          className={cn('h-1.5 rounded-full transition-all', levelColor[dimension.level])}
          style={{ width: `${dimension.score}%` }}
        />
      </div>
    </div>
  );
}
