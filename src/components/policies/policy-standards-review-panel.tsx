'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { PolicyStandardsReview, PolicyReviewRecommendation } from '@/lib/policies/policy-review-types';
import { cn } from '@/lib/utils';

const severityStyles = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusStyles = {
  open: 'border-slate-200 bg-white',
  applied: 'border-emerald-200 bg-emerald-50/50',
  dismissed: 'border-slate-200 bg-slate-50 opacity-75',
};

interface PolicyStandardsReviewPanelProps {
  policyId: string;
  initialReview: PolicyStandardsReview | null;
  defaultExpanded?: boolean;
  onContentApplied?: (content: string) => void;
}

export function PolicyStandardsReviewPanel({
  policyId,
  initialReview,
  defaultExpanded = false,
  onContentApplied,
}: PolicyStandardsReviewPanelProps) {
  const [review, setReview] = useState<PolicyStandardsReview | null>(initialReview);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runReview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/policies/${policyId}/review`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Review failed');
      setReview(d.review);
      setExpanded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  const autoRunAttempted = useRef(false);
  useEffect(() => {
    if (!defaultExpanded || review || autoRunAttempted.current) return;
    autoRunAttempted.current = true;
    void runReview();
  }, [defaultExpanded, review, runReview]);

  const handleAction = async (recId: string, action: 'apply' | 'dismiss') => {
    setActionId(recId);
    setError(null);
    try {
      const r = await fetch(`/api/policies/${policyId}/review/recommendations/${recId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Action failed');

      setReview(d.review);
      if (action === 'apply' && d.policy?.content && onContentApplied) {
        onContentApplied(d.policy.content);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const openRecs = review?.recommendations.filter((r) => r.status === 'open') ?? [];
  const appliedCount = review?.recommendations.filter((r) => r.status === 'applied').length ?? 0;
  const dismissedCount = review?.recommendations.filter((r) => r.status === 'dismissed').length ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Standards review</h3>
            <p className="text-xs text-slate-500">
              ISO 27001, framework mappings, and required sections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {review && (
            <span className="text-xs text-slate-500">
              {openRecs.length} open · {appliedCount} applied · {dismissedCount} dismissed
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4">
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={runReview}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {review ? 'Re-run review' : 'Run review'}
            </button>
            {review && (
              <span className="text-xs text-slate-500">
                Last reviewed {new Date(review.reviewedAt).toLocaleString()} ·{' '}
                {review.standards.join(', ')}
              </span>
            )}
          </div>

          {!review && loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running standards review against ISO 27001 and linked frameworks…
            </div>
          ) : !review ? (
            <p className="text-sm text-slate-500">
              Upload a policy or run a review to check against ISO 27001 and framework requirements.
            </p>
          ) : review.recommendations.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              No gaps found — document meets checked standards.
            </div>
          ) : (
            <ul className="space-y-3">
              {review.recommendations.map((rec) => (
                <RecommendationItem
                  key={rec.id}
                  rec={rec}
                  busy={actionId === rec.id}
                  onApply={() => handleAction(rec.id, 'apply')}
                  onDismiss={() => handleAction(rec.id, 'dismiss')}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationItem({
  rec,
  busy,
  onApply,
  onDismiss,
}: {
  rec: PolicyReviewRecommendation;
  busy: boolean;
  onApply: () => void;
  onDismiss: () => void;
}) {
  return (
    <li
      className={cn(
        'rounded-lg border p-4',
        statusStyles[rec.status]
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{rec.title}</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
                severityStyles[rec.severity]
              )}
            >
              {rec.severity}
            </span>
            {rec.status === 'applied' && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Applied
              </span>
            )}
            {rec.status === 'dismissed' && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <XCircle className="h-3 w-3" /> Dismissed
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {rec.framework} · {rec.standardRef} · {rec.category.replace(/_/g, ' ')}
          </p>
          <p className="mt-2 text-sm text-slate-600">{rec.finding}</p>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            {rec.recommendation}
          </p>
        </div>
      </div>

      {rec.status === 'open' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rec.suggestedText && (
            <button
              type="button"
              onClick={onApply}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              Apply
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Dismiss
          </button>
        </div>
      )}
    </li>
  );
}
