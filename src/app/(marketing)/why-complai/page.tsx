import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { WhyComplaiPageContent } from '@/components/marketing/why-complai-page-content';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Why ${PRODUCT_NAME} — ${ORGANIZATION_NAME}`,
  description: `Why choose ${PRODUCT_NAME} over manual GRC? Unified controls, continuous audit readiness, expert-backed templates, and automation built for security-first teams.`,
};

export default function WhyComplaiPage() {
  return (
    <MarketingShell>
      <WhyComplaiPageContent />
    </MarketingShell>
  );
}
