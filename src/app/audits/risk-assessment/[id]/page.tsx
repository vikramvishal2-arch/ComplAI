'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import {
  AUDIT_FINDINGS,
  FINDING_SEVERITY_STYLES,
  RISK_LEVEL_STYLES,
  getAuditRiskAssessmentById,
} from '@/lib/data/audits-demo';
import { cn } from '@/lib/utils';
import { ArrowLeft, ListChecks } from 'lucide-react';

export default function AuditRiskAssessmentDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const assessment = id ? getAuditRiskAssessmentById(id) : undefined;

  if (!assessment) {
    return (
      <AppShell title="Risk assessment not found" subtitle="">
        <AuditSubNav />
        <Link
          href="/audits/risk-assessment"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to risk assessments
        </Link>
      </AppShell>
    );
  }

  const linkedFindings = AUDIT_FINDINGS.filter((f) => assessment.linkedFindingIds.includes(f.id));

  return (
    <AppShell
      title={assessment.area}
      subtitle={`Last reviewed ${assessment.lastReviewed} · Owner: ${assessment.owner}`}
    >
      <AuditSubNav />

      <Link
        href="/audits/risk-assessment"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all assessments
      </Link>

      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-600">{assessment.summary}</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Inherent risk">
          <RiskBadge level={assessment.inherentRisk} />
        </MetricCard>
        <MetricCard label="Residual risk">
          <RiskBadge level={assessment.residualRisk} />
        </MetricCard>
        <MetricCard label="Controls tested" value={String(assessment.controlsTested)} />
        <MetricCard label="Gaps identified" value={String(assessment.gapsIdentified)} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ListChecks className="h-5 w-5 text-brand-500" />
          Controls in scope
        </h2>
        <div className="flex flex-wrap gap-2">
          {assessment.controlsInScope.map((control) => (
            <span
              key={control}
              className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700"
            >
              {control}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Identified gaps</h2>
        <div className="space-y-3">
          {assessment.gaps.map((gap) => (
            <article
              key={gap.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-medium text-slate-900">{gap.title}</p>
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
                    FINDING_SEVERITY_STYLES[gap.severity]
                  )}
                >
                  {gap.severity}
                </span>
              </div>
              <p className="mt-2 text-sm capitalize text-slate-500">
                Status: {gap.status.replace('_', ' ')}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Recommendations</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {assessment.recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {linkedFindings.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Linked findings</h2>
          <div className="space-y-2">
            {linkedFindings.map((finding) => (
              <Link
                key={finding.id}
                href="/audits/findings"
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <p className="font-mono text-xs text-slate-500">{finding.id}</p>
                <p className="mt-1 font-medium text-slate-900">{finding.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2">{children ?? <p className="text-2xl font-bold text-slate-900">{value}</p>}</div>
    </div>
  );
}

function RiskBadge({ level }: { level: keyof typeof RISK_LEVEL_STYLES }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        RISK_LEVEL_STYLES[level]
      )}
    >
      {level}
    </span>
  );
}
