'use client';

import { AppShell } from '@/components/layout/app-shell';
import { GrcProgramOverview } from '@/components/dashboard/grc-program-overview';
import { LeadershipDashboard } from '@/components/dashboard/leadership-dashboard';
import { PRODUCT_NAME } from '@/lib/brand';

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle={`${PRODUCT_NAME} — compliance posture, program modules, risk, assurance, and audit readiness`}
    >
      <div className="space-y-8">
        <GrcProgramOverview />
        <LeadershipDashboard />
      </div>
    </AppShell>
  );
}
