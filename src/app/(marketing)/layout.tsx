import type { Metadata } from 'next';
import { MarketingClientExtras } from '@/components/marketing/marketing-client-extras';
import {
  ORGANIZATION_NAME,
  PRODUCT_DESCRIPTION,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
} from '@/lib/brand';

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE} | ${ORGANIZATION_NAME}`,
  description: PRODUCT_DESCRIPTION,
  openGraph: {
    title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    description: PRODUCT_DESCRIPTION,
    siteName: ORGANIZATION_NAME,
    type: 'website',
    url: 'https://propelreadysolutions.in',
  },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen scroll-pt-28 bg-marketing-surface">
      {children}
      <MarketingClientExtras />
    </div>
  );
}
