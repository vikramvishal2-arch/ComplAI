import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import {
  GRC_MODULE_CATEGORY_LABELS,
  getGrcModuleById,
} from '@/lib/data/grc-modules';
import { cn } from '@/lib/utils';

export default async function ProgramModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = getGrcModuleById(id);
  if (!mod) notFound();

  return (
    <AppShell title={mod.name} subtitle={mod.description}>
      <div className="mb-6 flex flex-wrap gap-2">
        <span
          className={cn(
            'rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
            mod.category === 'govern' && 'bg-violet-100 text-violet-800',
            mod.category === 'identify' && 'bg-sky-100 text-sky-800',
            mod.category === 'protect' && 'bg-emerald-100 text-emerald-800',
            mod.category === 'detect' && 'bg-amber-100 text-amber-800',
            mod.category === 'respond' && 'bg-rose-100 text-rose-800'
          )}
        >
          {GRC_MODULE_CATEGORY_LABELS[mod.category]}
        </span>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Capabilities
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {mod.capabilities.map((cap) => (
            <div
              key={cap}
              className="flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {cap}
            </div>
          ))}
        </div>
      </section>

      <div className="mb-8">
        <Link
          href={mod.href}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Open {mod.shortName}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {mod.subLinks && mod.subLinks.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Quick links
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mod.subLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="grc-card flex items-center justify-between transition-shadow hover:shadow-md"
              >
                <span className="font-medium text-zinc-900">{link.label}</span>
                <ArrowRight className="h-4 w-4 text-brand-600" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
