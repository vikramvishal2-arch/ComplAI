'use client';

import { AppShell } from '@/components/layout/app-shell';
import { TprmSubNav } from '@/components/tprm/tprm-sub-nav';

/** App shell with TPRM tabs in the content header (clear of the left module panel). */
export function TprmAppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell title={title} subtitle={subtitle} moduleNav={<TprmSubNav />}>
      {children}
    </AppShell>
  );
}
