'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { RiskAssessmentHeatmap } from '@/components/audits/risk-assessment-heatmap';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

type DashboardData = {
  domains: Array<{
    id: string;
    name: string;
    domainKey: string;
    status: string;
    severityCounts: Record<'critical' | 'high' | 'medium' | 'low', number>;
    identification: { status: string };
    analysis: { status: string };
    evaluation: { status: string };
  }>;
  totals: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    domains: number;
    complete: number;
    inProgress: number;
  };
};

type ElasticStatus = {
  elasticsearch: 'connected' | 'unavailable';
  kibana: 'connected' | 'unavailable';
  riskAssessmentDashboardReady?: boolean;
  riskAssessmentDashboardUrl?: string | null;
  riskAssessmentDashboardDirectUrl?: string | null;
};

export default function RiskAssessmentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [elastic, setElastic] = useState<ElasticStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/audits/risk-assessment/dashboard').then((r) => r.json()),
      fetch('/api/elastic/sync').then((r) => r.json()),
    ])
      .then(([dashboard, esStatus]) => {
        if (dashboard.error) throw new Error(dashboard.error);
        setData(dashboard);
        setElastic(esStatus);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const syncToElastic = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/elastic/sync', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Sync failed');
      setSyncMessage(d.message ?? 'Synced to Elasticsearch and Kibana.');
      const statusRes = await fetch('/api/elastic/sync');
      setElastic(await statusRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppShell
      title="Risk assessment dashboard"
      subtitle="Domain heat map with critical / high / medium / low risk counts"
    >
      <AuditSubNav />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/audits/risk-assessment"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to domains
        </Link>
        <button
          type="button"
          onClick={syncToElastic}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sync to Kibana
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}
      {syncMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {syncMessage}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          Loading dashboard…
        </div>
      )}

      {!loading && data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Domains" value={String(data.totals.domains)} />
            <MetricCard label="Critical risks" value={String(data.totals.critical)} accent="text-red-600" />
            <MetricCard label="High risks" value={String(data.totals.high)} accent="text-orange-600" />
            <MetricCard
              label="In progress"
              value={`${data.totals.inProgress} / ${data.totals.domains}`}
              accent="text-amber-600"
            />
          </div>

          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Domain heat map</h2>
            <RiskAssessmentHeatmap domains={data.domains} />
          </section>

          {elastic?.riskAssessmentDashboardUrl && (
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Kibana dashboard</h2>
                {elastic.riskAssessmentDashboardDirectUrl && (
                  <a
                    href={elastic.riskAssessmentDashboardDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                  >
                    Open in Kibana
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <iframe
                title="Risk assessment Kibana dashboard"
                src={elastic.riskAssessmentDashboardUrl}
                className="h-[480px] w-full rounded-b-xl"
              />
            </section>
          )}

          {elastic && !elastic.riskAssessmentDashboardUrl && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              Kibana dashboard not ready. Start Elasticsearch/Kibana (
              <code className="text-xs">docker compose up -d elasticsearch kibana</code>
              ), then click Sync to Kibana.
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ?? 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
