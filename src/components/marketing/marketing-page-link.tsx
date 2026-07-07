import Link from 'next/link';
import { marketingHref } from '@/lib/marketing-href';

type MarketingPageLinkProps = Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href'> & {
  href: string;
};

/** Cross-page links that preserve hash anchors (dev + static hosting). */
export function MarketingPageLink({ href, ...props }: MarketingPageLinkProps) {
  const resolved = marketingHref(href);
  return <Link href={resolved} prefetch={false} scroll {...props} />;
}
