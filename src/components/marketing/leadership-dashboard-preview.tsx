'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Crown,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { ExecutiveRagCharts } from '@/components/dashboard/executive-rag-charts';
import { MARKETING_LEADERSHIP_DASHBOARD_PREVIEW } from '@/lib/data/marketing-leadership-dashboard-preview';
import type { RagStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type RagFilter = RagStatus | 'all';

/** Leadership dashboard snippet for marketing — same UI as `/dashboard`. */
export function LeadershipDashboardPreview({ embedded = false }: { embedded?: boolean }) {
  const data = MARKETING_LEADERSHIP_DASHBOARD_PREVIEW;
  const [selectedRag, setSelectedRag] = useState<RagFilter>('all');
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | 'all'>('all');

  const body = (
    <div
      className={cn(
        'overflow-y-auto bg-slate-50/80 p-4 sm:p-6',
        embedded ? 'max-h-[min(640px,65vh)]' : 'max-h-[min(720px,70vh)]'
      )}
    >
          <div className="space-y-6">
            <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-100 p-2.5">
                    <Crown className="h-6 w-6 text-brand-600 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                      Leadership view · {data.organizationName}
                    </p>
                    <p className="text-lg font-bold text-slate-900 sm:text-xl">
                      Compliance posture across activated frameworks
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {data.totals.total} controls · {data.frameworks.length} frameworks ·{' '}
                      {data.totals.readinessPercent}% green
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <MiniStat label="Green" value={data.totals.green} tone="green" />
                  <MiniStat label="Amber" value={data.totals.amber} tone="amber" />
                  <MiniStat label="Red" value={data.totals.red} tone="red" />
                  <MiniStat label="Open risks" value={data.riskSummary.openRisks} tone="amber" />
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

            <div className="grid gap-4 md:grid-cols-3">
              <PreviewPanel
                title="Leadership attention"
                icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
                borderClass="border-red-200"
              >
                <ul className="space-y-2">
                  {data.leadershipAttention.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-slate-100 bg-white p-3 text-sm"
                    >
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </PreviewPanel>

              <PreviewPanel
                title="Path to green"
                icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
                borderClass="border-emerald-200"
              >
                <ol className="list-decimal space-y-1.5 pl-4 text-sm text-slate-700">
                  {data.priorityGoGreenActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ol>
              </PreviewPanel>

              <PreviewPanel
                title="Risk register"
                icon={<ShieldAlert className="h-5 w-5 text-brand-500" />}
                borderClass="border-slate-200"
              >
                <div className="mb-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-lg font-bold text-slate-900">{data.riskSummary.openRisks}</p>
                    <p className="text-[10px] uppercase text-slate-500">Open</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2">
                    <p className="text-lg font-bold text-red-700">
                      {data.riskSummary.presentHighOrCritical}
                    </p>
                    <p className="text-[10px] uppercase text-red-600">High / critical</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {data.riskSummary.items.map((risk) => (
                    <li key={risk.id} className="rounded-lg border border-slate-100 px-3 py-2">
                      <p className="font-medium text-slate-900">{risk.title}</p>
                      <p className="text-xs text-slate-500">Present: {risk.presentRisk}</p>
                    </li>
                  ))}
                </ul>
              </PreviewPanel>
            </div>
          </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-sm">
        {body}
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-white shadow-2xl shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-medium text-slate-600">Leadership dashboard</span>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
            ComplAI preview
          </span>
        </div>

        {body}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500 sm:text-sm">
            Interactive preview — live leadership view in ComplAI
          </p>
          <Link
            href="/platform"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Explore ComplAI platform →
          </Link>
        </div>
      </div>
    </div>
  );
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
    <div className={cn('rounded-lg border px-3 py-2 min-w-[4.5rem] text-center sm:min-w-[5rem]', styles[tone])}>
      <p className="text-lg font-bold sm:text-xl">{value}</p>
      <p className="text-[10px] uppercase opacity-80">{label}</p>
    </div>
  );
}

function PreviewPanel({
  title,
  icon,
  borderClass,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  borderClass: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-xl border bg-white p-4 shadow-sm sm:p-5', borderClass)}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
