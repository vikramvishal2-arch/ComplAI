'use client';

import { useState } from 'react';
import {
  ExternalLink,
  Plus,
  Trash2,
  Link2,
  Wrench,
} from 'lucide-react';
import type {
  RemediationAction,
  RemediationActionStatus,
  RemediationPlaybookLink,
} from '@/lib/types';
import { REMEDIATION_STATUS_LABELS } from '@/lib/types';

function newActionId(): string {
  return `ra-${crypto.randomUUID()}`;
}

interface RemediationFormProps {
  actions: RemediationAction[];
  suggestedLinks: RemediationPlaybookLink[];
  onChange: (actions: RemediationAction[]) => void;
}

export function RemediationForm({
  actions,
  suggestedLinks,
  onChange,
}: RemediationFormProps) {
  const addAction = (seed?: Partial<RemediationAction>) => {
    onChange([
      ...actions,
      {
        id: newActionId(),
        title: seed?.title ?? '',
        description: seed?.description ?? '',
        remediationLink: seed?.remediationLink ?? '',
        linkLabel: seed?.linkLabel ?? '',
        status: 'open',
        assignee: '',
        dueDate: null,
        notes: '',
      },
    ]);
  };

  const updateAction = (id: string, patch: Partial<RemediationAction>) => {
    onChange(actions.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAction = (id: string) => {
    onChange(actions.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {suggestedLinks.length > 0 && (
        <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-brand-900">Suggested remediation links</h3>
          </div>
          <p className="text-xs text-brand-700 mb-3">
            Click to add a pre-built remediation action with documentation link to this control.
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() =>
                  addAction({
                    title: link.title,
                    description: link.description,
                    remediationLink: link.url,
                    linkLabel: link.linkLabel,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 transition"
              >
                <Plus className="h-3 w-3" />
                {link.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {actions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
          <Wrench className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700">No remediation actions yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Add actions from suggested links above or create a custom remediation step.
          </p>
          <button
            type="button"
            onClick={() => addAction()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" /> Add remediation action
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAction(action.id)}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove action"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Remediation title
                </label>
                <input
                  type="text"
                  value={action.title}
                  onChange={(e) => updateAction(action.id, { title: e.target.value })}
                  placeholder="e.g. Enable MFA for all users in Okta"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Remediation steps / description
                </label>
                <textarea
                  rows={3}
                  value={action.description}
                  onChange={(e) => updateAction(action.id, { description: e.target.value })}
                  placeholder="Describe what needs to be done to remediate this control gap..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Remediation link (URL)
                  </label>
                  <input
                    type="url"
                    value={action.remediationLink}
                    onChange={(e) => updateAction(action.id, { remediationLink: e.target.value })}
                    placeholder="https://docs.example.com/runbook"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Link label
                  </label>
                  <input
                    type="text"
                    value={action.linkLabel}
                    onChange={(e) => updateAction(action.id, { linkLabel: e.target.value })}
                    placeholder="e.g. Okta MFA setup guide"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              {action.remediationLink && (
                <a
                  href={action.remediationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {action.linkLabel || 'Open remediation guide'}
                </a>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={action.status}
                    onChange={(e) =>
                      updateAction(action.id, {
                        status: e.target.value as RemediationActionStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                  >
                    {(Object.keys(REMEDIATION_STATUS_LABELS) as RemediationActionStatus[]).map(
                      (s) => (
                        <option key={s} value={s}>
                          {REMEDIATION_STATUS_LABELS[s]}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={action.assignee}
                    onChange={(e) => updateAction(action.id, { assignee: e.target.value })}
                    placeholder="Owner email or name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due date</label>
                  <input
                    type="date"
                    value={action.dueDate ?? ''}
                    onChange={(e) =>
                      updateAction(action.id, { dueDate: e.target.value || null })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={action.notes}
                  onChange={(e) => updateAction(action.id, { notes: e.target.value })}
                  placeholder="Progress notes or blockers"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addAction()}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            <Plus className="h-4 w-4" /> Add another action
          </button>
        </div>
      )}
    </div>
  );
}
