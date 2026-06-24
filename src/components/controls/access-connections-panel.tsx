'use client';

import { ExternalLink, Plug, Unplug } from 'lucide-react';
import type { AccessConnection, AccessConnectionStatus, AccessIntegrationProvider } from '@/lib/types';
import { ACCESS_CONNECTION_STATUS_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusStyles: Record<AccessConnectionStatus, string> = {
  not_connected: 'bg-slate-100 text-slate-600 border-slate-200',
  connected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

interface AccessConnectionsPanelProps {
  connections: AccessConnection[];
  providers: AccessIntegrationProvider[];
  onChange: (connections: AccessConnection[]) => void;
}

export function AccessConnectionsPanel({
  connections,
  providers,
  onChange,
}: AccessConnectionsPanelProps) {
  const updateConnection = (providerId: string, patch: Partial<AccessConnection>) => {
    const exists = connections.some((c) => c.providerId === providerId);
    const list = exists
      ? connections
      : [...connections, getConnection(providerId)];

    onChange(
      list.map((c) => {
        if (c.providerId !== providerId) return c;
        const updated = { ...c, ...patch };
        if (patch.status === 'connected' && !updated.connectedAt) {
          updated.connectedAt = new Date().toISOString();
        }
        if (patch.status === 'not_connected') {
          updated.connectedAt = null;
        }
        return updated;
      })
    );
  };

  const getConnection = (providerId: string): AccessConnection => {
    return (
      connections.find((c) => c.providerId === providerId) ?? {
        providerId,
        status: 'not_connected',
        accountIdentifier: '',
        adminContact: '',
        connectedAt: null,
        notes: '',
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-violet-600" />
          <h3 className="text-sm font-semibold text-violet-900">Access control integrations</h3>
        </div>
        <p className="mt-1 text-xs text-violet-800">
          Connect identity and access systems to remediate access control gaps. Document account
          identifiers and admin contacts for audit traceability.
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => {
          const conn = getConnection(provider.id);
          return (
            <div
              key={provider.id}
              className={cn(
                'rounded-xl border p-5 transition',
                conn.status === 'connected'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-200 bg-white'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h4 className="font-semibold text-slate-900">{provider.name}</h4>
                  <p className="mt-1 text-xs text-slate-600 max-w-xl">{provider.description}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                    statusStyles[conn.status]
                  )}
                >
                  {conn.status === 'connected' ? (
                    <Plug className="h-3 w-3" />
                  ) : (
                    <Unplug className="h-3 w-3" />
                  )}
                  {ACCESS_CONNECTION_STATUS_LABELS[conn.status]}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {provider.checksProvided.map((check) => (
                  <span
                    key={check}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                  >
                    {check}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-4 text-xs">
                <a
                  href={provider.consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Admin console
                </a>
                <a
                  href={provider.setupGuideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Setup guide
                </a>
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Documentation
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Connection status
                  </label>
                  <select
                    value={conn.status}
                    onChange={(e) =>
                      updateConnection(provider.id, {
                        status: e.target.value as AccessConnectionStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {(Object.keys(ACCESS_CONNECTION_STATUS_LABELS) as AccessConnectionStatus[]).map(
                      (s) => (
                        <option key={s} value={s}>
                          {ACCESS_CONNECTION_STATUS_LABELS[s]}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Account / tenant ID
                  </label>
                  <input
                    type="text"
                    value={conn.accountIdentifier}
                    onChange={(e) =>
                      updateConnection(provider.id, { accountIdentifier: e.target.value })
                    }
                    placeholder={
                      provider.id === 'okta'
                        ? 'company.okta.com'
                        : provider.id === 'aws_iam'
                          ? 'AWS account ID'
                          : 'Org or tenant identifier'
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Admin contact
                  </label>
                  <input
                    type="text"
                    value={conn.adminContact}
                    onChange={(e) =>
                      updateConnection(provider.id, { adminContact: e.target.value })
                    }
                    placeholder="admin@company.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                  <input
                    type="text"
                    value={conn.notes}
                    onChange={(e) => updateConnection(provider.id, { notes: e.target.value })}
                    placeholder="SSO config, scope notes..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
