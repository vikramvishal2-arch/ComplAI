'use client';

import { useRef, useState } from 'react';
import { AlertCircle, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import type { ControlIssue, ControlIssueSeverity, ControlIssueStatus } from '@/lib/types';
import type { IssueTemplate } from '@/lib/data/control-templates';
import { ISSUE_SEVERITY_LABELS, ISSUE_STATUS_LABELS } from '@/lib/types';
import { TemplatePicker } from '@/components/controls/template-picker';
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
  issueTemplates?: IssueTemplate[];
}

export function ControlIssuesPanel({
  controlId,
  issues,
  onChange,
  issueTemplates = [],
}: ControlIssuesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as ControlIssueSeverity,
    raisedBy: '',
    assignee: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const issueFormRef = useRef<HTMLDivElement>(null);

  const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'in_progress').length;

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
        body: JSON.stringify({ ...form, dueDate: form.dueDate || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create issue');
      onChange([data.issue, ...issues]);
      setForm({ title: '', description: '', severity: 'medium', raisedBy: '', assignee: '', dueDate: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <TemplatePicker
        title="Issue templates"
        variant="issues"
        appliedId={appliedTemplateId}
        templates={issueTemplates.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          previewFields: [
            { label: 'Issue title', value: t.title },
            { label: 'Description', value: t.description },
            { label: 'Severity', value: ISSUE_SEVERITY_LABELS[t.severity] },
          ],
        }))}
        onApply={(templateId) => {
          const t = issueTemplates.find((x) => x.id === templateId);
          if (!t) return;
          setForm({
            title: t.title,
            description: t.description,
            severity: t.severity,
            raisedBy: '',
            assignee: '',
            dueDate: '',
          });
          setAppliedTemplateId(templateId);
          setShowForm(true);
          setError(null);
          setTemplateNotice(`"${t.name}" applied — review and submit the issue form below.`);
          setTimeout(() => setTemplateNotice(null), 4000);
          requestAnimationFrame(() => {
            issueFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }}
      />

      {templateNotice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {templateNotice}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {openIssues} open issue{openIssues !== 1 ? 's' : ''} · {issues.length} total
        </p>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setError(null); }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Raise issue'}
        </button>
      </div>

      {showForm && (
        <div
          ref={issueFormRef}
          className="scroll-mt-6 rounded-xl border-2 border-brand-200 bg-brand-50/30 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">New control issue</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Issue title *"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value as ControlIssueSeverity })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {(Object.keys(ISSUE_SEVERITY_LABELS) as ControlIssueSeverity[]).map((s) => (
                <option key={s} value={s}>{ISSUE_SEVERITY_LABELS[s]}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={submitIssue}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
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
              controlId={controlId}
              expanded={expandedId === issue.id}
              onToggle={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
              onChange={onChange}
              issues={issues}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function IssueCard({
  issue,
  controlId,
  expanded,
  onToggle,
  onChange,
  issues,
}: {
  issue: ControlIssue;
  controlId: string;
  expanded: boolean;
  onToggle: () => void;
  onChange: (issues: ControlIssue[]) => void;
  issues: ControlIssue[];
}) {
  const [local, setLocal] = useState(issue);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/controls/${controlId}/issues/${issue.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(local),
    });
    const data = await res.json();
    if (res.ok) onChange(issues.map((i) => (i.id === issue.id ? data.issue : i)));
    setSaving(false);
  };

  const remove = async () => {
    const res = await fetch(`/api/controls/${controlId}/issues/${issue.id}`, { method: 'DELETE' });
    if (res.ok) onChange(issues.filter((i) => i.id !== issue.id));
  };

  return (
    <li className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', SEVERITY_COLORS[issue.severity])}>
              {ISSUE_SEVERITY_LABELS[issue.severity]}
            </span>
            <span className="text-xs text-slate-500">{ISSUE_STATUS_LABELS[issue.status]}</span>
          </div>
          <p className="mt-1 font-medium text-slate-900 truncate">{issue.title}</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-3 bg-slate-50/50">
          <select
            value={local.status}
            onChange={(e) => setLocal({ ...local, status: e.target.value as ControlIssueStatus })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            {(Object.keys(ISSUE_STATUS_LABELS) as ControlIssueStatus[]).map((s) => (
              <option key={s} value={s}>{ISSUE_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400">Created {formatDateTime(issue.createdAt)}</p>
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={remove} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600">
              <Trash2 className="h-3 w-3 inline" /> Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
