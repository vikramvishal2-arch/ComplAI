import { AnnouncementBar } from '@/components/marketing/announcement-bar';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-scrut-navy">
      <AnnouncementBar />
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
