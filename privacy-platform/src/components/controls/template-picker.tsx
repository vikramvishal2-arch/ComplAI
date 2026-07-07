'use client';

import { useState } from 'react';
import { FileText, Wrench, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplatePreviewDialog } from '@/components/controls/template-preview-dialog';

export interface TemplatePreviewField {
  label: string;
  value: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  description?: string;
  previewFields?: TemplatePreviewField[];
}

interface TemplatePickerProps {
  title: string;
  templates: TemplateItem[];
  onApply: (id: string) => void;
  variant?: 'compliance' | 'remediation' | 'issues';
  className?: string;
  appliedId?: string | null;
}

const ICONS = {
  compliance: FileText,
  remediation: Wrench,
  issues: AlertTriangle,
};

export function TemplatePicker({
  title,
  templates,
  onApply,
  variant = 'compliance',
  className,
  appliedId,
}: TemplatePickerProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  if (templates.length === 0) return null;

  const Icon = ICONS[variant];
  const previewTemplate = templates.find((t) => t.id === previewId);

  return (
    <>
      <section
        className={cn(
          'rounded-xl border border-brand-100 bg-brand-50/40 p-4',
          className
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-brand-900">{title}</h3>
          <span className="text-xs text-brand-600">— click to preview and apply</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPreviewId(t.id)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left text-xs font-medium shadow-sm transition',
                appliedId === t.id
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : 'border-brand-200 bg-white text-brand-800 hover:border-brand-400 hover:bg-brand-50'
              )}
              title={t.description}
            >
              {t.name}
              {appliedId === t.id && <span className="ml-1.5 text-[10px] text-emerald-600">✓ applied</span>}
            </button>
          ))}
        </div>
      </section>

      {previewTemplate && (
        <TemplatePreviewDialog
          open={!!previewId}
          templateName={previewTemplate.name}
          onClose={() => setPreviewId(null)}
          onApply={() => onApply(previewTemplate.id)}
        >
          {previewTemplate.description && (
            <p className="mb-4 text-slate-600">{previewTemplate.description}</p>
          )}
          {previewTemplate.previewFields && previewTemplate.previewFields.length > 0 ? (
            <dl className="space-y-3">
              {previewTemplate.previewFields.map((field) => (
                <div key={field.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {field.label}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                    {field.value || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-slate-500">This template will prefill the form below.</p>
          )}
        </TemplatePreviewDialog>
      )}
    </>
  );
}
