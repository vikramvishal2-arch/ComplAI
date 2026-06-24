import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const basePrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-scrut-gradient px-6 py-3 text-sm font-semibold text-scrut-navy shadow-sm transition-opacity hover:opacity-90';

const baseSecondary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/30';

const baseOutline =
  'inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-scrut-navy transition-colors hover:border-slate-400 hover:bg-slate-50';

function isExternal(href: string) {
  return href.startsWith('http');
}

export function ScrutPrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = cn(basePrimary, className);
  if (isExternal(href)) {
    return (
      <a href={href} className={cls} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function ScrutSecondaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = cn(baseSecondary, className);
  if (isExternal(href)) {
    return (
      <a href={href} className={cls} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function ScrutOutlineButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const cls = cn(baseOutline, className);
  if (isExternal(href)) {
    return (
      <a href={href} className={cls} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.2em] text-slate-500',
        className
      )}
    >
      {children}
    </p>
  );
}
