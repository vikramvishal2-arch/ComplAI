'use client';

import {
  COMPLIANCE_METHOD_LABELS,
  DOMAIN_LABELS,
  type Control,
} from '@/lib/types';
import { buildControlComplianceGuidance } from '@/lib/controls/compliance-recommendations';
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Lightbulb,
  ListOrdered,
  Shield,
} from 'lucide-react';

export function ControlComplianceGuidancePanel({ control }: { control: Control }) {
  const guidance = buildControlComplianceGuidance(control);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-brand-50 p-2">
          <BookOpen className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Control description & recommendations</h2>
          <p className="mt-1 text-sm text-slate-500">
            Detailed requirement narrative and recommended path to compliance for{' '}
            <span className="font-mono text-slate-700">{control.reference}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">What this control requires</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {guidance.detailedDescription}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Domain: {DOMAIN_LABELS[control.domain]}
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Why it matters</p>
              <p className="mt-1 text-sm text-amber-800">{guidance.whyItMatters}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-brand-50 p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <div>
              <p className="text-sm font-semibold text-brand-900">Framework implementation guidance</p>
              <p className="mt-1 text-sm text-brand-800">
                {control.guidance?.trim() ||
                  'Follow the recommended methods below and retain operating evidence for the audit period.'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Recommended compliance methods</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {guidance.recommendedMethods.map((item) => (
              <div
                key={item.method}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.recommendation}</p>
              </div>
            ))}
          </div>
          {control.suggestedMethods.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Suggested for this control:{' '}
              {control.suggestedMethods
                .map((m) => COMPLIANCE_METHOD_LABELS[m])
                .join(' · ')}
            </p>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900">Recommended steps to comply</h3>
          </div>
          <ol className="space-y-3">
            {guidance.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Evidence to collect</h3>
            </div>
            <ul className="space-y-1.5">
              {guidance.evidence.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">What auditors typically check</h3>
            </div>
            <ul className="space-y-1.5">
              {guidance.auditorFocus.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
