import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/landing-page';
import { ORGANIZATION_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: `${ORGANIZATION_NAME} — Connect. Secure. Advance.`,
  description: `${ORGANIZATION_NAME} helps organizations see security and GRC risk across every dimension — with advisory services and the ComplAI platform.`,
};

export default function HomePage() {
  return <LandingPage />;
}
