'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { resolveControlLookup } from '@/lib/data/controls';
import { cn } from '@/lib/utils';

export type ControlReferenceProps = {
  controlId?: string;
  reference?: string;
  frameworkId?: string;
  title?: string;
  description?: string;
  showTitle?: boolean;
  variant?: 'link' | 'badge';
  className?: string;
  stopPropagation?: boolean;
};

export function ControlReference({
  controlId,
  reference,
  frameworkId,
  title,
  description,
  showTitle = false,
  variant = 'link',
  className,
  stopPropagation = false,
}: ControlReferenceProps) {
  const control = useMemo(
    () => resolveControlLookup({ controlId, reference, frameworkId }),
    [controlId, reference, frameworkId]
  );

  const resolvedId = control?.id ?? controlId;
  const refLabel = reference ?? control?.reference ?? controlId ?? '—';
  const controlTitle = title ?? control?.title;
  const tooltipBody = description ?? control?.description ?? control?.guidance ?? '';
  const hasLink = Boolean(resolvedId);
  const displayLabel = showTitle && controlTitle ? `${refLabel} — ${controlTitle}` : refLabel;

  const linkClass = cn(
    variant === 'badge'
      ? 'rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 hover:bg-brand-100 hover:border-brand-300'
      : 'font-mono text-xs text-brand-600 hover:text-brand-700 hover:underline',
    hasLink && 'cursor-pointer',
    className
  );

  const inner = hasLink ? (
    <Link
      href={`/controls/${resolvedId}`}
      className={linkClass}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {displayLabel}
    </Link>
  ) : (
    <span className={cn(linkClass, 'cursor-default')}>{displayLabel}</span>
  );

  if (!tooltipBody) {
    return inner;
  }

  return (
    <span className="group/control-ref relative inline-flex max-w-full align-middle">
      {inner}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 hidden w-80 max-w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-left shadow-xl group-hover/control-ref:block"
      >
        <span className="block font-mono text-[11px] font-semibold text-brand-300">{refLabel}</span>
        {controlTitle && (
          <span className="mt-1 block text-xs font-medium text-white">{controlTitle}</span>
        )}
        <span className="mt-1.5 block text-xs leading-relaxed text-slate-300 line-clamp-5">
          {tooltipBody}
        </span>
        {hasLink && (
          <span className="mt-2 block text-[10px] font-medium text-slate-400">Click to open control</span>
        )}
      </span>
    </span>
  );
}
