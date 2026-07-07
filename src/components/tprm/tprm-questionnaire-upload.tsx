'use client';

import { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileUp, Loader2, Upload, X } from 'lucide-react';
import {
  buildQuestionnaireImportPreview,
  matchesToResponses,
  type ImportMatchResult,
  type ImportableQuestion,
} from '@/lib/vendor/questionnaire-import';
import { getPredefinedVendorAssessmentQuestions } from '@/lib/data/vendor-assessment-controls';
import { VENDOR_ASSESSMENT_TEMPLATES } from '@/lib/vendor/vendor-assessment-templates';
import { cn } from '@/lib/utils';

const ACCEPT = '.csv,.json,text/csv,application/json';

interface TprmQuestionnaireUploadProps {
  vendorId: string;
  questions?: ImportableQuestion[];
  vendorTier?: string;
  vendorDataAccess?: string;
  assessmentId?: string | null;
  defaultTemplateId?: string;
  onImported: (assessmentId: string) => void;
  onError?: (message: string) => void;
}

export function TprmQuestionnaireUpload({
  vendorId,
  questions: questionsProp = [],
  vendorTier = 'medium',
  vendorDataAccess = 'none',
  assessmentId,
  defaultTemplateId = 'tprm-standard',
  onImported,
  onError,
}: TprmQuestionnaireUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState(defaultTemplateId);
  const [preview, setPreview] = useState<{
    matches: ImportMatchResult[];
    matchedCount: number;
    unmatchedCount: number;
    columnMap: { questionCol: string | null; answerCol: string | null; statusCol: string | null };
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const templateQuestions = useMemo(
    () =>
      getPredefinedVendorAssessmentQuestions({
        tier: vendorTier,
        dataAccess: vendorDataAccess,
        templateId,
      }),
    [vendorTier, vendorDataAccess, templateId]
  );

  const questions = questionsProp.length > 0 ? questionsProp : templateQuestions;

  const handleFile = async (file: File) => {
    setParseError(null);
    setPreview(null);
    setFileName(file.name);

    try {
      const content = await file.text();
      const result = buildQuestionnaireImportPreview(content, file.name, questions);

      if (result.rows.length === 0) {
        throw new Error('No data rows found in the uploaded file');
      }
      if (!result.columnMap.questionCol && !result.columnMap.answerCol) {
        throw new Error(
          'Could not detect question/answer columns. Expected headers like Question, Answer, Response, or Status.'
        );
      }

      setPreview({
        matches: result.matches,
        matchedCount: result.matchedCount,
        unmatchedCount: result.unmatchedCount,
        columnMap: result.columnMap,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse file';
      setParseError(message);
      onError?.(message);
    }
  };

  const confirmImport = async () => {
    if (!preview) return;
    setImporting(true);
    setParseError(null);

    try {
      const responses = matchesToResponses(preview.matches);
      if (responses.length === 0) {
        throw new Error('No rows could be matched to template questions');
      }

      const r = await fetch(`/api/vendors/${vendorId}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          assessmentId: assessmentId ?? undefined,
          templateId: assessmentId ? undefined : templateId,
          responses,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Import failed');

      setPreview(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = '';
      onImported(d.assessment.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed';
      setParseError(message);
      onError?.(message);
    } finally {
      setImporting(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName(null);
    setParseError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Import existing questionnaire</h3>
          <p className="mt-1 text-xs text-slate-500">
            Upload a completed vendor questionnaire (CSV or JSON). Responses are matched to the selected template and
            merged into an in-progress assessment.
          </p>
        </div>
        <FileUp className="h-5 w-5 shrink-0 text-slate-400" />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        {!assessmentId && (
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Template</span>
            <select
              className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={!!preview}
            >
              {VENDOR_ASSESSMENT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 px-4 py-2.5 text-sm font-medium text-brand-800 hover:bg-brand-50">
          <Upload className="h-4 w-4" />
          {fileName ? fileName : 'Choose CSV or JSON'}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
      </div>

      {questions.length === 0 && (
        <p className="mt-3 text-xs text-amber-700">
          No template questions apply for this vendor tier and data access. Adjust vendor settings or choose another
          template.
        </p>
      )}

      {parseError && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {parseError}
        </div>
      )}

      {preview && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {preview.matchedCount} matched
            </span>
            {preview.unmatchedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800">
                <AlertCircle className="h-3.5 w-3.5" />
                {preview.unmatchedCount} unmatched
              </span>
            )}
            <span className="text-xs text-slate-500">
              Columns: {preview.columnMap.questionCol ?? '—'} / {preview.columnMap.answerCol ?? '—'}
              {preview.columnMap.statusCol ? ` / ${preview.columnMap.statusCol}` : ''}
            </span>
          </div>

          <div className="max-h-64 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Uploaded question</th>
                  <th className="px-3 py-2 font-medium">Matched to</th>
                  <th className="px-3 py-2 font-medium">Answer</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.matches.slice(0, 50).map((row) => (
                  <tr key={row.rowIndex} className={row.questionId ? 'bg-white' : 'bg-amber-50/50'}>
                    <td className="max-w-[200px] truncate px-3 py-2 text-slate-700" title={row.uploadedQuestion}>
                      {row.uploadedQuestion}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-slate-600" title={row.questionText}>
                      {row.questionId ? (
                        <span className="inline-flex items-center gap-1">
                          {row.questionText || row.questionId}
                          <MatchBadge confidence={row.matchConfidence} />
                        </span>
                      ) : (
                        <span className="text-amber-700">No match</span>
                      )}
                    </td>
                    <td className="max-w-[160px] truncate px-3 py-2 text-slate-600" title={row.answer}>
                      {row.answer || '—'}
                    </td>
                    <td className="px-3 py-2 capitalize text-slate-500">{row.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.matches.length > 50 && (
              <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-400">
                Showing first 50 of {preview.matches.length} rows
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void confirmImport()}
              disabled={importing || preview.matchedCount === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {importing ? 'Importing…' : `Import ${preview.matchedCount} responses`}
            </button>
            <button
              type="button"
              onClick={clearPreview}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchBadge({ confidence }: { confidence: ImportMatchResult['matchConfidence'] }) {
  if (confidence === 'none') return null;
  const label = confidence === 'id' ? 'ID' : confidence === 'exact' ? 'Exact' : 'Fuzzy';
  return (
    <span
      className={cn(
        'rounded px-1 py-0.5 text-[10px] font-medium uppercase',
        confidence === 'fuzzy' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
      )}
    >
      {label}
    </span>
  );
}
