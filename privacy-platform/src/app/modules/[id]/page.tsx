'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { NavCard } from '@/components/ui/nav-card';
import { getModuleById } from '@/lib/data/modules';
import { NIST_FUNCTION_LABELS, type ControlCompliance, type PrivacyControl } from '@/lib/types';
import { NistBadge, StatusBadge, ReadinessBar } from '@/components/ui/badges';
import { ShieldAlert, FileSearch } from 'lucide-react';

type ControlRow = PrivacyControl & { compliance: ControlCompliance };

export default function ModuleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const mod = getModuleById(id);

  const [controls, setControls] = useState<ControlRow[]>([]);
  const [readiness, setReadiness] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/controls?moduleId=${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d;
      })
      .then((d) => {
        const rows: ControlRow[] = d.controls ?? [];
        setControls(rows);
        const ready = rows.filter((c) =>
          ['implemented', 'audit_ready', 'not_applicable'].includes(c.compliance.status)
        ).length;
        setReadiness(rows.length ? Math.round((ready / rows.length) * 100) : 0);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (mod) load();
  }, [mod, load]);

  if (!mod) {
    return (
      <AppShell title="Module not found" subtitle="">
        <p className="text-sm text-slate-600">This module does not exist.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={mod.name} subtitle={mod.description}>
      <div className="mb-6 flex flex-wrap gap-2">
        <NistBadge label={NIST_FUNCTION_LABELS[mod.nistFunction]} />
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {controls.length} controls
        </span>
      </div>

      <div className="mb-8 max-w-md">
        <ReadinessBar value={readiness} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Capabilities</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {mod.capabilities.map((cap) => (
            <div key={cap} className="flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {cap}
            </div>
          ))}
        </div>
      </section>

      {id === 'risk-dpia' && (
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <NavCard href="/privacy-risks" className="flex items-start gap-3 p-5">
            <ShieldAlert className="h-8 w-8 text-brand-600" />
            <div>
              <h3 className="font-semibold text-zinc-900">Privacy Risk Register</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Full register with risk ID, source, inherent/residual ratings, treatment plans, and linked RoPA/DPIA entries.
              </p>
            </div>
          </NavCard>
          <NavCard href="/dpias" className="flex items-start gap-3 p-5">
            <FileSearch className="h-8 w-8 text-brand-600" />
            <div>
              <h3 className="font-semibold text-zinc-900">DPIA Register</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Data Protection Impact Assessments with necessity, DPO consultation, mitigation measures, and review dates.
              </p>
            </div>
          </NavCard>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Controls — click to configure
        </h2>
        {error && <p className="mb-4 text-sm text-amber-700">{error}</p>}
        {loading ? (
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
        ) : (
          <div className="space-y-2">
            {controls.map((c) => (
              <NavCard key={c.id} href={`/controls/${c.id}`} className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-brand-600">{c.reference}</span>
                  <h3 className="font-semibold text-zinc-900">{c.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{c.description}</p>
                </div>
                <StatusBadge status={c.compliance.status} />
              </NavCard>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
