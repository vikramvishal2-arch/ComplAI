'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { NavCard } from '@/components/ui/nav-card';
import { getFrameworkById } from '@/lib/data/frameworks';
import { getModuleById } from '@/lib/data/modules';
import { StatusBadge, FrameworkBadge } from '@/components/ui/badges';
import type { ControlCompliance, PrivacyControl } from '@/lib/types';

type ControlRow = PrivacyControl & { compliance: ControlCompliance };

export default function FrameworkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const framework = getFrameworkById(id);

  const [controls, setControls] = useState<ControlRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/controls?frameworkId=${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d;
      })
      .then((d) => setControls(d.controls ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (framework) load();
  }, [framework, load]);

  if (!framework) {
    return (
      <AppShell title="Framework not found" subtitle="">
        <p className="text-sm text-slate-600">This framework does not exist.</p>
      </AppShell>
    );
  }

  const byModule = controls.reduce<Record<string, ControlRow[]>>((acc, c) => {
    if (!acc[c.moduleId]) acc[c.moduleId] = [];
    acc[c.moduleId].push(c);
    return acc;
  }, {});

  return (
    <AppShell
      title={framework.name}
      subtitle={`${framework.region} · ${framework.version}`}
    >
      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-900">
        {framework.description}
      </div>

      {error && <p className="mb-4 text-sm text-amber-700">{error}</p>}

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
      ) : (
        <div className="space-y-8">
          {Object.entries(byModule).map(([moduleId, moduleControls]) => {
            const mod = getModuleById(moduleId);
            return (
              <section key={moduleId}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900">{mod?.name ?? moduleId}</h2>
                  <Link
                    href={`/modules/${moduleId}`}
                    className="text-sm text-brand-600 hover:text-brand-700"
                  >
                    Open module →
                  </Link>
                </div>
                <div className="space-y-2">
                  {moduleControls.map((c) => {
                    const mapping = c.frameworkMappings.find((m) => m.frameworkId === id);
                    return (
                      <NavCard
                        key={c.id}
                        href={`/controls/${c.id}`}
                        className="flex items-start justify-between gap-2 !p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs text-brand-600">{mapping?.reference}</span>
                          <p className="font-medium text-zinc-900">{c.title}</p>
                          <p className="mt-0.5 text-sm text-zinc-500">{c.description}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <FrameworkBadge name={c.reference} />
                          <StatusBadge status={c.compliance.status} />
                        </div>
                      </NavCard>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
