'use client';

import { Clock, Send, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionnaireRow {
  id: string;
  vendorId: string;
  vendorName: string;
  templateName: string;
  status: string;
  questionnaireStatus: string;
  dueDate: string | null;
  aiScore: number | null;
  completedAt: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Send; color: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'In progress', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' },
};

export function TprmQuestionnaireHub({
  items,
  onOpen,
  selectedId,
}: {
  items: QuestionnaireRow[];
  onOpen: (vendorId: string, assessmentId: string) => void;
  selectedId?: string | null;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
        No questionnaires yet. Launch assessments from a vendor security profile.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((q) => {
        const config = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.draft;
        const Icon = config.icon;
        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onOpen(q.vendorId, q.id)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left shadow-sm transition-colors',
              selectedId === q.id
                ? 'border-brand-400 bg-brand-50/50 ring-1 ring-brand-200'
                : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'
            )}
          >
            <div className={cn('rounded-lg p-2.5', config.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{q.vendorName}</p>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.color)}>
                  {config.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-600">{q.templateName}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                {q.dueDate && <span>Due {q.dueDate.slice(0, 10)}</span>}
                {q.completedAt && <span>Completed {new Date(q.completedAt).toLocaleDateString()}</span>}
                {q.aiScore != null && <span>Score: {q.aiScore}/100</span>}
              </div>
            </div>
            {q.status === 'in_progress' && (
              <span className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white">
                Continue
              </span>
            )}
            {q.status === 'completed' && (
              <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                View results
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export type { QuestionnaireRow };
