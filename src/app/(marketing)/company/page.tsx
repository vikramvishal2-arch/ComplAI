import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { CompanyPageContent } from '@/components/marketing/company-page-content';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Company — ${ORGANIZATION_NAME} | ${PRODUCT_NAME}`,
  description: `Learn about ${ORGANIZATION_NAME}'s mission and contact us for ${PRODUCT_NAME} demos and GRC advisory.`,
};

type CompanyPageProps = {
  searchParams: Promise<{ contact?: string }>;
};

export default async function CompanyPage({ searchParams }: CompanyPageProps) {
  const params = await searchParams;
  const openContactOnMount = params.contact === '1' || params.contact === 'true';

  return (
    <MarketingShell>
      <CompanyPageContent openContactOnMount={openContactOnMount} />
    </MarketingShell>
  );
}
