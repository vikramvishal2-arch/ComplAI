'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Download,
  ExternalLink,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Upload,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import type {
  EvidenceBriefcaseItem,
  EvidenceBriefcaseModule,
  EvidenceBriefcaseSearchResult,
} from '@/lib/evidence/briefcase-types';
import { cn } from '@/lib/utils';

const MODULE_LABELS: Record<EvidenceBriefcaseModule, string> = {
  controls: 'Controls',
  risk: 'Risk register',
  tprm: 'TPRM',
  internal_audit: 'Internal audit',
  risk_assessment: 'Risk assessment',
  policy: 'Policies',
  assurance: 'Assurance',
};

const MODULE_COLORS: Record<EvidenceBriefcaseModule, string> = {
  controls: 'bg-sky-100 text-sky-800',
  risk: 'bg-rose-100 text-rose-800',
  tprm: 'bg-violet-100 text-violet-800',
  internal_audit: 'bg-amber-100 text-amber-800',
  risk_assessment: 'bg-orange-100 text-orange-800',
  policy: 'bg-emerald-100 text-emerald-800',
  assurance: 'bg-slate-100 text-slate-700',
};

const SUGGESTIONS = [
  'uploaded evidence',
  'MFA control closure evidence',
  'SOC 2 access management submitted',
  'vendor SOC report evidence',
  'ISO 27001 incident response',
];

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
  results?: EvidenceBriefcaseItem[];
  keywords?: string[];
};

function isUploadItem(item: EvidenceBriefcaseItem) {
  return (
    item.id.startsWith('control-file-') ||
    item.tags.some((tag) => tag.toLowerCase() === 'upload')
  );
}

export default function EvidenceBriefcasePage() {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [byModule, setByModule] = useState<Record<string, number>>({});
  const [uploads, setUploads] = useState<EvidenceBriefcaseItem[]>([]);
  const [moduleFilter, setModuleFilter] = useState<EvidenceBriefcaseModule | 'all' | 'uploads'>(
    'uploads'
  );
  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Uploaded control evidence appears below. Ask in plain language — for example: "uploaded evidence" or "MFA control closure evidence".',
    },
  ]);
  const [activeResults, setActiveResults] = useState<EvidenceBriefcaseItem[]>([]);

  const loadIndex = useCallback(async (opts?: { resetResults?: boolean }) => {
    setLoading(true);
    try {
      const r = await fetch('/api/evidence/briefcase?fresh=1', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Failed to load');
      const nextUploads: EvidenceBriefcaseItem[] = Array.isArray(d.uploads) ? d.uploads : [];
      setTotal(d.total ?? 0);
      setUploadCount(d.uploadCount ?? 0);
      setByModule(d.byModule ?? {});
      setUploads(nextUploads);
      if (opts?.resetResults !== false) {
        setActiveResults(nextUploads);
        setModuleFilter('uploads');
      }
    } catch {
      /* keep prior state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIndex({ resetResults: true });
  }, [loadIndex]);

  const displayedResults = useMemo(() => {
    if (moduleFilter === 'uploads') {
      if (activeResults.some(isUploadItem)) {
        return activeResults.filter(isUploadItem);
      }
      return uploads;
    }
    if (moduleFilter !== 'all') {
      return activeResults.filter((item) => item.module === moduleFilter);
    }
    return activeResults.length > 0 ? activeResults : uploads;
  }, [activeResults, moduleFilter, uploads]);

  const runSearch = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setSearching(true);
      setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);

      try {
        const res = await fetch('/api/evidence/briefcase/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            module: moduleFilter === 'uploads' ? 'all' : moduleFilter,
          }),
        });
        const data = (await res.json()) as EvidenceBriefcaseSearchResult & { error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Search failed');

        let items = data.items;
        if (moduleFilter === 'uploads') {
          items = items.filter(isUploadItem);
          if (items.length === 0 && /upload|file|evidence/i.test(trimmed)) {
            items = uploads;
          }
        }

        setActiveResults(items);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            results: items,
            keywords: data.keywords,
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: error instanceof Error ? error.message : 'Search failed',
          },
        ]);
      } finally {
        setSearching(false);
        setInput('');
      }
    },
    [moduleFilter, uploads]
  );

  return (
    <AppShell
      title="Evidence Briefcase"
      subtitle="Browse uploaded files and search evidence across controls, risk, TPRM, audits, and policies"
    >
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/70 to-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-brand-100 p-2 text-brand-700">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Unified evidence index</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {loading
                    ? 'Indexing evidence…'
                    : `${uploadCount} uploaded file${uploadCount === 1 ? '' : 's'} · ${total} searchable records across your GRC program.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadIndex({ resetResults: true })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">By area</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li className="flex justify-between gap-2 font-medium text-brand-700">
              <span className="inline-flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" /> Uploaded files
              </span>
              <span>{uploadCount}</span>
            </li>
            {Object.entries(MODULE_LABELS).map(([key, label]) => (
              <li key={key} className="flex justify-between gap-2">
                <span>{label}</span>
                <span className="font-medium">{byModule[key] ?? 0}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <MessageSquare className="h-4 w-4 text-brand-600" />
              Evidence search assistant
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Try &quot;uploaded evidence&quot; to list files from control uploads
            </p>
          </div>

          <div className="flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm',
                  msg.role === 'user'
                    ? 'ml-6 bg-brand-500 text-white'
                    : 'mr-4 bg-slate-50 text-slate-700'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.keywords && msg.keywords.length > 0 && (
                  <p className="mt-2 text-xs opacity-80">Keywords: {msg.keywords.join(', ')}</p>
                )}
              </div>
            ))}
            {searching && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching evidence briefcase…
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => runSearch(s)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runSearch(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='e.g. "uploaded evidence" or "MFA"'
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={searching || !input.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Search className="h-4 w-4 text-brand-600" />
              {moduleFilter === 'uploads' ? 'Uploaded evidence files' : 'Results'}
              <span className="text-xs font-normal text-slate-500">
                ({displayedResults.length})
              </span>
            </h3>
            <select
              value={moduleFilter}
              onChange={(e) =>
                setModuleFilter(e.target.value as EvidenceBriefcaseModule | 'all' | 'uploads')
              }
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="uploads">Uploaded files</option>
              <option value="all">All areas</option>
              {Object.entries(MODULE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {loading && displayedResults.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading uploaded evidence…
            </div>
          ) : displayedResults.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              <p>No uploaded evidence files found yet.</p>
              <p className="mt-2">
                Open a control → Compliance / Remediation / Issues tab → Upload evidence, then click
                Refresh here.
              </p>
              <Link
                href="/controls"
                className="mt-4 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Go to Control Catalog
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {displayedResults.map((item) => (
                <li key={item.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                            MODULE_COLORS[item.module]
                          )}
                        >
                          {MODULE_LABELS[item.module]}
                        </span>
                        {isUploadItem(item) && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-medium uppercase text-brand-800">
                            Upload
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 font-medium text-slate-900">{item.title}</h4>
                    </div>
                    {item.status && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.summary}</p>
                  {(item.controlRef || item.owner || item.recordedAt) && (
                    <p className="mt-2 text-xs text-slate-500">
                      {item.controlRef && <>Control: {item.controlRef}</>}
                      {item.controlRef && item.owner && ' · '}
                      {item.owner && <>Owner: {item.owner}</>}
                      {(item.controlRef || item.owner) && item.recordedAt && ' · '}
                      {item.recordedAt && <>Uploaded: {new Date(item.recordedAt).toLocaleString()}</>}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open record
                    </Link>
                    {item.downloadHref && (
                      <a
                        href={item.downloadHref}
                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
