import Link from 'next/link';
import {
  Bot,
  ClipboardCheck,
  Crown,
  FileText,
  Library,
  ListChecks,
  Plug,
  Search,
  ShieldAlert,
  Sparkles,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { COMPLAI_ICON } from '@/lib/brand';
import { ComplAIBrandLink, ComplAIText } from '@/components/marketing/complai-brand-link';
import {
  PLATFORM_FEATURED,
  PLATFORM_MENU_CARDS,
  PLATFORM_SIDEBAR_LINKS,
} from '@/lib/data/marketing-platform';

const menuIconById: Record<string, LucideIcon> = {
  frameworks: Library,
  approvals: ClipboardCheck,
  policies: FileText,
  risk: ShieldAlert,
  controls: ListChecks,
  dashboard: Crown,
  intelligence: Sparkles,
  vendors: Building2,
};

const sidebarIconByTitle: Record<string, LucideIcon> = {
  'Explore the platform': Search,
  'Why ComplAI': Bot,
  'ComplAI Intelligence': Sparkles,
  'Integrate your tech stack': Plug,
};

function HubLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith('http');
  if (isExternal) {
    return (
      <a href={href} className={className} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function PlatformPageHub() {
  return (
    <section className="border-b border-white/10 bg-marketing-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,220px)_1fr_minmax(0,260px)] lg:gap-8 xl:gap-12">
          {/* Featured highlight */}
          <HubLink
            href={PLATFORM_FEATURED.href}
            className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-scrut-teal/30 hover:bg-white/[0.07] sm:p-6"
          >
            <div className="relative mx-auto flex h-28 w-28 items-center justify-center sm:mx-0">
              <div className="absolute inset-0 rounded-2xl border border-scrut-teal/20 bg-scrut-gradient/10" />
              <div className="absolute inset-2 rounded-xl border border-white/10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COMPLAI_ICON}
                alt=""
                aria-hidden
                className="relative h-14 w-14 drop-shadow-lg"
              />
            </div>
            <h2 className="mt-5 text-base font-bold text-white group-hover:text-scrut-teal">
              <ComplAIText linked={false}>{PLATFORM_FEATURED.title}</ComplAIText>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              <ComplAIText linked={false}>{PLATFORM_FEATURED.description}</ComplAIText>
            </p>
          </HubLink>

          {/* Capability grid */}
          <div className="grid gap-1 sm:grid-cols-2">
            {PLATFORM_MENU_CARDS.map((item) => {
              const Icon = menuIconById[item.id] ?? Library;
              return (
                <HubLink
                  key={item.id}
                  href={item.href}
                  className="group flex gap-3 rounded-xl px-3 py-3.5 transition-colors hover:bg-white/[0.06] sm:px-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 group-hover:border-scrut-teal/30 group-hover:text-scrut-teal">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">{item.tagline}</p>
                  </div>
                </HubLink>
              );
            })}
          </div>

          {/* Sidebar links */}
          <div className="flex flex-col gap-2">
            {PLATFORM_SIDEBAR_LINKS.map((item) => {
              const Icon = sidebarIconByTitle[item.title] ?? Search;
              return (
                <HubLink
                  key={item.title}
                  href={item.href}
                  className="group flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors hover:border-scrut-teal/30 hover:bg-white/[0.07]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center text-white/70 group-hover:text-scrut-teal">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-scrut-teal">
                      <ComplAIText linked={false}>{item.title}</ComplAIText>
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                      <ComplAIText linked={false}>{item.description}</ComplAIText>
                    </p>
                  </div>
                </HubLink>
              );
            })}
          </div>
        </div>

        <p className="mt-8 hidden text-center text-xs text-white/40 lg:block">
          Jump to a capability above, or scroll to explore the full{' '}
          <ComplAIBrandLink inheritWeight className="text-xs" /> platform below.
        </p>
      </div>
    </section>
  );
}
