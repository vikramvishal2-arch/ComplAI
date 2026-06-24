'use client';

import { useState } from 'react';
import {
  Building2,
  ClipboardCheck,
  Crown,
  FileText,
  Library,
  ListChecks,
  Plug,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORM_CAPABILITIES } from '@/lib/data/marketing-platform';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';

const iconById: Record<string, LucideIcon> = {
  dashboard: Crown,
  policies: FileText,
  approvals: ClipboardCheck,
  frameworks: Library,
  controls: ListChecks,
  integrations: Plug,
  intelligence: Sparkles,
  risk: ShieldAlert,
  vendors: Building2,
};

export function PlatformCapabilitiesTabs() {
  const [active, setActive] = useState(0);
  const feature = PLATFORM_CAPABILITIES[active];
  const Icon = iconById[feature.id] ?? Crown;

  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
            Purpose-built features for smarter, faster GRC operations
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Explore the capabilities that power every ComplAI workflow — from leadership dashboards
            to vendor assessments.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {PLATFORM_CAPABILITIES.map((cap, i) => (
            <button
              key={cap.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:py-2 sm:text-sm',
                active === i
                  ? 'bg-scrut-gradient text-scrut-navy shadow-sm'
                  : 'bg-[#f4f7fb] text-scrut-navy ring-1 ring-slate-200 hover:ring-scrut-teal/40'
              )}
            >
              {cap.tabLabel ?? cap.title}
            </button>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-2">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-scrut-navy">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {feature.description}
            </p>
            {feature.bullets && (
              <ul className="mt-6 space-y-2">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scrut-teal" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-[#f4f7fb] p-6 sm:p-8">
            <div className="mb-4 h-2 w-24 rounded-full bg-scrut-gradient" />
            <div className="space-y-3">
              {[88, 72, 95, 64].map((w) => (
                <div
                  key={w}
                  className="h-3 rounded-full bg-white"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="h-8 w-8 rounded-lg bg-scrut-gradient/30" />
                  <div className="mt-3 h-2 w-full rounded bg-slate-100" />
                  <div className="mt-2 h-2 w-2/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
        </div>
      </div>
    </section>
  );
}
