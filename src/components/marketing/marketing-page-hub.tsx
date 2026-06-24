import Link from 'next/link';
import type { MarketingHubGroup } from '@/lib/data/marketing-page-hubs';

export function MarketingPageHub({ groups }: { groups: MarketingHubGroup[] }) {
  return (
    <section className="border-b border-slate-200 bg-[#f4f7fb] py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                {group.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <Link
                    key={`${group.title}-${link.label}`}
                    href={link.href}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-scrut-navy transition-all hover:border-scrut-teal/40 hover:shadow-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
