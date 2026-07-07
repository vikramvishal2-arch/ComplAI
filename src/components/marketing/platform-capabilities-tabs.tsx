'use client';

import { startTransition, useState } from 'react';
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
import { PlatformCapabilityPreview } from '@/components/marketing/platform-capability-previews';
import type { PlatformCapabilityPreviewId } from '@/components/marketing/platform-capability-previews';
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
    <section id="dashboard" className="scroll-mt-28 py-16 sm:py-20">
      {PLATFORM_CAPABILITIES.map((cap) => (
        <span key={cap.id} id={cap.id} className="block h-0 scroll-mt-28" aria-hidden />
      ))}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl lg:text-4xl">
            Purpose-built features for smarter, faster GRC operations
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            <ComplAIText>
              Explore the capabilities that power every ComplAI workflow — from leadership dashboards
              to vendor assessments.
            </ComplAIText>
          </p>
        </div>

        <div className="marketing-tab-scroll mt-10 -mx-4 touch-scroll-x overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex w-max min-w-full gap-2 lg:w-auto lg:flex-wrap lg:justify-center">
            {PLATFORM_CAPABILITIES.map((cap, i) => (
              <button
                key={cap.id}
                type="button"
                onClick={() => startTransition(() => setActive(i))}
                className={cn(
                  'shrink-0 rounded-full px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:py-2.5 sm:text-sm min-h-[44px]',
                  active === i
                    ? 'bg-scrut-gradient text-black shadow-sm'
                    : 'bg-scrut-navy-light text-zinc-300 ring-1 ring-white/10 hover:ring-scrut-teal/40 hover:text-zinc-100'
                )}
              >
                {cap.tabLabel ?? cap.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid items-start gap-8 rounded-2xl border border-white/10 bg-scrut-navy-light/70 p-4 shadow-sm sm:gap-10 sm:p-6 lg:grid-cols-2 lg:p-10">
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

          <PlatformCapabilityPreview capabilityId={feature.id as PlatformCapabilityPreviewId} />
        </div>

        <div className="mt-10 text-center">
          <ScrutPrimaryButton href="/company?contact=1">Book a demo</ScrutPrimaryButton>
        </div>
      </div>
    </section>
  );
}
