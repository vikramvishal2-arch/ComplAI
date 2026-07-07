'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ChronicleIntelligenceReport } from '@/lib/integrations/chronicle/types';
import { Loader2, Radar, Shield, ExternalLink } from 'lucide-react';
import { ControlReference } from '@/components/controls/control-reference';
import { cn } from '@/lib/utils';

export function ChronicleIntelligencePanel() {
  const [report, setReport] = useState<ChronicleIntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations/chronicle')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d as ChronicleIntelligenceReport;
      })
      .then(setReport)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading Chronicle intelligence…
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        {error ?? 'Chronicle intelligence unavailable'}
      </div>
    );
  }

  const { connection, siemReadiness, domains, priorityItems, intelligenceSummary } = report;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-100 p-2.5">
              <Radar className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Google Chronicle Intelligence</h2>
              <p className="text-sm text-slate-600">
                SecOps posture — ingestion, detection, investigation, and response
              </p>
            </div>
          </div>
          <ConnectionBadge status={connection.statusMessage} configured={connection.configured} />
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
          {intelligenceSummary.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              {line}
            </li>
          ))}
        </ul>
        {!report.frameworkActivated && (
          <Link
            href="/frameworks"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
          >
            Activate Chronicle framework
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </section>

      {connection.configured && (
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <ConfigItem label="GCP Project" value={connection.gcpProjectId || '—'} />
          <ConfigItem label="Instance" value={connection.instance || '—'} />
          <ConfigItem label="Region" value={connection.region} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="SecOps readiness" value={`${siemReadiness.readinessPercent}%`} />
        <Metric label="Green" value={String(siemReadiness.green)} tone="green" />
        <Metric label="Amber" value={String(siemReadiness.amber)} tone="amber" />
        <Metric label="Red" value={String(siemReadiness.red)} tone="red" />
      </div>

      {domains.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold text-slate-900">Domain posture</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {domains.map((d) => (
              <li key={d.domain} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm font-medium text-slate-800">{d.label}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="text-green-600">{d.green}G</span>
                  <span className="text-amber-600">{d.amber}A</span>
                  <span className="text-red-600">{d.red}R</span>
                  <span className="font-medium text-slate-700">{d.readinessPercent}%</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {priorityItems.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold text-slate-900">Priority SecOps gaps</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {priorityItems.map((item) => (
              <li key={item.controlId} className="p-4">
                <ControlReference
                  controlId={item.controlId}
                  reference={item.reference}
                  title={item.title}
                  showTitle
                  className="font-medium text-sm font-sans"
                />
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">Connect live Chronicle API (optional)</p>
        <p className="mt-1">
          Set <code className="rounded bg-slate-200 px-1">CHRONICLE_ENABLED=true</code>, project and
          instance in <code className="rounded bg-slate-200 px-1">.env</code>, and{' '}
          <code className="rounded bg-slate-200 px-1">GOOGLE_APPLICATION_CREDENTIALS</code> for
          service account access to Google SecOps.
        </p>
      </section>
    </div>
  );
}

function ConnectionBadge({
  status,
  configured,
}: {
  status: string;
  configured: boolean;
}) {
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium',
        configured
          ? 'bg-green-100 text-green-800'
          : 'bg-amber-100 text-amber-800'
      )}
    >
      {status}
    </span>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-mono text-sm text-slate-800">{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'green' | 'amber' | 'red';
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          'text-2xl font-bold',
          tone === 'green' && 'text-green-600',
          tone === 'amber' && 'text-amber-600',
          tone === 'red' && 'text-red-600',
          !tone && 'text-slate-900'
        )}
      >
        {value}
      </p>
    </div>
  );
}
