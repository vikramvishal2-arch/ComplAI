import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrutOutlineButton } from '@/components/marketing/marketing-ui';
import { PRODUCT_NAME } from '@/lib/brand';
import { WHY_COMPLAI_DIFFERENTIATORS } from '@/lib/data/marketing-platform';

export function WhyComplaiTeaserSection() {
  const highlights = WHY_COMPLAI_DIFFERENTIATORS.slice(0, 3);

  return (
    <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scrut-teal">
              Why {PRODUCT_NAME}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
              Move past surface-level compliance
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Manual GRC burns hours on evidence hunts and duplicate controls. {PRODUCT_NAME} gives
              you a unified platform that keeps your team continuously audit-ready.
            </p>
            <div className="mt-8">
              <ScrutOutlineButton href="/why-complai">
                Why {PRODUCT_NAME}
                <ArrowRight className="h-4 w-4" />
              </ScrutOutlineButton>
            </div>
          </div>

          <div className="space-y-4">
            {highlights.map((item) => (
              <Link
                key={item.id}
                href={`/why-complai#${item.id}`}
                className="group block rounded-2xl border border-slate-200 bg-[#f4f7fb] p-5 transition-all hover:border-scrut-teal/30 hover:shadow-sm"
              >
                <h3 className="font-semibold text-scrut-navy group-hover:text-scrut-blue">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
