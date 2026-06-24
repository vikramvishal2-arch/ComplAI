'use client';

import { AppShell } from '@/components/layout/app-shell';
import { LeadershipDashboard } from '@/components/dashboard/leadership-dashboard';
import { PRODUCT_NAME } from '@/lib/brand';

export default function DashboardPage() {
  return (
    <AppShell
      title="Leadership Dashboard"
      subtitle={`${PRODUCT_NAME} — CISO & CIO compliance posture, RAG by domain, risks, and actions`}
    >      <LeadershipDashboard />
    </AppShell>
  );
}
