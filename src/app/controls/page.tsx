'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { StatusBadge, MethodBadge } from '@/components/ui/badges';
import {
  COMPLIANCE_STATUS_LABELS,
  DOMAIN_LABELS,
  type Control,
  type ControlCompliance,
  type ControlEvidenceHealth,
  type ComplianceStatus,
  type RagStatus,
} from '@/lib/types';
import { Download, Search, AlertTriangle, CheckCircle2, FileWarning } from 'lucide-react';
import { ControlReference } from '@/components/controls/control-reference';
import { cn } from '@/lib/utils';

interface ControlRow extends Control {
  compliance: ControlCompliance;
  framework?: { shortName: string; id: string };
  rag: RagStatus;
  ragLabel: string;
  evidenceHealth: ControlEvidenceHealth;
  goGreenActions?: string[];
}

const RAG_STYLES: Record<RagStatus, string> = {
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-100 text-amber-900 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
};

const EVIDENCE_STYLES: Record<ControlEvidenceHealth['status'], string> = {
  ok: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  not_required: 'bg-slate-50 text-slate-600 border-slate-200',
  missing: 'bg-red-50 text-red-800 border-red-200',
  unreviewed: 'bg-amber-50 text-amber-900 border-amber-200',
  weak: 'bg-orange-50 text-orange-900 border-orange-200',
  mismatched: 'bg-red-50 text-red-900 border-red-300',
};

export default function ControlsPage() {
  const router = useRouter();
  const [controls, setControls] = useState<ControlRow[]>([]);
  const [frameworks, setFrameworks] = useState<{ id: string; shortName: string; activated: boolean }[]>([]);
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ragFilter, setRagFilter] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadControls = useCallback(() => {
    setLoading(true);
    setFetchError(null);

    const params = new URLSearchParams();
    if (frameworkFilter) params.set('frameworkId', frameworkFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (ragFilter) params.set('rag', ragFilter);
    if (evidenceFilter) params.set('evidenceHealth', evidenceFilter);
    if (search) params.set('search', search);

    fetch(`/api/controls?${params}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          throw new Error(d.error ?? 'Failed to load controls');
        }
        return d;
      })
      .then((d) => {
        setControls(Array.isArray(d.controls) ? d.controls : []);
      })
      .catch((err: Error) => {
        setControls([]);
        setFetchError(err.message);
      })
      .finally(() => setLoading(false));
  }, [frameworkFilter, statusFilter, ragFilter, evidenceFilter, search]);

  useEffect(() => {
    fetch('/api/frameworks')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) return;
        setFrameworks(
          Array.isArray(d.frameworks)
            ? d.frameworks.filter((f: { activated: boolean }) => f.activated)
            : []
        );
      })
      .catch(() => setFrameworks([]));
  }, []);

  useEffect(() => {
    loadControls();
  }, [loadControls]);

  const openControl = (controlId: string) => {
    router.push(`/controls/${controlId}`);
  };

  const exportHref = useMemo(() => {
    const params = new URLSearchParams({ format: 'csv', type: 'controls' });
    if (frameworkFilter) params.set('frameworkId', frameworkFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);
    return `/api/export?${params}`;
  }, [frameworkFilter, statusFilter, search]);

  const evidenceIssueCount = controls.filter((c) =>
    ['missing', 'unreviewed', 'weak', 'mismatched'].includes(c.evidenceHealth?.status)
  ).length;

  return (
    <AppShell
      title="Control Register"
      subtitle="RAG posture and evidence health across activated frameworks"
    >
      {evidenceIssueCount > 0 && !loading && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-medium">
              {evidenceIssueCount} control{evidenceIssueCount === 1 ? '' : 's'} need evidence attention
            </p>
            <p className="mt-0.5 text-xs text-amber-900">
              Missing, unreviewed, weak, or mismatched uploads pull RAG toward Amber/Red. Open a
              control and run AI evidence review, or upload the correct artifacts.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search controls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={frameworkFilter}
          onChange={(e) => setFrameworkFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All frameworks</option>
          {frameworks.map((f) => (
            <option key={f.id} value={f.id}>
              {f.shortName}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {(Object.keys(COMPLIANCE_STATUS_LABELS) as ComplianceStatus[]).map((s) => (
            <option key={s} value={s}>
              {COMPLIANCE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={ragFilter}
          onChange={(e) => setRagFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All RAG</option>
          <option value="red">Red</option>
          <option value="amber">Amber</option>
          <option value="green">Green</option>
        </select>
        <select
          value={evidenceFilter}
          onChange={(e) => setEvidenceFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All evidence</option>
          <option value="missing">Missing</option>
          <option value="unreviewed">Not assessed</option>
          <option value="weak">Weak</option>
          <option value="mismatched">Wrong evidence</option>
          <option value="ok">Evidence OK</option>
        </select>
        <a
          href={exportHref}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </a>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Could not load controls</p>
          <p className="mt-1 text-xs">{fetchError}</p>
          <button
            type="button"
            onClick={loadControls}
            className="mt-3 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
          >
            Retry
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">RAG</th>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3">Framework</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Control</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Approach</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    Loading controls…
                  </td>
                </tr>
              ) : controls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    {fetchError ? (
                      'Controls could not be loaded.'
                    ) : (
                      <>
                        No controls found. Activate a framework from the{' '}
                        <Link href="/frameworks" className="text-brand-600 hover:underline">
                          Framework Library
                        </Link>
                        .
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                controls.map((control) => {
                  const health = control.evidenceHealth ?? {
                    status: 'missing' as const,
                    fileCount: 0,
                    reviewedCount: 0,
                    label: 'No evidence',
                    detail: 'No evidence uploaded yet.',
                  };
                  const showWarning = ['missing', 'unreviewed', 'weak', 'mismatched'].includes(
                    health.status
                  );

                  return (
                    <tr
                      key={control.id}
                      className={cn(
                        'hover:bg-slate-50 cursor-pointer',
                        showWarning && health.status === 'mismatched' && 'bg-red-50/40',
                        showWarning && health.status === 'weak' && 'bg-orange-50/30',
                        showWarning && health.status === 'unreviewed' && 'bg-amber-50/20'
                      )}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('a, button')) return;
                        openControl(control.id);
                      }}
                    >
                      <td className="px-4 py-4">
                        <span
                          title={control.ragLabel}
                          className={cn(
                            'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase',
                            RAG_STYLES[control.rag ?? 'amber']
                          )}
                        >
                          {control.rag ?? 'amber'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={cn(
                            'inline-flex max-w-[11rem] items-start gap-1.5 rounded-lg border px-2 py-1',
                            EVIDENCE_STYLES[health.status]
                          )}
                          title={health.detail}
                        >
                          {health.status === 'ok' || health.status === 'not_required' ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold leading-tight">{health.label}</p>
                            <p className="text-[10px] opacity-80">
                              {health.fileCount} file{health.fileCount === 1 ? '' : 's'}
                              {health.reviewedCount > 0
                                ? ` · ${health.reviewedCount} reviewed`
                                : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium">
                          {control.framework?.shortName}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        <ControlReference
                          controlId={control.id}
                          reference={control.reference}
                          frameworkId={control.frameworkId}
                          title={control.title}
                          description={control.description}
                          stopPropagation
                        />
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900 max-w-xs">
                        <Link
                          href={`/controls/${control.id}`}
                          className="hover:text-brand-600 line-clamp-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {control.title}
                        </Link>
                        {showWarning && control.goGreenActions?.[0] && (
                          <p className="mt-1 text-[11px] font-normal text-amber-800 line-clamp-2">
                            {control.goGreenActions[0]}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {DOMAIN_LABELS[control.domain]}
                      </td>
                      <td className="px-4 py-4">
                        <MethodBadge method={control.compliance.complianceMethod} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={control.compliance.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/controls/${control.id}`}
                            className="text-brand-600 hover:underline font-medium text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Configure
                          </Link>
                          <Link
                            href={`/controls/${control.id}?tab=remediation`}
                            className="text-amber-600 hover:underline font-medium text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Remediate →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
