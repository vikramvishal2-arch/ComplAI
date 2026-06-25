import { FRAMEWORKS } from '@/lib/data/frameworks';
import { INTEGRATION_TOOLS } from '@/lib/data/integration-catalog';
import { POLICY_TEMPLATE_CATALOG } from '@/lib/data/policy-template-catalog';

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <h3 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
              {POLICY_TEMPLATE_CATALOG.length}+
            </h3>
            <p className="mt-2 text-lg text-zinc-400">Auditor-ready ISMS templates</p>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
              {FRAMEWORKS.length}+
            </h3>
            <p className="mt-2 text-lg text-zinc-400">Security & privacy frameworks</p>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
              {INTEGRATION_TOOLS.length}+
            </h3>
            <p className="mt-2 text-lg text-zinc-400">Integration tools catalogued</p>
          </div>
        </div>
      </div>
    </section>
  );
}
