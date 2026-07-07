'use client';

import { startTransition, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ComplAIText } from '@/components/marketing/complai-brand-link';
import { PlatformPillarPreview } from '@/components/marketing/platform-pillar-previews';

const pillars = [  {
    id: 'ccm',
    tabLabel: 'CCM',
    eyebrow: 'Continuous Control Monitoring',
    title: 'Monitor your controls without losing sleep.',
    description:
      'Let ComplAI evaluate the effectiveness of your controls 24/7, non-stop. Get notified of gaps and share step-by-step remediation guidelines. Collect evidence on the way, so you never hunt down documents for audits.',
    href: '/platform#controls',
  },
  {
    id: 'config',
    tabLabel: 'Configurable',
    eyebrow: 'Configurability at all Levels',
    title: 'Design a security program that works like you do. Down to the fine print.',
    description:
      'Configure approval matrices, create custom framework mappings, track per-control compliance methods, and build custom risk formulas. Build a program that\'s as unique as your business, directly from the interface.',
    href: '/platform#approvals',
  },
  {
    id: 'library',
    tabLabel: 'Library',
    eyebrow: 'Ready-to-Use Library',
    title: 'Get, set, go with auditor-approved policies and pre-built templates.',
    description:
      'Start with complete coverage: compliance frameworks, policy templates, risk registers, and vendor questionnaires, all pre-mapped to unified controls, so you don\'t waste time starting from scratch or duplicating work.',
    href: '/platform#policies',
  },
  {
    id: 'assist',
    tabLabel: 'Expert Assist',
    eyebrow: 'Expert Assist',
    title: 'Get live answers, not endless docs.',
    description:
      'From integration setup guides in our help centre to hands-on support from Propel Ready Solutions — you\'re never on your own. Whether it\'s onboarding, audit prep, or tightening your risk posture, we get you there faster.',
    href: '/help',
  },
];

export function PlatformPillarsSection() {
  const [active, setActive] = useState(0);
  const pillar = pillars[active];

  return (
    <section id="platform" className="border-y border-white/10 bg-marketing-surface py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="marketing-tab-scroll -mx-4 touch-scroll-x overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex w-max min-w-full gap-2 border-b border-white/10 pb-6 lg:w-auto lg:flex-wrap">
            {pillars.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => startTransition(() => setActive(i))}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors sm:text-sm min-h-[44px]',
                  active === i
                    ? 'bg-scrut-gradient text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                )}
              >
                <span className="lg:hidden">{p.tabLabel}</span>
                <span className="hidden lg:inline">{p.eyebrow}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid items-center gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scrut-teal">
              {pillar.eyebrow}
            </p>
            <h3 className="mt-4 text-xl font-bold leading-snug sm:text-2xl lg:text-3xl">{pillar.title}</h3>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              <ComplAIText>{pillar.description}</ComplAIText>
            </p>
            <Link
              href={pillar.href}
              {...(pillar.href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className="mt-6 inline-flex text-sm font-semibold text-scrut-teal hover:underline"
            >
              Learn more →
            </Link>
          </div>

          <PlatformPillarPreview pillarId={pillar.id as 'ccm' | 'config' | 'library' | 'assist'} />
        </div>
      </div>
    </section>
  );
}
