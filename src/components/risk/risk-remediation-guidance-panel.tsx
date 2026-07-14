'use client';

import Link from 'next/link';
import type { Control, Risk } from '@/lib/types';
import { buildRiskRemediationGuidance } from '@/lib/risk/remediation-guidance';
import {
  ClipboardList,
  ExternalLink,
  Lightbulb,
  ListOrdered,
  Shield,
} from 'lucide-react';

type Props = {
  risk: Pick<
    Risk,
    'title' | 'description' | 'category' | 'treatment' | 'status' | 'mitigationPlan'
  >;
  control?: Control | null;
  /** When true, visually emphasize the panel (e.g. after create). */
  highlight?: boolean;
  onApplyPlan?: (draft: string) => void;
};

export function RiskRemediationGuidancePanel({
  risk,
  control,
  highlight = false,
  onApplyPlan,
}: Props) {
  const guidance = buildRiskRemediationGuidance(risk, control);
  const planEmpty = !risk.mitigationPlan?.trim();

  return (
    <section
      id="remediation-guidance"
      className={
        highlight
          ? 'rounded-xl border border-amber-300 bg-amber-50/60 p-5 shadow-sm'
          : 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm'
      }
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-brand-50 p-2">
          <Lightbulb className="h-5 w-5 text-brand-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-900">Remediation guidance</h2>
          <p className="mt-1 text-sm text-slate-600">{guidance.summary}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Why {guidance.treatmentLabel.toLowerCase()} matters
            </p>
            <p className="mt-1 text-sm text-amber-800">{guidance.whyItMatters}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-900">Recommended steps</h3>
        </div>
        <ol className="space-y-2">
          {guidance.steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <p className="text-sm font-medium text-slate-900">
                {index + 1}. {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">Evidence to retain</h3>
        </div>
        <ul className="list-inside list-disc space-y-1 text-xs text-slate-600">
          {guidance.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg bg-brand-50 p-3">
        <p className="text-sm font-semibold text-brand-900">Next actions</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-brand-800">
          {guidance.nextActions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onApplyPlan && (
          <button
            type="button"
            onClick={() => onApplyPlan(guidance.mitigationPlanDraft)}
            className="inline-flex items-center rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600"
          >
            {planEmpty ? 'Apply to mitigation plan' : 'Replace mitigation plan with draft'}
          </button>
        )}
        {control && (
          <Link
            href={`/controls/${control.id}?tab=remediation`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Open control remediation
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
      {planEmpty && (
        <p className="mt-2 text-xs text-slate-500">
          Mitigation plan is empty — apply the draft above, then Save changes.
        </p>
      )}
    </section>
  );
}
