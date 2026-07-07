import { AppShell } from '@/components/layout/app-shell';
import { PrivacyDashboard } from '@/components/dashboard/privacy-dashboard';
import { PRODUCT_NAME } from '@/lib/brand';

export default function DashboardPage() {
  return (
    <AppShell
      title="Privacy Program Dashboard"
      subtitle={`${PRODUCT_NAME} — unified privacy posture across NIST Privacy Framework, ISO/IEC 27701, GDPR, and India's DPDP Act`}
    >
      <PrivacyDashboard />
    </AppShell>
  );
}
