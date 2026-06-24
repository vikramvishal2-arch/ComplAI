'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { EmployeeApprovalTimeline } from '@/components/policies/employee-approval-timeline';
import { ArrowLeft, Download, FilePenLine, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAuthorStep } from '@/lib/policies/approval-matrix';

interface ApprovalView {
  member: { id: string; name: string; title: string; email: string };
  hasDocument: boolean;
  policy: {
    id: string;
    title: string;
    status: string;
    version: string;
    isoReference: string;
    content: string;
    owner: string;
    originalFileName: string | null;
  };
  steps: Array<{
    id: string;
    role: string;
    description: string;
    required: boolean;
    assigneeName: string;
    assigneeTitle: string;
    assigneeEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    decisionDate: string | null;
    comments: string;
    isMine: boolean;
    isAuthor?: boolean;
    actionable: boolean;
    blockedReason: string | null;
  }>;
  progress: { completed: number; required: number; percent: number };
}

export default function EmployeeApprovalReviewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const policyId = params.policyId as string;
  const memberId = searchParams.get('member') ?? '';

  const [view, setView] = useState<ApprovalView | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comments, setComments] = useState('');

  const myAuthorStep = view?.steps.find((s) => s.isMine && isAuthorStep(s));
  const myReviewStep = view?.steps.find((s) => s.isMine && s.actionable && !isAuthorStep(s));

  const load = () => {
    if (!memberId) {
      setError('Select an employee from the approvals inbox');
      setLoading(false);
      return Promise.resolve();
    }
    return fetch(`/api/policies/${policyId}/approval-view?memberId=${memberId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Not found');
        return d as ApprovalView;
      })
      .then((d) => {
        setView(d);
        const mine = d.steps.find((s) => s.isMine);
        setComments(mine?.comments ?? '');
      });
  };

  useEffect(() => {
    load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [policyId, memberId]);

  const prepareVersion = async () => {
    if (!memberId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const r = await fetch(`/api/policies/${policyId}/approval-view`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          action: 'prepare_version',
          comments,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Submit failed');
      setSuccess(`Version ${view?.policy.version ?? ''} prepared and submitted for review.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async (status: 'approved' | 'rejected') => {
    if (!myReviewStep || !memberId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const r = await fetch(`/api/policies/${policyId}/approval-view`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          stepId: myReviewStep.id,
          status,
          comments,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Submit failed');
      setSuccess(status === 'approved' ? 'Approval recorded.' : 'Rejection recorded.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Review document" subtitle="Loading…">
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!view) {
    return (
      <AppShell title="Not found" subtitle="">
        <p className="text-sm text-slate-600">{error ?? 'This document is not assigned to you.'}</p>
        <Link
          href={`/policies/approvals${memberId ? `?member=${memberId}` : ''}`}
          className="mt-4 inline-block text-brand-600 hover:underline"
        >
          Back to inbox
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={view.policy.title} subtitle={`${view.member.name} · ${view.member.title}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/policies/approvals?member=${memberId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          My approvals
        </Link>
        <div className="flex items-center gap-3">
          {myAuthorStep && (
            <Link
              href={`/policies/${policyId}`}
              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              <FilePenLine className="h-4 w-4" />
              Edit document
            </Link>
          )}
          <a
            href={`/api/policies/${policyId}/download?format=docx`}
            download
            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
          >
            <Download className="h-4 w-4" />
            Download Word
          </a>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-slate-700">
        You are acting as <strong>{view.member.name}</strong>.
        {myAuthorStep
          ? ' As author, prepare and submit the document version — reviewers approve or reject after you.'
          : ' You can approve or reject only when earlier steps (including prepared version) are complete.'}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900">Document summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Version</dt>
                <dd className="text-slate-900">{view.policy.version}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd className="capitalize text-slate-900">{view.policy.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Owner</dt>
                <dd className="text-slate-900">{view.policy.owner || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">ISO reference</dt>
                <dd className="text-slate-900">{view.policy.isoReference || '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Progress</dt>
                <dd className="text-slate-900">
                  {view.progress.completed}/{view.progress.required} required steps
                </dd>
              </div>
            </dl>
          </div>

          {myAuthorStep && myAuthorStep.actionable ? (
            <div className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900">
                Prepare version {view.policy.version}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{myAuthorStep.description}</p>
              {!view.hasDocument && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Add policy content or upload a file before submitting this version for review.
                </p>
              )}
              <label className="mt-4 block text-sm">
                <span className="text-slate-600">Notes (optional)</span>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="What changed in this version…"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <button
                type="button"
                disabled={saving || !view.hasDocument}
                onClick={prepareVersion}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Submit prepared version
              </button>
            </div>
          ) : myReviewStep ? (
            <div className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900">Your decision — {myReviewStep.role}</h3>
              <p className="mt-1 text-sm text-slate-500">{myReviewStep.description}</p>
              <label className="mt-4 block text-sm">
                <span className="text-slate-600">Comments</span>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  placeholder="Optional notes for the audit trail…"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => submitReview('approved')}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => submitReview('rejected')}
                  className="inline-flex rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {myAuthorStep && myAuthorStep.status === 'approved'
                ? `You prepared version ${view.policy.version}. Waiting for reviewers.`
                : myAuthorStep
                  ? myAuthorStep.blockedReason ?? 'Complete the document before submitting the version.'
                  : view.steps.some((s) => s.isMine && s.status === 'approved')
                    ? 'You have already completed your step on this document.'
                    : view.steps.some((s) => s.isMine && s.status === 'rejected')
                      ? 'You rejected this document.'
                      : view.steps.some((s) => s.isMine)
                        ? view.steps.find((s) => s.isMine)?.blockedReason ??
                          'Your step is not ready for action yet.'
                        : 'You are not assigned to this document.'}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900">Approval workflow</h3>
            <div className="mt-4">
              <EmployeeApprovalTimeline steps={view.steps} />
            </div>
          </div>

          {view.policy.content && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="font-semibold text-slate-900">Document preview</h3>
              </div>
              <pre
                className={cn(
                  'max-h-96 overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-xs text-slate-700'
                )}
              >
                {view.policy.content.slice(0, 6000)}
                {view.policy.content.length > 6000
                  ? '\n\n… (truncated — download for full document)'
                  : ''}
              </pre>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
