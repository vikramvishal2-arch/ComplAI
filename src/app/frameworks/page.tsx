'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { ReadinessBar } from '@/components/ui/badges';
import { CATEGORY_LABELS, type Framework } from '@/lib/types';
import { Globe, Plus, Star, Eye } from 'lucide-react';
import { useDemoSession } from '@/hooks/use-demo-session';

interface FrameworkWithMeta extends Framework {
  activated: boolean;
  mvpRequired?: boolean;
  readiness: number | null;
}

export default function FrameworksPage() {
  const { isCustomer, isReadOnlyArea } = useDemoSession();
  const readOnly = isCustomer || isReadOnlyArea('frameworks');
  const [frameworks, setFrameworks] = useState<FrameworkWithMeta[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const load = () => {
    setFetchError(null);
    fetch('/api/frameworks')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          throw new Error(d.error ?? 'Failed to load frameworks');
        }
        if (!Array.isArray(d.frameworks)) {
          throw new Error('Invalid response from server');
        }
        setFrameworks(d.frameworks);
      })
      .catch((err: Error) => {
        setFrameworks([]);
        setFetchError(err.message);
      })
      .finally(() => setInitialLoad(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleFramework = async (frameworkId: string, activated: boolean) => {
    if (readOnly) return;
    setLoading(frameworkId);
    await fetch('/api/frameworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frameworkId,
        action: activated ? 'deactivate' : 'activate',
      }),
    });
    load();
    setLoading(null);
  };

  const categories = ['all', ...new Set(frameworks.map((f) => f.category))];
  const filtered =
    filter === 'all' ? frameworks : frameworks.filter((f) => f.category === filter);

  const activatedCount = frameworks.filter((f) => f.activated).length;

  return (
    <AppShell
      title="Framework Library"
      subtitle={
        fetchError
          ? 'Connect to PostgreSQL to load framework activations'
          : `${frameworks.length} security and privacy frameworks — activate the ones your customers need to comply with`
      }
    >
      {fetchError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Database unavailable</p>
          <p className="mt-1">{fetchError}. Start PostgreSQL, then refresh this page.</p>
          <p className="mt-2 font-mono text-xs text-amber-800">
            Start-Service postgresql-x64-17
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      )}

      {initialLoad && !fetchError && (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-slate-200" />
            ))}
          </div>
        </div>
      )}

      {!initialLoad && !fetchError && (
      <>
      {readOnly && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <Eye className="h-4 w-4 shrink-0 text-sky-600" />
          Framework library is view-only in the customer demo. Explore controls without changing activations.
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500">{activatedCount} activated</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((fw) => (
          <article
            key={fw.id}
            className={`rounded-xl border bg-white p-5 shadow-sm transition ${
              fw.activated ? 'border-brand-200 ring-1 ring-brand-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{fw.shortName}</h3>
                  {fw.popular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      <Star className="h-3 w-3" /> Popular
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{fw.name}</p>
              </div>
              {fw.activated && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {fw.mvpRequired ? 'MVP · Active' : 'Active'}
                </span>
              )}
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-slate-600">{fw.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {fw.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> {fw.region}
              </span>
              <span>{fw.controlCount} controls</span>
              <span>v{fw.version}</span>
            </div>

            {fw.activated && fw.readiness !== null && (
              <div className="mt-4">
                <ReadinessBar value={fw.readiness} />
              </div>
            )}

            <div className="mt-5 flex gap-2">
              {fw.activated ? (
                <>
                  <Link
                    href={`/frameworks/${fw.id}`}
                    className="flex-1 rounded-lg bg-brand-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-600"
                  >
                    View controls
                  </Link>
                  {!fw.mvpRequired && !readOnly && (
                    <button
                      onClick={() => toggleFramework(fw.id, true)}
                      disabled={loading === fw.id}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Deactivate
                    </button>
                  )}
                </>
              ) : readOnly ? (
                <span className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  View only
                </span>
              ) : (
                <button
                  onClick={() => toggleFramework(fw.id, false)}
                  disabled={loading === fw.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100"
                >
                  <Plus className="h-4 w-4" /> Activate framework
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      </>
      )}
    </AppShell>
  );
}
