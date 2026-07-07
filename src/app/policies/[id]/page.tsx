'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PolicyApprovalMatrixPanel } from '@/components/policies/approval-matrix-panel';
import { PolicyContentPreview } from '@/components/policies/policy-content-preview';
import { PolicyStandardsReviewPanel } from '@/components/policies/policy-standards-review-panel';
import type { PolicyStandardsReview } from '@/lib/policies/policy-review-types';
import { ArrowLeft, Download, Edit3, Eye, Loader2, RefreshCw, Save, Upload } from 'lucide-react';
import { getDefaultApprovalMatrix, type PolicyApprovalStep } from '@/lib/policies/approval-matrix';
import { cn } from '@/lib/utils';
import { ControlReference } from '@/components/controls/control-reference';

interface ApprovalMember {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  approvalRoles: string[];
}

interface Policy {
  id: string;
  templateId: string | null;
  categoryId: string;
  title: string;
  status: string;
  version: string;
  owner: string;
  content: string;
  source: string;
  isoReference: string;
  documentType: string;
  originalFileName: string | null;
  reviewDate: string | null;
  approvedAt: string | null;
  approvalMatrix?: PolicyApprovalStep[];
  standardsReview?: PolicyStandardsReview | null;
}

interface ControlRoadmapItem {
  controlId: string;
  reference: string;
  title: string;
  frameworkId: string;
  complianceStatus: string;
  complianceMethod: string | null;
  ragStatus: 'green' | 'amber' | 'red';
  openIssueCount: number;
  openRiskCount: number;
}

const RAG_DOT: Record<string, string> = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

const STATUSES = ['draft', 'review', 'approved', 'archived'];

export default function PolicyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const showReview = searchParams.get('review') === '1';

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [standardsReview, setStandardsReview] = useState<PolicyStandardsReview | null>(null);
  const [roadmap, setRoadmap] = useState<ControlRoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [approvalMatrix, setApprovalMatrix] = useState<PolicyApprovalStep[]>([]);
  const [members, setMembers] = useState<ApprovalMember[]>([]);
  const [editContent, setEditContent] = useState(false);

  const loadPolicy = () =>
    Promise.all([
      fetch(`/api/policies/${id}`).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Not found');
        return d as { policy: Policy; roadmap: ControlRoadmapItem[] };
      }),
      fetch('/api/members').then(async (r) => {
        const d = await r.json();
        if (!r.ok) return { members: [] };
        return d as { members: ApprovalMember[] };
      }),
    ]).then(([policyData, memberData]) => {
      setPolicy(policyData.policy);
      setStandardsReview(policyData.policy.standardsReview ?? null);
      setRoadmap(policyData.roadmap ?? []);
      setMembers(memberData.members ?? []);
      setForm({
        title: policyData.policy.title,
        content: policyData.policy.content,
        status: policyData.policy.status,
        version: policyData.policy.version,
        owner: policyData.policy.owner,
        isoReference: policyData.policy.isoReference,
        reviewDate: policyData.policy.reviewDate ? policyData.policy.reviewDate.slice(0, 10) : '',
      });
      setApprovalMatrix(
        policyData.policy.approvalMatrix?.length
          ? policyData.policy.approvalMatrix
          : getDefaultApprovalMatrix(policyData.policy.categoryId, memberData.members ?? [])
      );
    });

  const [form, setForm] = useState({
    title: '',
    content: '',
    status: 'draft',
    version: '1.0',
    owner: '',
    isoReference: '',
    reviewDate: '',
  });

  useEffect(() => {
    loadPolicy()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const syncControls = async () => {
    setSyncing(true);
    setError(null);
    setSyncMessage(null);
    try {
      const r = await fetch(`/api/policies/${id}/sync`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Sync failed');
      const green = (d.syncResults ?? []).filter(
        (s: { ragStatus: string }) => s.ragStatus === 'green'
      ).length;
      setSyncMessage(
        `Synced ${d.syncResults?.length ?? 0} control(s). ${green} marked green (implemented).`
      );
      await loadPolicy();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const r = await fetch(`/api/policies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          reviewDate: form.reviewDate || null,
          approvalMatrix,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Save failed');
      setPolicy(d.policy);
      setSaved(true);
      await loadPolicy();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const replaceFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const r = await fetch(`/api/policies/${id}/file`, {
        method: 'POST',
        body: formData,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Upload failed');
      setPolicy(d.policy);
      if (d.review) setStandardsReview(d.review);
      if (d.policy?.content) {
        setForm((prev) => ({ ...prev, content: d.policy.content }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Policy" subtitle="Loading…">
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!policy) {
    return (
      <AppShell title="Policy not found" subtitle="">
        <Link href="/policies" className="text-brand-600 hover:underline">
          Back to policies
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title={form.title || 'Edit policy'} subtitle={policy.isoReference || 'ISMS policy document'}>
      <div className="mb-6">
        <Link
          href="/policies"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All policies
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Policy saved — linked controls updated automatically.
        </div>
      )}
      {syncMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {syncMessage}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-slate-700">
        Complete the <strong>approval matrix</strong> and mark the document <strong>Approved</strong> to
        fully sync linked ISO 27001 controls to <strong>Implemented</strong> with policy evidence — turning
        them <strong>green</strong> when no open issues or risks remain. Draft uploads and in-review
        documents may partially sync before final approval.
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Metadata</h3>
            <div className="mt-3 space-y-3">
              <label className="block text-sm">
                <span className="text-slate-600">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Version</span>
                <input
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Owner</span>
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">ISO reference</span>
                <input
                  value={form.isoReference}
                  onChange={(e) => setForm({ ...form, isoReference: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Review date</span>
                <input
                  type="date"
                  value={form.reviewDate}
                  onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Source: <span className="capitalize">{policy.source}</span>
              {policy.originalFileName ? ` · ${policy.originalFileName}` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save policy'}
          </button>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Linked controls</h3>
              <button
                type="button"
                onClick={syncControls}
                disabled={syncing}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} />
                Sync
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Roadmap to green — each control updates when this document is in place.
            </p>
            {roadmap.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No ISO control mapping for this document.</p>
            ) : (
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {roadmap.map((item) => (
                  <li key={item.controlId}>
                    <Link
                      href={`/controls/${item.controlId}`}
                      className="flex items-start gap-2 rounded-lg border border-slate-100 px-2 py-2 hover:bg-slate-50"
                    >
                      <span
                        className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', RAG_DOT[item.ragStatus])}
                        title={item.ragStatus}
                      />
                      <span className="min-w-0">
                        <ControlReference
                          controlId={item.controlId}
                          reference={item.reference}
                          title={item.title}
                          className="text-xs"
                        />
                        <span className="block truncate text-sm text-slate-800">{item.title}</span>
                        <span className="block text-xs capitalize text-slate-500">
                          {item.complianceStatus.replace(/_/g, ' ')}
                          {item.openIssueCount + item.openRiskCount > 0
                            ? ` · ${item.openIssueCount + item.openRiskCount} blocker(s)`
                            : ''}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <PolicyStandardsReviewPanel
            policyId={id}
            initialReview={standardsReview}
            defaultExpanded={showReview || (standardsReview?.recommendations.some((r) => r.status === 'open') ?? false)}
            onContentApplied={(content) => {
              setForm((prev) => ({ ...prev, content }));
              setPolicy((prev) => (prev ? { ...prev, content } : prev));
            }}
          />

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-900">Policy content</h3>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditContent(false)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors',
                      !editContent
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditContent(true)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors',
                      editContent
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit content
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/api/policies/${id}/download?format=docx`}
                  download
                  className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600"
                  title="Download as Word document (.docx) — includes approval matrix"
                >
                  <Download className="h-4 w-4" />
                  Download Word
                </a>
                <label
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 text-sm text-brand-600 hover:text-brand-700',
                    uploading && 'opacity-50'
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Attach / replace file'}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.md,.txt"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) replaceFile(f);
                    }}
                  />
                </label>
              </div>
            </div>
            {policy.source === 'upload' && !form.content && (
              <div className="border-b border-slate-100 px-6 py-6 text-center text-sm text-slate-500">
                Uploaded file: {policy.originalFileName ?? 'attached document'}. Edit text below or replace the file.
              </div>
            )}
            {editContent ? (
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={24}
                className="w-full resize-y border-0 px-4 py-4 font-mono text-sm text-slate-800 focus:ring-0"
                placeholder="Policy content (Markdown supported)…"
              />
            ) : (
              <div className="min-h-[32rem] overflow-auto bg-white">
                <PolicyContentPreview
                  title={form.title}
                  content={form.content}
                  version={form.version}
                  status={form.status}
                  owner={form.owner}
                  isoReference={form.isoReference}
                  documentType={policy.documentType}
                  reviewDate={form.reviewDate || null}
                  approvedAt={policy.approvedAt}
                />
              </div>
            )}
          </div>

          <PolicyApprovalMatrixPanel
            matrix={approvalMatrix}
            onChange={setApprovalMatrix}
            members={members}
            documentContext={{
              content: form.content,
              originalFileName: policy.originalFileName,
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
