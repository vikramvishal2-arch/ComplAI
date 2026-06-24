'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ListChecks,
  Library,
  Settings,
  ChevronRight,
  ShieldAlert,
  Crown,
  Sparkles,
  Building2,
  FileText,
  ClipboardCheck,
  Plug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComplAILogo } from '@/components/brand/complai-logo';
import { PRODUCT_NAME } from '@/lib/brand';

const navItems = [
  { href: '/dashboard', label: 'Leadership', icon: Crown },
  { href: '/intelligence', label: 'Intelligence', icon: Sparkles },
  { href: '/vendors', label: 'Vendors', icon: Building2 },
  { href: '/frameworks', label: 'Frameworks', icon: Library },
  { href: '/policies', label: 'Policies', icon: FileText },
  { href: '/policies/approvals', label: 'My Approvals', icon: ClipboardCheck },
  { href: '/controls', label: 'Controls', icon: ListChecks },
  { href: '/risk-register', label: 'Risk Register', icon: ShieldAlert },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <ComplAILogo showTagline />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard' || pathname.startsWith('/dashboard/')
              : item.href === '/intelligence'
                ? pathname === '/intelligence' || pathname.startsWith('/intelligence/')
                : item.href === '/policies/approvals'
                ? pathname === '/policies/approvals' || pathname.startsWith('/policies/approvals/')
                : item.href === '/policies'
                  ? pathname === '/policies' || (pathname.startsWith('/policies/') && !pathname.startsWith('/policies/approvals'))
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-700">{PRODUCT_NAME}</p>
          <p className="text-xs text-slate-500">
            SOC 2 + ISO 27001 · 24 frameworks
          </p>
        </div>
      </div>
    </aside>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </header>
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
