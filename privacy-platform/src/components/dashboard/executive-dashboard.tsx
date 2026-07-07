'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ExecutiveDashboard, RagStatus } from '@/lib/types';
import { RAG_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

const RAG_COLORS: Record<RagStatus, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

function RagBar({ green, amber, red, total }: { green: number; amber: number; red: number; total: number }) {
  if (total === 0) return <div className="h-2 rounded-full bg-slate-100" />;
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
      {green > 0 && <div className="bg-emerald-500" style={{ width: `${(green / total) * 100}%` }} />}
      {amber > 0 && <div className="bg-amber-500" style={{ width: `${(amber / total) * 100}%` }} />}
      {red > 0 && <div className="bg-red-500" style={{ width: `${(red / total) * 100}%` }} />}
    </div>
  );
}

export function ExecutiveDashboardPanel() {
  const [data, setData] = useState<ExecutiveDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/executive')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-slate-200" />;
  if (error || !data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Executive dashboard unavailable: {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Executive RAG Dashboard</h2>
          <p className="text-sm text-slate-500">{data.organizationName}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900">{data.healthScore}%</p>
          <p className="text-xs text-slate-500">Health score</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(['green', 'amber', 'red'] as RagStatus[]).map((rag) => {
          const count = rag === 'green' ? data.green : rag === 'amber' ? data.amber : data.red;
          return (
            <div key={rag} className="privacy-card">
              <div className="flex items-center gap-2">
                <span className={cn('h-3 w-3 rounded-full', RAG_COLORS[rag])} />
                <span className="text-sm font-medium text-slate-700">{RAG_LABELS[rag]}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{count}</p>
            </div>
          );
        })}
      </div>

      {data.leadershipAttention.length > 0 && (
        <div className="privacy-card">
          <h3 className="mb-4 font-semibold text-slate-900">Leadership attention</h3>
          <div className="space-y-2">
            {data.leadershipAttention.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-lg border border-slate-100 px-4 py-3 hover:border-brand-200 hover:bg-brand-50/40"
              >
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {data.frameworks.map((fw) => (
          <div key={fw.frameworkId} className="privacy-card">
            <Link href={`/frameworks/${fw.frameworkId}`} className="font-semibold text-slate-900 hover:text-brand-700">
              {fw.frameworkName}
            </Link>
            <p className="mt-1 text-sm text-brand-600">{fw.readinessPercent}% ready</p>
            <div className="mt-3">
              <RagBar green={fw.green} amber={fw.amber} red={fw.red} total={fw.total} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
