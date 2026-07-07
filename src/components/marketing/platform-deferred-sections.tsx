'use client';

import { MarketingLazyMount } from '@/components/marketing/marketing-lazy-mount';
import { MarketingSectionSkeleton } from '@/components/marketing/marketing-section-skeleton';
import { IntegrationsPreviewSection } from '@/components/marketing/integrations-preview-section';
import { PlatformCapabilitiesTabs } from '@/components/marketing/platform-capabilities-tabs';
import { PlatformPillarsSection } from '@/components/marketing/platform-pillars-section';

export function DeferredPlatformCapabilitiesTabs() {
  return (
    <MarketingLazyMount
      minHeight={520}
      fallback={<MarketingSectionSkeleton minHeight={520} className="mx-auto max-w-6xl" />}
    >
      <PlatformCapabilitiesTabs />
    </MarketingLazyMount>
  );
}

export function DeferredPlatformPillarsSection() {
  return (
    <MarketingLazyMount
      minHeight={400}
      fallback={<MarketingSectionSkeleton minHeight={400} />}
    >
      <PlatformPillarsSection />
    </MarketingLazyMount>
  );
}

export function DeferredIntegrationsPreviewSection() {
  return (
    <MarketingLazyMount
      minHeight={360}
      fallback={<MarketingSectionSkeleton minHeight={360} />}
    >
      <IntegrationsPreviewSection />
    </MarketingLazyMount>
  );
}
