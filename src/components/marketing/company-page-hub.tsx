'use client';

import Link from 'next/link';
import { Building2, LayoutGrid, Mail, Sparkles } from 'lucide-react';
import { ComplAIStyled } from '@/components/marketing/complai-brand-link';

type CompanyPageHubProps = {
  onAbout: () => void;
  onContact: () => void;
};

const cardClassName =
  'group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left transition-colors hover:border-scrut-teal/30 hover:bg-white/[0.07]';

export function CompanyPageHub({ onAbout, onContact }: CompanyPageHubProps) {
  return (
    <section className="border-b border-white/10 bg-marketing-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-12">
          <button type="button" onClick={onAbout} className={cardClassName}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-scrut-gradient/20">
              <Building2 className="h-6 w-6 text-scrut-teal" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-base font-bold text-white group-hover:text-scrut-teal">
                About & mission
              </p>
              <p className="mt-1 text-sm text-white/60">
                Who we are, what we do, and who we serve.
              </p>
            </div>
          </button>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
              Get in touch
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={onContact} className={cardClassName}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 group-hover:border-scrut-teal/30 group-hover:text-scrut-teal">
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                    Contact us
                  </p>
                  <p className="text-xs text-white/50">Happy to help</p>
                </div>
              </button>

              <button type="button" onClick={onContact} className={cardClassName}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 group-hover:border-scrut-teal/30 group-hover:text-scrut-teal">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                    Book a demo
                  </p>
                  <p className="text-xs text-white/50">Talk to our team</p>
                </div>
              </button>

              <Link href="/why-complai" className={cardClassName}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 group-hover:border-scrut-teal/30 group-hover:text-scrut-teal">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                    Why <ComplAIStyled className="font-semibold" />
                  </p>
                  <p className="text-xs text-white/50">What makes us different</p>
                </div>
              </Link>

              <Link href="/platform" className={cardClassName}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 group-hover:border-scrut-teal/30 group-hover:text-scrut-teal">
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                    Explore platform
                  </p>
                  <p className="text-xs text-white/50">See all capabilities</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
