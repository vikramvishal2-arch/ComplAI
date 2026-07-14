'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, MinusCircle, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { ControlReference } from '@/components/controls/control-reference';
import { cn } from '@/lib/utils';

export type ChecklistStatus = 'yes' | 'partial' | 'no' | 'na' | '';

export interface VendorChecklistItem {
  id: string;
  category: string;
  checklistLabel?: string;
  question: string;
  weight: number;
  controlIds?: string[];
  controlRefs?: string[];
  evidenceGuidance?: string;
  minTier?: string;
  dataAccess?: string[];
}

type EvidenceReview = {
  verdict: 'strong' | 'acceptable' | 'weak' | 'mismatched';
  score: number;
  summary: string;
  recommendedUploads: { title: string; why: string; examples: string }[];
  action: 'keep' | 'replace' | 'supplement';
  source: 'ai' | 'rules';
};

const STATUS_OPTIONS: {
  value: Exclude<ChecklistStatus, ''>;
  label: string;
  icon: typeof CheckCircle2;
  activeClass: string;
}[] = [
  { value: 'yes', label: 'Compliant', icon: CheckCircle2, activeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'partial', label: 'Partial', icon: MinusCircle, activeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'no', label: 'Gap', icon: XCircle, activeClass: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'na', label: 'N/A', icon: Circle, activeClass: 'bg-slate-100 text-slate-600 border-slate-300' },
];

interface VendorAssessmentChecklistProps {
  items: VendorChecklistItem[];
  mode: 'reference' | 'interactive';
  responses?: Record<string, { status: ChecklistStatus; notes: string }>;
  onChange?: (itemId: string, patch: { status?: ChecklistStatus; notes?: string }) => void;
  title?: string;
  description?: string;
}

export function VendorAssessmentChecklist({
  items,
  mode,
  responses = {},
  onChange,
  title = 'Vendor assessment checklist',
  description,
}: VendorAssessmentChecklistProps) {
  const [reviews, setReviews] = useState<Record<string, EvidenceReview>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        No checklist items apply for the selected tier and data access level.
      </div>
    );
  }

  const grouped = items.reduce<Record<string, VendorChecklistItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const reviewEvidence = async (item: VendorChecklistItem) => {
    const response = responses[item.id] ?? { status: '' as ChecklistStatus, notes: '' };
    setReviewingId(item.id);
    try {
      const res = await fetch('/api/vendors/evidence-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: item.question,
          answer: response.notes,
          evidenceGuidance: item.evidenceGuidance,
          controlRefs: item.controlRefs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Review failed');
      setReviews((prev) => ({ ...prev, [item.id]: data.review }));
    } catch {
      setReviews((prev) => ({
        ...prev,
        [item.id]: {
          verdict: 'weak',
          score: 30,
          summary: 'Could not complete evidence review. Add notes describing the supporting artifact.',
          recommendedUploads: item.evidenceGuidance
            ? [
                {
                  title: item.evidenceGuidance,
                  why: 'Expected evidence for this questionnaire item.',
                  examples: 'PDF, attestation, or ticket export',
                },
              ]
            : [],
          action: 'supplement',
          source: 'rules',
        },
      }));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        <p className="mt-1 text-xs text-slate-400">
          {items.length} control{items.length !== 1 ? 's' : ''} · ISO 27001 A.5.19–A.5.23 · SOC 2 CC9.x
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {Object.entries(grouped).map(([category, categoryItems]) => (
          <div key={category} className="p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</h4>
            <ol className="space-y-3">
              {categoryItems.map((item, index) => {
                const response = responses[item.id] ?? { status: '' as ChecklistStatus, notes: '' };
                const label = item.checklistLabel ?? item.question;
                const review = reviews[item.id];

                return (
                  <li
                    key={item.id}
                    className={cn(
                      'rounded-lg border p-3',
                      mode === 'interactive' && response.status === 'no'
                        ? 'border-red-200 bg-red-50/40'
                        : mode === 'interactive' && response.status === 'yes'
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-slate-200 bg-slate-50/50'
                    )}
                  >
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{label}</p>
                          {item.controlRefs?.map((ref, refIndex) => (
                            <ControlReference
                              key={ref}
                              reference={ref}
                              controlId={item.controlIds?.[refIndex]}
                              variant="badge"
                            />
                          ))}
                        </div>
                        {mode === 'reference' && (
                          <p className="mt-1 text-xs text-slate-600">{item.question}</p>
                        )}
                        {item.evidenceGuidance && (
                          <p className="mt-1.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-600">Evidence: </span>
                            {item.evidenceGuidance}
                          </p>
                        )}

                        {mode === 'interactive' && onChange && (
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {STATUS_OPTIONS.map(({ value, label: statusLabel, icon: Icon, activeClass }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => onChange(item.id, { status: value })}
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                                    response.status === value
                                      ? activeClass
                                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                  )}
                                >
                                  <Icon className="h-3 w-3" />
                                  {statusLabel}
                                </button>
                              ))}
                            </div>
                            <textarea
                              className="w-full min-h-[52px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                              placeholder="Notes, evidence reference, or attestation details…"
                              value={response.notes}
                              onChange={(e) => onChange(item.id, { notes: e.target.value })}
                            />
                            <button
                              type="button"
                              onClick={() => reviewEvidence(item)}
                              disabled={reviewingId === item.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 hover:bg-violet-100 disabled:opacity-50"
                            >
                              {reviewingId === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              Check evidence fit
                            </button>
                            {review && (
                              <div className="rounded-lg border border-violet-200 bg-white p-2.5 text-xs text-slate-700">
                                <p className="font-semibold text-violet-900">
                                  {review.verdict} · {review.score}/100 · {review.action}
                                </p>
                                <p className="mt-1">{review.summary}</p>
                                {review.recommendedUploads.length > 0 && (
                                  <ul className="mt-2 space-y-1 text-slate-600">
                                    {review.recommendedUploads.slice(0, 2).map((rec) => (
                                      <li key={rec.title}>• Upload: {rec.title}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

export function checklistProgress(
  items: VendorChecklistItem[],
  responses: Record<string, { status: ChecklistStatus; notes: string }>
) {
  const answered = items.filter((i) => responses[i.id]?.status).length;
  const compliant = items.filter((i) => responses[i.id]?.status === 'yes').length;
  const gaps = items.filter((i) => responses[i.id]?.status === 'no').length;
  return { answered, compliant, gaps, total: items.length };
}
