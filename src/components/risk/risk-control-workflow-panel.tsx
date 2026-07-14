'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CONTROL_EFFECTIVENESS_LABELS,
  DEVIATION_EFFECTIVENESS,
  ISSUE_STATUS_LABELS,
  type ControlEffectiveness,
  type RiskControlMapping,
} from '@/lib/types';
import { ControlReference } from '@/components/controls/control-reference';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

interface ControlOption {
  id: string;
  reference: string;
  title: string;
  frameworkShortName?: string;
}

interface RiskControlWorkflowPanelProps {
  riskId: string;
  riskOwner: string;
  mappings: RiskControlMapping[];
  controlOptions: ControlOption[];
  onChanged: () => void;
}

export function RiskControlWorkflowPanel({
  riskId,
  riskOwner,
  mappings,
  controlOptions,
  onChanged,
}: RiskControlWorkflowPanelProps) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addControlId, setAddControlId] = useState('');
  const [notesByControl, setNotesByControl] = useState<Record<string, string>>({});
  const [assigneeByControl, setAssigneeByControl] = useState<Record<string, string>>({});

  const mappedIds = useMemo(() => new Set(mappings.map((m) => m.controlId)), [mappings]);
  const availableToAdd = controlOptions.filter((c) => !mappedIds.has(c.id));

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusyKey(key);
    setError(null);
    setMessage(null);
    try {
      await fn();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyKey(null);
    }
  };

  const addControl = async () => {
    if (!addControlId) return;
    await run('add', async () => {
      const controlIds = [...mappings.map((m) => m.controlId), addControlId];
      const res = await fetch(`/api/risks/${riskId}/workflow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controlIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to map control');
      setAddControlId('');
      setMessage('Control mapped to this risk');
    });
  };

  const removeControl = async (controlId: string) => {
    if (mappings.length <= 1) {
      setError('A risk must stay mapped to at least one control');
      return;
    }
    await run(`remove-${controlId}`, async () => {
      const controlIds = mappings
        .map((m) => m.controlId)
        .filter((id) => id !== controlId);
      const res = await fetch(`/api/risks/${riskId}/workflow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controlIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to remove mapping');
      setMessage('Control mapping removed');
    });
  };

  const assess = async (controlId: string, effectiveness: ControlEffectiveness) => {
    await run(`assess-${controlId}-${effectiveness}`, async () => {
      const res = await fetch(`/api/risks/${riskId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assess',
          controlId,
          effectiveness,
          notes: notesByControl[controlId] ?? '',
          assignee: assigneeByControl[controlId] || riskOwner,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Assessment failed');
      if (data.issueCreated) {
        setMessage(
          `Control marked ${CONTROL_EFFECTIVENESS_LABELS[effectiveness].toLowerCase()} — issue created automatically`
        );
      } else if (DEVIATION_EFFECTIVENESS.includes(effectiveness) && data.issue) {
        setMessage('Deviation recorded — existing open issue linked');
      } else {
        setMessage(`Control assessed as ${CONTROL_EFFECTIVENESS_LABELS[effectiveness].toLowerCase()}`);
      }
    });
  };

  const retest = async (controlId: string, result: 'passed' | 'failed') => {
    await run(`retest-${controlId}-${result}`, async () => {
      const res = await fetch(`/api/risks/${riskId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retest',
          controlId,
          result,
          notes: notesByControl[controlId] ?? '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Re-test failed');
      if (result === 'passed') {
        setMessage('Re-test passed — issue closed and control marked effective');
      } else {
        setMessage('Re-test failed — risk escalated (likelihood increased, status treating)');
      }
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Control workflow</h3>
          <p className="mt-1 text-xs text-slate-500">
            Risk → mapped controls → assess effectiveness → auto-issue on deviation → remediate →
            re-test
          </p>
        </div>
      </div>

      <ol className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-600">
        {[
          '1. Map controls',
          '2. Assess',
          '3. Auto-issue if failed',
          '4. Remediate',
          '5. Re-test',
        ].map((step) => (
          <li
            key={step}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1"
          >
            {step}
          </li>
        ))}
      </ol>

      {message && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-4 space-y-4">
        {mappings.map((mapping) => {
          const isDeviation = DEVIATION_EFFECTIVENESS.includes(mapping.effectiveness);
          const hasOpenIssue =
            mapping.linkedIssue &&
            (mapping.linkedIssue.status === 'open' ||
              mapping.linkedIssue.status === 'in_progress');

          return (
            <div
              key={mapping.id}
              className={cn(
                'rounded-lg border p-4',
                isDeviation ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {mapping.isPrimary && (
                      <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-700">
                        Primary
                      </span>
                    )}
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      {mapping.frameworkShortName}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-medium',
                        mapping.effectiveness === 'effective'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDeviation
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {CONTROL_EFFECTIVENESS_LABELS[mapping.effectiveness]}
                    </span>
                  </div>
                  <ControlReference
                    controlId={mapping.controlId}
                    reference={mapping.controlReference}
                    title={mapping.controlTitle}
                    className="mt-1 text-sm"
                  />
                </div>
                {!mapping.isPrimary && (
                  <button
                    type="button"
                    disabled={busyKey !== null}
                    onClick={() => removeControl(mapping.controlId)}
                    className="text-xs text-slate-500 hover:text-red-600"
                  >
                    Unmap
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="Assessment / remediation notes"
                  value={notesByControl[mapping.controlId] ?? ''}
                  onChange={(e) =>
                    setNotesByControl((prev) => ({
                      ...prev,
                      [mapping.controlId]: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
                <input
                  placeholder={`Issue owner (default: ${riskOwner || 'risk owner'})`}
                  value={assigneeByControl[mapping.controlId] ?? ''}
                  onChange={(e) =>
                    setAssigneeByControl((prev) => ({
                      ...prev,
                      [mapping.controlId]: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyKey !== null}
                  onClick={() => assess(mapping.controlId, 'effective')}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {busyKey === `assess-${mapping.controlId}-effective` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Effective
                </button>
                {(['ineffective', 'failed', 'non_compliant'] as ControlEffectiveness[]).map(
                  (eff) => (
                    <button
                      key={eff}
                      type="button"
                      disabled={busyKey !== null}
                      onClick={() => assess(mapping.controlId, eff)}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                    >
                      {busyKey === `assess-${mapping.controlId}-${eff}` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldAlert className="h-3.5 w-3.5" />
                      )}
                      {CONTROL_EFFECTIVENESS_LABELS[eff]}
                    </button>
                  )
                )}
              </div>

              {hasOpenIssue && mapping.linkedIssue && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-medium text-slate-800">Open issue</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                      {ISSUE_STATUS_LABELS[mapping.linkedIssue.status]}
                    </span>
                    <span className="text-slate-500">
                      Owner: {mapping.linkedIssue.assignee || 'Unassigned'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{mapping.linkedIssue.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/controls/${mapping.controlId}?tab=issues`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Open remediation →
                    </Link>
                    <button
                      type="button"
                      disabled={busyKey !== null}
                      onClick={() => retest(mapping.controlId, 'passed')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busyKey === `retest-${mapping.controlId}-passed` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Re-test passed → close issue
                    </button>
                    <button
                      type="button"
                      disabled={busyKey !== null}
                      onClick={() => retest(mapping.controlId, 'failed')}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {busyKey === `retest-${mapping.controlId}-failed` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      Re-test failed → escalate risk
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {availableToAdd.length > 0 && (
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Map additional control
            </label>
            <select
              value={addControlId}
              onChange={(e) => setAddControlId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select control…</option>
              {availableToAdd.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.frameworkShortName ? `${c.frameworkShortName} · ` : ''}
                  {c.reference} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!addControlId || busyKey !== null}
            onClick={addControl}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {busyKey === 'add' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add mapping
          </button>
        </div>
      )}
    </section>
  );
}
