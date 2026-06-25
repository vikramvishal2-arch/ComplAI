import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrutOutlineButton } from '@/components/marketing/marketing-ui';
import { ComplAIBrandLink, ComplAIStyled, ComplAIText } from '@/components/marketing/complai-brand-link';
import { WHY_COMPLAI_DIFFERENTIATORS } from '@/lib/data/marketing-platform';
export function WhyComplaiTeaserSection() {
  const highlights = WHY_COMPLAI_DIFFERENTIATORS.slice(0, 3);

  return (
    <section className="border-t border-white/10 bg-marketing-surface-alt py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scrut-teal">
              Why <ComplAIBrandLink inheritWeight />
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Move past surface-level compliance
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-zinc-400">
              Manual GRC burns hours on evidence hunts and duplicate controls.{' '}
              <ComplAIBrandLink inheritWeight /> gives you a unified platform that keeps your team
              continuously audit-ready.
            </p>
            <div className="mt-8">
              <ScrutOutlineButton href="/why-complai">
                Why <ComplAIStyled className="font-semibold" />
                <ArrowRight className="h-4 w-4" />
              </ScrutOutlineButton>
            </div>
          </div>

          <div className="space-y-4">
            {highlights.map((item) => (
              <Link
                key={item.id}
                href={`/why-complai#${item.id}`}
                className="group block rounded-2xl border border-white/10 bg-scrut-navy-light p-5 transition-all hover:border-scrut-teal/30 hover:shadow-sm"
              >
                <h3 className="font-semibold text-zinc-100 group-hover:text-scrut-blue">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400 line-clamp-2">
                  <ComplAIText linked={false}>{item.description}</ComplAIText>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
