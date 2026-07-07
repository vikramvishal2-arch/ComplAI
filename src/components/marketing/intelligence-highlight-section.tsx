import Link from 'next/link';
import { ArrowRight, Bot, Sparkles } from 'lucide-react';
import { ComplAIBrandLink, ComplAIStyled } from '@/components/marketing/complai-brand-link';
const features = [
  'Resolve failing tests faster with AI guided remediation',
  'Avoid audit surprises with intelligent evidence validation',
  'Get AI powered guidance across audits and compliance',
  'Manage third party risk with AI driven assessments',
  'Eliminate manual effort with auto filled security questionnaires',
];

export function IntelligenceHighlightSection() {
  return (
    <section className="border-y border-white/10 bg-marketing-surface-alt py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-6 shadow-xl sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-scrut-gradient">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    <ComplAIBrandLink inheritWeight className="font-semibold" /> Intelligence
                  </p>
                  <p className="text-xs text-white/50">Gap analysis · Questionnaires · SecOps</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {features.slice(0, 3).map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80"
                  >
                    <Bot className="mt-0.5 h-4 w-4 shrink-0 text-scrut-teal" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              <ComplAIBrandLink inheritWeight /> Intelligence
            </h2>
            <p className="mt-2 text-xl text-zinc-400">
              Your AI-powered teammate for risk and compliance
            </p>
            <ul className="mt-6 space-y-3">
              {features.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-zinc-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scrut-teal" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/solutions/intelligence"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100 hover:text-scrut-blue"
            >
              Explore <ComplAIStyled className="font-semibold" /> Intelligence
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
