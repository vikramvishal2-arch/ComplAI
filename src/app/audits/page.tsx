'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { ArrowRight, ClipboardCheck, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AuditsOverviewPage() {
  const [programs, setPrograms] = useState<Array<{ status: string }>>([]);
  const [assessments, setAssessments] = useState<Array<{ id: string }>>([]);
  const [findings, setFindings] = useState<Array<{ source: string }>>([]);
  const [readiness, setReadiness] = useState<Array<{ status: string }>>([]);
  const [engagements, setEngagements] = useState<Array<{ type: string; name: string; readiness: number }>>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/audits/internal').then((r) => r.json()),
      fetch('/api/audits/risk-assessment').then((r) => r.json()),
      fetch('/api/audits/findings?source=all').then((r) => r.json()),
      fetch('/api/audits/external-readiness').then((r) => r.json()),
    ]).then(([internal, risk, f, ext]) => {
      setPrograms(internal.programs ?? []);
      setAssessments(risk.domains ?? []);
      setFindings(f.findings ?? []);
      setReadiness(ext.items ?? []);
      setEngagements(ext.engagements ?? []);
    });
  }, []);

  const internalFindings = useMemo(
    () => findings.filter((f) => f.source === 'internal').length,
    [findings]
  );
  const externalFindings = useMemo(
    () => findings.filter((f) => f.source === 'external').length,
    [findings]
  );
  const activeInternal = useMemo(
    () => programs.filter((p) => p.status === 'in_progress').length,
    [programs]
  );
  const readinessReady = useMemo(
    () => readiness.filter((i) => i.status === 'ready').length,
    [readiness]
  );
  const externalEngagements = engagements.filter((e) => e.type === 'external' || !e.type);

  return (
    <AppShell
      title="Audits"
      subtitle="Internal audit, risk assessment, findings, and external audit preparedness"
    >
      <AuditSubNav />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Internal programs active</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{activeInternal}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Risk domains assessed</p>
          <p className="mt-1 text-3xl font-bold text-brand-600">{assessments.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open findings</p>
          <p className="mt-1 text-3xl font-bold text-orange-600">
            {internalFindings + externalFindings}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {internalFindings} internal · {externalFindings} external
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">External readiness items</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{readinessReady}</p>
          <p className="mt-1 text-xs text-slate-500">
            of {readiness.length} ready
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-slate-900">Internal audit</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Planned reviews of access, change management, and vendor controls before external
            fieldwork.
          </p>
          <Link
            href="/audits/internal"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View programs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">Risk assessment</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Fifteen security domains with identification, analysis, and evaluation stages per domain.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/audits/risk-assessment"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              View domains
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/audits/risk-assessment/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-slate-900">Findings</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Internal and external observations with severity, owners, and remediation status.
          </p>
          <Link
            href="/audits/findings"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View all findings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-slate-900">External audit preparedness</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Readiness checklist, evidence packs, and milestones for SOC 2 and ISO engagements.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Next external audit: {externalEngagements[0]?.name || '—'} ({externalEngagements[0]?.readiness ?? 0}%
            ready)
          </p>
          <Link
            href="/audits/external-readiness"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            Open preparedness hub
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
