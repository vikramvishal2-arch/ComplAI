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
  PRIVACY_RISK_IMPACT_LABELS,
  PRIVACY_RISK_LIKELIHOOD_LABELS,
  PRIVACY_RISK_SOURCE_LABELS,
  PRIVACY_RISK_STATUS_LABELS,
  PRIVACY_TREATMENT_LABELS,
  type DataLifecyclePhase,
  type PrivacyRiskImpact,
  type PrivacyRiskLikelihood,
  type PrivacyRiskRegisterEntry,
  type PrivacyRiskSource,
  type PrivacyRiskStatus,
  type PrivacyTreatmentStrategy,
} from '@/lib/types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const EMPTY_FORM: Omit<PrivacyRiskRegisterEntry, 'id' | 'createdAt' | 'updatedAt'> = {
  riskReference: '',
  source: 'other',
  affectedIndividualsAssets: '',
  description: '',
  dataLifecyclePhase: 'processing',
  inherentLikelihood: 'possible',
  inherentImpact: 'moderate',
  inherentRiskRating: '',
  existingControls: '',
  treatmentPlan: '',
  treatmentStrategy: 'mitigate',
  owner: '',
  targetDueDate: null,
  residualLikelihood: null,
  residualImpact: null,
  residualRiskRating: '',
  status: 'open',
  lastReviewDate: null,
  nextReviewDate: null,
  linkedRopaRefs: '',
  linkedDpiaRefs: '',
};

export default function PrivacyRiskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/privacy-risks/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d.risk as PrivacyRiskRegisterEntry;
      })
      .then((risk) => setForm(risk))
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
      const res = await fetch(`/api/privacy-risks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      setForm(data.risk);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this privacy risk entry?')) return;
    const res = await fetch(`/api/privacy-risks/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/privacy-risks');
  };

  if (loading) {
    return (
      <AppShell title="Loading…" subtitle="">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </AppShell>
    );
  }

  if (error && !form.riskReference) {
    return (
      <AppShell title="Risk not found" subtitle="">
        <p className="text-sm text-slate-600">{error}</p>
        <Link href="/privacy-risks" className="mt-4 inline-flex text-sm text-brand-600">
          ← Back to register
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={form.riskReference} subtitle="Privacy risk register entry">
      <Link href="/privacy-risks" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to privacy risk register
      </Link>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <section className="privacy-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            1. Risk identification
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Risk reference / ID</span>
              <input
                value={form.riskReference}
                onChange={(e) => setForm({ ...form, riskReference: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Source</span>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as PrivacyRiskSource })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {(Object.keys(PRIVACY_RISK_SOURCE_LABELS) as PrivacyRiskSource[]).map((k) => (
                  <option key={k} value={k}>{PRIVACY_RISK_SOURCE_LABELS[k]}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Affected individuals / assets</span>
              <input
                value={form.affectedIndividualsAssets}
                onChange={(e) => setForm({ ...form, affectedIndividualsAssets: e.target.value })}
                placeholder="e.g. Customers — access & rectification rights; employee HR data"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="privacy-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            2. Risk assessment
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Risk description (processing activity & threat)</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Aspects of information management (lifecycle phase)</span>
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
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Existing controls (technical & organizational)</span>
              <textarea
                rows={3}
                value={form.existingControls}
                onChange={(e) => setForm({ ...form, existingControls: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="privacy-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            3. Mitigation & ownership
          </h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Treatment strategy</span>
                <select
                  value={form.treatmentStrategy}
                  onChange={(e) =>
                    setForm({ ...form, treatmentStrategy: e.target.value as PrivacyTreatmentStrategy })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {(Object.keys(PRIVACY_TREATMENT_LABELS) as PrivacyTreatmentStrategy[]).map((k) => (
                    <option key={k} value={k}>{PRIVACY_TREATMENT_LABELS[k]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Risk owner</span>
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Treatment plan (actionable steps)</span>
              <textarea
                rows={3}
                value={form.treatmentPlan}
                onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:max-w-xs">
              <span className="text-xs font-medium text-slate-500">Target due date</span>
              <input
                type="date"
                value={form.targetDueDate ?? ''}
                onChange={(e) => setForm({ ...form, targetDueDate: e.target.value || null })}
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
                onChange={(e) => setForm({ ...form, status: e.target.value as PrivacyRiskStatus })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {(Object.keys(PRIVACY_RISK_STATUS_LABELS) as PrivacyRiskStatus[]).map((k) => (
                  <option key={k} value={k}>{PRIVACY_RISK_STATUS_LABELS[k]}</option>
                ))}
              </select>
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
                placeholder="e.g. ROPA-012, ROPA-034"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-slate-500">Linked DPIA entries</span>
              <input
                value={form.linkedDpiaRefs}
                onChange={(e) => setForm({ ...form, linkedDpiaRefs: e.target.value })}
                placeholder="e.g. DPIA-0003"
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
            {saving ? 'Saving…' : 'Save risk entry'}
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
