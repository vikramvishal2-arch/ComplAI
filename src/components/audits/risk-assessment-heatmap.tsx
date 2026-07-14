'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type DomainHeat = {
  id: string;
  name: string;
  domainKey: string;
  status: string;
  severityCounts: Record<'critical' | 'high' | 'medium' | 'low', number>;
  identification: { status: string };
  analysis: { status: string };
  evaluation: { status: string };
};

const SEVERITY_COLORS = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-amber-400',
  low: 'bg-slate-300',
} as const;

const STAGE_DOT: Record<string, string> = {
  complete: 'bg-green-500',
  in_progress: 'bg-amber-400',
  not_started: 'bg-slate-300',
};

export function RiskAssessmentHeatmap({ domains }: { domains: DomainHeat[] }) {
  if (domains.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
        No risk domains yet. Launch the assessment to seed 16 security domains.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {domains.map((domain) => {
        const total =
          domain.severityCounts.critical +
          domain.severityCounts.high +
          domain.severityCounts.medium +
          domain.severityCounts.low;

        return (
          <Link
            key={domain.id}
            href={`/audits/risk-assessment/${domain.id}`}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/30"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-brand-700">{domain.name}</p>
                <p className="mt-0.5 text-xs capitalize text-slate-500">{domain.status.replace('_', ' ')}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {total} risks
              </span>
            </div>

            <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
              {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
                const count = domain.severityCounts[severity];
                if (count === 0) return null;
                return (
                  <div
                    key={severity}
                    className={cn(SEVERITY_COLORS[severity])}
                    style={{ width: `${(count / Math.max(total, 1)) * 100}%` }}
                    title={`${severity}: ${count}`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
              {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
                <div key={severity}>
                  <p className="font-bold text-slate-700">{domain.severityCounts[severity]}</p>
                  <p className="capitalize text-slate-400">{severity.slice(0, 4)}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500">
              {[
                { label: 'ID', stage: domain.identification.status },
                { label: 'AN', stage: domain.analysis.status },
                { label: 'EV', stage: domain.evaluation.status },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1">
                  <span className={cn('h-2 w-2 rounded-full', STAGE_DOT[item.stage] ?? STAGE_DOT.not_started)} />
                  {item.label}
                </span>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
