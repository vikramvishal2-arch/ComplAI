import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ORGANIZATION_NAME, PRIVYCORE_ICON, PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/brand';

interface PrivyCoreLogoProps {
  className?: string;
  href?: string;
  showTagline?: boolean;
  onDark?: boolean;
}

export function PrivyCoreLogo({
  className,
  href = '/dashboard',
  showTagline = true,
  onDark = true,
}: PrivyCoreLogoProps) {
  const content = (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRIVYCORE_ICON}
          alt=""
          aria-hidden
          width={36}
          height={36}
          className="h-9 w-9 shrink-0"
        />
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              'truncate text-base font-bold tracking-tight',
              onDark ? 'text-zinc-50' : 'text-slate-900'
            )}
          >
            <span className="inline-flex items-baseline gap-[0.06em]">
              <span className="text-brand-400">Privy</span>
              <span className={onDark ? 'text-zinc-50' : 'text-slate-900'}>Core</span>
            </span>
          </p>
          {showTagline && (
            <p className={cn('truncate text-[11px]', onDark ? 'text-zinc-500' : 'text-slate-500')}>
              {PRODUCT_TAGLINE}
            </p>
          )}
        </div>
      </div>
      {showTagline && (
        <p
          className={cn(
            'text-[10px] font-medium uppercase tracking-wide',
            onDark ? 'text-zinc-600' : 'text-slate-400'
          )}
        >
          {ORGANIZATION_NAME}
        </p>
      )}
    </div>
  );

  if (!href) {
    return <div className={cn('min-w-0', className)}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        'block min-w-0 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 rounded-lg',
        onDark && 'focus-visible:ring-offset-surface-navy',
        className
      )}
      aria-label={`${PRODUCT_NAME} — go to dashboard`}
    >
      {content}
    </Link>
  );
}
