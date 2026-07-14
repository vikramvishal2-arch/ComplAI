'use client';

import { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Paperclip,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import type { ControlEvidence, ControlIssue, EvidenceContext } from '@/lib/types';
import { MAX_EVIDENCE_FILE_BYTES } from '@/lib/evidence/constants';
import { EVIDENCE_CONTEXT_LABELS } from '@/lib/evidence/constants';
import { formatDateTime, cn } from '@/lib/utils';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type EvidenceReview = {
  verdict: 'strong' | 'acceptable' | 'weak' | 'mismatched';
  score: number;
  summary: string;
  reasons: string[];
  gaps: string[];
  recommendedUploads: { title: string; why: string; examples: string }[];
  action: 'keep' | 'replace' | 'supplement';
  source: 'ai' | 'rules';
  contentInspected: boolean;
};

interface EvidenceUploadPanelProps {
  controlId: string;
  context: EvidenceContext;
  evidence: ControlEvidence[];
  onChange: (evidence: ControlEvidence[]) => void;
  issues?: ControlIssue[];
  required?: boolean;
}

const VERDICT_STYLES: Record<
  EvidenceReview['verdict'],
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  strong: {
    label: 'Strong match',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: CheckCircle2,
  },
  acceptable: {
    label: 'Acceptable',
    className: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: CheckCircle2,
  },
  weak: {
    label: 'Weak evidence',
    className: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: AlertTriangle,
  },
  mismatched: {
    label: 'Mismatched',
    className: 'border-red-200 bg-red-50 text-red-900',
    icon: XCircle,
  },
};

export function EvidenceUploadPanel({
  controlId,
  context,
  evidence,
  onChange,
  issues = [],
  required = false,
}: EvidenceUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [issueId, setIssueId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, EvidenceReview>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const contextEvidence = evidence.filter((e) => e.context === context);
  const isMissingRequired = required && contextEvidence.length === 0;

  const runReview = async (evidenceId: string) => {
    setReviewingId(evidenceId);
    setError(null);
    try {
      const res = await fetch(`/api/controls/${controlId}/evidence/${evidenceId}/validate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Evidence review failed');
      setReviews((prev) => ({ ...prev, [evidenceId]: data.review }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evidence review failed');
    } finally {
      setReviewingId(null);
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);
    formData.append('description', description);
    if (context === 'issues' && issueId) {
      formData.append('issueId', issueId);
    }

    try {
      const res = await fetch(`/api/controls/${controlId}/evidence`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');

      onChange([data.evidence, ...evidence]);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await runReview(data.evidence.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const remove = async (evidenceId: string) => {
    const res = await fetch(`/api/controls/${controlId}/evidence/${evidenceId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Delete failed');
      return;
    }
    onChange(evidence.filter((e) => e.id !== evidenceId));
    setReviews((prev) => {
      const next = { ...prev };
      delete next[evidenceId];
      return next;
    });
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-slate-50/80 p-5 space-y-4',
        isMissingRequired ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Paperclip className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-900">
          {EVIDENCE_CONTEXT_LABELS[context]} evidence
        </h3>
        {required && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-800">
            Required
          </span>
        )}
        <span className="text-xs text-slate-500">({contextEvidence.length} file(s))</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-violet-800">
          <Sparkles className="h-3 w-3" />
          AI review
        </span>
      </div>

      {isMissingRequired && (
        <p className="text-sm text-red-700 font-medium">
          At least one evidence file is required for this tab.
        </p>
      )}

      <p className="text-xs text-slate-500">
        Upload audit artifacts, screenshots, policies, or exports. Max{' '}
        {MAX_EVIDENCE_FILE_BYTES / (1024 * 1024)} MB — PDF, images, Office docs, CSV, ZIP. After
        upload, ComplAI reviews whether the file fits this control and recommends better evidence if
        needed.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Q2 access review sign-off"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
          />
        </div>

        {context === 'issues' && issues.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Link to issue (optional)
            </label>
            <select
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">General issue evidence</option>
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.md"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading & reviewing...' : 'Upload evidence'}
        </button>
      </div>

      {contextEvidence.length > 0 && (
        <ul className="space-y-3 pt-2 border-t border-slate-200">
          {contextEvidence.map((item) => {
            const review = reviews[item.id];
            const style = review ? VERDICT_STYLES[review.verdict] : null;
            const Icon = style?.icon ?? Sparkles;

            return (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-3 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-slate-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.originalName}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {formatFileSize(item.sizeBytes)} · {formatDateTime(item.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => runReview(item.id)}
                      disabled={reviewingId === item.id}
                      className="rounded p-1.5 text-slate-500 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
                      title="AI evidence review"
                    >
                      {reviewingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={`/api/controls/${controlId}/evidence/${item.id}`}
                      download={item.originalName}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {review && style && (
                  <div className={cn('rounded-lg border p-3', style.className)}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-semibold">{style.label}</span>
                      <span className="text-xs opacity-80">Score {review.score}/100</span>
                      <span className="text-[10px] uppercase tracking-wide opacity-70">
                        {review.source === 'ai' ? 'AI' : 'Rules'} ·{' '}
                        {review.action === 'keep'
                          ? 'Keep'
                          : review.action === 'replace'
                            ? 'Replace'
                            : 'Supplement'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{review.summary}</p>
                    {review.reasons.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs opacity-90">
                        {review.reasons.slice(0, 3).map((reason) => (
                          <li key={reason}>• {reason}</li>
                        ))}
                      </ul>
                    )}
                    {review.recommendedUploads.length > 0 && review.action !== 'keep' && (
                      <div className="mt-3 rounded-md bg-white/70 p-2.5 text-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Recommended uploads
                        </p>
                        <ul className="mt-1.5 space-y-2">
                          {review.recommendedUploads.slice(0, 3).map((rec) => (
                            <li key={rec.title} className="text-xs">
                              <span className="font-medium">{rec.title}</span>
                              {rec.why ? <span className="text-slate-600"> — {rec.why}</span> : null}
                              {rec.examples ? (
                                <span className="block text-slate-500">e.g. {rec.examples}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
