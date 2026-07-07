'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { ReadinessBar } from '@/components/ui/badges';
import { Globe } from 'lucide-react';

interface FrameworkRow {
  id: string;
  name: string;
  shortName: string;
  description: string;
  region: string;
  version: string;
  controlCount: number;
  activated: boolean;
  readiness: number | null;
}

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<FrameworkRow[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = () => {
    fetch('/api/frameworks')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        setFrameworks(d.frameworks ?? []);
      })
      .catch((err: Error) => setFetchError(err.message));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (frameworkId: string, activated: boolean) => {
    setLoading(frameworkId);
    await fetch('/api/frameworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frameworkId, action: activated ? 'deactivate' : 'activate' }),
    });
    load();
    setLoading(null);
  };

  return (
    <AppShell
      title="Regulatory Frameworks"
      subtitle="Activate frameworks and track readiness — click a card to view mapped controls"
    >
      {fetchError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {fetchError}. Run <code className="font-mono text-xs">npm run db:setup</code>.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {frameworks.map((f) => (
          <div key={f.id} className="privacy-card">
            <div className="flex items-start justify-between gap-4">
              <Link href={`/frameworks/${f.id}`} className="min-w-0 flex-1 text-left hover:text-brand-700">
                <h2 className="text-xl font-bold text-zinc-900">{f.name}</h2>
                <p className="mt-0.5 text-sm font-medium text-brand-600">{f.shortName}</p>
              </Link>
              <div className="flex flex-col items-end gap-2">
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Globe className="h-3.5 w-3.5" />{f.region}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(f.id, f.activated)}
                  disabled={loading === f.id}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${
                    f.activated
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200'
                  }`}
                >
                  {f.activated ? 'Active' : 'Activate'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">{f.description}</p>
            {f.activated && f.readiness !== null && (
              <div className="mt-4"><ReadinessBar value={f.readiness} /></div>
            )}
            <Link
              href={`/frameworks/${f.id}`}
              className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              {f.controlCount} controls →
            </Link>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
