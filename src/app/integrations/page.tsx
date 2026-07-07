'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Loader2,
  Search,
  Cloud,
  Server,
  Boxes,
  Code2,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainMeta {
  id: string;
  label: string;
  description: string;
  count: number;
}

interface IntegrationTool {
  id: string;
  name: string;
  domains: string[];
  description: string;
  websiteUrl: string;
  docsUrl?: string;
  helpGuidePath: string;
  helpGuideUrl: string;
  deployment: 'saas' | 'on-prem' | 'hybrid' | 'open-source';
  capabilities: string[];
}

const DEPLOYMENT_LABEL: Record<string, string> = {
  saas: 'SaaS',
  'on-prem': 'On-prem',
  hybrid: 'Hybrid',
  'open-source': 'Open source',
};

const DEPLOYMENT_ICON: Record<string, typeof Cloud> = {
  saas: Cloud,
  'on-prem': Server,
  hybrid: Boxes,
  'open-source': Code2,
};

const DOMAIN_COLORS: Record<string, string> = {
  hrms: 'bg-sky-100 text-sky-800',
  idam: 'bg-violet-100 text-violet-800',
  siem: 'bg-amber-100 text-amber-800',
  vapt: 'bg-rose-100 text-rose-800',
  sso: 'bg-emerald-100 text-emerald-800',
};

export default function IntegrationsPage() {
  const [domains, setDomains] = useState<DomainMeta[]>([]);
  const [tools, setTools] = useState<IntegrationTool[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d as { domains: DomainMeta[]; tools: IntegrationTool[] };
      })
      .then((d) => {
        setDomains(d.domains);
        setTools(d.tools);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tools.filter((t) => {
      const inDomain = filter === 'all' || t.domains.includes(filter);
      if (!inDomain) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.capabilities.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [tools, filter, search]);

  const activeMeta = filter === 'all' ? null : domains.find((d) => d.id === filter);

  return (
    <AppShell
      title="Integrations"
      subtitle="GRC-relevant tools by domain — HRMS, IDAM, SIEM, VAPT, and SSO"
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools, capabilities…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm"
          />
        </div>
        <Link
          href="/integrations/idam"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          IDAM & endpoint agent
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading integrations…
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">
              {filtered.length} of {tools.length} tools
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filter === 'all'
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {domains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setFilter(d.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filter === d.id
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {activeMeta && (
            <p className="mb-6 text-sm text-slate-500">{activeMeta.description}</p>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              No tools match your search{filter !== 'all' ? ' in this domain' : ''}.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => {
                const DepIcon = DEPLOYMENT_ICON[tool.deployment] ?? Cloud;
                return (
                  <article
                    key={tool.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        <DepIcon className="h-3 w-3" />
                        {DEPLOYMENT_LABEL[tool.deployment]}
                      </span>
                    </div>
                    <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-3">
                      {tool.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tool.domains.map((dom) => (
                        <span
                          key={dom}
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                            DOMAIN_COLORS[dom] ?? 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {dom}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-3 space-y-1">
                      {tool.capabilities.slice(0, 4).map((cap) => (
                        <li key={cap} className="text-xs text-slate-500">
                          · {cap}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <Link
                        href={tool.helpGuidePath}
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        View in Help Center
                      </Link>
                      <p className="mt-1.5 text-xs text-slate-500">
                        Product details, setup steps, and GRC evidence mapping
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
