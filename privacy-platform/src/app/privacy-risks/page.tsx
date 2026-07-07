'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Plus, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { riskRatingTone } from '@/lib/privacy-risk/scoring';
import {
  DATA_LIFECYCLE_LABELS,
  PRIVACY_RISK_SOURCE_LABELS,
  PRIVACY_RISK_STATUS_LABELS,
  PRIVACY_TREATMENT_LABELS,
  type PrivacyRiskRegisterEntry,
} from '@/lib/types';

export default function PrivacyRiskRegisterPage() {
  const router = useRouter();
  const [risks, setRisks] = useState<PrivacyRiskRegisterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/privacy-risks')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d.risks as PrivacyRiskRegisterEntry[];
      })
      .then(setRisks)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createRisk = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/privacy-risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'New privacy risk — describe processing activity and threat',
          affectedIndividualsAssets: 'Customers',
          source: 'other',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create');
      router.push(`/privacy-risks/${data.risk.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create risk');
      setCreating(false);
    }
  };

  const openCount = risks.filter((r) => r.status !== 'closed').length;

  return (
    <AppShell
      title="Privacy Risk Register"
      subtitle="Track vulnerabilities that could impact individuals' data rights — GDPR & DPDP aligned"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <ShieldAlert className="h-5 w-5 text-brand-600" />
          <span>{risks.length} risks · {openCount} open</span>
        </div>
        <button
          type="button"
          onClick={createRisk}
          disabled={creating}
          className="app-primary-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {creating ? 'Creating…' : 'Add privacy risk'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
      ) : risks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No privacy risks recorded yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Add risks from DPIAs, vendor reviews, system audits, or RoPA reviews.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[2200px] w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Risk ID</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Affected individuals / assets</th>
                <th className="px-3 py-3 min-w-[200px]">Risk description</th>
                <th className="px-3 py-3">Lifecycle phase</th>
                <th className="px-3 py-3">Inherent risk</th>
                <th className="px-3 py-3 min-w-[160px]">Existing controls</th>
                <th className="px-3 py-3">Treatment strategy</th>
                <th className="px-3 py-3 min-w-[160px]">Treatment plan</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Target due</th>
                <th className="px-3 py-3">Residual risk</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Last review</th>
                <th className="px-3 py-3">Next review</th>
                <th className="px-3 py-3">Linked RoPA</th>
                <th className="px-3 py-3">Linked DPIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {risks.map((risk) => (
                <tr key={risk.id} className="hover:bg-brand-50/30">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/privacy-risks/${risk.id}`}
                      className="font-mono font-medium text-brand-600 hover:underline"
                    >
                      {risk.riskReference}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {PRIVACY_RISK_SOURCE_LABELS[risk.source]}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{risk.affectedIndividualsAssets || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-700 max-w-[240px] truncate" title={risk.description}>
                    {risk.description || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {DATA_LIFECYCLE_LABELS[risk.dataLifecyclePhase]}
                  </td>
                  <td className={cn('px-3 py-2.5', riskRatingTone(risk.inherentRiskRating))}>
                    {risk.inherentRiskRating || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[180px] truncate" title={risk.existingControls}>
                    {risk.existingControls || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {PRIVACY_TREATMENT_LABELS[risk.treatmentStrategy]}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[180px] truncate" title={risk.treatmentPlan}>
                    {risk.treatmentPlan || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{risk.owner || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{risk.targetDueDate ?? '—'}</td>
                  <td className={cn('px-3 py-2.5', riskRatingTone(risk.residualRiskRating))}>
                    {risk.residualRiskRating || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {PRIVACY_RISK_STATUS_LABELS[risk.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{risk.lastReviewDate ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{risk.nextReviewDate ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate" title={risk.linkedRopaRefs}>
                    {risk.linkedRopaRefs || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate" title={risk.linkedDpiaRefs}>
                    {risk.linkedDpiaRefs || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
