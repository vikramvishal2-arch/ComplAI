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
import { ComplAIText } from '@/components/marketing/complai-brand-link';
import { LeadershipDashboardPreview } from '@/components/marketing/leadership-dashboard-preview';
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

function CapabilityPlaceholder() {
  return (
    <div className="rounded-2xl border border-white/10 bg-scrut-navy-light p-6 sm:p-8">
      <div className="mb-4 h-2 w-24 rounded-full bg-scrut-gradient" />
      <div className="space-y-3">
        {[88, 72, 95, 64].map((w) => (
          <div key={w} className="h-3 rounded-full bg-zinc-700" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="rounded-xl bg-scrut-navy-light/70 p-4 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-scrut-gradient/30" />
            <div className="mt-3 h-2 w-full rounded bg-zinc-700" />
            <div className="mt-2 h-2 w-2/3 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformCapabilitiesTabs() {
  const [active, setActive] = useState(0);
  const feature = PLATFORM_CAPABILITIES[active];
  const Icon = iconById[feature.id] ?? Crown;
  const isDashboard = feature.id === 'dashboard';

  return (
    <section id="dashboard" className="scroll-mt-28 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Purpose-built features for smarter, faster GRC operations
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            <ComplAIText>
              Explore the capabilities that power every ComplAI workflow — from leadership dashboards
              to vendor assessments.
            </ComplAIText>
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
                  ? 'bg-scrut-gradient text-black shadow-sm'
                  : 'bg-scrut-navy-light text-zinc-300 ring-1 ring-white/10 hover:ring-scrut-teal/40 hover:text-zinc-100'
              )}
            >
              {cap.tabLabel ?? cap.title}
            </button>
          ))}
        </div>

        <div
          className={cn(
            'mt-10 grid items-start gap-10 rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-6 shadow-sm sm:p-10',
            isDashboard ? 'grid-cols-1' : 'lg:grid-cols-2'
          )}
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-scrut-teal/15 text-scrut-teal">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-zinc-100">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              {feature.description}
            </p>
            {feature.bullets && (
              <ul className="mt-6 space-y-2">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm text-zinc-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scrut-teal" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isDashboard ? (
            <LeadershipDashboardPreview embedded />
          ) : (
            <CapabilityPlaceholder />
          )}
        </div>

        <div className="mt-10 text-center">
          <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
        </div>
      </div>
    </section>
  );
}
