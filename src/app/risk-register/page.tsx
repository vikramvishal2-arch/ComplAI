'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import {
  ISSUE_SEVERITY_LABELS,
  ISSUE_STATUS_LABELS,
  RISK_CATEGORY_OPTIONS,
  RISK_IMPACT_LABELS,
  RISK_LIKELIHOOD_LABELS,
  RISK_STATUS_LABELS,
  RISK_TREATMENT_LABELS,
  type RiskRegisterEntry,
  type RiskLikelihood,
  type RiskImpact,
  type RiskTreatment,
  type RiskStatus,
  type ControlIssueSeverity,
} from '@/lib/types';
import { calculateRiskScore, riskScoreLabel, isHighOrCriticalScore, parseRiskScoreLabel, resolvePresentRiskDisplay, isHighOrCriticalDisplay } from '@/lib/risk/scoring';
import { AlertTriangle, Download, Plus, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkableControl {
  id: string;
  reference: string;
  title: string;
  frameworkId: string;
  frameworkShortName: string;
}

function riskScoreTone(value: string | null): string {
  if (!value || value === '—') return 'text-slate-400';
  const label = parseRiskScoreLabel(value);
  if (label === 'Critical') return 'text-red-700 font-semibold';
  if (label === 'High') return 'text-orange-700 font-medium';
  if (label === 'Medium') return 'text-amber-700';
  return 'text-emerald-700';
}

type RegisterFormType = 'risk' | 'issue';

function displayPresentRisk(entry: RiskRegisterEntry): string {
  if (entry.entryType !== 'risk') return entry.severityOrScore;
  return resolvePresentRiskDisplay(entry);
}

export default function RiskRegisterPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<RiskRegisterEntry[]>([]);
  const [controls, setControls] = useState<LinkableControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<RegisterFormType>('risk');
  const [submitting, setSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'risk' | 'issue'>('all');
  const [frameworkFilter, setFrameworkFilter] = useState('');

  const [form, setForm] = useState({
    controlId: '',
    title: '',
    description: '',
    category: 'compliance',
    likelihood: 'possible' as RiskLikelihood,
    impact: 'moderate' as RiskImpact,
    residualLikelihood: null as RiskLikelihood | null,
    residualImpact: null as RiskImpact | null,
    treatment: 'mitigate' as RiskTreatment,
    status: 'identified' as RiskStatus,
    severity: 'medium' as ControlIssueSeverity,
    owner: '',
    assignee: '',
    raisedBy: '',
    dueDate: '',
    mitigationPlan: '',
  });

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/risks?view=register').then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load register');
        return d.entries as RiskRegisterEntry[];
      }),
      fetch('/api/risks/controls').then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load controls');
        return d.controls as LinkableControl[];
      }),
    ])
      .then(([registerEntries, linkableControls]) => {
        setEntries(registerEntries);
        setControls(linkableControls);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const frameworks = useMemo(
    () => [...new Set(controls.map((c) => c.frameworkShortName))].sort(),
    [controls]
  );

  const filtered = entries.filter((e) => {
    if (typeFilter !== 'all' && e.entryType !== typeFilter) return false;
    if (frameworkFilter && e.frameworkShortName !== frameworkFilter) return false;
    return true;
  });

  const exportHref = useMemo(() => {
    const params = new URLSearchParams({ format: 'csv', type: 'risks' });
    if (typeFilter !== 'all') params.set('entryType', typeFilter);
    if (frameworkFilter) params.set('framework', frameworkFilter);
    return `/api/export?${params}`;
  }, [typeFilter, frameworkFilter]);

  const openCount = entries.filter(
    (e) => !['closed', 'resolved', 'accepted'].includes(e.status)
  ).length;

  const riskEntries = entries.filter((e) => e.entryType === 'risk');
  const riskSummary = useMemo(() => {
    return {
      total: riskEntries.length,
      inherentHigh: riskEntries.filter((e) => isHighOrCriticalDisplay(e.inherentRisk)).length,
      presentHigh: riskEntries.filter((e) =>
        isHighOrCriticalDisplay(displayPresentRisk(e))
      ).length,
    };
  }, [riskEntries]);

  const previewScore = calculateRiskScore(form.likelihood, form.impact);
  const residualLikelihood = form.residualLikelihood ?? 'unlikely';
  const residualImpact = form.residualImpact ?? 'minor';
  const previewResidualScore = calculateRiskScore(residualLikelihood, residualImpact);
  const isClosedRisk = formType === 'risk' && form.status === 'closed';
  const residualInvalid = isClosedRisk && isHighOrCriticalScore(previewResidualScore);

  const resetForm = () => {
    setForm({
      controlId: '',
      title: '',
      description: '',
      category: 'compliance',
      likelihood: 'possible',
      impact: 'moderate',
      residualLikelihood: null,
      residualImpact: null,
      treatment: 'mitigate',
      status: 'identified',
      severity: 'medium',
      owner: '',
      assignee: '',
      raisedBy: '',
      dueDate: '',
      mitigationPlan: '',
    });
  };

  const submit = async () => {
    if (!form.controlId) {
      setError('Select a linked framework control');
      return;
    }
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formType === 'risk' && form.status === 'closed') {
      if (residualInvalid) {
        setError('Closed risks require residual severity of medium or low (not high or critical).');
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const presentLikelihood =
      form.status === 'closed'
        ? form.residualLikelihood ?? 'unlikely'
        : form.residualLikelihood;
    const presentImpact =
      form.status === 'closed' ? form.residualImpact ?? 'minor' : form.residualImpact;

    const payload =
      formType === 'issue'
        ? {
            entryType: 'issue',
            controlId: form.controlId,
            title: form.title,
            description: form.description,
            severity: form.severity,
            raisedBy: form.raisedBy || form.owner,
            assignee: form.assignee,
            dueDate: form.dueDate || null,
          }
        : {
            controlId: form.controlId,
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
            dueDate: form.dueDate || null,
            mitigationPlan: form.mitigationPlan,
          };

    try {
      const res = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save entry');

      resetForm();
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Risk Register"
      subtitle="Central register of risks and control issues — every entry must link to a framework control"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span>{entries.length} entries</span>
          <span>{openCount} open</span>
          <span>{controls.length} linkable controls</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={exportHref}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add risk or issue
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 rounded-xl border-2 border-brand-200 bg-white p-6 shadow-sm space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">New register entry</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2">
            {(['risk', 'issue'] as RegisterFormType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormType(t)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium capitalize',
                  formType === t
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Linked control * <span className="font-normal text-slate-500">(activated frameworks only)</span>
            </label>
            <select
              value={form.controlId}
              onChange={(e) => setForm({ ...form, controlId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select control...</option>
              {frameworks.map((fw) => (
                <optgroup key={fw} label={fw}>
                  {controls
                    .filter((c) => c.frameworkShortName === fw)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.reference} — {c.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          {formType === 'risk' ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <p className="text-xs font-medium text-slate-700">Inherent risk</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Likelihood</label>
                  <select
                    value={form.likelihood}
                    disabled={isClosedRisk}
                    onChange={(e) =>
                      setForm({ ...form, likelihood: e.target.value as RiskLikelihood })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
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
                    disabled={isClosedRisk}
                    onChange={(e) => setForm({ ...form, impact: e.target.value as RiskImpact })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
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
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
                    {previewScore} ({riskScoreLabel(previewScore)})
                  </p>
                </div>
                </div>
              </div>
              {isClosedRisk ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                  <p className="text-xs font-medium text-slate-700">
                    Present risk (required when closed — medium or low only)
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Present likelihood
                      </label>
                      <select
                        value={form.residualLikelihood ?? 'unlikely'}
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
                        value={form.residualImpact ?? 'minor'}
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
                          'rounded-lg border px-3 py-2 text-sm font-medium bg-white',
                          residualInvalid ? 'border-red-300 text-red-700' : 'border-emerald-200'
                        )}
                      >
                        {previewResidualScore} ({riskScoreLabel(previewResidualScore)})
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <p className="text-xs font-medium text-slate-700">
                    Present risk (optional — defaults to inherent score on the register until set)
                  </p>
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
                      <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
                        {form.residualLikelihood && form.residualImpact
                          ? `${previewResidualScore} (${riskScoreLabel(previewResidualScore)})`
                          : `${previewScore} (${riskScoreLabel(previewScore)})`}
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
                    onChange={(e) => {
                      const status = e.target.value as RiskStatus;
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
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {(Object.keys(RISK_STATUS_LABELS) as RiskStatus[]).map((k) => (
                      <option key={k} value={k}>
                        {RISK_STATUS_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mitigation plan</label>
                <textarea
                  rows={2}
                  value={form.mitigationPlan}
                  onChange={(e) => setForm({ ...form, mitigationPlan: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value as ControlIssueSeverity })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {(Object.keys(ISSUE_SEVERITY_LABELS) as ControlIssueSeverity[]).map((k) => (
                    <option key={k} value={k}>
                      {ISSUE_SEVERITY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Raised by</label>
                <input
                  value={form.raisedBy}
                  onChange={(e) => setForm({ ...form, raisedBy: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Assignee</label>
                <input
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {formType === 'risk' ? 'Owner' : 'Owner (optional)'}
              </label>
              <input
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting || (formType === 'risk' && residualInvalid)}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : `Add ${formType}`}
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="risk">Risks only</option>
          <option value="issue">Issues only</option>
        </select>
        <select
          value={frameworkFilter}
          onChange={(e) => setFrameworkFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All frameworks</option>
          {frameworks.map((fw) => (
            <option key={fw} value={fw}>
              {fw}
            </option>
          ))}
        </select>
      </div>

      {(typeFilter === 'all' || typeFilter === 'risk') && riskSummary.total > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Risks</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{riskSummary.total}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-800">
              Inherent risk (high / critical)
            </p>
            <p className="mt-1 text-2xl font-bold text-orange-900">{riskSummary.inherentHigh}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
              Present risk (high / critical)
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{riskSummary.presentHigh}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse h-64 rounded-xl bg-slate-200" />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Framework</th>
                  <th className="px-6 py-3">Control</th>
                  <th className="px-6 py-3">Inherent risk</th>
                  <th className="px-6 py-3">Present risk</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      No risks or issues yet. Add an entry linked to a framework control.
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => {
                    const detailHref =
                      entry.entryType === 'risk'
                        ? `/risk-register/risks/${entry.id}`
                        : `/controls/${entry.controlId}?tab=issues`;

                    return (
                    <tr
                      key={`${entry.entryType}-${entry.id}`}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => router.push(detailHref)}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                            entry.entryType === 'risk'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                          )}
                        >
                          {entry.entryType === 'risk' ? (
                            <ShieldAlert className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                          {entry.entryType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 max-w-xs">
                        <Link
                          href={detailHref}
                          className="hover:text-brand-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entry.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{entry.frameworkShortName}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/controls/${entry.controlId}`}
                          className="font-mono text-xs text-brand-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entry.controlReference}
                        </Link>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {entry.controlTitle}
                        </p>
                      </td>
                      <td className={cn('px-6 py-4', riskScoreTone(entry.inherentRisk))}>
                        {entry.entryType === 'risk' ? entry.inherentRisk : '—'}
                      </td>
                      <td className={cn('px-6 py-4', riskScoreTone(displayPresentRisk(entry)))}>
                        {displayPresentRisk(entry)}
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-600">
                        {entry.entryType === 'issue'
                          ? ISSUE_STATUS_LABELS[entry.status as keyof typeof ISSUE_STATUS_LABELS] ??
                            entry.status
                          : RISK_STATUS_LABELS[entry.status as keyof typeof RISK_STATUS_LABELS] ??
                            entry.status}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {entry.owner || entry.assignee || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{entry.dueDate ?? '—'}</td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
