'use client';

import { useRef, useState } from 'react';
import type { RiskRegisterImportResult } from '@/lib/risk/import-register';
import { cn } from '@/lib/utils';
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';

type RiskRegisterImportDialogProps = {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
};

export function RiskRegisterImportDialog({ open, onClose, onImported }: RiskRegisterImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskRegisterImportResult | null>(null);

  if (!open) return null;

  const reset = () => {
    setFile(null);
    setError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleImport = async () => {
    if (!file) {
      setError('Choose a CSV file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/risks/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Import failed');
      }

      setResult(data as RiskRegisterImportResult);
      if (data.imported > 0) {
        onImported();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close import dialog"
        onClick={close}
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Upload risk register</h2>
            <p className="mt-1 text-sm text-slate-500">
              Import existing risks and issues from CSV. Each row must link to an activated framework
              control.
            </p>
          </div>
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <a
            href="/api/risks/import"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
          >
            <Download className="h-4 w-4" />
            Download CSV template
          </a>

          <div
            className={cn(
              'rounded-xl border-2 border-dashed p-6 text-center transition-colors',
              file ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200 bg-slate-50'
            )}
          >
            <FileSpreadsheet className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              {file ? file.name : 'Drop your CSV here or browse'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Columns: type, title, framework, control_reference, likelihood, impact, owner…
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError(null);
                setResult(null);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" />
              Choose file
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          {result && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">
                Imported {result.imported} · Skipped {result.skipped}
              </p>
              {result.results.some((r) => r.status === 'skipped' && r.message) && (
                <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-slate-600">
                  {result.results
                    .filter((r) => r.status === 'skipped' && r.message)
                    .slice(0, 8)
                    .map((r) => (
                      <li key={`${r.row}-${r.title}`}>
                        Row {r.row}: {r.message}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={close}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              type="button"
              disabled={!file || uploading}
              onClick={handleImport}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Importing…' : 'Import register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
