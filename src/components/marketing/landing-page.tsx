import { AnnouncementBar } from '@/components/marketing/announcement-bar';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { HeroSection } from '@/components/marketing/hero-section';
import { ComplianceCompassSection } from '@/components/marketing/compliance-compass-section';
import { StatsSection } from '@/components/marketing/stats-section';
import { FrameworksSection } from '@/components/marketing/frameworks-section';
import { IntelligenceHighlightSection } from '@/components/marketing/intelligence-highlight-section';
import { ProblemSolutionSection } from '@/components/marketing/problem-solution-section';
import { WhyComplaiTeaserSection } from '@/components/marketing/why-complai-teaser-section';
import { PlatformPillarsSection } from '@/components/marketing/platform-pillars-section';
import { StagesSection } from '@/components/marketing/stages-section';
import { IntegrationsPreviewSection } from '@/components/marketing/integrations-preview-section';
import { CtaSection } from '@/components/marketing/cta-section';

export function LandingPage() {
  return (
    <div className="bg-white text-scrut-navy">
      <AnnouncementBar />
      <MarketingHeader />
      <main>
        <HeroSection />
        <ComplianceCompassSection />
        <StatsSection />
        <FrameworksSection />
        <IntelligenceHighlightSection />
        <ProblemSolutionSection />
        <WhyComplaiTeaserSection />
        <PlatformPillarsSection />
        <StagesSection />
        <IntegrationsPreviewSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
