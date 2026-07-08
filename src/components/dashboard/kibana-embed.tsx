'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, ChevronDown, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { VULNERABILITY_SEVERITY_STYLES } from '@/lib/data/assurance-demo';
import { cn } from '@/lib/utils';
import { useDemoSession } from '@/hooks/use-demo-session';

interface TermBucket {
  key: string;
  count: number;
}

interface AnalyticsSummary {
  controlsByRag: TermBucket[];
  controlsByFramework: TermBucket[];
  risksBySeverity: TermBucket[];
  vendorsByTier: TermBucket[];
  auditsBySeverity: TermBucket[];
  cyclesByStatus: TermBucket[];
  policiesByStatus: TermBucket[];
  assuranceBySeverity: TermBucket[];
  assuranceVmBySeverity: TermBucket[];
  assuranceDastBySeverity: TermBucket[];
  assuranceByStatus: TermBucket[];
  totals: Record<string, number>;
}

interface ElasticStatus {
  elasticsearch: 'connected' | 'unavailable';
  kibana: 'connected' | 'unavailable';
  dashboardReady: boolean;
  kibanaUrl: string;
  dashboardDirectUrl: string | null;
}

interface SyncResult {
  sync: { success: boolean; indices: Record<string, number>; error?: string };
  kibana: { success: boolean; dataViews: number; visualizations: number; dashboards: number };
  message: string;
}

const RAG_COLORS: Record<string, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  grey: 'bg-slate-400',
  gray: 'bg-slate-400',
};

function BarChart({ title, buckets, colorClass = 'bg-brand-500' }: {
  title: string;
  buckets: TermBucket[];
  colorClass?: string;
}) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  if (buckets.length === 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
        <p className="text-xs font-semibold text-slate-700">{title}</p>
        <p className="mt-3 text-xs text-slate-400">No data — click Sync data</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="text-xs font-semibold text-slate-700 mb-3">{title}</p>
      <div className="space-y-2">
        {buckets.map((b) => (
          <div key={b.key} className="flex items-center gap-2">
            <span className="w-24 shrink-0 truncate text-[10px] text-slate-600" title={b.key}>
              {b.key}
            </span>
            <div className="flex-1 h-4 rounded bg-slate-100 overflow-hidden">
              <div
                className={cn('h-full rounded transition-all', colorClass)}
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-[10px] font-bold text-slate-700">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;

const SEVERITY_BAR_COLORS: Record<string, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-amber-400',
  low: 'bg-slate-400',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Med',
  low: 'Low',
};

function severityBuckets(buckets: TermBucket[]): TermBucket[] {
  return SEVERITY_ORDER.map((level) => ({
    key: level,
    count: buckets.find((b) => b.key.toLowerCase() === level)?.count ?? 0,
  }));
}

function SeverityLegend() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Severity</span>
      {SEVERITY_ORDER.map((level) => (
        <span
          key={level}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
            VULNERABILITY_SEVERITY_STYLES[level]
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', SEVERITY_BAR_COLORS[level])} />
          {SEVERITY_LABELS[level]}
        </span>
      ))}
    </div>
  );
}

function SeverityChart({ title, buckets }: { title: string; buckets: TermBucket[] }) {
  const all = severityBuckets(buckets);
  const total = all.reduce((s, b) => s + b.count, 0);
  const max = Math.max(...all.map((b) => b.count), 1);

  if (total === 0) {
    return (
      <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
        <p className="text-xs font-semibold text-slate-700">{title}</p>
        <p className="mt-3 text-xs text-slate-400">No data — click Sync data</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="text-xs font-semibold text-slate-700 mb-3">{title}</p>

      <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {all.map((b) =>
          b.count > 0 ? (
            <div
              key={b.key}
              className={cn(SEVERITY_BAR_COLORS[b.key], 'transition-all')}
              style={{ width: `${(b.count / total) * 100}%` }}
              title={`${SEVERITY_LABELS[b.key]}: ${b.count}`}
            />
          ) : null
        )}
      </div>

      <div className="space-y-2">
        {all.map((b) => (
          <div key={b.key} className="flex items-center gap-2">
            <span
              className={cn(
                'w-[4.5rem] shrink-0 rounded-full border px-1.5 py-0.5 text-center text-[10px] font-bold',
                VULNERABILITY_SEVERITY_STYLES[b.key as keyof typeof VULNERABILITY_SEVERITY_STYLES]
              )}
            >
              {SEVERITY_LABELS[b.key]}
            </span>
            <div className="flex-1 h-4 rounded bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded transition-all',
                  b.count > 0 ? SEVERITY_BAR_COLORS[b.key] : 'bg-transparent'
                )}
                style={{ width: b.count > 0 ? `${(b.count / max) * 100}%` : '0%' }}
              />
            </div>
            <span
              className={cn(
                'w-8 text-right text-[10px] font-bold',
                b.count > 0 ? 'text-slate-800' : 'text-slate-300'
              )}
            >
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RagChart({ buckets }: { buckets: TermBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.count, 0) || 1;
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <p className="text-xs font-semibold text-slate-700 mb-3">Compliance RAG</p>
      <div className="flex h-4 overflow-hidden rounded-full">
        {buckets.map((b) => (
          <div
            key={b.key}
            className={cn(RAG_COLORS[b.key.toLowerCase()] ?? 'bg-slate-400')}
            style={{ width: `${(b.count / total) * 100}%` }}
            title={`${b.key}: ${b.count}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {buckets.map((b) => (
          <span key={b.key} className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className={cn('h-2 w-2 rounded-full', RAG_COLORS[b.key.toLowerCase()] ?? 'bg-slate-400')} />
            {b.key} ({b.count})
          </span>
        ))}
      </div>
    </div>
  );
}

export function KibanaEmbed() {
  const { isCustomer } = useDemoSession();
  const [status, setStatus] = useState<ElasticStatus | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [expanded, setExpanded] = useState(true);

  const refreshAll = useCallback(async () => {
    const [statusRes, analyticsRes] = await Promise.all([
      fetch('/api/elastic/sync', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/elastic/analytics', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    ]);
    setStatus(statusRes as ElasticStatus | null);
    setAnalytics(analyticsRes as AnalyticsSummary | null);
    return statusRes as ElasticStatus | null;
  }, []);

  useEffect(() => {
    refreshAll().finally(() => setLoading(false));
  }, [refreshAll]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/elastic/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(data as SyncResult);
        await refreshAll();
      } else {
        setSyncResult({
          sync: { success: false, indices: {}, error: data.error },
          kibana: { success: false, dataViews: 0, visualizations: 0, dashboards: 0 },
          message: data.error,
        });
      }
    } catch {
      setSyncResult({
        sync: { success: false, indices: {}, error: 'Network error' },
        kibana: { success: false, dataViews: 0, visualizations: 0, dashboards: 0 },
        message: 'Sync failed',
      });
    } finally {
      setSyncing(false);
    }
  }, [refreshAll]);

  const esAvailable = status?.elasticsearch === 'connected';
  const kibanaAvailable = status?.kibana === 'connected';
  const directUrl = status?.dashboardDirectUrl ?? status?.kibanaUrl;
  const hasData = analytics && analytics.totals.controls > 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-brand-700"
        >
          <BarChart3 className="h-5 w-5 text-brand-500" />
          GRC Analytics
          <ChevronDown className={cn('h-4 w-4 transition-transform text-slate-400', expanded && 'rotate-180')} />
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {loading ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </span>
          ) : (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                hasData ? 'bg-emerald-100 text-emerald-800' : esAvailable ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', hasData ? 'bg-emerald-500' : esAvailable ? 'bg-amber-500' : 'bg-slate-400')} />
              {hasData ? 'Live' : esAvailable ? 'Sync needed' : 'Offline'}
            </span>
          )}

          <button
            type="button"
            onClick={() => refreshAll()}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Retry
          </button>

          {!isCustomer && (
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || !esAvailable}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50"
            >
              {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Sync data
            </button>
          )}

          {kibanaAvailable && directUrl && (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Open in Kibana <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {syncResult && (
        <div
          className={cn(
            'px-5 py-2 text-xs border-b border-slate-100',
            syncResult.sync.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
          )}
        >
          {syncResult.sync.success
            ? `Synced: ${Object.entries(syncResult.sync.indices).map(([k, v]) => `${k} (${v})`).join(' · ')}`
            : `Sync failed: ${syncResult.sync.error}`}
        </div>
      )}

      {expanded && (
        <div className="p-5">
          {!esAvailable ? (
            <div className="py-8 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">Start Elasticsearch & Kibana</p>
              <code className="mt-3 inline-block rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-700">
                npm run analytics:up
              </code>
            </div>
          ) : !hasData ? (
            <div className="py-8 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No analytics data yet</p>
              <p className="mt-1 text-xs text-slate-500">Click Sync data to push GRC data into Elasticsearch.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {Object.entries(analytics.totals).map(([key, val]) => (
                  <div key={key} className="rounded-lg bg-slate-50 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-slate-900">{val}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{key}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <RagChart buckets={analytics.controlsByRag} />
                <BarChart title="Controls by Framework" buckets={analytics.controlsByFramework} />
                <BarChart title="Risks by Severity" buckets={analytics.risksBySeverity} colorClass="bg-orange-500" />
                <BarChart title="Vendors by Tier" buckets={analytics.vendorsByTier} colorClass="bg-violet-500" />
                <BarChart title="Audit Findings" buckets={analytics.auditsBySeverity} colorClass="bg-rose-500" />
                <BarChart title="Program Cycles" buckets={analytics.cyclesByStatus} colorClass="bg-teal-500" />
              </div>

              <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-indigo-800">
                  Assurance
                </p>
                <SeverityLegend />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <SeverityChart
                    title="Assurance by Severity"
                    buckets={analytics.assuranceBySeverity ?? []}
                  />
                  <SeverityChart
                    title="Infrastructure VM — Severity"
                    buckets={analytics.assuranceVmBySeverity ?? []}
                  />
                  <SeverityChart
                    title="Application DAST — Severity"
                    buckets={analytics.assuranceDastBySeverity ?? []}
                  />
                  <BarChart
                    title="Remediation Status"
                    buckets={analytics.assuranceByStatus ?? []}
                    colorClass="bg-teal-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
