import Link from 'next/link';
import { cn } from '@/lib/utils';

type PropelReadyTheme = 'dark' | 'light';

/** Brand wordmark — navy PROPEL, green READY, SOLUTIONS subline with rules. */
export function PropelReadyWordmark({
  className,
  theme = 'dark',
  showSolutions = true,
  size = 'md',
}: {
  className?: string;
  theme?: PropelReadyTheme;
  showSolutions?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const propelClass = theme === 'dark' ? 'text-[#7cb3ff]' : 'text-[#1a4278]';
  const readyClass = theme === 'dark' ? 'text-[#4ade80]' : 'text-[#16a34a]';
  const ruleClass = theme === 'dark' ? 'bg-[#7cb3ff]/45' : 'bg-[#1a4278]/35';
  const solutionsClass = theme === 'dark' ? 'text-[#93c5fd]/85' : 'text-[#1a4278]/75';

  const titleSize =
    size === 'lg'
      ? 'text-xl sm:text-2xl'
      : size === 'sm'
        ? 'text-[13px] sm:text-sm'
        : 'text-[15px] sm:text-base';

  const solutionsSize =
    size === 'lg' ? 'text-[10px] tracking-[0.24em]' : 'text-[8px] sm:text-[9px] tracking-[0.22em]';

  return (
    <div className={cn('min-w-0 leading-none', className)}>
      <p className={cn('font-extrabold uppercase tracking-[0.04em]', titleSize)}>
        <span className={propelClass}>Propel </span>
        <span className={readyClass}>Ready</span>
      </p>
      {showSolutions && (
        <div className="mt-1 flex items-center gap-1.5">
          <span className={cn('h-px min-w-[10px] flex-1', ruleClass)} aria-hidden />
          <span className={cn('shrink-0 font-medium uppercase', solutionsSize, solutionsClass)}>
            Solutions
          </span>
          <span className={cn('h-px min-w-[10px] flex-1', ruleClass)} aria-hidden />
        </div>
      )}
    </div>
  );
}

/** @deprecated Use PropelReadyWordmark. */
export function PropelReadyStyled({
  className,
  showSolutions = false,
  theme = 'dark',
}: {
  className?: string;
  showSolutions?: boolean;
  theme?: PropelReadyTheme;
}) {
  return (
    <PropelReadyWordmark
      className={className}
      theme={theme}
      showSolutions={showSolutions}
      size="md"
    />
  );
}

export function PropelReadyBrandLink({
  className,
  inheritWeight = false,
}: {
  className?: string;
  inheritWeight?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        'rounded-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
        !inheritWeight && 'font-bold',
        className
      )}
    >
      <PropelReadyWordmark size="md" />
    </Link>
  );
}
