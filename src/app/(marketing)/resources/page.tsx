import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ResourcesPageContent } from '@/components/marketing/resources-page-content';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Resources — FAQs & Framework Guides | ${ORGANIZATION_NAME}`,
  description: `FAQs and compliance framework guides for SOC 2, ISO 27001, GDPR, HIPAA, and more — from ${ORGANIZATION_NAME} and ${PRODUCT_NAME}.`,
};

export default function ResourcesPage() {
  return (
    <MarketingShell>
      <ResourcesPageContent />
    </MarketingShell>
  );
}
