'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import {
  AUDIT_ENGAGEMENTS,
  AUDIT_FINDINGS,
  AUDIT_RISK_ASSESSMENTS,
  EXTERNAL_READINESS_CHECKLIST,
  INTERNAL_AUDIT_PROGRAMS,
} from '@/lib/data/audits-demo';
import { ArrowRight, ClipboardCheck, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AuditsOverviewPage() {
  const internalFindings = AUDIT_FINDINGS.filter((f) => f.source === 'internal').length;
  const externalFindings = AUDIT_FINDINGS.filter((f) => f.source === 'external').length;
  const activeInternal = INTERNAL_AUDIT_PROGRAMS.filter((p) => p.status === 'in_progress').length;
  const readinessReady = EXTERNAL_READINESS_CHECKLIST.filter((i) => i.status === 'ready').length;
  const externalEngagements = AUDIT_ENGAGEMENTS.filter((e) => e.type === 'external');

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
          <p className="text-sm text-slate-500">Risk areas assessed</p>
          <p className="mt-1 text-3xl font-bold text-brand-600">{AUDIT_RISK_ASSESSMENTS.length}</p>
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
            of {EXTERNAL_READINESS_CHECKLIST.length} ready
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
            Inherent vs residual risk by domain with control testing coverage and gap counts.
          </p>
          <Link
            href="/audits/risk-assessment"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View assessments
            <ArrowRight className="h-4 w-4" />
          </Link>
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
            Next external audit: {externalEngagements[0]?.name} ({externalEngagements[0]?.readiness}%
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
