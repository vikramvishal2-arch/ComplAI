import Link from 'next/link';
import { getGrcProgramStats } from '@/lib/data/grc-program-stats';
import { StatCard } from '@/components/ui/badges';
import { GRC_MODULES } from '@/lib/data/grc-modules';

export function GrcProgramOverview() {
  const stats = getGrcProgramStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Program Modules" value={stats.moduleCount} sub="Integrated GRC capabilities" />
        <StatCard label="Frameworks" value={stats.frameworkCount} sub="SOC 2, ISO 27001, and more" />
        <StatCard label="Controls" value={stats.controlCount} sub="Unified control catalog" />
        <StatCard
          label="Workspace"
          value="Streamlined"
          sub="Dashboard · modules · catalog"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Program modules</h2>
          <Link href="/program" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {GRC_MODULES.slice(0, 5).map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="grc-card py-4 transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-semibold text-zinc-900">{m.shortName}</p>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{m.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
