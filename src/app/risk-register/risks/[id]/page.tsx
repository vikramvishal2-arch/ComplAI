'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import {
  RISK_CATEGORY_OPTIONS,
  RISK_IMPACT_LABELS,
  RISK_LIKELIHOOD_LABELS,
  RISK_STATUS_LABELS,
  RISK_TREATMENT_LABELS,
  type Risk,
  type RiskImpact,
  type RiskLikelihood,
  type RiskStatus,
  type RiskTreatment,
  type Control,
  type RiskControlMapping,
} from '@/lib/types';
import { calculateRiskScore, riskScoreLabel, isHighOrCriticalScore } from '@/lib/risk/scoring';
import { ControlReference } from '@/components/controls/control-reference';
import { RiskControlWorkflowPanel } from '@/components/risk/risk-control-workflow-panel';
import { RiskRemediationGuidancePanel } from '@/components/risk/risk-remediation-guidance-panel';
import { formatDateTime, cn } from '@/lib/utils';
import { ArrowLeft, Save, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';

interface LinkableControl {
  id: string;
  reference: string;
  title: string;
  frameworkShortName: string;
}

interface RiskDetailData {
  risk: Risk;
  control: Control | null;
  framework: { id: string; name: string; shortName: string } | null;
  mappings: RiskControlMapping[];
}

export default function RiskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<RiskDetailData | null>(null);
  const [form, setForm] = useState<Risk | null>(null);
  const [controlOptions, setControlOptions] = useState<LinkableControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [highlightGuidance, setHighlightGuidance] = useState(false);

  const load = (opts?: { soft?: boolean }) => {
    if (!opts?.soft) setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/risks/${id}`).then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? 'Failed to load risk');
        return json as RiskDetailData;
      }),
      fetch('/api/risks/controls').then(async (r) => {
        const json = await r.json();
        if (!r.ok) return [] as LinkableControl[];
        return (json.controls ?? []) as LinkableControl[];
      }),
    ])
      .then(([d, controls]) => {
        const risk = d.risk;
        setData({ ...d, mappings: d.mappings ?? [] });
        setControlOptions(controls);
        setForm(
          risk.status === 'closed' && !risk.residualLikelihood
            ? {
                ...risk,
                residualLikelihood: 'unlikely',
                residualImpact: risk.residualImpact ?? 'minor',
              }
            : risk
        );
      })
      .catch((err: Error) => {
        setData(null);
        setForm(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const show = params.get('guidance') === '1';
    setHighlightGuidance(show);
    if (show) {
      requestAnimationFrame(() => {
        document.getElementById('remediation-guidance')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [id, loading]);

  const save = async () => {
    if (!form) return;
    if (!form.reviewer?.trim()) {
      setError('Reviewer name is required');
      return;
    }
    if (!form.approver?.trim()) {
      setError('Approver name is required');
      return;
    }
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const presentLikelihood =
        form.status === 'closed'
          ? form.residualLikelihood ?? 'unlikely'
          : form.residualLikelihood;
      const presentImpact =
        form.status === 'closed' ? form.residualImpact ?? 'minor' : form.residualImpact;

      const res = await fetch(`/api/risks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          likelihood: form.likelihood,
          impact: form.impact,
          residualLikelihood: presentLikelihood,
          residualImpact: presentImpact,
          treatment: form.treatment,
          status: form.status,
          owner: form.owner,
          reviewer: form.reviewer,
          approver: form.approver,
          dueDate: form.dueDate,
          mitigationPlan: form.mitigationPlan,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save');

      setForm(json.risk);
      setData((prev) =>
        prev
          ? {
              ...prev,
              risk: json.risk,
              mappings: json.mappings ?? prev.mappings,
            }
          : prev
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm('Delete this risk from the register?')) return;
    const res = await fetch(`/api/risks/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? 'Failed to delete');
      return;
    }
    router.push('/risk-register');
  };

  if (loading) {
    return (
      <AppShell title="Loading risk..." subtitle="">
        <div className="animate-pulse h-96 rounded-xl bg-slate-200" />
      </AppShell>
    );
  }

  if (error && !form) {
    return (
      <AppShell title="Risk not found" subtitle="">
        <Link
          href="/risk-register"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to risk register
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          {error}
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 block rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  if (!form || !data) return null;

  const isClosed = form.status === 'closed';
  const inherentScore = calculateRiskScore(form.likelihood, form.impact);
  const presentLikelihood = form.residualLikelihood ?? (isClosed ? 'unlikely' : null);
  const presentImpact = form.residualImpact ?? (isClosed ? 'minor' : null);
  const presentScore =
    presentLikelihood && presentImpact
      ? calculateRiskScore(presentLikelihood, presentImpact)
      : isClosed
        ? null
        : inherentScore;
  const presentInvalid = isClosed && presentScore != null && isHighOrCriticalScore(presentScore);

  const handleStatusChange = (status: RiskStatus) => {
    if (status === 'closed') {
      setForm({
        ...form,
        status,
        residualLikelihood: form.residualLikelihood ?? 'unlikely',
        residualImpact: form.residualImpact ?? 'minor',
      });
    } else {
      setForm({ ...form, status });
    }
  };

  return (
    <AppShell
      title={form.title}
      subtitle={`${data.framework?.shortName ?? 'Framework'} · ${data.control?.reference ?? 'Control'}`}
    >
      <Link
        href="/risk-register"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to risk register
      </Link>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-lg font-semibold text-slate-900">Risk details</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Inherent risk</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Original assessment before treatment. {isClosed && 'Historical — not shown in register when closed.'}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Likelihood</label>
                  <select
                    value={form.likelihood}
                    disabled={isClosed}
                    onChange={(e) =>
                      setForm({ ...form, likelihood: e.target.value as RiskLikelihood })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {(Object.keys(RISK_LIKELIHOOD_LABELS) as RiskLikelihood[]).map((k) => (
                      <option key={k} value={k}>
                        {RISK_LIKELIHOOD_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Impact</label>
                  <select
                    value={form.impact}
                    disabled={isClosed}
                    onChange={(e) => setForm({ ...form, impact: e.target.value as RiskImpact })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    {(Object.keys(RISK_IMPACT_LABELS) as RiskImpact[]).map((k) => (
                      <option key={k} value={k}>
                        {RISK_IMPACT_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Inherent score</label>
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
                    {inherentScore} ({riskScoreLabel(inherentScore)})
                  </p>
                </div>
              </div>
            </div>

            {isClosed && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Present risk *</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Required when closed. Must be medium or low — high and critical are not allowed.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Present likelihood
                    </label>
                    <select
                      value={presentLikelihood ?? 'unlikely'}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          residualLikelihood: e.target.value as RiskLikelihood,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                    >
                      {(Object.keys(RISK_LIKELIHOOD_LABELS) as RiskLikelihood[]).map((k) => (
                        <option key={k} value={k}>
                          {RISK_LIKELIHOOD_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Present impact
                    </label>
                    <select
                      value={presentImpact ?? 'minor'}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          residualImpact: e.target.value as RiskImpact,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                    >
                      {(Object.keys(RISK_IMPACT_LABELS) as RiskImpact[]).map((k) => (
                        <option key={k} value={k}>
                          {RISK_IMPACT_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Present score
                    </label>
                    <p
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm font-semibold bg-white',
                        presentInvalid
                          ? 'border-red-300 text-red-700'
                          : 'border-emerald-200 text-emerald-800'
                      )}
                    >
                      {presentScore != null
                        ? `${presentScore} (${riskScoreLabel(presentScore)})`
                        : '—'}
                    </p>
                  </div>
                </div>
                {presentInvalid && (
                  <p className="text-xs text-red-700">
                    Reduce present likelihood or impact before saving. High and critical scores
                    cannot be used for closed risks.
                  </p>
                )}
              </div>
            )}

            {!isClosed && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Present risk</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Optional while open — defaults to inherent score on the register until set.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Present likelihood
                    </label>
                    <select
                      value={form.residualLikelihood ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          residualLikelihood: e.target.value
                            ? (e.target.value as RiskLikelihood)
                            : null,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Same as inherent</option>
                      {(Object.keys(RISK_LIKELIHOOD_LABELS) as RiskLikelihood[]).map((k) => (
                        <option key={k} value={k}>
                          {RISK_LIKELIHOOD_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Present impact
                    </label>
                    <select
                      value={form.residualImpact ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          residualImpact: e.target.value
                            ? (e.target.value as RiskImpact)
                            : null,
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Same as inherent</option>
                      {(Object.keys(RISK_IMPACT_LABELS) as RiskImpact[]).map((k) => (
                        <option key={k} value={k}>
                          {RISK_IMPACT_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Present score
                    </label>
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
                      {presentScore != null
                        ? `${presentScore} (${riskScoreLabel(presentScore)})`
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {RISK_CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Treatment</label>
                <select
                  value={form.treatment}
                  onChange={(e) =>
                    setForm({ ...form, treatment: e.target.value as RiskTreatment })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {(Object.keys(RISK_TREATMENT_LABELS) as RiskTreatment[]).map((k) => (
                    <option key={k} value={k}>
                      {RISK_TREATMENT_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleStatusChange(e.target.value as RiskStatus)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {(Object.keys(RISK_STATUS_LABELS) as RiskStatus[]).map((k) => (
                    <option key={k} value={k}>
                      {RISK_STATUS_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Owner</label>
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  placeholder="Name, member id, or email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Reviewer <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={form.reviewer}
                  onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
                  placeholder="Name, member id, or email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Approver <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={form.approver}
                  onChange={(e) => setForm({ ...form, approver: e.target.value })}
                  placeholder="Name, member id, or email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
                <input
                  type="date"
                  value={form.dueDate ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mitigation plan</label>
              <textarea
                rows={4}
                value={form.mitigationPlan}
                onChange={(e) => setForm({ ...form, mitigationPlan: e.target.value })}
                placeholder="Describe how this risk will be treated. Use Remediation guidance to seed a draft."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <RiskRemediationGuidancePanel
              risk={form}
              control={data.control}
              highlight={highlightGuidance}
              onApplyPlan={(draft) => setForm({ ...form, mitigationPlan: draft })}
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={save}
                disabled={saving || presentInvalid}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {saved && (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </span>
              )}
              <button
                type="button"
                onClick={remove}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </section>

          <RiskControlWorkflowPanel
            riskId={id}
            riskOwner={form.owner}
            mappings={data.mappings ?? []}
            controlOptions={controlOptions}
            onChanged={() => load({ soft: true })}
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              {isClosed ? 'Present risk' : 'Current score'}
            </h3>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {presentScore ?? inherentScore}
              <span className="ml-2 text-sm font-medium text-slate-600">
                ({riskScoreLabel(presentScore ?? inherentScore)}
                {isClosed ? ' present' : ''})
              </span>
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Linked controls ({(data.mappings ?? []).length || 1})
            </h3>
            {(data.mappings ?? []).length > 0 ? (
              <ul className="mt-3 space-y-3">
                {(data.mappings ?? []).map((m) => (
                  <li key={m.id}>
                    <ControlReference
                      controlId={m.controlId}
                      reference={m.controlReference}
                      title={m.controlTitle}
                      className="text-sm"
                    />
                    {m.isPrimary && (
                      <span className="mt-1 inline-block text-[10px] font-semibold uppercase text-brand-600">
                        Primary
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : data.control ? (
              <>
                <ControlReference
                  controlId={data.control.id}
                  reference={data.control.reference}
                  title={data.control.title}
                  description={data.control.description}
                  className="mt-2 text-sm"
                />
                <Link
                  href={`/controls/${data.control.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                >
                  Open control <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Control reference unavailable</p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Framework</h3>
            <p className="mt-2 text-sm font-medium text-brand-600">
              {data.framework?.name ?? '—'}
            </p>
            {data.framework && (
              <Link
                href={`/frameworks/${data.framework.id}`}
                className="mt-3 inline-block text-xs text-brand-600 hover:underline"
              >
                View framework controls →
              </Link>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-xs text-slate-500 space-y-1">
            <p>Created {formatDateTime(form.createdAt)}</p>
            <p>Updated {formatDateTime(form.updatedAt)}</p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
