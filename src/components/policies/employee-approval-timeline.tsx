'use client';

import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PolicyApprovalStatus } from '@/lib/policies/approval-matrix';
import { getStepStatusLabel, isAuthorStep } from '@/lib/policies/approval-matrix';

export interface ApprovalTimelineStep {
  id: string;
  role: string;
  description: string;
  required: boolean;
  assigneeName: string;
  assigneeTitle: string;
  assigneeEmail: string;
  status: PolicyApprovalStatus;
  decisionDate: string | null;
  comments: string;
  isMine?: boolean;
  actionable?: boolean;
  blockedReason?: string | null;
}

export function EmployeeApprovalTimeline({ steps }: { steps: ApprovalTimelineStep[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const done = step.status === 'approved';
        const rejected = !isAuthorStep(step) && step.status === 'rejected';
        const waiting = step.status === 'pending';
        const statusLabel = getStepStatusLabel(step);

        return (
          <li key={step.id} className="relative flex gap-4">
            {index < steps.length - 1 && (
              <span
                className="absolute left-[11px] top-8 h-[calc(100%-8px)] w-px bg-slate-200"
                aria-hidden
              />
            )}
            <div className="relative z-10 mt-0.5">
              {done ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : rejected ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : step.actionable ? (
                <Clock className="h-6 w-6 text-amber-500" />
              ) : (
                <Circle className="h-6 w-6 text-slate-300" />
              )}
            </div>
            <div
              className={cn(
                'min-w-0 flex-1 rounded-xl border px-4 py-3',
                step.isMine && step.actionable && 'border-brand-300 bg-brand-50/60',
                step.isMine && !step.actionable && 'border-slate-200 bg-slate-50',
                !step.isMine && 'border-slate-200 bg-white'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    {step.role}
                    {step.isMine && (
                      <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        Your step
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    done && 'bg-emerald-100 text-emerald-800',
                    rejected && 'bg-red-100 text-red-800',
                    waiting && 'bg-amber-100 text-amber-800'
                  )}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-700">
                <p>
                  {step.assigneeName || 'Unassigned'}
                  {step.assigneeTitle ? ` · ${step.assigneeTitle}` : ''}
                </p>
                {step.decisionDate && (
                  <p className="mt-1 text-xs text-slate-500">
                    {isAuthorStep(step) ? 'Prepared' : 'Decision'}: {step.decisionDate}
                  </p>
                )}
                {step.comments && (
                  <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-sm text-slate-600">
                    {step.comments}
                  </p>
                )}
                {step.isMine && step.blockedReason && step.status === 'pending' && (
                  <p className="mt-2 text-xs text-amber-700">{step.blockedReason}</p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
