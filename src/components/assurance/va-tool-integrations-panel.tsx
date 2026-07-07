'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plug,
  RefreshCw,
  Unplug,
  Zap,
} from 'lucide-react';
import type { VaToolDefinition } from '@/lib/data/va-tool-integrations';
import { VA_CATEGORY_LABELS } from '@/lib/data/va-tool-integrations';
import { cn } from '@/lib/utils';

type ToolState = VaToolDefinition & {
  connected: boolean;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastSyncCount: number | null;
  apiBaseUrl: string;
};

type ActionState = {
  toolId: string;
  action: 'test' | 'connect' | 'sync' | 'disconnect';
} | null;

export function VaToolIntegrationsPanel({ compact = false }: { compact?: boolean }) {
  const [tools, setTools] = useState<ToolState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});
  const [actionState, setActionState] = useState<ActionState>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/assurance/integrations')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load integrations');
        return d.tools as ToolState[];
      })
      .then((loaded) => {
        setTools(loaded);
        setCredentials((prev) => {
          const next = { ...prev };
          for (const tool of loaded) {
            if (!next[tool.id]) {
              next[tool.id] = { apiBaseUrl: tool.apiBaseUrl };
            }
          }
          return next;
        });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (
    toolId: string,
    action: 'test' | 'connect' | 'sync' | 'disconnect'
  ) => {
    setActionState({ toolId, action });
    setError(null);
    setMessage(null);
    try {
      const r = await fetch('/api/assurance/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          toolId,
          credentials: credentials[toolId] ?? {},
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Action failed');
      setMessage(d.message);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionState(null);
    }
  };

  const setField = (toolId: string, fieldId: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [toolId]: { ...prev[toolId], [fieldId]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading VA tool integrations…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {!compact && (
        <p className="text-sm text-slate-600">
          Connect vulnerability assessment tools via REST API. ComplAI pulls findings into
          Infrastructure VM and Application DAST, then raises Jira tickets for open issues.
        </p>
      )}

      <div className="grid gap-4">
        {tools.map((tool) => {
          const expanded = expandedId === tool.id;
          const busy = actionState?.toolId === tool.id;
          const creds = credentials[tool.id] ?? {};

          return (
            <article
              key={tool.id}
              className={cn(
                'overflow-hidden rounded-xl border bg-white shadow-sm transition-colors',
                tool.connected ? 'border-green-200' : 'border-slate-200'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {VA_CATEGORY_LABELS[tool.category]}
                    </span>
                    {tool.connected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Not connected
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{tool.description}</p>
                  {tool.connected && tool.lastSyncAt && (
                    <p className="mt-2 text-xs text-slate-500">
                      Last sync {new Date(tool.lastSyncAt).toLocaleString()} —{' '}
                      {tool.lastSyncCount ?? 0} findings imported
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tool.syncCapabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded-md bg-brand-50 px-2 py-0.5 text-xs text-brand-700"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {tool.connected && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(tool.id, 'sync')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-60"
                    >
                      {busy && actionState?.action === 'sync' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Sync now
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : tool.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Plug className="h-4 w-4" />
                    {expanded ? 'Hide' : 'Configure API'}
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/80 p-5">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      API credentials
                    </p>
                    <a
                      href={tool.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      {tool.apiDocsLabel} →
                    </a>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {tool.fields.map((field) => (
                      <label key={field.id} className="block text-sm sm:col-span-2">
                        <span className="font-medium text-slate-700">
                          {field.label}
                          {field.required && <span className="text-red-500"> *</span>}
                        </span>
                        <input
                          type={field.type === 'password' ? 'password' : 'text'}
                          value={creds[field.id] ?? ''}
                          onChange={(e) => setField(tool.id, field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          autoComplete="off"
                        />
                        {field.helpText && (
                          <span className="mt-1 block text-xs text-slate-500">{field.helpText}</span>
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(tool.id, 'test')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {busy && actionState?.action === 'test' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      Test connection
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(tool.id, 'connect')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                    >
                      {busy && actionState?.action === 'connect' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plug className="h-4 w-4" />
                      )}
                      Connect
                    </button>
                    {tool.connected && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(tool.id, 'disconnect')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {busy && actionState?.action === 'disconnect' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Unplug className="h-4 w-4" />
                        )}
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
