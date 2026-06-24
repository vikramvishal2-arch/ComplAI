import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { SolutionsPageContent } from '@/components/marketing/solutions-page-content';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Solutions — ${PRODUCT_NAME} | ${ORGANIZATION_NAME}`,
  description: `GRC solutions for compliance, audits, policies, risk, vendors, integrations, and AI — powered by ${PRODUCT_NAME}.`,
};

export default function SolutionsPage() {
  return (
    <MarketingShell>
      <SolutionsPageContent />
    </MarketingShell>
  );
}
