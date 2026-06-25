import Link from 'next/link';
import {
  BookOpen,
  ClipboardList,
  Crown,
  FileText,
  HelpCircle,
  Plug,
  Shield,
  ShieldAlert,
  Sparkles,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { ComplAIBrandLink } from '@/components/marketing/complai-brand-link';
import { MARKETING_SOLUTIONS } from '@/lib/data/marketing-resources';

const solutionIconById: Record<string, LucideIcon> = {
  compliance: Shield,
  audits: ClipboardList,
  policies: FileText,
  risk: ShieldAlert,
  vendors: Building2,
  integrations: Plug,
  intelligence: Sparkles,
  dashboard: Crown,
};

const solutionTaglines: Record<string, string> = {
  compliance: 'Get and stay compliant, effortlessly.',
  audits: 'Share. Track. Close audits faster.',
  policies: 'Templates, workflows, and Word export.',
  risk: 'Build a live, collaborative risk program.',
  vendors: 'Manage vendor risk with real insight.',
  integrations: 'Connect the tools you already use.',
  intelligence: 'AI guidance across audits and compliance.',
  dashboard: 'Real-time visibility for leadership.',
};

export function SolutionsPageHub() {
  return (
    <section className="border-b border-white/10 bg-marketing-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-12">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-scrut-gradient/20">
              <Shield className="h-6 w-6 text-scrut-teal" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-base font-bold text-white">GRC by workflow</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Pick the outcome you need — <ComplAIBrandLink inheritWeight /> covers compliance,
              audits, risk, and more from one workspace.
            </p>
            <Link
              href="/platform"
              className="mt-4 inline-flex text-sm font-semibold text-scrut-teal hover:underline"
            >
              View full platform →
            </Link>
          </div>

          <div className="grid gap-1 sm:grid-cols-2">
            {MARKETING_SOLUTIONS.map((solution) => {
              const Icon = solutionIconById[solution.id] ?? Shield;
              return (
                <Link
                  key={solution.id}
                  href={`#${solution.id}`}
                  className="group flex gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-white/[0.06] sm:px-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 group-hover:border-scrut-teal/30 group-hover:text-scrut-teal">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                      {solution.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                      {solutionTaglines[solution.id] ?? solution.description.slice(0, 60)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
