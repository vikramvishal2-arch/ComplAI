'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Play, Cloud, CheckCircle2, XCircle, AlertTriangle, MinusCircle } from 'lucide-react';
import { ControlReference } from '@/components/controls/control-reference';
import { cn } from '@/lib/utils';

interface MonitorConfig {
  aws: { enabled: boolean; configured: boolean; region: string };
  azure: { enabled: boolean; configured: boolean; subscriptionId: string };
  anyConfigured: boolean;
}

interface CheckResult {
  id: string;
  checkId: string;
  checkName: string;
  controlId: string | null;
  status: string;
  message: string;
  remediation: string;
}

interface MonitorRun {
  id: string;
  provider: string;
  status: string;
  passed: number;
  failed: number;
  errors: number;
  summary: string;
  startedAt: string;
  completedAt: string | null;
  results?: CheckResult[];
}

export function MonitoringPanel() {
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [latestAws, setLatestAws] = useState<MonitorRun | null>(null);
  const [latestAzure, setLatestAzure] = useState<MonitorRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<'aws' | 'azure' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/monitoring/status')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d;
      })
      .then((d) => {
        setConfig(d.config);
        setLatestAws(d.dashboard.latestAws);
        setLatestAzure(d.dashboard.latestAzure);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runChecks = async (provider: 'aws' | 'azure') => {
    setRunning(provider);
    setError(null);
    try {
      const r = await fetch('/api/monitoring/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Run failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed');
    } finally {
      setRunning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading monitoring status…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Continuous Control Monitoring</h2>
        <p className="mt-1 text-sm text-slate-600">
          Run read-only AWS and Azure compliance checks mapped to your activated controls. Ideal for
          lab accounts or production with least-privilege IAM / service principals.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {!config?.anyConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Cloud credentials not configured</p>
          <p className="mt-1">
            Set <code className="rounded bg-amber-100 px-1">AWS_MONITOR_ENABLED=true</code> or{' '}
            <code className="rounded bg-amber-100 px-1">AZURE_MONITOR_ENABLED=true</code> in{' '}
            <code className="rounded bg-amber-100 px-1">.env</code> — see{' '}
            <code className="rounded bg-amber-100 px-1">.env.example</code> for lab setup.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ProviderCard
          name="Amazon Web Services"
          configured={config?.aws.configured ?? false}
          region={config?.aws.region}
          latest={latestAws}
          running={running === 'aws'}
          onRun={() => runChecks('aws')}
        />
        <ProviderCard
          name="Microsoft Azure"
          configured={config?.azure.configured ?? false}
          region={config?.azure.subscriptionId ? `Sub: ${config.azure.subscriptionId.slice(0, 8)}…` : undefined}
          latest={latestAzure}
          running={running === 'azure'}
          onRun={() => runChecks('azure')}
        />
      </div>
    </div>
  );
}

function ProviderCard({
  name,
  configured,
  region,
  latest,
  running,
  onRun,
}: {
  name: string;
  configured: boolean;
  region?: string;
  latest: MonitorRun | null;
  running: boolean;
  onRun: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-brand-600" />
          <div>
            <h3 className="font-semibold text-slate-900">{name}</h3>
            {region && <p className="text-xs text-slate-500">{region}</p>}
          </div>
        </div>
        <button
          type="button"
          disabled={!configured || running}
          onClick={onRun}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            configured
              ? 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run checks
        </button>
      </div>

      {latest ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="text-green-700">{latest.passed} passed</span>
            <span className="text-red-700">{latest.failed} failed</span>
            <span className="text-amber-700">{latest.errors} errors</span>
            <span className="text-slate-400">
              {new Date(latest.startedAt).toLocaleString()}
            </span>
          </div>
          <ul className="space-y-2">
            {(latest.results ?? []).map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <StatusIcon status={r.status} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{r.checkName}</p>
                    <p className="mt-0.5 text-slate-600">{r.message}</p>
                    {r.controlId && (
                      <div className="mt-1">
                        <ControlReference controlId={r.controlId} className="text-xs" />
                      </div>
                    )}
                    {r.status === 'fail' && r.remediation && (
                      <p className="mt-1 text-xs text-slate-500">Fix: {r.remediation}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No runs yet.</p>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'pass') return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />;
  if (status === 'fail') return <XCircle className="h-4 w-4 shrink-0 text-red-600" />;
  if (status === 'skipped') return <MinusCircle className="h-4 w-4 shrink-0 text-slate-400" />;
  return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />;
}

export function MonitoringPanelCompact() {
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/monitoring/status')
      .then((r) => r.json())
      .then((d) => {
        const aws = d.dashboard?.latestAws;
        const azure = d.dashboard?.latestAzure;
        const parts: string[] = [];
        if (aws) parts.push(`AWS: ${aws.summary || `${aws.passed}P/${aws.failed}F`}`);
        if (azure) parts.push(`Azure: ${azure.summary || `${azure.passed}P/${azure.failed}F`}`);
        setSummary(parts.length ? parts.join(' · ') : null);
      })
      .catch(() => setSummary(null));
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Cloud monitoring</h3>
        <Link href="/intelligence?tab=monitoring" className="text-sm text-brand-600 hover:underline">
          Open
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        {summary ?? 'Run AWS/Azure compliance checks from the Monitoring tab.'}
      </p>
    </section>
  );
}
