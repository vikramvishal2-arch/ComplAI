import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Brand-colored ComplAI wordmark (no link). */
export function ComplAIStyled({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold', className)}>
      <span className="text-emerald-400">Compl</span>
      <span className="text-white">AI</span>
    </span>
  );
}

/** ComplAI wordmark linking to the platform page. */
export function ComplAIBrandLink({
  className,
  inheritWeight = false,
}: {
  className?: string;
  inheritWeight?: boolean;
}) {
  return (
    <Link
      href="/platform"
      className={cn(
        'rounded-sm transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scrut-teal/50',
        !inheritWeight && 'font-bold',
        className
      )}
    >
      <ComplAIStyled className={inheritWeight ? 'font-inherit' : undefined} />
    </Link>
  );
}

/** Renders text with every "ComplAI" occurrence styled; links to /platform when `linked` is true. */
export function ComplAIText({
  children,
  className,
  linked = true,
}: {
  children: string;
  className?: string;
  linked?: boolean;
}) {
  const parts = children.split(/(ComplAI)/g);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part === 'ComplAI' ? linked ? (
          <ComplAIBrandLink key={i} inheritWeight className="inline font-inherit" />
        ) : (
          <ComplAIStyled key={i} className="inline font-inherit" />
        ) : (
          part
        )
      )}
    </span>
  );
}
