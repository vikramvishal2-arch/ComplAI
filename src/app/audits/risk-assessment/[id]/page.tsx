'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { ControlReference } from '@/components/controls/control-reference';
import {
  RISK_ASSESSMENT_STAGE_LABELS,
  stageChecklistLabels,
  type DomainRiskItem,
  type RiskAssessmentStageKey,
  type StageProgress,
} from '@/lib/data/risk-assessment-domains';
import {
  createDomainRiskItem,
  domainRiskInherentScore,
  domainRiskPresentScore,
  domainRiskSeverityBucket,
  type RiskSeverityBucket,
} from '@/lib/risk/domain-risk-item';
import {
  isHighOrCriticalScore,
  riskScoreLabel,
} from '@/lib/risk/scoring';
import {
  RISK_CATEGORY_OPTIONS,
  RISK_IMPACT_LABELS,
  RISK_LIKELIHOOD_LABELS,
  RISK_STATUS_LABELS,
  RISK_TREATMENT_LABELS,
  type RiskImpact,
  type RiskLikelihood,
  type RiskStatus,
  type RiskTreatment,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, ListChecks, Plus, Save, Trash2 } from 'lucide-react';

type RiskDomain = {
  id: string;
  domainKey: string;
  name: string;
  owner: string;
  status: string;
  controlRefs: string[];
  identification: StageProgress;
  analysis: StageProgress;
  evaluation: StageProgress;
  riskItems: DomainRiskItem[];
  severityCounts: Record<RiskSeverityBucket, number>;
};

interface LinkableControl {
  id: string;
  reference: string;
  title: string;
  frameworkId: string;
  frameworkShortName: string;
}

const SEVERITY_STYLES: Record<RiskSeverityBucket, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const STAGE_KEYS: RiskAssessmentStageKey[] = ['identification', 'analysis', 'evaluation'];

export default function AuditRiskAssessmentDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [domain, setDomain] = useState<RiskDomain | null>(null);
  const [draft, setDraft] = useState<RiskDomain | null>(null);
  const [controls, setControls] = useState<LinkableControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/audits/risk-assessment?id=${encodeURIComponent(id)}`).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load domain');
        return d.domain as RiskDomain | null;
      }),
      fetch('/api/risks/controls').then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load controls');
        return (d.controls ?? []) as LinkableControl[];
      }),
    ])
      .then(([loadedDomain, linkableControls]) => {
        setDomain(loadedDomain ?? null);
        setDraft(loadedDomain ?? null);
        setControls(linkableControls);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const frameworks = useMemo(
    () => [...new Set(controls.map((c) => c.frameworkShortName))].sort(),
    [controls]
  );

  const risksBySeverity = useMemo(() => {
    const items = draft?.riskItems ?? [];
    const buckets: Record<RiskSeverityBucket, DomainRiskItem[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };
    for (const item of items) {
      buckets[domainRiskSeverityBucket(item)].push(item);
    }
    return buckets;
  }, [draft?.riskItems]);

  const updateStage = (stage: RiskAssessmentStageKey, patch: Partial<StageProgress>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      [stage]: { ...draft[stage], ...patch },
    });
  };

  const toggleChecklist = (stage: RiskAssessmentStageKey, key: string) => {
    if (!draft) return;
    const current = draft[stage];
    updateStage(stage, {
      checklist: { ...current.checklist, [key]: !current.checklist[key] },
      status: current.status === 'not_started' ? 'in_progress' : current.status,
    });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSavedNote(null);
    try {
      const res = await fetch('/api/audits/risk-assessment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          owner: draft.owner,
          identification: draft.identification,
          analysis: draft.analysis,
          evaluation: draft.evaluation,
          riskItems: draft.riskItems,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Failed to save');
      setDomain(d.domain);
      setDraft(d.domain);
      setSavedNote('Domain assessment saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addRiskItem = () => {
    if (!draft) return;
    setDraft({
      ...draft,
      riskItems: [...draft.riskItems, createDomainRiskItem()],
    });
  };

  const updateRiskItem = (itemId: string, patch: Partial<DomainRiskItem>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      riskItems: draft.riskItems.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    });
  };

  const removeRiskItem = (itemId: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      riskItems: draft.riskItems.filter((item) => item.id !== itemId),
    });
  };

  if (!domain && !loading) {
    return (
      <AppShell title="Risk domain not found" subtitle="">
        <AuditSubNav />
        <Link
          href="/audits/risk-assessment"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to risk assessment
        </Link>
      </AppShell>
    );
  }

  if (loading || !draft) {
    return (
      <AppShell title="Risk assessment" subtitle="Loading…">
        <AuditSubNav />
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-500">
          Loading domain…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={draft.name} subtitle={`Owner: ${draft.owner} · Status: ${draft.status.replace('_', ' ')}`}>
      <AuditSubNav />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/audits/risk-assessment"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all domains
        </Link>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}
      {savedNote && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {savedNote}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700">Domain owner</label>
        <input
          type="text"
          value={draft.owner}
          onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
          className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="mb-8 space-y-6">
        {STAGE_KEYS.map((stage) => (
          <StageSection
            key={stage}
            stage={stage}
            progress={draft[stage]}
            onStatusChange={(status) => updateStage(stage, { status })}
            onNotesChange={(notes) => updateStage(stage, { notes })}
            onToggleChecklist={(key) => toggleChecklist(stage, key)}
          />
        ))}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ListChecks className="h-5 w-5 text-brand-500" />
          Mapped controls (SOC 2 / ISO 27001)
        </h2>
        <div className="flex flex-wrap gap-2">
          {draft.controlRefs.map((control) => (
            <ControlReference key={control} reference={control} variant="badge" />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Risk items by inherent severity</h2>
          <button
            type="button"
            onClick={addRiskItem}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add risk
          </button>
        </div>

        {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
          const items = risksBySeverity[severity];
          if (items.length === 0) return null;
          return (
            <div key={severity} className="mb-6">
              <h3 className="mb-2 text-sm font-semibold capitalize text-slate-700">{severity}</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <RiskItemEditor
                    key={item.id}
                    item={item}
                    controls={controls}
                    frameworks={frameworks}
                    onChange={(patch) => updateRiskItem(item.id, patch)}
                    onRemove={() => removeRiskItem(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {draft.riskItems.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No risk items recorded yet. Add risks during identification and analysis stages.
          </p>
        )}
      </section>
    </AppShell>
  );
}

function StageSection({
  stage,
  progress,
  onStatusChange,
  onNotesChange,
  onToggleChecklist,
}: {
  stage: RiskAssessmentStageKey;
  progress: StageProgress;
  onStatusChange: (status: StageProgress['status']) => void;
  onNotesChange: (notes: string) => void;
  onToggleChecklist: (key: string) => void;
}) {
  const labels = stageChecklistLabels(stage);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{RISK_ASSESSMENT_STAGE_LABELS[stage]}</h2>
        <select
          value={progress.status}
          onChange={(e) => onStatusChange(e.target.value as StageProgress['status'])}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        >
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={progress.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Record what was done in this stage for this domain…"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Key activities</p>
        <ul className="space-y-2">
          {labels.map((label, index) => {
            const key = `activity-${index}`;
            const checked = Boolean(progress.checklist[key]);
            return (
              <li key={key} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleChecklist(key)}
                  className="mt-1"
                />
                <span className={checked ? 'text-slate-500 line-through' : ''}>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function RiskItemEditor({
  item,
  controls,
  frameworks,
  onChange,
  onRemove,
}: {
  item: DomainRiskItem;
  controls: LinkableControl[];
  frameworks: string[];
  onChange: (patch: Partial<DomainRiskItem>) => void;
  onRemove: () => void;
}) {
  const isClosed = item.status === 'closed';
  const inherentScore = domainRiskInherentScore(item);
  const severity = domainRiskSeverityBucket(item);
  const presentLikelihood = item.residualLikelihood ?? (isClosed ? 'unlikely' : null);
  const presentImpact = item.residualImpact ?? (isClosed ? 'minor' : null);
  const presentScore = domainRiskPresentScore(item);
  const presentInvalid = isClosed && presentScore != null && isHighOrCriticalScore(presentScore);
  const linkedControl = controls.find((c) => c.id === item.controlId);

  const handleStatusChange = (status: RiskStatus) => {
    if (status === 'closed') {
      onChange({
        status,
        residualLikelihood: item.residualLikelihood ?? 'unlikely',
        residualImpact: item.residualImpact ?? 'minor',
      });
    } else {
      onChange({ status });
    }
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Linked control * <span className="font-normal text-slate-500">(activated frameworks only)</span>
            </label>
            <select
              value={item.controlId}
              onChange={(e) => onChange({ controlId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select control…</option>
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
            {linkedControl && (
              <p className="mt-1 text-xs text-slate-500">
                {linkedControl.frameworkShortName} · {linkedControl.reference}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
              SEVERITY_STYLES[severity]
            )}
          >
            {severity}
          </span>
          <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
        <textarea
          value={item.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
          placeholder="Risk description…"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
        <p className="text-xs font-medium text-slate-700">Inherent risk</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Likelihood</label>
            <select
              value={item.likelihood}
              disabled={isClosed}
              onChange={(e) => onChange({ likelihood: e.target.value as RiskLikelihood })}
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
              value={item.impact}
              disabled={isClosed}
              onChange={(e) => onChange({ impact: e.target.value as RiskImpact })}
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
              {inherentScore} ({riskScoreLabel(inherentScore)})
            </p>
          </div>
        </div>
      </div>

      {isClosed ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
          <p className="text-xs font-medium text-slate-700">
            Present risk (required when closed — medium or low only)
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Present likelihood</label>
              <select
                value={presentLikelihood ?? 'unlikely'}
                onChange={(e) =>
                  onChange({ residualLikelihood: e.target.value as RiskLikelihood })
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Present impact</label>
              <select
                value={presentImpact ?? 'minor'}
                onChange={(e) => onChange({ residualImpact: e.target.value as RiskImpact })}
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Present score</label>
              <p
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium bg-white',
                  presentInvalid ? 'border-red-300 text-red-700' : 'border-emerald-200'
                )}
              >
                {presentScore != null
                  ? `${presentScore} (${riskScoreLabel(presentScore)})`
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-medium text-slate-700">
            Present risk (optional — defaults to inherent score until set)
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Present likelihood</label>
              <select
                value={item.residualLikelihood ?? ''}
                onChange={(e) =>
                  onChange({
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Present impact</label>
              <select
                value={item.residualImpact ?? ''}
                onChange={(e) =>
                  onChange({
                    residualImpact: e.target.value ? (e.target.value as RiskImpact) : null,
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Present score</label>
              <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
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
            value={item.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {RISK_CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Treatment</label>
          <select
            value={item.treatment}
            onChange={(e) => onChange({ treatment: e.target.value as RiskTreatment })}
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
            value={item.status}
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
          <label className="block text-xs font-medium text-slate-600 mb-1">Assessment stage</label>
          <select
            value={item.stage}
            onChange={(e) => onChange({ stage: e.target.value as DomainRiskItem['stage'] })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="identification">Identification</option>
            <option value="analysis">Analysis</option>
            <option value="evaluation">Evaluation</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Owner</label>
          <input
            value={item.owner}
            onChange={(e) => onChange({ owner: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
          <input
            type="date"
            value={item.dueDate ?? ''}
            onChange={(e) => onChange({ dueDate: e.target.value || null })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Mitigation plan</label>
        <textarea
          rows={2}
          value={item.mitigationPlan}
          onChange={(e) => onChange({ mitigationPlan: e.target.value })}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {presentInvalid && (
        <p className="text-xs text-red-700">
          Closed risks require present risk of medium or low (not high or critical).
        </p>
      )}
    </article>
  );
}
