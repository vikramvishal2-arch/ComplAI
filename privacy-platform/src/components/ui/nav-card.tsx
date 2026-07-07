import Link from 'next/link';
import { cn } from '@/lib/utils';

export function NavCard({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'privacy-card block text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </Link>
  );
}
