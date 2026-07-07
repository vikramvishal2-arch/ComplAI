'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { NavCard } from '@/components/ui/nav-card';
import { getModulesWithCounts } from '@/lib/data/program-stats';
import { NIST_FUNCTION_LABELS } from '@/lib/types';
import { NistBadge } from '@/components/ui/badges';

export default function ModulesPage() {
  const modules = getModulesWithCounts();

  return (
    <AppShell
      title="Privacy Modules"
      subtitle="Click a module to view controls and track compliance"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <NavCard key={m.id} href={`/modules/${m.id}`}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-zinc-900">{m.name}</h2>
              <NistBadge label={NIST_FUNCTION_LABELS[m.nistFunction]} />
            </div>
            <p className="mt-2 text-sm text-zinc-600">{m.description}</p>
            <p className="mt-4 text-sm font-medium text-brand-600">{m.controlCount} controls →</p>
          </NavCard>
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Or browse all controls in the{' '}
        <Link href="/controls" className="font-medium text-brand-600 hover:text-brand-700">control register</Link>.
      </p>
    </AppShell>
  );
}
