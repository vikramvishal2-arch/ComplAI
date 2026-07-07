'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Library,
  ListChecks,
  Settings,
  ChevronRight,
  ShieldAlert,
  FileSearch,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrivyCoreLogo } from '@/components/brand/privycore-logo';
import { PRODUCT_NAME } from '@/lib/brand';
import { PRIVACY_FRAMEWORKS } from '@/lib/data/frameworks';
import { MODULES_WITH_COUNTS } from '@/lib/data/program-stats';

type NavItem = { href: string; label: string; icon: LucideIcon };

const topNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/modules', label: 'Privacy Modules', icon: Boxes },
  { href: '/privacy-risks', label: 'Privacy Risk Register', icon: ShieldAlert },
  { href: '/dpias', label: 'DPIA Register', icon: FileSearch },
  { href: '/frameworks', label: 'Frameworks', icon: Library },
  { href: '/controls', label: 'Control Catalog', icon: ListChecks },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--app-sidebar-border)]">
      <div className="border-b border-[var(--app-sidebar-border)] px-4 py-4">
        <PrivyCoreLogo showTagline onDark href="/dashboard" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <ul className="space-y-0.5">
          {topNav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'app-sidebar-nav-active' : 'app-sidebar-nav-idle'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Modules
          </p>
          <ul className="space-y-0.5">
            {MODULES_WITH_COUNTS.map((m) => {
              const href = `/modules/${m.id}`;
              const active = pathname === href;
              return (
                <li key={m.id}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors',
                      active ? 'app-sidebar-nav-active' : 'app-sidebar-nav-idle'
                    )}
                  >
                    <span className="truncate">{m.shortName}</span>
                    <span className="ml-1 shrink-0 text-[10px] text-zinc-500">{m.controlCount}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-[var(--app-sidebar-border)] px-4 py-3">
        <p className="text-xs font-medium text-zinc-300">{PRODUCT_NAME}</p>
        <p className="text-[10px] text-zinc-500">
          {PRIVACY_FRAMEWORKS.length} frameworks · privacy program
        </p>
      </div>
    </aside>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="relative z-0 ml-64 flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 px-8 py-5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-brand-600">
              PrivyCore
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-600">{title}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </header>

        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
