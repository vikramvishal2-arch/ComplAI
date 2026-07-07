'use client';

import type { TrainingInfographic, TrainingVisualIcon } from '@/lib/data/security-learning-visuals';
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
  Clock,
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
  TrendingUp,
  Unlock,
  Upload,
  User,
  Users,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type TrainingCinematicVisualProps = {
  visual: TrainingInfographic;
  progress: number;
  playing: boolean;
};

export function TrainingCinematicVisual({ visual, progress, playing }: TrainingCinematicVisualProps) {
  const anim = playing ? 'training-anim-active' : 'training-anim-paused';

  return (
    <div className={cn('relative flex h-full w-full items-center justify-center px-2 sm:px-4', anim)}>
      {visual.type === 'stats' && <CinematicStats items={visual.items} progress={progress} />}
      {visual.type === 'flow' && <CinematicFlow steps={visual.steps} progress={progress} />}
      {visual.type === 'icons' && <CinematicIcons items={visual.items} progress={progress} />}
      {visual.type === 'compare' && (
        <CinematicCompare doItems={visual.do} dontItems={visual.dont} progress={progress} />
      )}
      {visual.type === 'email-alert' && <CinematicEmail flags={visual.flags} progress={progress} />}
      {visual.type === 'funnel' && <CinematicFunnel stages={visual.stages} progress={progress} />}
      {visual.type === 'timeline' && <CinematicTimeline items={visual.items} progress={progress} />}
      {visual.type === 'layers' && <CinematicLayers layers={visual.layers} progress={progress} />}
    </div>
  );
}

function reveal(progress: number, index: number, total: number) {
  return progress >= (index + 0.5) / total;
}

function CinematicStats({
  items,
  progress,
}: {
  items: { label: string; value: number; unit?: string; tone?: string }[];
  progress: number;
}) {
  const icons = [TrendingUp, Clock, Shield];
  const colors = ['from-red-500 to-rose-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600'];

  return (
    <div className="grid w-full max-w-lg grid-cols-3 gap-2 sm:gap-4">
      {items.slice(0, 3).map((item, i) => {
        const Icon = icons[i] ?? Shield;
        const visible = reveal(progress, i, items.length);
        const displayVal = Math.round(item.value * Math.min(1, progress * 1.4));
        return (
          <div
            key={item.label}
            className={cn(
              'training-scale-in flex flex-col items-center text-center transition-all duration-700',
              visible ? 'opacity-100' : 'opacity-0 scale-75'
            )}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div
              className={cn(
                'training-orbit-icon mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg shadow-black/30 sm:h-20 sm:w-20',
                colors[i]
              )}
            >
              <Icon className="h-7 w-7 text-white sm:h-9 sm:w-9" />
            </div>
            <p className="text-xl font-black tabular-nums text-white sm:text-3xl">
              {displayVal}
              {item.unit && (
                <span className="ml-0.5 text-sm font-bold text-white/70 sm:text-base">{item.unit}</span>
              )}
            </p>
            <p className="mt-1 text-[9px] font-medium leading-tight text-white/75 sm:text-xs">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function CinematicFlow({
  steps,
  progress,
}: {
  steps: { label: string; sublabel?: string }[];
  progress: number;
}) {
  return (
    <div className="relative flex w-full max-w-xl items-start justify-between gap-1">
      <div className="absolute left-[10%] right-[10%] top-6 h-0.5 bg-gradient-to-r from-brand-400/20 via-brand-400/60 to-brand-400/20 sm:top-8" />
      {steps.map((step, i) => {
        const visible = reveal(progress, i, steps.length);
        return (
          <div key={step.label} className="relative z-10 flex flex-1 flex-col items-center">
            <div
              className={cn(
                'training-scale-in flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold shadow-lg sm:h-16 sm:w-16 sm:text-base',
                visible
                  ? 'border-brand-300 bg-brand-500 text-white training-glow-pulse'
                  : 'border-white/20 bg-white/5 text-white/30'
              )}
            >
              {i + 1}
            </div>
            <p className={cn('mt-2 text-center text-[9px] font-semibold text-white sm:text-xs', !visible && 'opacity-40')}>
              {step.label}
            </p>
            {step.sublabel && (
              <p className="mt-0.5 text-center text-[8px] text-white/50 sm:text-[10px]">{step.sublabel}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CinematicIcons({
  items,
  progress,
}: {
  items: { label: string; icon: TrainingVisualIcon }[];
  progress: number;
}) {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:gap-4">
      {items.map((item, i) => {
        const visible = reveal(progress, i, items.length);
        const Icon = TRAINING_ICONS[item.icon] ?? Shield;
        return (
          <div
            key={item.label}
            className={cn(
              'training-float training-scale-in flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 px-3 py-4 backdrop-blur-sm',
              visible ? 'opacity-100' : 'opacity-0 scale-90'
            )}
            style={{ animationDelay: `${i * 0.2}s`, transitionDelay: `${i * 100}ms` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/80 to-brand-700/80 shadow-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="mt-2 text-center text-[10px] font-semibold text-white sm:text-xs">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const TRAINING_ICONS: Record<TrainingVisualIcon, LucideIcon> = {
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

function CinematicCompare({
  doItems,
  dontItems,
  progress,
}: {
  doItems: string[];
  dontItems: string[];
  progress: number;
}) {
  return (
    <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:gap-4">
      <div className="training-slide-up rounded-2xl border border-emerald-400/40 bg-emerald-500/20 p-3 backdrop-blur-sm sm:p-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Do
        </p>
        <ul className="space-y-2">
          {doItems.map((item, i) => (
            <li
              key={item}
              className={cn(
                'flex gap-1.5 text-[10px] text-white/90 transition-all sm:text-xs',
                progress > (i + 1) / (doItems.length + 1) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
              )}
            >
              <span className="text-emerald-400">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div
        className="training-slide-up rounded-2xl border border-red-400/40 bg-red-500/20 p-3 backdrop-blur-sm sm:p-4"
        style={{ animationDelay: '0.15s' }}
      >
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-red-300">
          <Ban className="h-4 w-4" /> Don&apos;t
        </p>
        <ul className="space-y-2">
          {dontItems.map((item, i) => (
            <li
              key={item}
              className={cn(
                'flex gap-1.5 text-[10px] text-white/90 transition-all sm:text-xs',
                progress > (i + 1) / (dontItems.length + 1) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
              )}
            >
              <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CinematicEmail({ flags, progress }: { flags: string[]; progress: number }) {
  return (
    <div className="w-full max-w-sm">
      <div
        className={cn(
          'training-scale-in overflow-hidden rounded-2xl border border-red-400/50 bg-slate-900/90 shadow-2xl shadow-red-900/30',
          progress > 0.05 ? 'opacity-100' : 'opacity-0 scale-95'
        )}
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-red-950/50 px-4 py-2.5">
          <Mail className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold text-white">Suspicious email</span>
        </div>
        <div className="space-y-2 p-4">
          <div className="training-shake rounded-lg bg-red-500/30 px-3 py-2 text-xs font-bold text-red-100">
            URGENT: Verify your account now
          </div>
          <p className="text-xs text-white/50">From: security@paypa1-support.com</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {flags.map((flag, i) => (
          <div
            key={flag}
            className={cn(
              'training-slide-up flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-xs text-amber-100',
              progress > (i + 1) / (flags.length + 1) ? 'opacity-100' : 'opacity-0 translate-y-2'
            )}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {flag}
          </div>
        ))}
      </div>
    </div>
  );
}

function CinematicFunnel({
  stages,
  progress,
}: {
  stages: { label: string; width: number }[];
  progress: number;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2">
      {stages.map((stage, i) => {
        const visible = reveal(progress, i, stages.length);
        const width = stage.width * Math.min(1, progress * 1.2);
        return (
          <div
            key={stage.label}
            className={cn(
              'training-funnel-bar flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-400 px-4 text-xs font-bold text-white shadow-lg sm:h-11 sm:text-sm',
              visible ? 'opacity-100' : 'opacity-30'
            )}
            style={{ width: `${width}%` }}
          >
            {stage.label}
          </div>
        );
      })}
    </div>
  );
}

function CinematicTimeline({
  items,
  progress,
}: {
  items: { time: string; label: string; tone?: string }[];
  progress: number;
}) {
  return (
    <div className="w-full max-w-md space-y-3">
      {items.map((item, i) => {
        const visible = reveal(progress, i, items.length);
        const dot =
          item.tone === 'danger' ? 'bg-red-400' : item.tone === 'warning' ? 'bg-amber-400' : 'bg-emerald-400';
        return (
          <div
            key={item.label}
            className={cn(
              'flex items-center gap-3 transition-all duration-500',
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            )}
          >
            <span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums text-brand-300">
              {item.time}
            </span>
            <span className={cn('h-3 w-3 shrink-0 rounded-full', dot, visible && 'training-pulse-ring')} />
            <span className="text-xs text-white/90 sm:text-sm">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CinematicLayers({
  layers,
  progress,
}: {
  layers: { label: string; level: string }[];
  progress: number;
}) {
  const icons = [Lock, Shield, Zap];
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      {layers.map((layer, i) => {
        const visible = reveal(progress, i, layers.length);
        const Icon = icons[i] ?? Shield;
        return (
          <div
            key={layer.label}
            className={cn(
              'training-slide-up flex items-center gap-3 rounded-2xl border border-white/20 bg-gradient-to-r from-brand-600/40 to-brand-400/20 px-4 py-3 backdrop-blur-sm',
              visible ? 'opacity-100' : 'opacity-0 translate-y-4'
            )}
            style={{ marginLeft: `${i * 8}px`, transitionDelay: `${i * 100}ms` }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{layer.label}</p>
              <p className="text-xs text-white/60">{layer.level}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
