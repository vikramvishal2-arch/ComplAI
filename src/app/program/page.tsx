import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { GRC_MODULE_CATEGORY_LABELS, GRC_MODULES } from '@/lib/data/grc-modules';
import { cn } from '@/lib/utils';

export default function ProgramModulesPage() {
  return (
    <AppShell
      title="Program Modules"
      subtitle="Ten integrated GRC modules — compliance, risk, TPRM, assurance, audits, and program operations in one streamlined workspace"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GRC_MODULES.map((m) => (
          <Link
            key={m.id}
            href={`/program/${m.id}`}
            className="grc-card transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-zinc-900">{m.name}</h2>
              <span
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  m.category === 'govern' && 'bg-violet-100 text-violet-800',
                  m.category === 'identify' && 'bg-sky-100 text-sky-800',
                  m.category === 'protect' && 'bg-emerald-100 text-emerald-800',
                  m.category === 'detect' && 'bg-amber-100 text-amber-800',
                  m.category === 'respond' && 'bg-rose-100 text-rose-800'
                )}
              >
                {GRC_MODULE_CATEGORY_LABELS[m.category]}
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{m.description}</p>
            <ul className="mt-4 space-y-1">
              {m.capabilities.slice(0, 3).map((cap) => (
                <li key={cap} className="flex items-start gap-2 text-xs text-zinc-500">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  {cap}
                </li>
              ))}
              {m.capabilities.length > 3 && (
                <li className="text-xs text-brand-600">+{m.capabilities.length - 3} more</li>
              )}
            </ul>
            <p className="mt-4 text-sm font-medium text-brand-600">Open module →</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
