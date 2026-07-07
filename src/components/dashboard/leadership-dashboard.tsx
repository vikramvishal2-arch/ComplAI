'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ReadinessBar } from '@/components/ui/badges';
import {
  ExecutiveRagCharts,
  filterDomainsByRag,
} from '@/components/dashboard/executive-rag-charts';
import type { ExecutiveDashboard, ExecutiveDomainSummary, LeadershipProgramSummaries, RagStatus } from '@/lib/types';
import { parseRiskScoreLabel } from '@/lib/risk/scoring';
import {
  AlertTriangle,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Crown,
  FileText,
  Shield,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnualCyclesPanel } from '@/components/cycles/annual-cycles-panel';
import { GapAnalysisPanel } from '@/components/ai/gap-analysis-panel';
import { KibanaEmbed } from '@/components/dashboard/kibana-embed';
import type { CycleWithReminders, ProgramType } from '@/lib/types';

type RagFilter = RagStatus | 'all';

export function LeadershipDashboard() {
  const [data, setData] = useState<ExecutiveDashboard | null>(null);
  const [programs, setPrograms] = useState<LeadershipProgramSummaries | null>(null);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRag, setSelectedRag] = useState<RagFilter>('all');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | 'all'>('all');
  const [cycles, setCycles] = useState<CycleWithReminders[]>([]);
  const [cyclesLoaded, setCyclesLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/dashboard/executive', { signal: controller.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load leadership dashboard');
        return d as ExecutiveDashboard;
      })
      .then(setData)
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetch('/api/cycles')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) return;
        setCycles(d.cycles as CycleWithReminders[]);
      })
      .catch(() => {})
      .finally(() => setCyclesLoaded(true));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setProgramsLoading(true);
    fetch('/api/dashboard/programs', { signal: controller.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load program summaries');
        return d.programs as LeadershipProgramSummaries;
      })
      .then(setPrograms)
      .catch(() => setPrograms(null))
      .finally(() => setProgramsLoading(false));
    return () => controller.abort();
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

  const overdueCycles = cycles.filter((c) => c.status === 'overdue');
  const dueSoonCycles = cycles.filter(
    (c) => c.status !== 'overdue' && c.status !== 'completed' && c.daysUntilDue <= 30
  );
  const grcHealth = Math.round(
    (data.totals.readinessPercent * 0.5) +
    (riskSummary.openRisks === 0 ? 50 : Math.max(0, 50 - riskSummary.presentHighOrCritical * 10))
  );
  const grcTone = grcHealth >= 75 ? 'emerald' : grcHealth >= 50 ? 'amber' : 'red';

  return (
    <div className="space-y-6">
      {/* ── Hero: Organisation health at a glance ── */}
      <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 via-white to-brand-50/30 px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-brand-100 p-2">
            <Crown className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {data.organizationName}
            </p>
            <p className="text-lg font-bold text-slate-900">GRC Command Center</p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiTile
            label="GRC Health"
            value={`${grcHealth}%`}
            tone={grcTone}
            href="/controls"
          />
          <KpiTile
            label="Compliance"
            value={`${data.totals.readinessPercent}%`}
            sub={`${data.totals.green}G · ${data.totals.amber}A · ${data.totals.red}R`}
            tone={data.totals.readinessPercent >= 70 ? 'emerald' : data.totals.readinessPercent >= 50 ? 'amber' : 'red'}
            href="/controls"
          />
          <KpiTile
            label="Open Risks"
            value={riskSummary.openRisks}
            sub={`${riskSummary.presentHighOrCritical} high/critical`}
            tone={riskSummary.presentHighOrCritical > 0 ? 'red' : 'emerald'}
            href="/risk-register"
          />
          <KpiTile
            label="Vendors"
            value={programs?.tprm.vendorCount ?? '—'}
            sub={programs ? `${programs.tprm.averageRating950 ?? '—'}/950 avg` : undefined}
            tone="slate"
            href="/vendors"
          />
          <KpiTile
            label="Audit Findings"
            value={programs?.audits.openFindings ?? '—'}
            sub={programs ? `${programs.audits.activeInternalPrograms} active` : undefined}
            tone={programs && programs.audits.openFindings > 0 ? 'amber' : 'emerald'}
            href="/audits"
          />
          <KpiTile
            label="Policies"
            value={programs?.policies.approved ?? '—'}
            sub={programs ? `${programs.policies.inReview} in review` : undefined}
            tone={programs && programs.policies.inReview > 0 ? 'amber' : 'emerald'}
            href="/policies"
          />
        </div>
      </section>

      {/* ── Analytics + right sidebar ── */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2 min-w-0 flex flex-col gap-6">
          <KibanaEmbed />

          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Program health</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {programs && (
                <>
                  <CompactProgramCard
                    title="Compliance (RAG)"
                    icon={CheckCircle2}
                    href="/controls"
                    metric={`${data.totals.readinessPercent}%`}
                    metricLabel="green"
                    metricTone={data.totals.readinessPercent >= 70 ? 'emerald' : 'amber'}
                    details={[
                      `${data.totals.green} green · ${data.totals.amber} amber · ${data.totals.red} red`,
                      `${data.totals.total} controls across ${data.frameworks.length} frameworks`,
                    ]}
                  />
                  <CompactProgramCard
                    title="Third-Party Risk"
                    icon={Users}
                    href="/vendors"
                    metric={programs.tprm.averageRating950?.toString() ?? '—'}
                    metricLabel="/950"
                    metricTone={
                      (programs.tprm.averageRating950 ?? 0) >= 701 ? 'emerald' :
                      (programs.tprm.averageRating950 ?? 0) >= 501 ? 'amber' : 'red'
                    }
                    details={[
                      `${programs.tprm.vendorCount} vendors · ${programs.tprm.monitoredCount} monitored`,
                      programs.tprm.criticalFindings > 0
                        ? `${programs.tprm.criticalFindings} critical findings`
                        : `${programs.tprm.openRemediations} open remediations`,
                    ]}
                  />
                  <CompactProgramCard
                    title="Audits & Readiness"
                    icon={ClipboardCheck}
                    href="/audits"
                    metric={programs.audits.openFindings.toString()}
                    metricLabel="open findings"
                    metricTone={programs.audits.openFindings > 0 ? 'red' : 'emerald'}
                    details={[
                      `${programs.audits.activeInternalPrograms} active programs`,
                      `External ready: ${programs.audits.externalReadinessReady}/${programs.audits.externalReadinessTotal}`,
                    ]}
                  />
                  <CompactProgramCard
                    title="Policy Governance"
                    icon={FileText}
                    href="/policies"
                    metric={programs.policies.approved.toString()}
                    metricLabel="approved"
                    metricTone="emerald"
                    details={[
                      `${programs.policies.inReview} in review · ${programs.policies.draft} draft`,
                      `${programs.policies.total} total policies`,
                    ]}
                  />
                </>
              )}
              {!programs && programsLoading && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </>
              )}
            </div>
          </section>

          <AnnualCyclesPanel compact />
        </div>
        <aside className="flex flex-col gap-4 min-w-0 lg:sticky lg:top-4">
          <UpcomingCyclesPanel
            cycles={[...overdueCycles, ...dueSoonCycles]}
            cyclesLoaded={cyclesLoaded}
          />
          <EscalationsPanel items={data.leadershipAttention} />
          <GapAnalysisPanel variant="sidebar" />
          <RiskRemediationPanel riskSummary={riskSummary} />
        </aside>
      </div>

      {/* ── RAG charts ── */}
      <ExecutiveRagCharts
        data={data}
        selectedRag={selectedRag}
        onRagChange={setSelectedRag}
        selectedFrameworkId={selectedFrameworkId}
        onFrameworkChange={setSelectedFrameworkId}
      />

      {/* ── Open audit findings ── */}
      {programs && programs.audits.topFindings.length > 0 && (
        <section className="rounded-xl border border-orange-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">Open audit findings</h3>
            <Link href="/audits/findings" className="text-xs font-medium text-brand-600 hover:underline">
              All findings →
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {programs.audits.topFindings.map((finding) => (
              <Link
                key={finding.id}
                href="/audits/findings"
                className="block rounded-lg border border-slate-100 p-3 hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">{finding.title}</p>
                  <SeverityBadge severity={finding.severity === 'critical' ? 'critical' : finding.severity === 'high' ? 'high' : 'medium'} />
                </div>
                <p className="mt-1 text-xs text-slate-500 capitalize">{finding.source} audit</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Framework detail (collapsible) ── */}
      <FrameworkDetailSection
        frameworks={visibleFrameworks}
        selectedRag={selectedRag}
      />
    </div>
  );
}

function cycleProgramHref(type: ProgramType): string {
  const map: Record<ProgramType, string> = {
    internal_audit: '/audits/internal',
    external_audit: '/audits/external-readiness',
    risk_assessment: '/audits/risk-assessment',
    vendor_assessment: '/vendors',
    risk_register_update: '/risk-register',
  };
  return map[type] ?? '/cycles';
}

function UpcomingCyclesPanel({
  cycles,
  cyclesLoaded,
}: {
  cycles: CycleWithReminders[];
  cyclesLoaded: boolean;
}) {
  const hasOverdue = cycles.some((c) => c.status === 'overdue');
  return (
    <section
      className={cn(
        'rounded-xl border p-4 shadow-sm',
        !cyclesLoaded
          ? 'border-slate-200 bg-white'
          : hasOverdue
            ? 'border-red-200 bg-red-50/40'
            : cycles.length > 0
              ? 'border-amber-200 bg-amber-50/30'
              : 'border-slate-200 bg-white'
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CalendarClock className="h-4 w-4 text-brand-500" />
          Upcoming cycles
        </h3>
        <Link href="/cycles" className="text-xs text-brand-600 hover:underline">View all →</Link>
      </div>
      {!cyclesLoaded ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : cycles.length === 0 ? (
        <p className="text-sm text-emerald-700 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          No overdue or due-soon cycles.
        </p>
      ) : (
        <div className="space-y-1.5">
          {cycles.slice(0, 5).map((cycle) => {
            const isOd = cycle.status === 'overdue';
            return (
              <Link
                key={cycle.id}
                href={cycleProgramHref(cycle.programType)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition',
                  isOd ? 'border-red-200 bg-white hover:bg-red-50' : 'border-amber-200 bg-white hover:bg-amber-50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn('h-2 w-2 rounded-full shrink-0', isOd ? 'bg-red-500' : 'bg-amber-400')} />
                  <span className="font-medium text-slate-900 truncate">{cycle.title}</span>
                </div>
                <span className={cn('text-xs font-semibold whitespace-nowrap shrink-0', isOd ? 'text-red-700' : 'text-amber-700')}>
                  {isOd ? `${Math.abs(cycle.daysUntilDue)}d overdue` : `${cycle.daysUntilDue}d left`}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EscalationsPanel({
  items,
}: {
  items: ExecutiveDashboard['leadershipAttention'];
}) {
  return (
    <section className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          Escalations{items.length > 0 ? ` (${items.length})` : ''}
        </h3>
        {items.length > 0 && (
          <Link href="/intelligence?tab=gaps" className="text-xs text-brand-600 hover:underline">Details →</Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No leadership escalations.</p>
      ) : (
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-red-50/40"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                <p className="text-xs text-slate-500 truncate">{item.description}</p>
              </div>
              <SeverityBadge severity={item.severity} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RiskRemediationPanel({
  riskSummary,
}: {
  riskSummary: ExecutiveDashboard['riskSummary'];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <ShieldAlert className="h-4 w-4 text-brand-500" />
          Risk & remediation
        </h3>
        <Link href="/risk-register" className="text-xs text-brand-600 hover:underline">Full register →</Link>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center mb-3">
        <div className="rounded-lg bg-slate-50 px-2 py-2">
          <p className="text-xl font-bold text-slate-900">{riskSummary.openRisks}</p>
          <p className="text-[10px] text-slate-500 uppercase">Open</p>
        </div>
        <div className="rounded-lg bg-red-50 px-2 py-2">
          <p className="text-xl font-bold text-red-700">{riskSummary.presentHighOrCritical}</p>
          <p className="text-[10px] text-red-600 uppercase">High / critical</p>
        </div>
      </div>
      {riskSummary.items.length > 0 ? (
        <ul className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-thin">
          {riskSummary.items.slice(0, 4).map((risk) => (
            <li key={risk.id}>
              <Link
                href={`/risk-register/risks/${risk.id}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-1.5 hover:bg-slate-50"
              >
                <p className="text-sm text-slate-900 truncate">{risk.title}</p>
                <span className={cn('text-xs font-medium whitespace-nowrap', riskScoreTone(risk.presentRisk))}>
                  {risk.presentRisk}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No open risks in register.</p>
      )}
    </section>
  );
}

function KpiTile({
  label,
  value,
  sub,
  tone,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone: 'emerald' | 'amber' | 'red' | 'slate';
  href: string;
}) {
  const border = {
    emerald: 'border-emerald-200',
    amber: 'border-amber-200',
    red: 'border-red-200',
    slate: 'border-slate-200',
  };
  const valueCn = {
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
    slate: 'text-slate-900',
  };
  return (
    <Link
      href={href}
      className={cn(
        'group rounded-xl border bg-white px-3 py-3 text-center transition hover:shadow-md',
        border[tone]
      )}
    >
      <p className={cn('text-2xl font-bold tabular-nums', valueCn[tone])}>{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-slate-400">{sub}</p>}
    </Link>
  );
}

function CompactProgramCard({
  title,
  icon: Icon,
  href,
  metric,
  metricLabel,
  metricTone,
  details,
}: {
  title: string;
  icon: typeof Shield;
  href: string;
  metric: string;
  metricLabel: string;
  metricTone: 'emerald' | 'amber' | 'red';
  details: string[];
}) {
  const metricColor = {
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="rounded-lg bg-brand-50 p-2 shrink-0">
        <Icon className="h-4 w-4 text-brand-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-700">{title}</p>
        <p className="mt-1">
          <span className={cn('text-xl font-bold tabular-nums', metricColor[metricTone])}>{metric}</span>
          <span className="ml-1 text-xs text-slate-400">{metricLabel}</span>
        </p>
        {details.map((d) => (
          <p key={d} className="text-xs text-slate-500 leading-snug">{d}</p>
        ))}
      </div>
    </Link>
  );
}

function FrameworkDetailSection({
  frameworks,
  selectedRag,
}: {
  frameworks: ExecutiveDashboard['frameworks'];
  selectedRag: RagFilter;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700"
      >
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
        Framework & domain detail ({frameworks.length})
      </button>
      {expanded && (
        <div className="space-y-6">
          {frameworks.length === 0 ? (
            <p className="text-sm text-slate-500">No frameworks match the current chart filter.</p>
          ) : (
            frameworks.map((fw) => (
              <FrameworkDomainPanel key={fw.frameworkId} framework={fw} selectedRag={selectedRag} />
            ))
          )}
        </div>
      )}
    </section>
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
