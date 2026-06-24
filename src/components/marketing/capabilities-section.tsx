import {
  Building2,
  ClipboardCheck,
  Crown,
  FileText,
  Library,
  ListChecks,
  Plug,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { PRODUCT_NAME } from '@/lib/brand';
import { PLATFORM_CAPABILITIES } from '@/lib/data/marketing-platform';

const iconById: Record<string, LucideIcon> = {
  dashboard: Crown,
  policies: FileText,
  approvals: ClipboardCheck,
  frameworks: Library,
  controls: ListChecks,
  integrations: Plug,
  intelligence: Sparkles,
  risk: ShieldAlert,
  vendors: Building2,
};

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Purpose-built for smarter, faster GRC
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {PRODUCT_NAME} brings policies, frameworks, controls, integrations, and intelligence
            into one workspace — so your team spends less time chasing artifacts and more time
            reducing risk.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_CAPABILITIES.map((cap) => {
            const Icon = iconById[cap.id] ?? Crown;
            return (
              <Link
                key={cap.id}
                href={`/platform#${cap.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{cap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{cap.description}</p>
                <span className="mt-4 inline-flex text-sm font-medium text-brand-600 group-hover:underline">
                  Learn more →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
