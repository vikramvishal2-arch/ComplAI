'use client';

import { cn } from '@/lib/utils';

type RagLevel = 'green' | 'amber' | 'red';

type RiskDimension = {
  id: string;
  label: string;
  short: string;
  score: number;
  level: RagLevel;
  openItems: number;
};

const RISK_DIMENSIONS: RiskDimension[] = [
  { id: 'people', label: 'People & identity', short: 'People', score: 86, level: 'green', openItems: 3 },
  { id: 'cloud', label: 'Cloud & infrastructure', short: 'Cloud', score: 72, level: 'amber', openItems: 5 },
  { id: 'apps', label: 'Applications & APIs', short: 'Apps', score: 68, level: 'amber', openItems: 4 },
  { id: 'data', label: 'Data & privacy', short: 'Data', score: 81, level: 'green', openItems: 2 },
  { id: 'vendors', label: 'Vendor & third-party', short: 'Vendors', score: 58, level: 'red', openItems: 7 },
  { id: 'compliance', label: 'Compliance & audit', short: 'Compliance', score: 78, level: 'amber', openItems: 6 },
  { id: 'detection', label: 'Detection & response', short: 'Detection', score: 74, level: 'amber', openItems: 4 },
  { id: 'governance', label: 'Governance & policy', short: 'Governance', score: 88, level: 'green', openItems: 2 },
];

const SUMMARY = {
  overallScore: 76,
  openRisks: 8,
  highCritical: 3,
  frameworksActive: 4,
  vendorGaps: 2,
};

const levelHex: Record<RagLevel, string> = {
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
};

const levelText: Record<RagLevel, string> = {
  green: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
};

/** Propel Ready landing — org-wide risk radar (no product/platform chrome). */
export function OrganizationRiskProfile() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#2a2d38] via-[#1a1d26] to-[#0a0b10] shadow-2xl shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-medium text-white/60">
              Organization security &amp; risk profile
            </span>
          </div>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            Executive overview
          </span>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
              Risk posture across every dimension
            </p>
            <div className="mt-2 flex flex-1 items-center justify-center">
              <RadarChart dimensions={RISK_DIMENSIONS} />
            </div>
            <RagLegend />
          </div>

          <div className="flex flex-col justify-center">
            <div className="border-b border-white/10 pb-5">
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
                Aggregated across people, technology, vendors, compliance, and operations
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
              <SummaryPill label="Open risks" value={String(SUMMARY.openRisks)} />
              <SummaryPill label="High / critical" value={String(SUMMARY.highCritical)} highlight />
              <SummaryPill label="Frameworks" value={String(SUMMARY.frameworksActive)} />
              <SummaryPill label="Vendor gaps" value={String(SUMMARY.vendorGaps)} />
            </div>

            <div className="mt-5 space-y-2">
              {[...RISK_DIMENSIONS]
                .sort((a, b) => a.score - b.score)
                .slice(0, 3)
                .map((dim) => (
                  <div key={dim.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-white/70">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: levelHex[dim.level] }}
                      />
                      {dim.label}
                    </span>
                    <span className={cn('font-semibold tabular-nums', levelText[dim.level])}>
                      {dim.score}%
                    </span>
                  </div>
                ))}
              <p className="pt-1 text-[11px] text-white/40">Lowest-scoring areas to prioritize</p>
            </div>
          </div>
        </div>

        <p className="border-t border-white/10 px-4 py-4 text-center text-xs text-zinc-500 sm:px-6 sm:text-sm">
          Illustrative view — Propel Ready Solutions helps leadership teams see security and GRC
          posture across every dimension, not in silos.
        </p>
      </div>
    </div>
  );
}

function RadarChart({ dimensions }: { dimensions: RiskDimension[] }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 108;
  const n = dimensions.length;
  const rings = [0.25, 0.5, 0.75, 1];

  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => {
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };

  const ringPolygon = (factor: number) =>
    dimensions
      .map((_, i) => {
        const [x, y] = point(i, radius * factor);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const dataPolygon = dimensions
    .map((dim, i) => {
      const [x, y] = point(i, radius * (dim.score / 100));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-auto w-full max-w-[340px]"
      role="img"
      aria-label="Radar chart of security posture by dimension"
    >
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {rings.map((factor) => (
        <polygon
          key={factor}
          points={ringPolygon(factor)}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={1}
        />
      ))}

      {dimensions.map((_, i) => {
        const [x, y] = point(i, radius);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={dataPolygon}
        fill="url(#radar-fill)"
        stroke="#34d399"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {dimensions.map((dim, i) => {
        const [x, y] = point(i, radius * (dim.score / 100));
        return <circle key={dim.id} cx={x} cy={y} r={3.5} fill={levelHex[dim.level]} />;
      })}

      {dimensions.map((dim, i) => {
        const [x, y] = point(i, radius + 16);
        const a = angleFor(i);
        const cos = Math.cos(a);
        const anchor = Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end';
        return (
          <text
            key={`label-${dim.id}`}
            x={x}
            y={y}
            dy="0.35em"
            textAnchor={anchor}
            className="fill-white/60"
            style={{ fontSize: '10px', fontWeight: 500 }}
          >
            {dim.short}
          </text>
        );
      })}
    </svg>
  );
}

function RagLegend() {
  const items: { level: RagLevel; label: string }[] = [
    { level: 'green', label: 'On track' },
    { level: 'amber', label: 'Needs attention' },
    { level: 'red', label: 'At risk' },
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <span key={item.level} className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: levelHex[item.level] }}
          />
          {item.label}
        </span>
      ))}
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
