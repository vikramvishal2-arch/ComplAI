'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import {
  formatPrivacyRiskRating,
  resolveResidualRiskRating,
} from '@/lib/privacy-risk/scoring';
import {
  DATA_LIFECYCLE_LABELS,
  DPIA_STATUS_LABELS,
  PRIVACY_RISK_IMPACT_LABELS,
  PRIVACY_RISK_LIKELIHOOD_LABELS,
  type DataLifecyclePhase,
  type DpiaRecord,
  type DpiaStatus,
  type PrivacyRiskImpact,
  type PrivacyRiskLikelihood,
} from '@/lib/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const EMPTY_FORM: Omit<DpiaRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  dpiaReference: '',
  processingActivityName: '',
  description: '',
  triggerReason: '',
  necessityProportionality: '',
  dataCategories: '',
  affectedIndividuals: '',
  riskDescription: '',
  dataLifecyclePhase: 'processing',
  inherentLikelihood: 'possible',
  inherentImpact: 'moderate',
  inherentRiskRating: '',
  measuresToMitigate: '',
  dpoConsultation: '',
  residualLikelihood: null,
  residualImpact: null,
  residualRiskRating: '',
  status: 'draft',
  owner: '',
  initiatedDate: null,
  targetCompletionDate: null,
  completedDate: null,
  lastReviewDate: null,
  nextReviewDate: null,
  linkedRopaRefs: '',
  linkedRiskRefs: '',
};

export default function DpiaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/dpias/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d.dpia as DpiaRecord;
      })
      .then((dpia) => setForm(dpia))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const inherentPreview = formatPrivacyRiskRating(form.inherentLikelihood, form.inherentImpact);
  const residualPreview = resolveResidualRiskRating(
    form.inherentLikelihood,
    form.inherentImpact,
    form.residualLikelihood,
    form.residualImpact
  );

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/dpias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      setForm(data.dpia);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this DPIA record?')) return;
    const res = await fetch(`/api/dpias/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/dpias');
  };

  if (loading) {
    return (
      <AppShell title="Loading…" subtitle="">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </AppShell>
    );
  }

  if (error && !form.dpiaReference) {
    return (
      <AppShell title="DPIA not found" subtitle="">
        <p className="text-sm text-slate-600">{error}</p>
        <Link href="/dpias" className="mt-4 inline-flex text-sm text-brand-600">
          ← Back to DPIA register
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={form.dpiaReference} subtitle={form.processingActivityName}>
      <Link href="/dpias" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to DPIA register
      </Link>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <section className="privacy-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            1. Processing identification
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">DPIA reference / ID</span>
              <input
                value={form.dpiaReference}
                onChange={(e) => setForm({ ...form, dpiaReference: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Owner</span>
              <input
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Processing activity name</span>
              <input
                value={form.processingActivityName}
                onChange={(e) => setForm({ ...form, processingActivityName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Trigger / reason for DPIA</span>
              <input
                value={form.triggerReason}
                onChange={(e) => setForm({ ...form, triggerReason: e.target.value })}
                placeholder="e.g. Large-scale profiling, AI decision-making, children data"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Description / purpose of processing</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Necessity & proportionality assessment</span>
              <textarea
                rows={3}
                value={form.necessityProportionality}
                onChange={(e) => setForm({ ...form, necessityProportionality: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="privacy-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            2. Data subjects & risk assessment
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Data categories</span>
                <input
                  value={form.dataCategories}
                  onChange={(e) => setForm({ ...form, dataCategories: e.target.value })}
                  placeholder="e.g. Contact, financial, health, biometric"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Affected individuals</span>
                <input
                  value={form.affectedIndividuals}
                  onChange={(e) => setForm({ ...form, affectedIndividuals: e.target.value })}
                  placeholder="e.g. Customers, employees, children"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Lifecycle phase</span>
              <select
                value={form.dataLifecyclePhase}
                onChange={(e) =>
                  setForm({ ...form, dataLifecyclePhase: e.target.value as DataLifecyclePhase })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {(Object.keys(DATA_LIFECYCLE_LABELS) as DataLifecyclePhase[]).map((k) => (
                  <option key={k} value={k}>{DATA_LIFECYCLE_LABELS[k]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Risk description (threats to individuals&apos; rights)</span>
              <textarea
                rows={4}
                value={form.riskDescription}
                onChange={(e) => setForm({ ...form, riskDescription: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Inherent likelihood</span>
                <select
                  value={form.inherentLikelihood}
                  onChange={(e) =>
                    setForm({ ...form, inherentLikelihood: e.target.value as PrivacyRiskLikelihood })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {(Object.keys(PRIVACY_RISK_LIKELIHOOD_LABELS) as PrivacyRiskLikelihood[]).map((k) => (
                    <option key={k} value={k}>{PRIVACY_RISK_LIKELIHOOD_LABELS[k]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Inherent impact</span>
                <select
                  value={form.inherentImpact}
                  onChange={(e) =>
                    setForm({ ...form, inherentImpact: e.target.value as PrivacyRiskImpact })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {(Object.keys(PRIVACY_RISK_IMPACT_LABELS) as PrivacyRiskImpact[]).map((k) => (
                    <option key={k} value={k}>{PRIVACY_RISK_IMPACT_LABELS[k]}</option>
                  ))}
                </select>
              </label>
              <div>
                <span className="text-xs font-medium text-slate-500">Inherent risk rating</span>
                <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium">
                  {inherentPreview}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="privacy-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            3. Mitigation & consultation
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Measures to mitigate risk (treatment plan)</span>
              <textarea
                rows={4}
                value={form.measuresToMitigate}
                onChange={(e) => setForm({ ...form, measuresToMitigate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">DPO consultation notes</span>
              <textarea
                rows={3}
                value={form.dpoConsultation}
                onChange={(e) => setForm({ ...form, dpoConsultation: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Residual likelihood</span>
                <select
                  value={form.residualLikelihood ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      residualLikelihood: e.target.value
                        ? (e.target.value as PrivacyRiskLikelihood)
                        : null,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Same as inherent</option>
                  {(Object.keys(PRIVACY_RISK_LIKELIHOOD_LABELS) as PrivacyRiskLikelihood[]).map((k) => (
                    <option key={k} value={k}>{PRIVACY_RISK_LIKELIHOOD_LABELS[k]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Residual impact</span>
                <select
                  value={form.residualImpact ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      residualImpact: e.target.value
                        ? (e.target.value as PrivacyRiskImpact)
                        : null,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Same as inherent</option>
                  {(Object.keys(PRIVACY_RISK_IMPACT_LABELS) as PrivacyRiskImpact[]).map((k) => (
                    <option key={k} value={k}>{PRIVACY_RISK_IMPACT_LABELS[k]}</option>
                  ))}
                </select>
              </label>
              <div>
                <span className="text-xs font-medium text-slate-500">Residual risk rating</span>
                <p className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                  {residualPreview}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="privacy-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            4. Review & governance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DpiaStatus })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {(Object.keys(DPIA_STATUS_LABELS) as DpiaStatus[]).map((k) => (
                  <option key={k} value={k}>{DPIA_STATUS_LABELS[k]}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Initiated date</span>
              <input
                type="date"
                value={form.initiatedDate ?? ''}
                onChange={(e) => setForm({ ...form, initiatedDate: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Target completion date</span>
              <input
                type="date"
                value={form.targetCompletionDate ?? ''}
                onChange={(e) => setForm({ ...form, targetCompletionDate: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Completed date</span>
              <input
                type="date"
                value={form.completedDate ?? ''}
                onChange={(e) => setForm({ ...form, completedDate: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Last review date</span>
              <input
                type="date"
                value={form.lastReviewDate ?? ''}
                onChange={(e) => setForm({ ...form, lastReviewDate: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Next review date</span>
              <input
                type="date"
                value={form.nextReviewDate ?? ''}
                onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Linked RoPA entries</span>
              <input
                value={form.linkedRopaRefs}
                onChange={(e) => setForm({ ...form, linkedRopaRefs: e.target.value })}
                placeholder="e.g. ROPA-012"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Linked privacy risk entries</span>
              <input
                value={form.linkedRiskRefs}
                onChange={(e) => setForm({ ...form, linkedRiskRefs: e.target.value })}
                placeholder="e.g. PR-0001"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="app-primary-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save DPIA'}
          </button>
          {saved && <span className="text-sm text-emerald-600">Saved successfully.</span>}
          <button
            type="button"
            onClick={remove}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </AppShell>
  );
}
