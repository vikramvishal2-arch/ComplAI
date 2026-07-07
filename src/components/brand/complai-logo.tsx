import Link from 'next/link';
import { cn } from '@/lib/utils';
import { COMPLAI_ICON, COMPLAI_LOGO, ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

type ComplAILogoVariant = 'full' | 'icon' | 'stacked';

interface ComplAILogoProps {
  className?: string;
  href?: string;
  variant?: ComplAILogoVariant;
  showTagline?: boolean;
  /** Light text for dark backgrounds (app sidebar, marketing). */
  onDark?: boolean;
}

export function ComplAILogo({
  className,
  href = '/dashboard',
  variant = 'stacked',
  showTagline = true,
  onDark = false,
}: ComplAILogoProps) {
  const content =
    variant === 'icon' ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={COMPLAI_ICON}
        alt={PRODUCT_NAME}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0"
      />
    ) : variant === 'full' ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={COMPLAI_LOGO}
        alt={PRODUCT_NAME}
        className="h-10 w-auto max-w-[11rem] object-contain object-left"
      />
    ) : (
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={COMPLAI_ICON}
            alt=""
            aria-hidden
            width={36}
            height={36}
            className="h-9 w-9 shrink-0"
          />
          <div className="min-w-0 leading-tight">
            <p className={cn('truncate text-base font-bold tracking-tight', onDark ? 'text-zinc-50' : 'text-slate-900')}>
              <span className="inline-flex items-baseline gap-[0.06em]">
                <span className="text-brand-400">Compl</span>
                <span className={onDark ? 'text-zinc-50' : 'text-slate-900'}>AI</span>
              </span>
            </p>
            {showTagline && (
              <p className={cn('truncate text-[11px]', onDark ? 'text-zinc-500' : 'text-slate-500')}>
                GRC Compliance Platform
              </p>
            )}
          </div>
        </div>
        {showTagline && (
          <p className={cn('text-[10px] font-medium uppercase tracking-wide', onDark ? 'text-zinc-600' : 'text-slate-400')}>
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
        onDark && 'focus-visible:ring-offset-scrut-navy',
        className
      )}
      aria-label={`${PRODUCT_NAME} — go to leadership dashboard`}
    >
      {content}
    </Link>
  );
}
