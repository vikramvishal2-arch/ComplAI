'use client';

import { AlertTriangle, CheckCircle2, ExternalLink, Search } from 'lucide-react';
import type { VendorExternalIntel } from '@/lib/vendor/external-intel-types';
import {
  EXTERNAL_INTEL_PROVIDER_IDS,
  EXTERNAL_INTEL_SOURCE_LABEL,
  ensureExternalIntelProviders,
} from '@/lib/vendor/external-intel-types';
import { cn, formatDateTime } from '@/lib/utils';

export function TprmExternalIntelPanel({
  intel,
  className,
}: {
  intel: VendorExternalIntel | null;
  className?: string;
}) {
  const providers = intel
    ? ensureExternalIntelProviders(intel.providers, intel.checkedAt)
    : EXTERNAL_INTEL_PROVIDER_IDS.map((source) => ({
        source,
        status: 'skipped' as const,
        live: false,
        checkedAt: new Date(0).toISOString(),
        message: `${EXTERNAL_INTEL_SOURCE_LABEL[source]} — run Refresh intelligence to query this source.`,
        findingCount: 0,
        configured: false,
      }));

  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">External intelligence (correlated)</h3>
          <p className="mt-1 text-xs text-slate-500">
            Live providers: Shodan, Censys, VirusTotal, NVD + EPSS, HIBP — fetched via API keys,
            validated, stored in PostgreSQL, and indexed in Elasticsearch. NVD and HIBP are required
            pilot sources (set NVD_API_KEY and HIBP_API_KEY). Missing keys are marked unconfigured —
            never faked as clear.
          </p>
        </div>
        {intel?.correlatedScore100 != null && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900">
            Correlated {intel.correlatedScore100}/100
          </div>
        )}
      </div>

      {!intel && (
        <p className="mt-4 text-sm text-slate-500">
          No correlated intelligence yet. Use <strong>Refresh intelligence</strong> to run the
          integration service. Provider cards below show expected sources until the first refresh.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {intel && (
          <>
            <p className="text-sm text-slate-700">{intel.summary}</p>
            <p className="text-xs text-slate-500">
              Checked {formatDateTime(intel.checkedAt)}
              {intel.domain ? ` · ${intel.domain}` : ''}
              {intel.live ? ' · live sources present' : ' · no live sources succeeded'}
            </p>
          </>
        )}

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <div
              key={p.source}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-xs',
                p.status === 'clear' || p.status === 'ok'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : p.status === 'findings'
                    ? 'border-amber-200 bg-amber-50 text-amber-950'
                    : p.status === 'unconfigured' || p.status === 'skipped'
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-red-200 bg-red-50 text-red-900'
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                {p.status === 'clear' || p.status === 'ok' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {EXTERNAL_INTEL_SOURCE_LABEL[p.source] ?? p.source}
              </div>
              <p className="mt-1 opacity-90">{p.message}</p>
              <p className="mt-1 opacity-70">
                {p.status === 'skipped' && !p.configured
                  ? 'Awaiting refresh'
                  : p.configured
                    ? p.live
                      ? 'Live'
                      : 'Configured'
                    : 'API key missing'}{' '}
                · {p.status}
              </p>
            </div>
          ))}
        </div>

        {intel && intel.cves.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Correlated CVEs (NVD + EPSS)
            </h4>
            <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {intel.cves.map((c) => (
                <li key={c.cve} className="px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                    <span>{c.cve}</span>
                    {c.cvss != null && (
                      <span className="text-xs text-slate-500">CVSS {c.cvss}</span>
                    )}
                    {c.epss != null && (
                      <span className="text-xs text-slate-500">
                        EPSS {(c.epss * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{c.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {intel && intel.findings.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Search className="h-3.5 w-3.5" />
              Findings ({intel.findings.length})
            </h4>
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {intel.findings.slice(0, 40).map((f) => (
                <li
                  key={f.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{f.title}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{f.detail}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                        {EXTERNAL_INTEL_SOURCE_LABEL[f.source] ?? f.source} · {f.severity} · {f.type}
                      </p>
                    </div>
                    {f.evidenceUrl && (
                      <a
                        href={f.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        Evidence <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
