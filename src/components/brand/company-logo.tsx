import { cn } from '@/lib/utils';
import { PRODUCT_NAME } from '@/lib/brand';
import { PropelReadyLogo } from '@/components/brand/propel-ready-logo';

interface CompanyLogoProps {
  className?: string;
}

export function CompanyLogo({ className }: CompanyLogoProps) {
  return (
    <PropelReadyLogo
      href="/dashboard"
      variant="stacked"
      theme="light"
      className={cn(className)}
      ariaLabel={`${PRODUCT_NAME} — go to leadership dashboard`}
    />
  );
}
