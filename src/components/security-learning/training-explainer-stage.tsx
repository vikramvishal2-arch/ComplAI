'use client';

import type { SecurityLearningCategory } from '@/lib/data/security-learning';
import type { TrainingInfographic } from '@/lib/data/security-learning-visuals';
import { TrainingCinematicVisual } from '@/components/security-learning/training-cinematic-visual';
import { cn } from '@/lib/utils';
import {
  Fingerprint,
  Globe,
  Lock,
  MailWarning,
  Shield,
  ShieldAlert,
  Smartphone,
  Users,
} from 'lucide-react';

type TrainingExplainerStageProps = {
  title: string;
  narration?: string;
  highlights?: string[];
  category: SecurityLearningCategory;
  visual: TrainingInfographic;
  playing: boolean;
  progress: number;
  speaking: boolean;
  sceneKey?: string;
  sceneIndex?: number;
  sceneCount?: number;
  moduleTitle?: string;
};

const CATEGORY_THEME: Record<
  SecurityLearningCategory,
  { gradient: string; icon: typeof Shield; accent: string; glow: string }
> = {
  phishing: {
    gradient: 'from-[#1a0505] via-rose-950 to-[#0f172a]',
    icon: MailWarning,
    accent: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  authentication: {
    gradient: 'from-[#0f0520] via-violet-950 to-[#0f172a]',
    icon: Fingerprint,
    accent: 'text-violet-400',
    glow: 'shadow-violet-500/20',
  },
  'data-protection': {
    gradient: 'from-[#030f2e] via-indigo-950 to-[#0f172a]',
    icon: Lock,
    accent: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  'remote-work': {
    gradient: 'from-[#042f2e] via-teal-950 to-[#0f172a]',
    icon: Globe,
    accent: 'text-teal-400',
    glow: 'shadow-teal-500/20',
  },
  'social-engineering': {
    gradient: 'from-[#1a0f03] via-orange-950 to-[#0f172a]',
    icon: Users,
    accent: 'text-orange-400',
    glow: 'shadow-orange-500/20',
  },
  'incident-response': {
    gradient: 'from-[#1a1203] via-amber-950 to-[#0f172a]',
    icon: ShieldAlert,
    accent: 'text-amber-400',
    glow: 'shadow-amber-500/20',
  },
  'physical-security': {
    gradient: 'from-slate-950 via-zinc-900 to-[#0f172a]',
    icon: Shield,
    accent: 'text-slate-300',
    glow: 'shadow-slate-500/20',
  },
  'mobile-devices': {
    gradient: 'from-[#0a0f2e] via-indigo-950 to-[#0f172a]',
    icon: Smartphone,
    accent: 'text-indigo-400',
    glow: 'shadow-indigo-500/20',
  },
};

export function TrainingExplainerStage({
  title,
  highlights: _highlights = [],
  category,
  visual,
  playing,
  progress,
  speaking,
  sceneKey,
  sceneIndex = 0,
  sceneCount = 1,
  moduleTitle,
}: TrainingExplainerStageProps) {
  const theme = CATEGORY_THEME[category];
  const Icon = theme.icon;
  const titleVisible = progress > 0.02;

  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-gradient-to-br', theme.gradient)}>
      <div
        key={sceneKey}
        className={cn('absolute inset-0 training-scene-enter', !playing && 'training-anim-paused')}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="training-bg-orb absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />
          <div className="training-bg-orb-delay absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-brand-500/[0.07] blur-3xl" />
          <div className="training-bg-grid absolute inset-0 opacity-[0.035]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
        </div>

        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15',
                speaking && 'training-icon-pulse'
              )}
            >
              <Icon className={cn('h-4 w-4', theme.accent)} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45 sm:text-[10px]">
              {moduleTitle ?? 'Security learning'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {speaking && (
              <div className="flex items-end gap-0.5 rounded-full bg-white/10 px-2.5 py-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="training-voice-bar w-0.5 rounded-full bg-emerald-400 sm:w-1"
                    style={{ animationDelay: `${i * 0.1}s`, height: `${6 + (i % 3) * 5}px` }}
                  />
                ))}
              </div>
            )}
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 sm:text-xs">
              {sceneIndex + 1} / {sceneCount}
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[12%] z-10 px-4 text-center sm:top-[11%] sm:px-8">
          <h2
            className={cn(
              'training-kinetic-in mx-auto max-w-lg text-lg font-black leading-tight text-white sm:text-2xl md:text-3xl',
              titleVisible ? 'opacity-100' : 'opacity-0'
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              'training-kinetic-in mx-auto mt-1 max-w-md text-xs text-white/50 sm:text-sm',
              titleVisible ? 'opacity-100' : 'opacity-0'
            )}
            style={{ animationDelay: '0.1s' }}
          >
            {visual.title}
          </p>
        </div>

        <div className="absolute inset-x-0 top-[24%] bottom-[10%] z-10 sm:top-[22%] sm:bottom-[8%]">
          <TrainingCinematicVisual visual={visual} progress={progress} playing={playing} />
        </div>
      </div>
    </div>
  );
}
