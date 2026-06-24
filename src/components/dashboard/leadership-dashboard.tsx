'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ReadinessBar } from '@/components/ui/badges';
import {
  ExecutiveRagCharts,
  filterDomainsByRag,
} from '@/components/dashboard/executive-rag-charts';
import type { ExecutiveDashboard, ExecutiveDomainSummary, RagStatus } from '@/lib/types';
import { parseRiskScoreLabel } from '@/lib/risk/scoring';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Crown,
  ShieldAlert,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RagFilter = RagStatus | 'all';

export function LeadershipDashboard() {
  const [data, setData] = useState<ExecutiveDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRag, setSelectedRag] = useState<RagFilter>('all');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | 'all'>('all');

  useEffect(() => {
    fetch('/api/dashboard/executive')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load leadership dashboard');
        return d;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const visibleFrameworks = useMemo(() => {
    if (!data) return [];
    if (selectedFrameworkId === 'all') return data.frameworks;
    return data.frameworks.filter((f) => f.frameworkId === selectedFrameworkId);
  }, [data, selectedFrameworkId]);

  if (!data && !error) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 rounded-xl bg-slate-200" />
        <div className="h-96 rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const riskSummary = data.riskSummary;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-100 p-2.5">
              <Crown className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Leadership view · {data.organizationName}
              </p>
              <p className="text-xl font-bold text-slate-900">
                Compliance posture across activated frameworks
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {data.totals.total} controls · {data.frameworks.length} framework
                {data.frameworks.length === 1 ? '' : 's'} · {data.totals.readinessPercent}% green
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <MiniStat label="Green" value={data.totals.green} tone="green" />
            <MiniStat label="Amber" value={data.totals.amber} tone="amber" />
            <MiniStat label="Red" value={data.totals.red} tone="red" />
            <MiniStat label="Open risks" value={riskSummary.openRisks} tone="amber" />
          </div>
        </div>
      </section>

      <ExecutiveRagCharts
        data={data}
        selectedRag={selectedRag}
        onRagChange={setSelectedRag}
        selectedFrameworkId={selectedFrameworkId}
        onFrameworkChange={setSelectedFrameworkId}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-slate-900">Leadership attention</h2>
          </div>
          {data.leadershipAttention.length === 0 ? (
            <p className="text-sm text-slate-500">No critical escalations at this time.</p>
          ) : (
            <ul className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin">
              {data.leadershipAttention.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block rounded-lg border border-slate-100 p-3 transition hover:border-red-200 hover:bg-red-50/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <SeverityBadge severity={item.severity} />
                      <span className="text-[10px] uppercase text-slate-400">{item.category}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Path to green</h2>
          </div>
          {data.priorityGoGreenActions.length === 0 ? (
            <p className="text-sm text-slate-500">All controls are green or on track.</p>
          ) : (
            <ol className="list-decimal space-y-2 pl-4 text-sm text-slate-700">
              {data.priorityGoGreenActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-brand-500" />
              <h2 className="text-lg font-semibold text-slate-900">Risk register</h2>
            </div>
            <Link href="/risk-register" className="text-xs font-medium text-brand-600 hover:underline">
              Full register →
            </Link>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-900">{riskSummary.openRisks}</p>
              <p className="text-[10px] text-slate-500 uppercase">Open</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-lg font-bold text-red-700">{riskSummary.presentHighOrCritical}</p>
              <p className="text-[10px] text-red-600 uppercase">High / critical</p>
            </div>
          </div>
          {riskSummary.items.length === 0 ? (
            <p className="text-sm text-slate-500">No risks logged.</p>
          ) : (
            <ul className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
              {riskSummary.items.slice(0, 5).map((risk) => (
                <li key={risk.id}>
                  <Link
                    href={`/risk-register/risks/${risk.id}`}
                    className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                  >
                    <p className="text-sm font-medium text-slate-900 truncate">{risk.title}</p>
                    <p className="text-xs text-slate-500">
                      Present:{' '}
                      <span className={riskScoreTone(risk.presentRisk)}>{risk.presentRisk}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Framework & domain detail</h2>
        {visibleFrameworks.length === 0 ? (
          <p className="text-sm text-slate-500">No frameworks match the current chart filter.</p>
        ) : (
          visibleFrameworks.map((fw) => (
            <FrameworkDomainPanel
              key={fw.frameworkId}
              framework={fw}
              selectedRag={selectedRag}
            />
          ))
        )}
      </div>
    </div>
  );
}

function riskScoreTone(value: string | null): string {
  if (!value || value === '—') return 'text-slate-400';
  const label = parseRiskScoreLabel(value);
  if (label === 'Critical') return 'text-red-700 font-semibold';
  if (label === 'High') return 'text-orange-700 font-medium';
  if (label === 'Medium') return 'text-amber-700';
  return 'text-emerald-700';
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'green' | 'amber' | 'red';
}) {
  const styles = {
    green: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    red: 'text-red-700 bg-red-50 border-red-200',
  };
  return (
    <div className={cn('rounded-lg border px-4 py-2 min-w-[5rem] text-center', styles[tone])}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] uppercase opacity-80">{label}</p>
    </div>
  );
}

function FrameworkDomainPanel({
  framework,
  selectedRag,
}: {
  framework: ExecutiveDashboard['frameworks'][number];
  selectedRag: RagFilter;
}) {
  const filteredDomains = filterDomainsByRag(framework.domains, selectedRag);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-500" />
            <h3 className="text-lg font-semibold text-slate-900">{framework.frameworkName}</h3>
            {selectedRag !== 'all' && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 capitalize">
                {selectedRag} filter
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {framework.green} green · {framework.amber} amber · {framework.red} red
          </p>
        </div>
        <div className="w-full max-w-xs">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Readiness</span>
            <span>{framework.readiness}%</span>
          </div>
          <ReadinessBar value={framework.readiness} />
        </div>
      </div>

      {filteredDomains.length === 0 ? (
        <p className="text-sm text-slate-500">No domains match the current filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3 text-center">Green</th>
                <th className="px-4 py-3 text-center">Amber</th>
                <th className="px-4 py-3 text-center">Red</th>
                <th className="px-4 py-3">RAG mix</th>
                <th className="px-4 py-3">Go-green focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDomains.map((domain) => (
                <DomainRow
                  key={domain.domain}
                  domain={domain}
                  frameworkId={framework.frameworkId}
                  highlightRag={selectedRag}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DomainRow({
  domain,
  frameworkId,
  highlightRag,
}: {
  domain: ExecutiveDomainSummary;
  frameworkId: string;
  highlightRag: RagFilter;
}) {
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="px-4 py-3 font-medium text-slate-900">
        <Link href={`/frameworks/${frameworkId}`} className="hover:text-brand-600">
          {domain.domainLabel}
        </Link>
        <p className="text-xs font-normal text-slate-500">{domain.total} controls</p>
      </td>
      <td className="px-4 py-3 text-center">
        <CountPill count={domain.green} status="green" active={highlightRag === 'green'} />
      </td>
      <td className="px-4 py-3 text-center">
        <CountPill count={domain.amber} status="amber" active={highlightRag === 'amber'} />
      </td>
      <td className="px-4 py-3 text-center">
        <CountPill count={domain.red} status="red" active={highlightRag === 'red'} />
      </td>
      <td className="px-4 py-3 min-w-[140px]">
        <RagStackedBar green={domain.green} amber={domain.amber} red={domain.red} compact />
        <p className="mt-1 text-[10px] text-slate-500">{domain.readinessPercent}% green</p>
      </td>
      <td className="px-4 py-3 max-w-sm">
        {domain.goGreenActions.length === 0 ? (
          <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> On track
          </span>
        ) : (
          <ul className="space-y-1 text-xs text-slate-600">
            {domain.goGreenActions.slice(0, 2).map((action) => (
              <li key={action} className="flex gap-1.5">
                <Target className="h-3.5 w-3.5 shrink-0 text-brand-500 mt-0.5" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        )}
      </td>
    </tr>
  );
}

function CountPill({
  count,
  status,
  active,
}: {
  count: number;
  status: RagStatus;
  active?: boolean;
}) {
  if (count === 0) return <span className="text-slate-300">—</span>;
  const styles = {
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-900',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={cn(
        'inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
        styles[status],
        active && 'ring-2 ring-brand-500 ring-offset-1'
      )}
    >
      {count}
    </span>
  );
}

function RagStackedBar({
  green,
  amber,
  red,
  compact = false,
}: {
  green: number;
  amber: number;
  red: number;
  compact?: boolean;
}) {
  const total = green + amber + red;
  if (total === 0) {
    return <div className={cn('rounded-full bg-slate-100', compact ? 'h-2' : 'h-3')} />;
  }
  const gPct = (green / total) * 100;
  const aPct = (amber / total) * 100;
  const rPct = (red / total) * 100;
  return (
    <div
      className={cn('flex overflow-hidden rounded-full bg-slate-100', compact ? 'h-2' : 'h-3')}
      title={`Green ${green}, Amber ${amber}, Red ${red}`}
    >
      {gPct > 0 && <div className="bg-emerald-500" style={{ width: `${gPct}%` }} />}
      {aPct > 0 && <div className="bg-amber-400" style={{ width: `${aPct}%` }} />}
      {rPct > 0 && <div className="bg-red-500" style={{ width: `${rPct}%` }} />}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: 'critical' | 'high' | 'medium' }) {
  const styles = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-amber-100 text-amber-800',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', styles[severity])}>
      {severity}
    </span>
  );
}
