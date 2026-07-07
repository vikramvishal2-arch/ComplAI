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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComplAILogo } from '@/components/brand/complai-logo';
import { PRODUCT_NAME } from '@/lib/brand';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { GRC_MODULES } from '@/lib/data/grc-modules';
import { DemoEnvironmentBanner } from '@/components/layout/demo-environment-banner';

type NavItem = { href: string; label: string; icon: LucideIcon };

const topNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/program', label: 'Program Modules', icon: Boxes },
  { href: '/frameworks', label: 'Frameworks', icon: Library },
  { href: '/controls', label: 'Control Catalog', icon: ListChecks },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  }
  if (href === '/program') {
    return pathname === '/program' || pathname.startsWith('/program/');
  }
  if (href === '/controls') {
    return pathname === '/controls' || pathname.startsWith('/controls/');
  }
  if (href === '/frameworks') {
    return pathname === '/frameworks' || pathname.startsWith('/frameworks/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isModuleActive(pathname: string, moduleHref: string, moduleId: string) {
  if (pathname === '/program' || pathname.startsWith('/program/')) {
    return pathname === `/program/${moduleId}`;
  }
  return pathname === moduleHref || pathname.startsWith(`${moduleHref}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10">
      <div className="border-b border-white/10 px-4 py-4">
        <ComplAILogo showTagline onDark href="/dashboard" />
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
            {GRC_MODULES.map((m) => {
              const active = isModuleActive(pathname, m.href, m.id);
              return (
                <li key={m.id}>
                  <Link
                    href={m.href}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors',
                      active ? 'app-sidebar-nav-active' : 'app-sidebar-nav-idle'
                    )}
                  >
                    <span className="truncate">{m.shortName}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-xs font-medium text-zinc-300">{PRODUCT_NAME}</p>
        <p className="text-[10px] text-zinc-500">{FRAMEWORKS.length} frameworks · GRC program</p>
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
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pl-64">
        <DemoEnvironmentBanner />
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 px-8 py-5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-brand-600">
              {PRODUCT_NAME}
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
