'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { StatusBadge, MethodBadge } from '@/components/ui/badges';
import {
  COMPLIANCE_STATUS_LABELS,
  type ControlCompliance,
  type ComplianceStatus,
  type PrivacyControl,
} from '@/lib/types';
import { Search } from 'lucide-react';
import { PRIVACY_MODULES } from '@/lib/data/modules';

interface ControlRow extends PrivacyControl {
  compliance: ControlCompliance;
  module?: { shortName: string; id: string };
}

export default function ControlsPage() {
  const router = useRouter();
  const [controls, setControls] = useState<ControlRow[]>([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadControls = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    const params = new URLSearchParams();
    if (moduleFilter) params.set('moduleId', moduleFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('search', search);

    fetch(`/api/controls?${params}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load controls');
        return d;
      })
      .then((d) => setControls(Array.isArray(d.controls) ? d.controls : []))
      .catch((err: Error) => {
        setControls([]);
        setFetchError(err.message);
      })
      .finally(() => setLoading(false));
  }, [moduleFilter, statusFilter, search]);

  useEffect(() => {
    loadControls();
  }, [loadControls]);

  const openControl = (controlId: string) => {
    router.push(`/controls/${controlId}`);
  };

  return (
    <AppShell
      title="Control Register"
      subtitle="All privacy controls — click a row to define compliance approach and track status"
    >
      {fetchError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Database unavailable</p>
          <p className="mt-1">{fetchError}. Run <code className="font-mono text-xs">npm run db:setup</code> in privacy-platform.</p>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center flex-1">
        <div className="relative max-w-md flex-1">
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
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All modules</option>
          {PRIVACY_MODULES.map((m) => (
            <option key={m.id} value={m.id}>{m.shortName}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {(Object.keys(COMPLIANCE_STATUS_LABELS) as ComplianceStatus[]).map((s) => (
            <option key={s} value={s}>{COMPLIANCE_STATUS_LABELS[s]}</option>
          ))}
        </select>
        </div>
        <a
          href="/api/export?format=csv"
          className="inline-flex items-center justify-center rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ref</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Control</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Module</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">Loading controls...</td></tr>
            ) : controls.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">No controls match your filters.</td></tr>
            ) : (
              controls.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openControl(c.id)}
                  className="cursor-pointer transition-colors hover:bg-brand-50/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-brand-600">{c.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{c.description}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{c.module?.shortName}</td>
                  <td className="px-4 py-3"><MethodBadge method={c.compliance.complianceMethod} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.compliance.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/controls/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Configure →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
