import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { PlatformPageContent } from '@/components/marketing/platform-page-content';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Platform — ${PRODUCT_NAME} | ${ORGANIZATION_NAME}`,
  description: `Explore the ${PRODUCT_NAME} platform — policies, frameworks, controls, integrations, intelligence, risk, vendors, and leadership dashboards in one GRC workspace.`,
};

export default function PlatformPage() {
  return (
    <MarketingShell>
      <PlatformPageContent />
    </MarketingShell>
  );
}
