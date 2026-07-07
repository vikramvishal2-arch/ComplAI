'use client';

import type { IconItem, StatItem, TrainingInfographic, TrainingVisualIcon } from '@/lib/data/security-learning-visuals';
import { TONE_COLORS } from '@/lib/data/security-learning-visuals';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Archive,
  Ban,
  BarChart3,
  Bug,
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  Eraser,
  Eye,
  Flag,
  Folder,
  Globe,
  Home,
  IdCard,
  Key,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Phone,
  Rocket,
  Shield,
  Smartphone,
  Trash2,
  Unlock,
  Upload,
  User,
  Users,
  Wifi,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

type TrainingSceneInfographicProps = {
  visual: TrainingInfographic;
  playing: boolean;
  progress: number;
  variant?: 'dark' | 'light';
};

export function TrainingSceneInfographic({
  visual,
  playing,
  progress,
  variant = 'dark',
}: TrainingSceneInfographicProps) {
  const anim = playing ? 'training-anim-active' : 'training-anim-paused';
  const reveal = Math.min(1, Math.max(0, progress));
  const light = variant === 'light';

  return (
    <div className={cn('relative flex h-full w-full flex-col items-center justify-center', anim)}>
      {visual.type === 'stats' && <StatsVisual items={visual.items} reveal={reveal} light={light} />}
      {visual.type === 'flow' && <FlowVisual steps={visual.steps} reveal={reveal} light={light} />}
      {visual.type === 'compare' && (
        <CompareVisual doItems={visual.do} dontItems={visual.dont} reveal={reveal} light={light} />
      )}
      {visual.type === 'icons' && <IconsVisual items={visual.items} reveal={reveal} light={light} />}
      {visual.type === 'funnel' && <FunnelVisual stages={visual.stages} reveal={reveal} light={light} />}
      {visual.type === 'timeline' && <TimelineVisual items={visual.items} reveal={reveal} light={light} />}
      {visual.type === 'email-alert' && <EmailAlertVisual flags={visual.flags} reveal={reveal} light={light} />}
      {visual.type === 'layers' && <LayersVisual layers={visual.layers} reveal={reveal} light={light} />}
    </div>
  );
}

function StatsVisual({ items, reveal, light }: { items: StatItem[]; reveal: number; light?: boolean }) {
  return (
    <div className="w-full space-y-3">
      {items.map((item, i) => {
        const threshold = (i + 1) / items.length;
        const visible = reveal >= threshold * 0.35;
        const barWidth = visible ? (item.value / (item.max ?? 100)) * 100 * Math.min(1, reveal * 1.4) : 0;
        const tone = item.tone ?? 'info';
        return (
          <div
            key={item.label}
            className={cn('transition-all duration-500', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className="mb-1 flex items-end justify-between gap-2">
              <span className={cn('text-xs', light ? 'text-slate-600' : 'text-white/80')}>{item.label}</span>
              <span className={cn('text-sm font-bold tabular-nums', light ? 'text-slate-900' : 'text-white')}>
                {Math.round(item.value * Math.min(1, reveal * 1.5))}
                {item.unit ? (
                  <span className={cn('ml-1 text-xs font-normal', light ? 'text-slate-500' : 'text-white/70')}>
                    {item.unit}
                  </span>
                ) : null}
              </span>
            </div>
            <div className={cn('h-2.5 overflow-hidden rounded-full', light ? 'bg-slate-200' : 'bg-white/10')}>
              <div
                className={cn('h-full rounded-full transition-all duration-700 ease-out', TONE_COLORS[tone])}
                style={{ width: `${Math.min(100, barWidth)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlowVisual({
  steps,
  reveal,
  light,
}: {
  steps: { label: string; sublabel?: string }[];
  reveal: number;
  light?: boolean;
}) {
  return (
    <div className="relative flex w-full items-start justify-between gap-1 sm:gap-2">
      <div
        className={cn('absolute left-[12%] right-[12%] top-5 h-0.5 sm:top-6', light ? 'bg-slate-200' : 'bg-white/10')}
        aria-hidden
      />
      {steps.map((step, i) => {
        const threshold = i / Math.max(steps.length - 1, 1);
        const visible = reveal > threshold * 0.8 || i === 0;
        return (
          <div key={step.label} className="relative z-10 flex flex-1 flex-col items-center">
            <div
              className={cn(
                'training-pulse-ring flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500 sm:h-12 sm:w-12',
                visible
                  ? 'border-brand-400 bg-brand-500 text-white scale-100'
                  : light
                    ? 'border-slate-200 bg-slate-100 text-slate-400 scale-90'
                    : 'border-white/20 bg-white/5 text-white/40 scale-90'
              )}
            >
              {i + 1}
            </div>
            <p
              className={cn(
                'mt-2 text-center text-[10px] font-semibold leading-tight sm:text-xs',
                light ? 'text-slate-800' : 'text-white',
                !visible && 'opacity-40'
              )}
            >
              {step.label}
            </p>
            {step.sublabel && (
              <p className={cn('mt-0.5 text-center text-[9px] sm:text-[10px]', light ? 'text-slate-500' : 'text-white/60')}>
                {step.sublabel}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CompareVisual({
  doItems,
  dontItems,
  reveal,
  light,
}: {
  doItems: string[];
  dontItems: string[];
  reveal: number;
  light?: boolean;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
      <div className={cn('rounded-lg border p-2 sm:p-3', light ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-400/30 bg-emerald-500/15')}>
        <p className={cn('mb-2 flex items-center gap-1 text-[10px] font-bold uppercase sm:text-xs', light ? 'text-emerald-700' : 'text-emerald-200')}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Do
        </p>
        <ul className="space-y-1.5">
          {doItems.map((item, i) => (
            <li
              key={item}
              className={cn(
                'flex gap-1.5 text-[10px] transition-all sm:text-xs',
                light ? 'text-slate-700' : 'text-white/90',
                reveal > (i + 1) / (doItems.length + 1) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              )}
            >
              <span className={light ? 'text-emerald-600' : 'text-emerald-300'}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn('rounded-lg border p-2 sm:p-3', light ? 'border-red-200 bg-red-50' : 'border-red-400/30 bg-red-500/15')}>
        <p className={cn('mb-2 flex items-center gap-1 text-[10px] font-bold uppercase sm:text-xs', light ? 'text-red-700' : 'text-red-200')}>
          <Ban className="h-3.5 w-3.5" /> Don&apos;t
        </p>
        <ul className="space-y-1.5">
          {dontItems.map((item, i) => (
            <li
              key={item}
              className={cn(
                'flex gap-1.5 text-[10px] transition-all sm:text-xs',
                light ? 'text-slate-700' : 'text-white/90',
                reveal > (i + 1) / (dontItems.length + 1) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
              )}
            >
              <XCircle className={cn('h-3 w-3 shrink-0', light ? 'text-red-500' : 'text-red-300')} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function IconsVisual({
  items,
  reveal,
  light,
}: {
  items: IconItem[];
  reveal: number;
  light?: boolean;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
      {items.map((item, i) => {
        const visible = reveal > i / items.length;
        const Icon = SCENE_ICONS[item.icon] ?? Shield;
        return (
          <div
            key={item.label}
            className={cn(
              'training-float flex flex-col items-center rounded-lg border p-3 text-center transition-all duration-500',
              light ? 'border-slate-200 bg-slate-50' : 'border-white/15 bg-white/10',
              visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            )}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <Icon className={cn('h-7 w-7', light ? 'text-brand-600' : 'text-white')} />
            <span className={cn('mt-1.5 text-[10px] font-medium leading-tight sm:text-xs', light ? 'text-slate-700' : 'text-white/90')}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const SCENE_ICONS: Record<TrainingVisualIcon, LucideIcon> = {
  user: User,
  'id-card': IdCard,
  'credit-card': CreditCard,
  globe: Globe,
  home: Home,
  users: Users,
  camera: Camera,
  'map-pin': MapPin,
  wifi: Wifi,
  shield: Shield,
  lock: Lock,
  eye: Eye,
  phone: Phone,
  'message-square': MessageSquare,
  'door-open': DoorOpen,
  mic: Mic,
  bug: Bug,
  smartphone: Smartphone,
  unlock: Unlock,
  upload: Upload,
  archive: Archive,
  'trash-2': Trash2,
  eraser: Eraser,
  folder: Folder,
  flag: Flag,
  rocket: Rocket,
  key: Key,
  'bar-chart': BarChart3,
  check: Check,
};

function FunnelVisual({
  stages,
  reveal,
  light: _light,
}: {
  stages: { label: string; width: number }[];
  reveal: number;
  light?: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      {stages.map((stage, i) => {
        const visible = reveal > i / stages.length;
        const width = stage.width * Math.min(1, reveal * 1.2);
        return (
          <div key={stage.label} className="flex w-full flex-col items-center">
            <div
              className={cn(
                'training-funnel-bar flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-brand-500/80 to-brand-400/60 px-3 text-[10px] font-semibold text-white transition-all duration-700 sm:h-10 sm:text-xs',
                visible ? 'opacity-100' : 'opacity-30'
              )}
              style={{ width: `${width}%` }}
            >
              {stage.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineVisual({
  items,
  reveal,
  light,
}: {
  items: { time: string; label: string; tone?: 'danger' | 'warning' | 'success' }[];
  reveal: number;
  light?: boolean;
}) {
  return (
    <div className="w-full space-y-2">
      {items.map((item, i) => {
        const visible = reveal > i / items.length;
        const tone = item.tone ?? 'info';
        const dotColor =
          tone === 'danger' ? 'bg-red-400' : tone === 'warning' ? 'bg-amber-400' : 'bg-emerald-400';
        return (
          <div
            key={item.label}
            className={cn(
              'flex items-center gap-3 transition-all duration-500',
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
            )}
          >
            <span className={cn('w-10 shrink-0 text-right text-[10px] font-bold tabular-nums sm:text-xs', light ? 'text-brand-600' : 'text-brand-200')}>
              {item.time}
            </span>
            <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', dotColor, visible && 'training-pulse-ring')} />
            <span className={cn('text-[10px] sm:text-xs', light ? 'text-slate-700' : 'text-white/90')}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function EmailAlertVisual({ flags, reveal, light: _light }: { flags: string[]; reveal: number; light?: boolean }) {
  return (
    <div className="relative w-full max-w-xs">
      <div className="overflow-hidden rounded-lg border border-white/20 bg-slate-900/80 shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/80 px-3 py-2">
          <Mail className="h-4 w-4 text-red-300" />
          <span className="text-xs font-medium text-white">Suspicious email</span>
        </div>
        <div className="space-y-2 p-3">
          <div className="training-shake rounded bg-red-500/20 px-2 py-1 text-[10px] text-red-100">
            URGENT: Verify your account now
          </div>
          <div className="text-[10px] text-white/50">From: security@paypa1-support.com</div>
          <div className="h-1 rounded bg-white/10" />
          <div className="h-1 w-4/5 rounded bg-white/10" />
        </div>
      </div>
      {flags.map((flag, i) => {
        const visible = reveal > (i + 1) / (flags.length + 1);
        return (
          <div
            key={flag}
            className={cn(
              'mt-2 flex items-start gap-1.5 rounded-md border border-amber-400/40 bg-amber-500/20 px-2 py-1.5 text-[10px] text-amber-100 transition-all sm:text-xs',
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            )}
          >
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            {flag}
          </div>
        );
      })}
    </div>
  );
}

function LayersVisual({
  layers,
  reveal,
  light,
}: {
  layers: { label: string; level: string }[];
  reveal: number;
  light?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {layers.map((layer, i) => {
        const visible = reveal > i / layers.length;
        const inset = i * 4;
        return (
          <div
            key={layer.label}
            className={cn(
              'rounded-lg border px-3 py-2 transition-all duration-500',
              light
                ? 'border-brand-200 bg-gradient-to-r from-brand-50 to-brand-100/80'
                : 'border-white/20 bg-gradient-to-r from-brand-600/50 to-brand-400/30',
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            )}
            style={{ marginLeft: `${inset}px`, marginRight: `${inset}px` }}
          >
            <p className={cn('text-xs font-semibold', light ? 'text-slate-900' : 'text-white')}>{layer.label}</p>
            <p className={cn('text-[10px]', light ? 'text-slate-500' : 'text-white/60')}>{layer.level}</p>
          </div>
        );
      })}
    </div>
  );
}
