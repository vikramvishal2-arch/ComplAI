'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AnnualCyclesManager } from '@/components/cycles/annual-cycles-manager';

export default function CyclesPage() {
  return (
    <AppShell
      title="Annual Program Cycles"
      subtitle="Track and manage recurring compliance, audit, risk, and vendor program deadlines"
    >
      <AnnualCyclesManager />
    </AppShell>
  );
}
