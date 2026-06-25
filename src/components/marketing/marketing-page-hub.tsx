'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ComplAIText } from '@/components/marketing/complai-brand-link';
import type { MarketingHubGroup } from '@/lib/data/marketing-page-hubs';

const linkClassName =
  'rounded-lg border border-white/10 bg-scrut-navy-light/80 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-all hover:border-scrut-teal/40 hover:shadow-sm';

type MarketingPageHubProps = {
  groups: MarketingHubGroup[];
  /** Return true when a hash link is fully handled (skip default scroll). */
  onHashNavigate?: (href: string) => boolean;
};

function scrollToHash(href: string, pathname: string) {
  const id = href.slice(1);
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `${pathname}${href}`);
  }
}

function HubLink({
  href,
  label,
  onHashNavigate,
}: {
  href: string;
  label: string;
  onHashNavigate?: (href: string) => boolean;
}) {
  const pathname = usePathname();

  if (href.startsWith('#')) {
    return (
      <a
        href={href}
        className={linkClassName}
        onClick={(event) => {
          event.preventDefault();
          if (onHashNavigate?.(href)) return;
          scrollToHash(href, pathname);
        }}
      >
        <ComplAIText linked={false}>{label}</ComplAIText>
      </a>
    );
  }

  return (
    <Link href={href} className={linkClassName}>
      <ComplAIText linked={false}>{label}</ComplAIText>
    </Link>
  );
}

export function MarketingPageHub({ groups, onHashNavigate }: MarketingPageHubProps) {
  return (
    <section className="border-b border-white/10 bg-marketing-surface-alt py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                {group.title}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <HubLink
                    key={`${group.title}-${link.label}`}
                    href={link.href}
                    label={link.label}
                    onHashNavigate={onHashNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
