'use client';

import { useState } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { SAMPLE_QUESTIONNAIRE } from '@/lib/questionnaire/constants';
import { cn } from '@/lib/utils';

interface AnswerRow {
  question: string;
  answer: string;
  confidence: string;
  sourceNotes: string;
}

export function QuestionnairePanel() {
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONNAIRE.join('\n'));
  const [useAi, setUseAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    const list = questions.split('\n').map((q) => q.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/ai/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: list, useAiEnhancement: useAi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setAnswers(data.answers);
      setAiEnhanced(data.aiEnhanced);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Question', 'Answer', 'Confidence', 'Sources'],
      ...answers.map((a) => [a.question, a.answer, a.confidence, a.sourceNotes]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-questionnaire-answers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const confidenceColor: Record<string, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-slate-100 text-slate-700',
    needs_review: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-700">
          Security questionnaire questions (one per line)
        </label>
        <textarea
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          rows={6}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="rounded border-slate-300"
            />
            <Sparkles className="h-4 w-4 text-brand-500" />
            AI polish (requires OPENAI_API_KEY)
          </label>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </span>
            ) : (
              'Auto-fill answers'
            )}
          </button>
          {answers.length > 0 && (
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {aiEnhanced && (
          <p className="mt-2 text-xs text-brand-600">Answers enhanced with AI using your org context.</p>
        )}
      </div>

      {answers.length > 0 && (
        <div className="space-y-3">
          {answers.map((a, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium text-slate-900">{a.question}</p>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    confidenceColor[a.confidence] ?? confidenceColor.low
                  )}
                >
                  {a.confidence.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{a.answer}</p>
              {a.sourceNotes && (
                <p className="mt-2 text-xs text-slate-400">Sources: {a.sourceNotes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
