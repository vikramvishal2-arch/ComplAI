'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { INTEGRATION_HELP_BASE_URL } from '@/lib/brand';
import { ComplAIText } from '@/components/marketing/complai-brand-link';

const pillars = [
  {
    id: 'ccm',
    eyebrow: 'Continuous Control Monitoring',
    title: 'Monitor your controls without losing sleep.',
    description:
      'Let ComplAI evaluate the effectiveness of your controls 24/7, non-stop. Get notified of gaps and share step-by-step remediation guidelines. Collect evidence on the way, so you never hunt down documents for audits.',
    href: '/platform#controls',
  },
  {
    id: 'config',
    eyebrow: 'Configurability at all Levels',
    title: 'Design a security program that works like you do. Down to the fine print.',
    description:
      'Configure approval matrices, create custom framework mappings, track per-control compliance methods, and build custom risk formulas. Build a program that\'s as unique as your business, directly from the interface.',
    href: '/platform#approvals',
  },
  {
    id: 'library',
    eyebrow: 'Ready-to-Use Library',
    title: 'Get, set, go with auditor-approved policies and pre-built templates.',
    description:
      'Start with complete coverage: compliance frameworks, policy templates, risk registers, and vendor questionnaires, all pre-mapped to unified controls, so you don\'t waste time starting from scratch or duplicating work.',
    href: '/platform#policies',
  },
  {
    id: 'assist',
    eyebrow: 'Expert Assist',
    title: 'Get live answers, not endless docs.',
    description:
      'From integration setup guides at propelreadysolutions.in to hands-on support from Propel Ready Solutions — you\'re never on your own. Whether it\'s onboarding, audit prep, or tightening your risk posture, we get you there faster.',
    href: INTEGRATION_HELP_BASE_URL,
  },
];

export function PlatformPillarsSection() {
  const [active, setActive] = useState(0);
  const pillar = pillars[active];

  return (
    <section id="platform" className="border-y border-white/10 bg-marketing-surface py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-6">
          {pillars.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm',
                active === i
                  ? 'bg-scrut-gradient text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              )}
            >
              {p.eyebrow}
            </button>
          ))}
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scrut-teal">
              {pillar.eyebrow}
            </p>
            <h3 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">{pillar.title}</h3>
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
            <div className="mb-4 h-2 w-24 rounded-full bg-scrut-gradient" />
            <div className="space-y-3">
              {[92, 78, 65, 88].map((w) => (
                <div
                  key={w}
                  className="h-3 rounded-full bg-white/10"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl bg-white/10 p-4">
                  <div className="h-8 w-8 rounded-lg bg-scrut-gradient/30" />
                  <div className="mt-3 h-2 w-full rounded bg-white/10" />
                  <div className="mt-2 h-2 w-2/3 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
