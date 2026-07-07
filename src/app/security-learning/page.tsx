'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import {
  SECURITY_LEARNING_CATEGORY_LABELS,
  SECURITY_LEARNING_CATEGORY_STYLES,
  SECURITY_LEARNING_MODULES,
  getModuleDurationMinutes,
  getSecurityLearningSummary,
  type SecurityLearningCategory,
} from '@/lib/data/security-learning';
import { cn } from '@/lib/utils';
import {
  Clock,
  Fingerprint,
  Globe,
  Lock,
  MailWarning,
  Play,
  Shield,
  ShieldAlert,
  Smartphone,
  Users,
} from 'lucide-react';

const ALL_CATEGORIES = 'all' as const;

type CategoryFilter = typeof ALL_CATEGORIES | SecurityLearningCategory;

const CATEGORY_ART: Record<
  SecurityLearningCategory,
  { Icon: typeof Shield; gradient: string }
> = {
  phishing: { Icon: MailWarning, gradient: 'from-rose-900 via-red-950 to-slate-950' },
  authentication: { Icon: Fingerprint, gradient: 'from-violet-900 via-purple-950 to-slate-950' },
  'data-protection': { Icon: Lock, gradient: 'from-blue-900 via-indigo-950 to-slate-950' },
  'remote-work': { Icon: Globe, gradient: 'from-teal-900 via-cyan-950 to-slate-950' },
  'social-engineering': { Icon: Users, gradient: 'from-orange-900 via-amber-950 to-slate-950' },
  'incident-response': { Icon: ShieldAlert, gradient: 'from-amber-900 via-yellow-950 to-slate-950' },
  'physical-security': { Icon: Shield, gradient: 'from-slate-800 via-zinc-900 to-slate-950' },
  'mobile-devices': { Icon: Smartphone, gradient: 'from-indigo-900 via-blue-950 to-slate-950' },
};

export default function SecurityLearningPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(ALL_CATEGORIES);
  const summary = getSecurityLearningSummary();

  const categories = useMemo(() => {
    const unique = new Set(SECURITY_LEARNING_MODULES.map((m) => m.category));
    return Array.from(unique);
  }, []);

  const filteredModules = useMemo(() => {
    if (categoryFilter === ALL_CATEGORIES) return SECURITY_LEARNING_MODULES;
    return SECURITY_LEARNING_MODULES.filter((m) => m.category === categoryFilter);
  }, [categoryFilter]);

  return (
    <AppShell
      title="Learning Management"
      subtitle="Narrated awareness videos with motion graphics — voice-led, no on-screen captions"
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Awareness modules" value={String(summary.totalModules)} />
        <SummaryCard label="Total video time" value={`${summary.totalMinutes} min`} />
        <SummaryCard label="Avg. completion" value={`${summary.avgCompletion}%`} accent />
        <SummaryCard label="Learners assigned" value={String(summary.learnersAssigned)} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          active={categoryFilter === ALL_CATEGORIES}
          onClick={() => setCategoryFilter(ALL_CATEGORIES)}
        >
          All modules
        </FilterChip>
        {categories.map((category) => (
          <FilterChip
            key={category}
            active={categoryFilter === category}
            onClick={() => setCategoryFilter(category)}
          >
            {SECURITY_LEARNING_CATEGORY_LABELS[category]}
          </FilterChip>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredModules.map((module) => {
          const art = CATEGORY_ART[module.category];
          const ModuleIcon = art.Icon;
          const duration = getModuleDurationMinutes(module.id);

          return (
            <Link
              key={module.id}
              href={`/security-learning/${module.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-md"
            >
              <div
                className={cn(
                  'relative flex aspect-video items-center justify-center bg-gradient-to-br',
                  art.gradient
                )}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.2),transparent_55%)]" />
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
                <ModuleIcon className="relative h-16 w-16 text-white/20" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform group-hover:scale-105">
                    <Play className="h-6 w-6 fill-current pl-0.5" />
                  </div>
                </div>
                <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                  Narrated video
                </span>
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                  <Clock className="h-3 w-3" />
                  {duration} min
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      SECURITY_LEARNING_CATEGORY_STYLES[module.category]
                    )}
                  >
                    {SECURITY_LEARNING_CATEGORY_LABELS[module.category]}
                  </span>
                  <span className="text-xs text-slate-500">{module.completionRate}% completed</span>
                </div>
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-brand-600">
                  {module.title}
                </h2>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {module.description}
                </p>
                <p className="mt-4 text-xs text-slate-400">Voice narration · Motion graphics</p>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', accent ? 'text-brand-600' : 'text-slate-900')}>
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      )}
    >
      {children}
    </button>
  );
}
