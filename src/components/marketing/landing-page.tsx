import { LandingHeader } from '@/components/marketing/landing-header';
import { LandingFooter } from '@/components/marketing/landing-footer';
import { LandingHeroSection } from '@/components/marketing/landing-hero-section';
import { LandingComplaiTeaser } from '@/components/marketing/landing-complai-teaser';
import { LandingCtaSection } from '@/components/marketing/landing-cta-section';

/** Propel Ready corporate home — distinct from the ComplAI /platform product page. */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-marketing-surface">
      <LandingHeader />
      <main>
        <LandingHeroSection />
        <LandingComplaiTeaser />
        <LandingCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
