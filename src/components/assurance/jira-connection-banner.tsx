'use client';

import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssuranceDataMode } from '@/lib/assurance/types';

type Props = {
  mode: AssuranceDataMode | null;
  configured: boolean;
  message: string;
  loading?: boolean;
  onRefresh?: () => void;
  className?: string;
};

export function JiraConnectionBanner({
  mode,
  configured,
  message,
  loading,
  onRefresh,
  className,
}: Props) {
  const isJira = mode === 'jira';

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm',
        isJira
          ? 'border-green-200 bg-green-50 text-green-900'
          : 'border-amber-200 bg-amber-50 text-amber-900',
        className
      )}
    >
      <div className="flex items-start gap-2">
        {isJira ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        )}
        <div>
          <p className="font-semibold">
            {isJira
              ? 'Jira connected'
              : configured
                ? 'Demo data (Jira request failed)'
                : 'Demo data (configure JIRA_* env)'}
          </p>
          <p className="mt-0.5 text-xs opacity-90">{message}</p>
          {!isJira ? (
            <p className="mt-1 text-xs opacity-80">
              Use a personal API token from{' '}
              <a
                className="underline underline-offset-2"
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noreferrer"
              >
                id.atlassian.com
              </a>
              . Organization API keys from admin.atlassian.com are not valid for Jira issue sync.
            </p>
          ) : null}
        </div>
      </div>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-60"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      ) : null}
    </div>
  );
}
