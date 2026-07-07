'use client';

import { X, Check } from 'lucide-react';

interface TemplatePreviewDialogProps {
  open: boolean;
  templateName: string;
  onClose: () => void;
  onApply: () => void;
  children: React.ReactNode;
}

export function TemplatePreviewDialog({
  open,
  templateName,
  onClose,
  onApply,
  children,
}: TemplatePreviewDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close template preview"
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-preview-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Template preview</p>
            <h2 id="template-preview-title" className="mt-0.5 text-lg font-semibold text-slate-900">
              {templateName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-700">{children}</div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="app-primary-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Check className="h-4 w-4" />
            Use this template
          </button>
        </div>
      </div>
    </div>
  );
}
