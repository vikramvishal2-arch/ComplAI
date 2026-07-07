'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ClipboardList, FileWarning, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/vendors', label: 'Vendor portfolio', icon: LayoutDashboard, exact: true },
  { href: '/vendors/questionnaires', label: 'Questionnaires', icon: ClipboardList },
  { href: '/vendors/remediation', label: 'Remediation', icon: FileWarning },
];

export function TprmSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-slate-200">
      <div className="flex flex-wrap gap-1">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                active
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function TprmPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
          <Building2 className="h-3.5 w-3.5" />
          Vendor Risk · TPRM
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
