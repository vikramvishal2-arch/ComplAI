'use client';

import { VENDOR_ASSESSMENT_TEMPLATES } from '@/lib/vendor/vendor-assessment-templates';
import { cn } from '@/lib/utils';

interface TprmTemplatePickerProps {
  value: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function TprmTemplatePicker({ value, onChange, disabled, compact }: TprmTemplatePickerProps) {
  const selected = VENDOR_ASSESSMENT_TEMPLATES.find((t) => t.id === value) ?? VENDOR_ASSESSMENT_TEMPLATES[0];

  if (compact) {
    return (
      <select
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {VENDOR_ASSESSMENT_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} — {t.framework}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {VENDOR_ASSESSMENT_TEMPLATES.map((template) => {
        const active = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(template.id)}
            className={cn(
              'rounded-xl border p-3 text-left transition-colors',
              active
                ? 'border-brand-400 bg-brand-50/60 ring-1 ring-brand-200'
                : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/30',
              disabled && 'opacity-60'
            )}
          >
            <p className="text-sm font-semibold text-slate-900">{template.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{template.description}</p>
            <p className="mt-2 text-[11px] text-slate-400">
              {template.framework} · ~{template.estimatedMinutes} min
            </p>
          </button>
        );
      })}
      {selected && (
        <p className="sm:col-span-2 text-xs text-slate-500">
          Selected: <span className="font-medium text-slate-700">{selected.name}</span>
        </p>
      )}
    </div>
  );
}
