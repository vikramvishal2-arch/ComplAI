'use client';

import { ExternalLink } from 'lucide-react';
import { getJiraTicketByKey } from '@/lib/data/assurance-demo';
import { cn } from '@/lib/utils';

type JiraTicketLinkProps = {
  ticketKey: string;
  url?: string;
  variant?: 'chip' | 'button' | 'inline';
  className?: string;
};

export function JiraTicketLink({
  ticketKey,
  url,
  variant = 'chip',
  className,
}: JiraTicketLinkProps) {
  const ticket = getJiraTicketByKey(ticketKey);
  const href =
    url ||
    ticket?.url ||
    `${(process.env.NEXT_PUBLIC_JIRA_BASE_URL?.replace(/\/$/, '') ||
      'https://propelreadysolutions.atlassian.net')}/browse/${ticketKey}`;

  const base =
    'inline-flex items-center gap-1.5 font-mono font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

  const variants = {
    chip: cn(
      base,
      'rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-800',
      'hover:border-blue-400 hover:bg-blue-100 hover:text-blue-900',
      'cursor-pointer shadow-sm'
    ),
    button: cn(
      base,
      'rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white shadow-sm',
      'hover:bg-brand-700 cursor-pointer'
    ),
    inline: cn(base, 'text-sm text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline'),
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${ticketKey} in Jira`}
      aria-label={`Open Jira ticket ${ticketKey} in a new tab`}
      className={cn(variants[variant], className)}
      onClick={(e) => e.stopPropagation()}
    >
      {variant === 'button' ? (
        <>
          Open in Jira
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </>
      ) : (
        <>
          {ticketKey}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </>
      )}
    </a>
  );
}
