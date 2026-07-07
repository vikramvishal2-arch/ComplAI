'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { FileSearch, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { riskRatingTone } from '@/lib/privacy-risk/scoring';
import {
  DATA_LIFECYCLE_LABELS,
  DPIA_STATUS_LABELS,
  type DpiaRecord,
} from '@/lib/types';

export default function DpiaRegisterPage() {
  const router = useRouter();
  const [dpias, setDpias] = useState<DpiaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/dpias')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d.dpias as DpiaRecord[];
      })
      .then(setDpias)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createDpia = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/dpias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processingActivityName: 'New processing activity',
          triggerReason: 'High-risk processing — complete DPIA assessment',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create');
      router.push(`/dpias/${data.dpia.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create DPIA');
      setCreating(false);
    }
  };

  const activeCount = dpias.filter((d) => !['closed', 'rejected'].includes(d.status)).length;

  return (
    <AppShell
      title="DPIA Register"
      subtitle="Data Protection Impact Assessments — Art. 35 GDPR / DPDP high-risk processing"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <FileSearch className="h-5 w-5 text-brand-600" />
          <span>{dpias.length} DPIAs · {activeCount} active</span>
        </div>
        <button
          type="button"
          onClick={createDpia}
          disabled={creating}
          className="app-primary-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {creating ? 'Creating…' : 'New DPIA'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
      ) : dpias.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <FileSearch className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No DPIAs recorded yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Create DPIAs for high-risk processing, profiling, large-scale monitoring, and children data.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[2600px] w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">DPIA ID</th>
                <th className="px-3 py-3 min-w-[180px]">Processing activity</th>
                <th className="px-3 py-3">Trigger / reason</th>
                <th className="px-3 py-3 min-w-[160px]">Description / purpose</th>
                <th className="px-3 py-3 min-w-[140px]">Necessity & proportionality</th>
                <th className="px-3 py-3">Data categories</th>
                <th className="px-3 py-3">Affected individuals</th>
                <th className="px-3 py-3 min-w-[160px]">Risk description</th>
                <th className="px-3 py-3">Lifecycle phase</th>
                <th className="px-3 py-3">Inherent risk</th>
                <th className="px-3 py-3 min-w-[160px]">Measures to mitigate</th>
                <th className="px-3 py-3 min-w-[120px]">DPO consultation</th>
                <th className="px-3 py-3">Residual risk</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Initiated</th>
                <th className="px-3 py-3">Target completion</th>
                <th className="px-3 py-3">Completed</th>
                <th className="px-3 py-3">Last review</th>
                <th className="px-3 py-3">Next review</th>
                <th className="px-3 py-3">Linked RoPA</th>
                <th className="px-3 py-3">Linked risks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dpias.map((dpia) => (
                <tr key={dpia.id} className="hover:bg-brand-50/30">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/dpias/${dpia.id}`}
                      className="font-mono font-medium text-brand-600 hover:underline"
                    >
                      {dpia.dpiaReference}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{dpia.processingActivityName}</td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[140px] truncate" title={dpia.triggerReason}>
                    {dpia.triggerReason || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[180px] truncate" title={dpia.description}>
                    {dpia.description || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[160px] truncate" title={dpia.necessityProportionality}>
                    {dpia.necessityProportionality || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate" title={dpia.dataCategories}>
                    {dpia.dataCategories || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate" title={dpia.affectedIndividuals}>
                    {dpia.affectedIndividuals || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[180px] truncate" title={dpia.riskDescription}>
                    {dpia.riskDescription || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {DATA_LIFECYCLE_LABELS[dpia.dataLifecyclePhase]}
                  </td>
                  <td className={cn('px-3 py-2.5', riskRatingTone(dpia.inherentRiskRating))}>
                    {dpia.inherentRiskRating || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[180px] truncate" title={dpia.measuresToMitigate}>
                    {dpia.measuresToMitigate || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate" title={dpia.dpoConsultation}>
                    {dpia.dpoConsultation || '—'}
                  </td>
                  <td className={cn('px-3 py-2.5', riskRatingTone(dpia.residualRiskRating))}>
                    {dpia.residualRiskRating || '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {DPIA_STATUS_LABELS[dpia.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{dpia.owner || '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{dpia.initiatedDate ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{dpia.targetCompletionDate ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{dpia.completedDate ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{dpia.lastReviewDate ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600">{dpia.nextReviewDate ?? '—'}</td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate" title={dpia.linkedRopaRefs}>
                    {dpia.linkedRopaRefs || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[100px] truncate" title={dpia.linkedRiskRefs}>
                    {dpia.linkedRiskRefs || '—'}
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
