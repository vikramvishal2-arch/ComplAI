'use client';

import dynamic from 'next/dynamic';
import { MarketingHashScroll } from '@/components/marketing/marketing-hash-scroll';

const PiaChatbot = dynamic(
  () => import('@/components/marketing/pia-chatbot').then((m) => m.PiaChatbot),
  { ssr: false }
);

export function MarketingClientExtras() {
  return (
    <>
      <MarketingHashScroll />
      <PiaChatbot />
    </>
  );
}
