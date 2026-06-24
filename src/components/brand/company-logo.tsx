import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PRODUCT_NAME, ORGANIZATION_NAME } from '@/lib/brand';
interface CompanyLogoProps {
  className?: string;
}

export function CompanyLogo({ className }: CompanyLogoProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'block w-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg',
        className
      )}
      aria-label={`${PRODUCT_NAME} — go to leadership dashboard`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/company-logo.png"
        alt={`${ORGANIZATION_NAME} — Connect. Secure. Advance.`}
        className="h-auto w-full max-w-[13.5rem] object-contain object-left"
      />
    </Link>
  );
}
