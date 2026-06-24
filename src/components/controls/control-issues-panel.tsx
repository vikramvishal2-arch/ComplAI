'use client';

import { useState } from 'react';
import { AlertCircle, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import type {
  ControlIssue,
  ControlIssueSeverity,
  ControlIssueStatus,
} from '@/lib/types';
import {
  ISSUE_SEVERITY_LABELS,
  ISSUE_STATUS_LABELS,
} from '@/lib/types';
import { cn, formatDateTime } from '@/lib/utils';

const SEVERITY_COLORS: Record<ControlIssueSeverity, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-slate-100 text-slate-700',
};

interface ControlIssuesPanelProps {
  controlId: string;
  issues: ControlIssue[];
  onChange: (issues: ControlIssue[]) => void;
}

interface IssueFormState {
  title: string;
  description: string;
  severity: ControlIssueSeverity;
  raisedBy: string;
  assignee: string;
  dueDate: string;
}

const emptyForm = (): IssueFormState => ({
  title: '',
  description: '',
  severity: 'medium',
  raisedBy: '',
  assignee: '',
  dueDate: '',
});

export function ControlIssuesPanel({
  controlId,
  issues,
  onChange,
}: ControlIssuesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<IssueFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openIssues = issues.filter(
    (i) => i.status === 'open' || i.status === 'in_progress'
  ).length;

  const submitIssue = async () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/controls/${controlId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create issue');

      onChange([data.issue, ...issues]);
      setForm(emptyForm());
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  const updateIssue = async (issueId: string, patch: Partial<ControlIssue>) => {
    const res = await fetch(`/api/controls/${controlId}/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to update issue');
    onChange(issues.map((i) => (i.id === issueId ? data.issue : i)));
  };

  const removeIssue = async (issueId: string) => {
    const res = await fetch(`/api/controls/${controlId}/issues/${issueId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? 'Failed to delete issue');
    }
    onChange(issues.filter((i) => i.id !== issueId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            {openIssues} open issue{openIssues !== 1 ? 's' : ''} · {issues.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setError(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Raise issue'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border-2 border-brand-200 bg-brand-50/30 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">New control issue</h3>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Missing MFA on contractor VPN accounts"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the gap, audit finding, or compliance concern..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(e) =>
                  setForm({ ...form, severity: e.target.value as ControlIssueSeverity })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {(Object.keys(ISSUE_SEVERITY_LABELS) as ControlIssueSeverity[]).map((s) => (
                  <option key={s} value={s}>
                    {ISSUE_SEVERITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Raised by
              </label>
              <input
                type="text"
                value={form.raisedBy}
                onChange={(e) => setForm({ ...form, raisedBy: e.target.value })}
                placeholder="Auditor, team lead, etc."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={submitIssue}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Submitting...' : 'Submit issue'}
          </button>
        </div>
      )}

      {issues.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          No issues raised for this control yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              expanded={expandedId === issue.id}
              onToggle={() =>
                setExpandedId(expandedId === issue.id ? null : issue.id)
              }
              onUpdate={(patch) => updateIssue(issue.id, patch)}
              onDelete={() => removeIssue(issue.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function IssueCard({
  issue,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
}: {
  issue: ControlIssue;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<ControlIssue>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(issue);

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({
        title: local.title,
        description: local.description,
        severity: local.severity,
        status: local.status,
        raisedBy: local.raisedBy,
        assignee: local.assignee,
        dueDate: local.dueDate,
        resolutionNotes: local.resolutionNotes,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                SEVERITY_COLORS[issue.severity]
              )}
            >
              {ISSUE_SEVERITY_LABELS[issue.severity]}
            </span>
            <span className="text-xs text-slate-500">
              {ISSUE_STATUS_LABELS[issue.status]}
            </span>
          </div>
          <p className="mt-1 font-medium text-slate-900 truncate">{issue.title}</p>
          {issue.assignee && (
            <p className="text-xs text-slate-500 mt-0.5">Assignee: {issue.assignee}</p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-3 bg-slate-50/50">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
            <input
              type="text"
              value={local.title}
              onChange={(e) => setLocal({ ...local, title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={local.description}
              onChange={(e) => setLocal({ ...local, description: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={local.status}
                onChange={(e) =>
                  setLocal({ ...local, status: e.target.value as ControlIssueStatus })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                {(Object.keys(ISSUE_STATUS_LABELS) as ControlIssueStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {ISSUE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Severity</label>
              <select
                value={local.severity}
                onChange={(e) =>
                  setLocal({ ...local, severity: e.target.value as ControlIssueSeverity })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                {(Object.keys(ISSUE_SEVERITY_LABELS) as ControlIssueSeverity[]).map((s) => (
                  <option key={s} value={s}>
                    {ISSUE_SEVERITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assignee</label>
              <input
                type="text"
                value={local.assignee}
                onChange={(e) => setLocal({ ...local, assignee: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
              <input
                type="date"
                value={local.dueDate ?? ''}
                onChange={(e) =>
                  setLocal({ ...local, dueDate: e.target.value || null })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>
          {(local.status === 'resolved' || local.status === 'closed') && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Resolution notes
              </label>
              <textarea
                rows={2}
                value={local.resolutionNotes}
                onChange={(e) =>
                  setLocal({ ...local, resolutionNotes: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
              />
            </div>
          )}
          <p className="text-xs text-slate-400">
            Created {formatDateTime(issue.createdAt)}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => onDelete()}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
