'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
import {
  DAST_FINDINGS,
  getOpenDastCount,
  getOpenInfrastructureCount,
  getUnlinkedFindingsCount,
  INFRASTRUCTURE_VULNERABILITIES,
  JIRA_TICKETS,
} from '@/lib/data/assurance-demo';
import { ArrowRight, Bug, ExternalLink, Plug, Server, ShieldCheck } from 'lucide-react';
import { VaToolIntegrationsPanel } from '@/components/assurance/va-tool-integrations-panel';

export default function AssuranceOverviewPage() {
  const openInfra = getOpenInfrastructureCount();
  const openDast = getOpenDastCount();
  const unlinked = getUnlinkedFindingsCount();
  const openJira = JIRA_TICKETS.filter((t) => t.status !== 'Done').length;
  const criticalCount =
    INFRASTRUCTURE_VULNERABILITIES.filter(
      (v) => v.severity === 'critical' && v.status !== 'remediated' && v.status !== 'accepted'
    ).length +
    DAST_FINDINGS.filter(
      (f) => f.severity === 'critical' && f.status !== 'remediated' && f.status !== 'false_positive'
    ).length;

  return (
    <AppShell
      title="Assurance"
      subtitle="Infrastructure vulnerability management, application DAST, and Jira remediation tracking"
    >
      <AssuranceSubNav />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open infrastructure findings</p>
          <p className="mt-1 text-3xl font-bold text-orange-600">{openInfra}</p>
          <p className="mt-1 text-xs text-slate-500">From Nessus, Qualys, Wiz scanners</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open DAST findings</p>
          <p className="mt-1 text-3xl font-bold text-brand-600">{openDast}</p>
          <p className="mt-1 text-xs text-slate-500">OWASP ZAP, Burp Suite, Acunetix</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Critical vulnerabilities</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{criticalCount}</p>
          <p className="mt-1 text-xs text-slate-500">Require immediate remediation</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Jira tickets</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{openJira}</p>
          <p className="mt-1 text-xs text-slate-500">
            {unlinked > 0 ? `${unlinked} findings without tickets` : 'All findings ticketed'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-slate-900">Infrastructure VM</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Server, network, container, and cloud vulnerabilities from continuous infrastructure
            scanning — CVE tracking, CVSS scoring, and asset context.
          </p>
          <Link
            href="/assurance/infrastructure"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View infrastructure findings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">Application DAST</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Dynamic application security testing across web apps and APIs — OWASP Top 10
            categorization with scan provenance and remediation status.
          </p>
          <Link
            href="/assurance/dast"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View DAST findings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Jira tickets</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Identified vulnerabilities are raised as tickets on your service management platform
            (Jira) with SLA tracking, assignees, and bidirectional status sync.
          </p>
          <Link
            href="/assurance/jira"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View Jira tickets
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-slate-900">VA tool API integrations</h2>
          </div>
          <Link
            href="/assurance/integrations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            Full integrations page
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <VaToolIntegrationsPanel compact />
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">Remediation workflow</h2>
        </div>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '1', label: 'Detect', detail: 'VM and DAST scanners identify vulnerabilities' },
            { step: '2', label: 'Triage', detail: 'Severity, asset criticality, and exploitability assessed' },
            { step: '3', label: 'Ticket', detail: 'Jira issue auto-created with SLA and owner' },
            { step: '4', label: 'Verify', detail: 'Re-scan confirms fix; ticket closed in Jira' },
          ].map((item) => (
            <li key={item.step} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {item.step}
              </span>
              <p className="mt-2 font-semibold text-slate-900">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
