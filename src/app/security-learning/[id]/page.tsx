'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import {
  SECURITY_LEARNING_AUDIENCE_LABELS,
  SECURITY_LEARNING_CATEGORY_LABELS,
  SECURITY_LEARNING_CATEGORY_STYLES,
  getModuleDurationMinutes,
  getSecurityLearningModule,
} from '@/lib/data/security-learning';
import { cn } from '@/lib/utils';
import { ArrowLeft, Clock, Film, ListChecks, Shield, Users } from 'lucide-react';
import { AiTrainingVideoPlayer } from '@/components/security-learning/ai-training-video-player';

export default function SecurityLearningModulePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const module = id ? getSecurityLearningModule(id) : undefined;

  if (!module) {
    return (
      <AppShell title="Module not found" subtitle="">
        <Link
          href="/security-learning"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Management
        </Link>
      </AppShell>
    );
  }

  const duration = getModuleDurationMinutes(module.id);

  return (
    <AppShell title={module.title} subtitle={module.description}>
      <Link
        href="/security-learning"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All awareness modules
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {module.scenes.length > 0 ? (
            <AiTrainingVideoPlayer
              moduleId={module.id}
              title={module.title}
              category={module.category}
              scenes={module.scenes}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-200 bg-slate-900 text-sm text-slate-400">
              Training video is being prepared.
            </div>
          )}

          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ListChecks className="h-5 w-5 text-brand-500" />
              Learning objectives
            </h2>
            <ul className="space-y-2">
              {module.learningObjectives.map((objective) => (
                <li
                  key={objective}
                  className="flex gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {objective}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Module details
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <DetailRow label="Category">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    SECURITY_LEARNING_CATEGORY_STYLES[module.category]
                  )}
                >
                  {SECURITY_LEARNING_CATEGORY_LABELS[module.category]}
                </span>
              </DetailRow>
              <DetailRow label="Format">
                <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                  <Film className="h-3.5 w-3.5 text-brand-500" />
                  Narrated explainer
                </span>
              </DetailRow>
              <DetailRow label="Duration">
                <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {duration} min
                </span>
              </DetailRow>
              <DetailRow label="Voice">
                <span className="font-medium text-slate-900">Pre-generated narration</span>
              </DetailRow>
              <DetailRow label="Audience">
                {SECURITY_LEARNING_AUDIENCE_LABELS[module.audience]}
              </DetailRow>
              <DetailRow label="Assigned">
                <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  {module.assignedCount} learners
                </span>
              </DetailRow>
              <DetailRow label="Completion">{module.completionRate}%</DetailRow>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Shield className="h-4 w-4" />
              Related controls
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {module.relatedControlRefs.map((ref) => (
                <span
                  key={ref}
                  className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700"
                >
                  {ref}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Maps to security awareness and training requirements in SOC 2, ISO 27001, and privacy
              frameworks.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}
