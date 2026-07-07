'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatCard, ReadinessBar, StatusBadge } from '@/components/ui/badges';
import { NavCard } from '@/components/ui/nav-card';
import { ExecutiveDashboardPanel } from '@/components/dashboard/executive-dashboard';
import { PRIVACY_MODULES } from '@/lib/data/modules';
import { PRIVACY_FRAMEWORKS } from '@/lib/data/frameworks';
import { NIST_FUNCTION_LABELS, type DashboardSummary, type ControlCompliance, type PrivacyControl } from '@/lib/types';

type AttentionItem = {
  control: PrivacyControl;
  compliance: ControlCompliance;
  module?: { shortName: string; id: string };
};

export function PrivacyDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [needsAttention, setNeedsAttention] = useState<AttentionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load dashboard');
        return d;
      })
      .then((d) => {
        setSummary(d.summary);
        setNeedsAttention(d.needsAttention ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-200" />;
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-medium">Database unavailable</p>
        <p className="mt-1">{error}. Run <code className="font-mono text-xs">npm run db:setup</code> in privacy-platform.</p>
      </div>
    );
  }

  const moduleMap = Object.fromEntries(PRIVACY_MODULES.map((m) => [m.id, m]));

  return (
    <div className="space-y-8">
      <ExecutiveDashboardPanel />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall readiness" value={`${summary.overallReadiness}%`} sub={`${summary.auditReady} of ${summary.totalControls} controls ready`} />
        <StatCard label="Implementing" value={summary.implementing} sub="In progress" />
        <StatCard label="Not started" value={summary.notStarted} sub="Needs attention" />
        <StatCard label="Frameworks active" value={summary.activatedFrameworks} sub="NIST, ISO 27701, GDPR, DPDP" />
      </div>

      {needsAttention.length > 0 && (
        <section className="privacy-card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Needs attention</h2>
          <div className="space-y-2">
            {needsAttention.map((item) => (
              <Link
                key={item.control.id}
                href={`/controls/${item.control.id}`}
                className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-4 py-3 text-left transition-colors hover:border-brand-200 hover:bg-brand-50/50"
              >
                <div>
                  <span className="font-mono text-xs text-brand-600">{item.control.reference}</span>
                  <p className="font-medium text-slate-900">{item.control.title}</p>
                  <p className="text-xs text-slate-500">{item.module?.shortName}</p>
                </div>
                <StatusBadge status={item.compliance.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Privacy modules</h2>
          <Link href="/modules" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.byModule.map((m) => {
            const mod = moduleMap[m.moduleId];
            if (!mod) return null;
            return (
              <NavCard key={m.moduleId} href={`/modules/${m.moduleId}`}>
                <h3 className="font-semibold text-slate-900">{mod.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{mod.description}</p>
                <div className="mt-4"><ReadinessBar value={m.readiness} /></div>
                <p className="mt-2 text-xs text-slate-500">{m.ready}/{m.total} controls ready</p>
              </NavCard>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Regulatory frameworks</h2>
          <Link href="/frameworks" className="text-sm font-medium text-brand-600 hover:text-brand-700">Manage →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {summary.byFramework.map((f) => {
            const fw = PRIVACY_FRAMEWORKS.find((x) => x.id === f.frameworkId);
            return (
              <NavCard key={f.frameworkId} href={`/frameworks/${f.frameworkId}`}>
                <h3 className="font-semibold text-slate-900">{f.frameworkName}</h3>
                <p className="mt-1 text-sm text-slate-500">{fw?.description}</p>
                <div className="mt-4"><ReadinessBar value={f.readiness} /></div>
              </NavCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
