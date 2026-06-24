import { FileText, Layers, Plug, BarChart3 } from 'lucide-react';
import { PRODUCT_NAME } from '@/lib/brand';

const steps = [
  {
    step: '01',
    icon: Layers,
    title: 'Select your frameworks',
    description:
      'Activate SOC 2, ISO 27001, GDPR, regional regulations, or SecOps frameworks. Controls and evidence requirements are pre-mapped for each standard.',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Build your policy library',
    description:
      'Start from ISO Annex A templates, upload existing Word policies, or author in-app. Route documents through prepare and review approval stages.',
  },
  {
    step: '03',
    icon: Plug,
    title: 'Connect integrations',
    description:
      'Browse the integrations catalog, follow setup guides at propelreadysolutions.in/help/integrations, and tie HRMS, IAM, and SIEM data to controls.',
  },
  {
    step: '04',
    icon: BarChart3,
    title: 'Monitor and report',
    description:
      'Track RAG posture on the leadership dashboard, run AI gap analysis, manage risks and vendors, and export policies to Word for auditors.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y border-slate-200 bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How {PRODUCT_NAME} works
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From framework selection to executive reporting — a continuous compliance loop, not a
            once-a-year audit scramble.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative">
                <span className="text-xs font-bold text-brand-600">{item.step}</span>
                <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
