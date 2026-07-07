'use client';

import { CheckCircle2, Clock, FileText, X } from 'lucide-react';
import { TprmRatingBadge } from '@/components/tprm/tprm-rating-badge';
import { VendorDomainBreakdown } from '@/components/vendors/vendor-domain-breakdown';
import {
  VendorAssessmentChecklist,
  checklistProgress,
  type ChecklistStatus,
} from '@/components/vendors/vendor-assessment-checklist';
import { parseFindings, parseDomainScores } from '@/lib/vendor/vendor-assessment-types';
import { cn } from '@/lib/utils';

type ChecklistItem = Parameters<typeof VendorAssessmentChecklist>[0]['items'][number];

export interface QuestionnaireAssessment {
  id: string;
  status: string;
  templateName: string;
  questionnaireStatus: string;
  aiScore: number | null;
  aiSummary?: string;
  dueDate: string | null;
  completedAt: string | null;
  questions: unknown;
  responses: unknown;
  findings: unknown;
  domainScores: unknown;
}

function parseQuestions(raw: unknown): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw as ChecklistItem[];
}

function responsesToMap(raw: unknown): Record<string, { status: ChecklistStatus; notes: string }> {
  if (!Array.isArray(raw)) return {};
  const map: Record<string, { status: ChecklistStatus; notes: string }> = {};
  for (const r of raw as { questionId: string; status?: ChecklistStatus; answer?: string }[]) {
    map[r.questionId] = { status: r.status ?? '', notes: r.answer ?? '' };
  }
  return map;
}

export function TprmQuestionnaireDetail({
  assessment,
  vendorName,
  activeResponses,
  onResponsesChange,
  onSubmit,
  onClose,
  onViewFindings,
  submitting = false,
}: {
  assessment: QuestionnaireAssessment;
  vendorName: string;
  activeResponses?: Record<string, { status: ChecklistStatus; notes: string }>;
  onResponsesChange?: (itemId: string, patch: { status?: ChecklistStatus; notes?: string }) => void;
  onSubmit?: () => void;
  onClose?: () => void;
  onViewFindings?: () => void;
  submitting?: boolean;
}) {
  const questions = parseQuestions(assessment.questions);
  const responses = activeResponses ?? responsesToMap(assessment.responses);
  const findings = parseFindings(assessment.findings);
  const openFindings = findings.filter((f) => f.status !== 'resolved' && f.status !== 'accepted');
  const domainScores = parseDomainScores(assessment.domainScores);
  const isCompleted = assessment.status === 'completed';
  const isInProgress = assessment.status === 'in_progress';
  const progress = isInProgress && questions.length > 0 ? checklistProgress(questions, responses) : null;

  const statusConfig = isCompleted
    ? { label: 'Completed', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' }
    : isInProgress
      ? { label: 'In progress', icon: Clock, color: 'bg-blue-100 text-blue-800' }
      : { label: 'Draft', icon: FileText, color: 'bg-slate-100 text-slate-700' };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{assessment.templateName}</h3>
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', statusConfig.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{vendorName}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
            {assessment.completedAt && (
              <span>Completed {new Date(assessment.completedAt).toLocaleDateString()}</span>
            )}
            {assessment.dueDate && !assessment.completedAt && (
              <span>Due {assessment.dueDate.slice(0, 10)}</span>
            )}
            {openFindings.length > 0 && <span>{openFindings.length} open finding{openFindings.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div className="flex items-start gap-3">
          {assessment.aiScore != null && (
            <TprmRatingBadge score100={assessment.aiScore} size="sm" showBand={false} />
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close questionnaire"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {isCompleted && (
          <>
            {assessment.aiSummary && (
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                <h4 className="text-sm font-semibold text-slate-900">Assessment summary</h4>
                <p className="mt-2 text-sm text-slate-700">{assessment.aiSummary}</p>
              </div>
            )}

            {Object.keys(domainScores).length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Domain scores</h4>
                <VendorDomainBreakdown recordScores={domainScores} />
              </div>
            )}

            {findings.length > 0 && onViewFindings && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onViewFindings}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  View {findings.length} risk{findingLabel(findings.length)} & findings
                </button>
              </div>
            )}

            {questions.length === 0 && (
              <p className="text-sm text-slate-500">
                This assessment was completed from public intelligence data. Questionnaire responses are not stored for demo vendors.
              </p>
            )}

            {questions.length > 0 && (
              <VendorAssessmentChecklist
                mode="reference"
                items={questions}
                responses={responses}
                title="Submitted responses"
                description="Read-only view of questionnaire answers"
              />
            )}
          </>
        )}

        {isInProgress && questions.length > 0 && onResponsesChange && (
          <>
            {progress && (
              <p className="text-xs text-slate-500">
                {progress.answered}/{progress.total} rated · {progress.gaps} gaps identified so far
              </p>
            )}
            <VendorAssessmentChecklist
              mode="interactive"
              items={questions}
              responses={responses}
              onChange={onResponsesChange}
              title="Complete questionnaire"
            />
            {onSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {submitting ? 'Analyzing…' : 'Submit & identify risks'}
              </button>
            )}
          </>
        )}

        {isInProgress && questions.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Questionnaire items are still being generated. Refresh the page or send a new questionnaire if this persists.
          </div>
        )}
      </div>
    </div>
  );
}

function findingLabel(count: number): string {
  return count !== 1 ? 's' : '';
}
