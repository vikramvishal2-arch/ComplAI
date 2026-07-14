'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { AssuranceSubNav } from '@/components/assurance/assurance-sub-nav';
import { JiraConnectionBanner } from '@/components/assurance/jira-connection-banner';
import { VaToolIntegrationsPanel } from '@/components/assurance/va-tool-integrations-panel';
import type { AssuranceDataMode, AssuranceVulnerability } from '@/lib/assurance/types';
import { ArrowRight, Bug, Cloud, Code2, ExternalLink, Plug, Server, ShieldCheck } from 'lucide-react';

export default function AssuranceOverviewPage() {
  const [mode, setMode] = useState<AssuranceDataMode | null>(null);
  const [configured, setConfigured] = useState(false);
  const [message, setMessage] = useState('Loading connection status…');
  const [vulns, setVulns] = useState<AssuranceVulnerability[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/assurance/vulnerabilities?source=all&status=open')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setMode(data.mode);
        setConfigured(Boolean(data.configured));
        setMessage(data.message ?? '');
        setVulns(data.vulnerabilities ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setMessage('Unable to load assurance status');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const bySource = (source: string) => vulns.filter((v) => v.source === source).length;
  const criticalCount = vulns.filter((v) => v.severity === 'critical').length;

  return (
    <AppShell
      title="Assurance"
      subtitle="SAST, DAST, infrastructure, and cloud scanning with Jira-backed remediation tracking"
    >
      <AssuranceSubNav />

      <JiraConnectionBanner mode={mode} configured={configured} message={message} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open SAST</p>
          <p className="mt-1 text-3xl font-bold text-violet-600">{bySource('sast')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open DAST</p>
          <p className="mt-1 text-3xl font-bold text-teal-600">{bySource('dast')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Infra</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{bySource('infra')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Cloud</p>
          <p className="mt-1 text-3xl font-bold text-sky-600">{bySource('cloud')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Critical open</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{criticalCount}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-slate-900">SAST</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Static analysis findings from CI/CD and code scanners, tracked as open Jira issues.
          </p>
          <Link
            href="/assurance/sast"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View SAST findings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-teal-500" />
            <h2 className="text-lg font-semibold text-slate-900">DAST</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Dynamic application security testing across web apps and APIs with remediation tickets.
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
            <Server className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-900">Infrastructure</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Host and network vulnerabilities from continuous VM scanning — CVE context in Jira.
          </p>
          <Link
            href="/assurance/infrastructure"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View infra findings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-sky-500" />
            <h2 className="text-lg font-semibold text-slate-900">Cloud</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            CSPM and cloud misconfiguration findings across accounts and providers.
          </p>
          <Link
            href="/assurance/cloud"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            View cloud findings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Open vulns &amp; Jira</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Unified open-vulnerability list with severity filters, plus the full Jira ticket board.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/assurance/vulnerabilities"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              Open vulnerabilities
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/assurance/jira"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
            >
              Jira tickets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
            {
              step: '1',
              label: 'Detect',
              detail: 'SAST, DAST, infra, and cloud scanners identify issues',
            },
            {
              step: '2',
              label: 'Triage',
              detail: 'Severity, asset criticality, and exploitability assessed',
            },
            {
              step: '3',
              label: 'Ticket',
              detail: 'Jira issue created with labels (sast|dast|infra|cloud)',
            },
            {
              step: '4',
              label: 'Verify',
              detail: 'Re-scan confirms fix; ticket closed in Jira',
            },
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
