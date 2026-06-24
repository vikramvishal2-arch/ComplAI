'use client';

import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PolicyApprovalStep, PolicyApprovalStatus } from '@/lib/policies/approval-matrix';
import {
  approvalMatrixProgress,
  hasPolicyDocumentVersion,
  isApprovalStepComplete,
  isAuthorStep,
  isAuthorVersionPrepared,
  markAuthorVersionPrepared,
  type PolicyDocumentContext,
} from '@/lib/policies/approval-matrix';

const STATUS_OPTIONS: { value: PolicyApprovalStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  approvalRoles: string[];
}

interface PolicyApprovalMatrixPanelProps {
  matrix: PolicyApprovalStep[];
  onChange: (matrix: PolicyApprovalStep[]) => void;
  members?: OrganizationMember[];
  documentContext?: PolicyDocumentContext;
  readOnly?: boolean;
}

export function PolicyApprovalMatrixPanel({
  matrix,
  onChange,
  members = [],
  documentContext,
  readOnly = false,
}: PolicyApprovalMatrixPanelProps) {
  const progress = approvalMatrixProgress(matrix, documentContext);

  const assignMember = (stepId: string, memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    onChange(
      matrix.map((step) =>
        step.id === stepId
          ? {
              ...step,
              assigneeName: member.name,
              assigneeTitle: member.title,
              assigneeEmail: member.email,
            }
          : step
      )
    );
  };

  const stepMembers = (stepId: string) => {
    const matched = members.filter((m) => m.approvalRoles.includes(stepId));
    return matched.length > 0 ? matched : members;
  };

  const updateStep = (id: string, patch: Partial<PolicyApprovalStep>) => {
    onChange(
      matrix.map((step) => {
        if (step.id !== id) return step;
        const next = { ...step, ...patch };
        if (patch.status === 'approved' && !next.decisionDate) {
          next.decisionDate = new Date().toISOString().slice(0, 10);
        }
        if (patch.status === 'pending') {
          next.decisionDate = null;
        }
        return next;
      })
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="font-semibold text-slate-900">Approval matrix</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Required sign-offs before the document can be marked Approved and controls turn green.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {progress.completed} / {progress.required} required
          </p>
          <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.map((step) => {
              const done = isApprovalStepComplete(step, documentContext);
              const authorPrepared = isAuthorStep(step) && isAuthorVersionPrepared(step, documentContext);
              return (
                <tr key={step.id} className={cn(!step.required && 'bg-slate-50/50')}>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-2">
                      {done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : step.status === 'rejected' ? (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span>
                        <span className="font-medium text-slate-900">{step.role}</span>
                        {!step.required && (
                          <span className="ml-1 text-xs text-slate-400">(optional)</span>
                        )}
                        <span className="mt-0.5 block text-xs text-slate-500">{step.description}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {members.length > 0 && !readOnly ? (
                      <select
                        value={
                          members.find(
                            (m) =>
                              m.name === step.assigneeName && m.email === step.assigneeEmail
                          )?.id ?? ''
                        }
                        onChange={(e) => {
                          if (e.target.value) assignMember(step.id, e.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5"
                      >
                        <option value="">Select approver…</option>
                        {stepMembers(step.id).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} — {m.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        disabled={readOnly}
                        value={step.assigneeName}
                        onChange={(e) => updateStep(step.id, { assigneeName: e.target.value })}
                        placeholder="Full name"
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 disabled:bg-slate-50"
                      />
                    )}
                    {step.assigneeEmail && (
                      <p className="mt-1 text-xs text-slate-400">{step.assigneeEmail}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <input
                      disabled={readOnly}
                      value={step.assigneeTitle}
                      onChange={(e) => updateStep(step.id, { assigneeTitle: e.target.value })}
                      placeholder="Job title"
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    {isAuthorStep(step) ? (
                      <div className="space-y-2">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                            authorPrepared
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          )}
                        >
                          {authorPrepared ? 'Prepared' : 'Pending preparation'}
                        </span>
                        {!readOnly && !authorPrepared && (
                          <button
                            type="button"
                            disabled={!hasPolicyDocumentVersion(documentContext)}
                            onClick={() =>
                              onChange(
                                matrix.map((s) =>
                                  s.id === step.id ? markAuthorVersionPrepared(s, s.comments) : s
                                )
                              )
                            }
                            className="block rounded-lg border border-brand-300 bg-brand-50 px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Mark version prepared
                          </button>
                        )}
                        {!readOnly && authorPrepared && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStep(step.id, {
                                status: 'pending',
                                decisionDate: null,
                              })
                            }
                            className="block text-xs text-slate-500 hover:text-slate-700"
                          >
                            Reset preparation
                          </button>
                        )}
                        {!hasPolicyDocumentVersion(documentContext) && !authorPrepared && (
                          <p className="text-xs text-slate-500">
                            Add content or upload a file first
                          </p>
                        )}
                      </div>
                    ) : (
                      <select
                        disabled={readOnly}
                        value={step.status}
                        onChange={(e) =>
                          updateStep(step.id, { status: e.target.value as PolicyApprovalStatus })
                        }
                        className={cn(
                          'w-full rounded-lg border px-2 py-1.5 disabled:bg-slate-50',
                          step.status === 'approved' && 'border-emerald-300 bg-emerald-50',
                          step.status === 'rejected' && 'border-red-300 bg-red-50'
                        )}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <input
                      type="date"
                      disabled={readOnly}
                      value={step.decisionDate ?? ''}
                      onChange={(e) =>
                        updateStep(step.id, { decisionDate: e.target.value || null })
                      }
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <input
                      disabled={readOnly}
                      value={step.comments}
                      onChange={(e) => updateStep(step.id, { comments: e.target.value })}
                      placeholder="Notes"
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 disabled:bg-slate-50"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
