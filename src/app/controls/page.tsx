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
  type ComplianceStatus,
} from '@/lib/types';
import { Download, Search } from 'lucide-react';

interface ControlRow extends Control {
  compliance: ControlCompliance;
  framework?: { shortName: string; id: string };
}

export default function ControlsPage() {
  const router = useRouter();
  const [controls, setControls] = useState<ControlRow[]>([]);
  const [frameworks, setFrameworks] = useState<{ id: string; shortName: string; activated: boolean }[]>([]);
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadControls = useCallback(() => {
    setLoading(true);
    setFetchError(null);

    const params = new URLSearchParams();
    if (frameworkFilter) params.set('frameworkId', frameworkFilter);
    if (statusFilter) params.set('status', statusFilter);
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
  }, [frameworkFilter, statusFilter, search]);

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

  return (
    <AppShell
      title="Control Register"
      subtitle="All controls across activated frameworks — define compliance approach per control"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
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
          <p className="mt-2 text-xs">
            Ensure PostgreSQL is running, then run{' '}
            <code className="rounded bg-amber-100 px-1">npm run db:setup</code> and restart{' '}
            <code className="rounded bg-amber-100 px-1">npm run dev</code>.
          </p>
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
                <th className="px-6 py-3">Framework</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Control</th>
                <th className="px-6 py-3">Domain</th>
                <th className="px-6 py-3">Your approach</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Loading controls…
                  </td>
                </tr>
              ) : controls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
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
                controls.map((control) => (
                  <tr
                    key={control.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('a, button')) return;
                      openControl(control.id);
                    }}
                  >
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium">
                        {control.framework?.shortName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <Link
                        href={`/controls/${control.id}`}
                        className="text-brand-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {control.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                      <Link
                        href={`/controls/${control.id}`}
                        className="hover:text-brand-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {control.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {DOMAIN_LABELS[control.domain]}
                    </td>
                    <td className="px-6 py-4">
                      <MethodBadge method={control.compliance.complianceMethod} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={control.compliance.status} />
                    </td>
                    <td className="px-6 py-4">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
