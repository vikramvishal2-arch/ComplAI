import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ORGANIZATION_NAME, PROPEL_READY_ICON } from '@/lib/brand';
import { PropelReadyWordmark } from '@/components/marketing/propel-ready-brand-link';

type PropelReadyLogoVariant = 'icon' | 'compact' | 'hero' | 'stacked';
type PropelReadyLogoTheme = 'dark' | 'light';

interface PropelReadyLogoProps {
  className?: string;
  href?: string;
  variant?: PropelReadyLogoVariant;
  showTagline?: boolean;
  theme?: PropelReadyLogoTheme;
  ariaLabel?: string;
}

const iconSize: Record<PropelReadyLogoVariant, string> = {
  icon: 'h-12 w-[4.3rem]',
  compact: 'h-14 w-[5rem] sm:h-16 sm:w-[5.75rem]',
  stacked: 'h-16 w-[5.75rem] sm:h-[4.5rem] sm:w-[6.5rem]',
  hero: 'h-24 w-[8.6rem] sm:h-28 sm:w-[10rem]',
};

function PropelReadyIconMark({
  variant,
  theme = 'dark',
  className,
}: {
  variant: PropelReadyLogoVariant;
  theme?: PropelReadyLogoTheme;
  className?: string;
}) {
  void theme;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={PROPEL_READY_ICON}
      alt=""
      aria-hidden
      className={cn('shrink-0 object-contain object-left', iconSize[variant], className)}
    />
  );
}

/** Propel Ready lockup — SVG icon + styled wordmark (no PNG). */
export function PropelReadyLogo({
  className,
  href = '/',
  variant = 'compact',
  showTagline = true,
  theme = 'dark',
  ariaLabel,
}: PropelReadyLogoProps) {
  const wordmarkSize =
    variant === 'hero' ? 'lg' : variant === 'stacked' ? 'sm' : variant === 'icon' ? 'sm' : 'md';

  const content =
    variant === 'icon' ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={PROPEL_READY_ICON}
        alt={ORGANIZATION_NAME}
        className={cn('h-12 w-auto shrink-0 object-contain', className)}
      />
    ) : variant === 'hero' ? (
      <div className="flex flex-col items-center gap-4 text-center">
        <PropelReadyIconMark variant="hero" theme={theme} className="mx-auto h-28 w-auto max-w-[14rem] sm:h-32" />
        <PropelReadyWordmark theme={theme} size="lg" showSolutions />
        {showTagline && (
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-400/80">
            Connect. Secure. Advance.
          </p>
        )}
      </div>
    ) : (
      <div className="flex min-w-0 items-center gap-2.5">
        <PropelReadyIconMark variant={variant} theme={theme} />
        <PropelReadyWordmark
          theme={theme}
          size={wordmarkSize}
          showSolutions={variant !== 'stacked' || showTagline}
        />
      </div>
    );

  if (!href) {
    return <div className={cn('inline-flex min-w-0', className)}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-w-0 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 rounded-sm',
        theme === 'dark' && 'focus-visible:ring-offset-scrut-navy',
        className
      )}
      aria-label={ariaLabel ?? `${ORGANIZATION_NAME} — home`}
    >
      {content}
    </Link>
  );
}
