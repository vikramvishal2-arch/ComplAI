'use client';

import { useMemo, useState } from 'react';
import type { ExecutiveDashboard, ExecutiveDomainSummary, RagStatus } from '@/lib/types';
import { RAG_LABELS } from '@/lib/compliance/rag-status';
import { cn } from '@/lib/utils';

const RAG_COLORS: Record<RagStatus, { fill: string; hover: string; bg: string; text: string }> = {
  green: { fill: '#10b981', hover: '#059669', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  amber: { fill: '#fbbf24', hover: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-900' },
  red: { fill: '#ef4444', hover: '#dc2626', bg: 'bg-red-100', text: 'text-red-800' },
};

type RagFilter = RagStatus | 'all';

interface ExecutiveRagChartsProps {
  data: ExecutiveDashboard;
  selectedRag: RagFilter;
  onRagChange: (rag: RagFilter) => void;
  selectedFrameworkId: string | 'all';
  onFrameworkChange: (id: string | 'all') => void;
}

export function ExecutiveRagCharts({
  data,
  selectedRag,
  onRagChange,
  selectedFrameworkId,
  onFrameworkChange,
}: ExecutiveRagChartsProps) {
  const [hoveredSlice, setHoveredSlice] = useState<RagStatus | null>(null);
  const [hoveredFramework, setHoveredFramework] = useState<string | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const pieSegments = useMemo(
    () =>
      (['green', 'amber', 'red'] as RagStatus[]).map((status) => ({
        status,
        count: data.totals[status],
        pct: data.totals.total
          ? Math.round((data.totals[status] / data.totals.total) * 100)
          : 0,
      })),
    [data.totals]
  );

  const selectedFramework =
    selectedFrameworkId === 'all'
      ? null
      : data.frameworks.find((f) => f.frameworkId === selectedFrameworkId);

  const domainBars = useMemo(() => {
    const source = selectedFramework ?? {
      domains: mergeDomainsAcrossFrameworks(data.frameworks),
    };
    return [...source.domains]
      .sort((a, b) => b.red - a.red || a.readinessPercent - b.readinessPercent)
      .slice(0, 12);
  }, [data.frameworks, selectedFramework]);

  const tooltipSlice = hoveredSlice
    ? pieSegments.find((s) => s.status === hoveredSlice)
    : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Interactive compliance overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Click chart segments to filter · hover for details
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={selectedRag === 'all'}
            onClick={() => onRagChange('all')}
            label="All RAG"
          />
          {(['green', 'amber', 'red'] as RagStatus[]).map((status) => (
            <FilterChip
              key={status}
              active={selectedRag === status}
              onClick={() => onRagChange(selectedRag === status ? 'all' : status)}
              label={status}
              className={RAG_COLORS[status].bg}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center">
          <RagDonutChart
            segments={pieSegments}
            total={data.totals.total}
            selectedRag={selectedRag}
            hoveredSlice={hoveredSlice}
            onSelect={(status) =>
              onRagChange(selectedRag === status ? 'all' : status)
            }
            onHover={setHoveredSlice}
          />
          <div className="mt-4 min-h-[3rem] text-center text-sm">
            {tooltipSlice ? (
              <p className="text-slate-700">
                <span className="font-semibold capitalize">{tooltipSlice.status}</span>
                {' — '}
                {tooltipSlice.count} controls ({tooltipSlice.pct}%)
              </p>
            ) : selectedRag !== 'all' ? (
              <p className="text-slate-600">
                Filtering domains table to{' '}
                <span className="font-semibold capitalize">{selectedRag}</span> only
              </p>
            ) : (
              <p className="text-slate-500">{RAG_LABELS.green.split('—')[0].trim()} distribution</p>
            )}
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-3">
            {pieSegments.map((seg) => (
              <li key={seg.status}>
                <button
                  type="button"
                  onClick={() => onRagChange(selectedRag === seg.status ? 'all' : seg.status)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition',
                    selectedRag === seg.status
                      ? 'ring-2 ring-brand-500 ring-offset-1'
                      : 'hover:bg-slate-100',
                    RAG_COLORS[seg.status].text
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: RAG_COLORS[seg.status].fill }}
                  />
                  {seg.count} {seg.status}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">RAG by framework</h3>
            {selectedFrameworkId !== 'all' && (
              <button
                type="button"
                onClick={() => onFrameworkChange('all')}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Clear framework filter
              </button>
            )}
          </div>
          <FrameworkGroupedBarChart
            frameworks={data.frameworks}
            selectedFrameworkId={selectedFrameworkId}
            hoveredFramework={hoveredFramework}
            onSelect={(id) =>
              onFrameworkChange(selectedFrameworkId === id ? 'all' : id)
            }
            onHover={setHoveredFramework}
          />
          {hoveredFramework && (
            <p className="mt-2 text-xs text-slate-500">
              {data.frameworks.find((f) => f.frameworkId === hoveredFramework)?.frameworkName} — click
              to drill down
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 border-t border-slate-100 pt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Domain breakdown
            {selectedFramework ? ` — ${selectedFramework.frameworkName}` : ' — all frameworks'}
          </h3>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => onFrameworkChange('all')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                selectedFrameworkId === 'all'
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              All
            </button>
            {data.frameworks.map((fw) => (
              <button
                key={fw.frameworkId}
                type="button"
                onClick={() => onFrameworkChange(fw.frameworkId)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                  selectedFrameworkId === fw.frameworkId
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {fw.frameworkName}
              </button>
            ))}
          </div>
        </div>
        <DomainStackedBarChart
          domains={domainBars}
          selectedRag={selectedRag}
          hoveredDomain={hoveredDomain}
          onHover={setHoveredDomain}
        />
      </div>
    </section>
  );
}

function mergeDomainsAcrossFrameworks(
  frameworks: ExecutiveDashboard['frameworks']
): ExecutiveDomainSummary[] {
  const map = new Map<string, ExecutiveDomainSummary>();

  for (const fw of frameworks) {
    for (const d of fw.domains) {
      const existing = map.get(d.domain);
      if (!existing) {
        map.set(d.domain, { ...d });
        continue;
      }
      existing.green += d.green;
      existing.amber += d.amber;
      existing.red += d.red;
      existing.total += d.total;
      existing.readinessPercent = existing.total
        ? Math.round((existing.green / existing.total) * 100)
        : 0;
    }
  }

  return [...map.values()];
}

function FilterChip({
  active,
  onClick,
  label,
  className,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-semibold capitalize transition',
        active ? 'bg-brand-600 text-white shadow-sm' : cn('bg-slate-100 text-slate-700 hover:bg-slate-200', className)
      )}
    >
      {label}
    </button>
  );
}

function RagDonutChart({
  segments,
  total,
  selectedRag,
  hoveredSlice,
  onSelect,
  onHover,
}: {
  segments: { status: RagStatus; count: number; pct: number }[];
  total: number;
  selectedRag: RagFilter;
  hoveredSlice: RagStatus | null;
  onSelect: (status: RagStatus) => void;
  onHover: (status: RagStatus | null) => void;
}) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 100;
  const innerR = 62;

  let angle = -Math.PI / 2;
  const arcs = segments
    .filter((s) => s.count > 0)
    .map((seg) => {
      const sweep = total ? (seg.count / total) * Math.PI * 2 : 0;
      const start = angle;
      angle += sweep;
      return { ...seg, start, end: angle };
    });

  const describeArc = (start: number, end: number, outer: number, inner: number) => {
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + outer * Math.cos(start);
    const y1 = cy + outer * Math.sin(start);
    const x2 = cx + outer * Math.cos(end);
    const y2 = cy + outer * Math.sin(end);
    const x3 = cx + inner * Math.cos(end);
    const y3 = cy + inner * Math.sin(end);
    const x4 = cx + inner * Math.cos(start);
    const y4 = cy + inner * Math.sin(start);
    return [
      `M ${x1} ${y1}`,
      `A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
  };

  const centerLabel =
    selectedRag !== 'all'
      ? segments.find((s) => s.status === selectedRag)
      : null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="select-none">
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={outerR} fill="#f1f5f9" />
      ) : (
        arcs.map((arc) => {
          const isSelected = selectedRag === arc.status;
          const isDimmed = selectedRag !== 'all' && !isSelected;
          const isHovered = hoveredSlice === arc.status;
          return (
            <path
              key={arc.status}
              d={describeArc(arc.start, arc.end, isHovered ? outerR + 4 : outerR, innerR)}
              fill={isHovered ? RAG_COLORS[arc.status].hover : RAG_COLORS[arc.status].fill}
              opacity={isDimmed ? 0.25 : 1}
              stroke="white"
              strokeWidth={2}
              className="cursor-pointer transition-opacity"
              onClick={() => onSelect(arc.status)}
              onMouseEnter={() => onHover(arc.status)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })
      )}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="fill-slate-900 text-2xl font-bold"
        style={{ fontSize: 28, fontWeight: 700 }}
      >
        {centerLabel ? centerLabel.count : total}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        className="fill-slate-500"
        style={{ fontSize: 12 }}
      >
        {centerLabel ? `${centerLabel.pct}% ${centerLabel.status}` : 'controls'}
      </text>
    </svg>
  );
}

function FrameworkGroupedBarChart({
  frameworks,
  selectedFrameworkId,
  hoveredFramework,
  onSelect,
  onHover,
}: {
  frameworks: ExecutiveDashboard['frameworks'];
  selectedFrameworkId: string | 'all';
  hoveredFramework: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const maxTotal = Math.max(...frameworks.map((f) => f.total), 1);
  const chartH = 200;
  const barW = 48;
  const gap = 56;
  const width = frameworks.length * gap + 40;
  const baseY = chartH + 10;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${chartH + 36}`} className="max-h-[240px]">
      {frameworks.map((fw, i) => {
        const x = 24 + i * gap;
        const scale = (n: number) => (n / maxTotal) * chartH;
        const isSelected = selectedFrameworkId === fw.frameworkId;
        const isHovered = hoveredFramework === fw.frameworkId;
        const isDimmed = selectedFrameworkId !== 'all' && !isSelected;

        const stack = [
          { status: 'green' as RagStatus, h: scale(fw.green) },
          { status: 'amber' as RagStatus, h: scale(fw.amber) },
          { status: 'red' as RagStatus, h: scale(fw.red) },
        ];

        let yAcc = baseY;
        return (
          <g
            key={fw.frameworkId}
            opacity={isDimmed ? 0.35 : 1}
            className="cursor-pointer"
            onClick={() => onSelect(fw.frameworkId)}
            onMouseEnter={() => onHover(fw.frameworkId)}
            onMouseLeave={() => onHover(null)}
          >
            {stack.map((part) => {
              yAcc -= part.h;
              if (part.h <= 0) return null;
              return (
                <rect
                  key={part.status}
                  x={x}
                  y={yAcc}
                  width={barW}
                  height={part.h}
                  rx={part.status === 'green' ? 4 : 0}
                  fill={RAG_COLORS[part.status].fill}
                  stroke={isSelected || isHovered ? '#6366f1' : 'white'}
                  strokeWidth={isSelected || isHovered ? 2 : 1}
                />
              );
            })}
            <text
              x={x + barW / 2}
              y={baseY + 16}
              textAnchor="middle"
              style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500 }}
              className="fill-slate-700"
            >
              {fw.frameworkName}
            </text>
            <text
              x={x + barW / 2}
              y={baseY + 28}
              textAnchor="middle"
              style={{ fontSize: 10 }}
              className="fill-slate-400"
            >
              {fw.readiness}% green
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DomainStackedBarChart({
  domains,
  selectedRag,
  hoveredDomain,
  onHover,
}: {
  domains: ExecutiveDomainSummary[];
  selectedRag: RagFilter;
  hoveredDomain: string | null;
  onHover: (domain: string | null) => void;
}) {
  const maxTotal = Math.max(...domains.map((d) => d.total), 1);
  const barHeight = 22;
  const gap = 8;
  const labelW = 140;
  const chartW = 320;
  const height = domains.length * (barHeight + gap) + 8;

  const valueForRag = (d: ExecutiveDomainSummary, rag: RagStatus) => d[rag];

  return (
    <div className="overflow-x-auto">
      <svg width={labelW + chartW + 80} height={height} className="min-w-full">
        {domains.map((d, i) => {
          const y = i * (barHeight + gap) + 4;
          const isHovered = hoveredDomain === d.domain;
          const total = d.total || 1;
          let x = labelW;

          const parts = (['green', 'amber', 'red'] as RagStatus[]).filter((rag) => {
            if (selectedRag !== 'all' && selectedRag !== rag) return false;
            return valueForRag(d, rag) > 0;
          });

          return (
            <g
              key={d.domain}
              onMouseEnter={() => onHover(d.domain)}
              onMouseLeave={() => onHover(null)}
            >
              <text
                x={0}
                y={y + barHeight / 2 + 4}
                style={{ fontSize: 11 }}
                className={cn('fill-slate-700', isHovered && 'font-semibold')}
              >
                {d.domainLabel.length > 18
                  ? `${d.domainLabel.slice(0, 17)}…`
                  : d.domainLabel}
              </text>
              {parts.map((rag) => {
                const count = valueForRag(d, rag);
                const w = (count / maxTotal) * chartW;
                const rect = (
                  <rect
                    key={rag}
                    x={x}
                    y={y}
                    width={Math.max(w, count > 0 ? 4 : 0)}
                    height={barHeight}
                    rx={3}
                    fill={RAG_COLORS[rag].fill}
                    opacity={isHovered ? 1 : 0.92}
                    stroke={isHovered ? '#6366f1' : 'transparent'}
                    strokeWidth={1.5}
                  />
                );
                x += w;
                return rect;
              })}
              <text
                x={labelW + chartW + 8}
                y={y + barHeight / 2 + 4}
                style={{ fontSize: 10 }}
                className="fill-slate-500"
              >
                {isHovered
                  ? `${d.green}G · ${d.amber}A · ${d.red}R`
                  : `${d.readinessPercent}%`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function filterDomainsByRag(
  domains: ExecutiveDomainSummary[],
  rag: RagFilter
): ExecutiveDomainSummary[] {
  if (rag === 'all') return domains;
  return domains
    .map((d) => ({
      ...d,
      green: rag === 'green' ? d.green : 0,
      amber: rag === 'amber' ? d.amber : 0,
      red: rag === 'red' ? d.red : 0,
      total: d[rag],
      readinessPercent: d[rag] && d.total ? Math.round((d[rag] / d.total) * 100) : 0,
    }))
    .filter((d) => d.total > 0);
}
