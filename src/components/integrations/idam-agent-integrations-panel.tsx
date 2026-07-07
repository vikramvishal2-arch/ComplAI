'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Loader2,
  Monitor,
  Plug,
  Server,
  Zap,
} from 'lucide-react';
import type { IdamToolDefinition } from '@/lib/data/idam-tool-integrations';
import type { AgentInstallBundle, CustomerIdamIntegration } from '@/lib/integrations/idam/types';
import { cn } from '@/lib/utils';

type ToolState = IdamToolDefinition & {
  configured: boolean;
  integration: CustomerIdamIntegration | null;
  config: Record<string, string>;
};

type AgentRow = {
  id: string;
  status: string;
  hostname: string;
  platform: string;
  bundleId: string;
  enrolledAt: string | null;
  lastHeartbeatAt: string | null;
  expiresAt: string;
};

type Overview = {
  organization: { id: string; name: string };
  integrations: CustomerIdamIntegration[];
  primaryIdam: CustomerIdamIntegration | null;
  tools: ToolState[];
  agents: AgentRow[];
  agentRequired: boolean;
};

type ActionState = { toolId: string; action: 'test' | 'connect' } | null;

export function IdamAgentIntegrationsPanel() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({});
  const [actionState, setActionState] = useState<ActionState>(null);
  const [bundle, setBundle] = useState<AgentInstallBundle | null>(null);
  const [preparingBundle, setPreparingBundle] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/integrations/idam')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load IDAM integrations');
        return d as Overview;
      })
      .then((data) => {
        setOverview(data);
        setCredentials((prev) => {
          const next = { ...prev };
          for (const tool of data.tools) {
            if (!next[tool.id]) {
              next[tool.id] = {
                tenantUrl: tool.integration?.tenantUrl || tool.defaultTenantUrl,
                ...tool.config,
              };
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

  const runAction = async (toolId: string, action: 'test' | 'connect') => {
    setActionState({ toolId, action });
    setError(null);
    setMessage(null);
    try {
      const r = await fetch('/api/integrations/idam', {
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

  const prepareBundle = async () => {
    setPreparingBundle(true);
    setError(null);
    setMessage(null);
    try {
      const r = await fetch('/api/integrations/idam/agent-bundle', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Failed to prepare agent bundle');
      setBundle(d.bundle as AgentInstallBundle);
      setMessage('Endpoint agent installer bundle prepared — valid for 72 hours');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to prepare bundle');
    } finally {
      setPreparingBundle(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard');
  };

  const downloadBundle = () => {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complai-agent-bundle-${bundle.bundleId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setField = (toolId: string, fieldId: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [toolId]: { ...prev[toolId], [fieldId]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading customer IDAM integrations…
      </div>
    );
  }

  if (!overview) return null;

  const connectedCount = overview.integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-6">
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

      <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Customer IDAM profile</h2>
            <p className="mt-1 text-sm text-slate-600">
              Resolved from access-control remediations and org integration settings for{' '}
              <strong>{overview.organization.name}</strong>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-violet-800">
                {connectedCount} connected
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-violet-800">
                {overview.integrations.length} detected
              </span>
              {overview.agentRequired && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                  Endpoint agent required
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={prepareBundle}
            disabled={preparingBundle || connectedCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {preparingBundle ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
            Prepare endpoint agent installer
          </button>
        </div>

        {overview.primaryIdam && (
          <div className="mt-4 rounded-lg border border-violet-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
              Primary IDAM
            </p>
            <p className="mt-1 font-semibold text-slate-900">{overview.primaryIdam.toolName}</p>
            <p className="text-sm text-slate-600">{overview.primaryIdam.tenantUrl}</p>
            <p className="mt-2 text-xs text-slate-500">
              Source: {overview.primaryIdam.source.replace('_', ' ')} · Mode:{' '}
              {overview.primaryIdam.connectionMode}
            </p>
          </div>
        )}

        {overview.integrations.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {overview.integrations.map((integration) => (
              <li
                key={integration.toolId}
                className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{integration.toolName}</span>
                  <StatusBadge status={integration.status} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {integration.accountIdentifier || integration.tenantUrl}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {bundle && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Agent install bundle</h3>
              <p className="text-sm text-slate-500">
                Bundle {bundle.bundleId} · expires {new Date(bundle.expiresAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadBundle}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <InstallCommand
              label="Windows (PowerShell)"
              command={bundle.install.windows.powershell}
              onCopy={copyText}
            />
            <InstallCommand
              label="macOS / Linux"
              command={bundle.install.linux.shell}
              onCopy={copyText}
            />
          </div>

          <p className="mt-4 text-xs text-slate-500">
            The installer enrolls the machine, stores credentials locally, and pulls IDAM sync
            configuration from ComplAI. Hybrid/on-prem IDAM tools (CyberArk, Ping, AWS IAM) route
            through this agent.
          </p>
        </section>
      )}

      {overview.agents.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-900">Registered endpoint agents</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Host</th>
                  <th className="py-2 pr-4">Platform</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Enrolled</th>
                  <th className="py-2">Last heartbeat</th>
                </tr>
              </thead>
              <tbody>
                {overview.agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-slate-900">
                      {agent.hostname || '—'}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{agent.platform || '—'}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={agent.status} />
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {agent.enrolledAt ? new Date(agent.enrolledAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 text-slate-600">
                      {agent.lastHeartbeatAt
                        ? new Date(agent.lastHeartbeatAt).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-3 font-semibold text-slate-900">Configure IDAM connectors</h3>
        <div className="space-y-3">
          {overview.tools.map((tool) => {
            const expanded = expandedId === tool.id;
            const busy = actionState?.toolId === tool.id;
            return (
              <article
                key={tool.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : tool.id)}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{tool.name}</h4>
                      {tool.integration?.status === 'connected' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {tool.agentRequired && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                          Agent
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-600">
                        {tool.deployment}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{tool.description}</p>
                  </div>
                  {expanded ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                  )}
                </button>

                {expanded && (
                  <div className="border-t border-slate-100 px-4 pb-4">
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {tool.fields.map((field) => (
                        <label key={field.id} className="block text-sm">
                          <span className="font-medium text-slate-700">{field.label}</span>
                          {field.helpText && (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {field.helpText}
                            </span>
                          )}
                          <input
                            type={field.type === 'password' ? 'password' : 'text'}
                            value={credentials[tool.id]?.[field.id] ?? ''}
                            onChange={(e) => setField(tool.id, field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(tool.id, 'test')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                      >
                        {busy && actionState?.action === 'connect' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plug className="h-4 w-4" />
                        )}
                        Connect
                      </button>
                      <Link
                        href={`/help/integrations/${tool.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        Setup guide
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    connected: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    not_connected: 'bg-slate-100 text-slate-600',
    revoked: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
        styles[status] ?? 'bg-slate-100 text-slate-600'
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function InstallCommand({
  label,
  command,
  onCopy,
}: {
  label: string;
  command: string;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <button
          type="button"
          onClick={() => onCopy(command)}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
      <code className="block overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-800">
        {command}
      </code>
    </div>
  );
}
