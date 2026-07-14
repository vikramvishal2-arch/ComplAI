'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { cn } from '@/lib/utils';
import { BarChart3, ChevronRight } from 'lucide-react';

type RiskDomain = {
  id: string;
  name: string;
  owner: string;
  status: string;
  controlRefs: string[];
  severityCounts: Record<'critical' | 'high' | 'medium' | 'low', number>;
  identification: { status: string };
  analysis: { status: string };
  evaluation: { status: string };
};

const STATUS_STYLES: Record<string, string> = {
  complete: 'bg-green-50 text-green-700 border-green-200',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
  not_started: 'bg-slate-50 text-slate-600 border-slate-200',
};

const STAGE_LABELS = ['Identification', 'Analysis', 'Evaluation'] as const;

export default function AuditRiskAssessmentPage() {
  const router = useRouter();
  const [rows, setRows] = useState<RiskDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [launchNote, setLaunchNote] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('/api/audits/risk-assessment')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        setRows(d.domains ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const launchDomains = async () => {
    setCreating(true);
    setLaunchNote(null);
    setError(null);
    try {
      const res = await fetch('/api/audits/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launch: true }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Failed to launch risk assessment');
      const created = typeof d.created === 'number' ? d.created : 0;
      if (created > 0) {
        setLaunchNote(`Launched ${created} risk domain${created === 1 ? '' : 's'} with mapped SOC 2 / ISO controls.`);
      } else {
        setLaunchNote('All 16 risk domains are already in place.');
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to launch risk assessment');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell
      title="Risk assessment"
      subtitle="Assess risk across 16 security domains — identification, analysis, and evaluation per domain"
    >
      <AuditSubNav />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Each domain tracks three process stages. Open a domain to record stage progress, controls, and risk items.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/audits/risk-assessment/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={launchDomains}
            disabled={creating}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {creating ? 'Launching…' : 'Launch risk assessment'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {launchNote && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {launchNote}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Domain</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Stages</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Risk items</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Controls</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Owner</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(loading ? [] : rows).map((row) => {
              const riskTotal =
                row.severityCounts.critical +
                row.severityCounts.high +
                row.severityCounts.medium +
                row.severityCounts.low;
              const stages = [row.identification, row.analysis, row.evaluation];

              return (
                <tr
                  key={row.id}
                  className="cursor-pointer hover:bg-brand-50/60"
                  onClick={() => router.push(`/audits/risk-assessment/${row.id}`)}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/audits/risk-assessment/${row.id}`}
                      className="font-medium text-slate-900 hover:text-brand-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {stages.map((stage, index) => (
                        <span
                          key={STAGE_LABELS[index]}
                          title={`${STAGE_LABELS[index]}: ${stage.status.replace('_', ' ')}`}
                          className={cn(
                            'h-2.5 w-2.5 rounded-full',
                            stage.status === 'complete'
                              ? 'bg-green-500'
                              : stage.status === 'in_progress'
                                ? 'bg-amber-400'
                                : 'bg-slate-300'
                          )}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {riskTotal > 0 ? (
                      <span>
                        {riskTotal}
                        {row.severityCounts.critical > 0 && (
                          <span className="ml-1 text-red-600">({row.severityCounts.critical} crit)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.controlRefs.length}</td>
                  <td className="px-4 py-3 text-slate-600">{row.owner}</td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </td>
                </tr>
              );
            })}
            {loading && (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
                  Loading risk domains…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={7}>
                  No domains yet. Click &quot;Launch risk assessment&quot; to seed 16 security domains.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
        STATUS_STYLES[status] ?? STATUS_STYLES.not_started
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
