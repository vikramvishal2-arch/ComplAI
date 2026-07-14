'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { TprmAppShell } from '@/components/tprm/tprm-app-shell';
import { TprmPageHeader } from '@/components/tprm/tprm-sub-nav';
import { TprmRatingBadge } from '@/components/tprm/tprm-rating-badge';
import { VendorDomainBreakdown } from '@/components/vendors/vendor-domain-breakdown';
import { VendorScoreBasisPanel } from '@/components/vendors/vendor-score-basis-panel';
import { buildVendorPosture } from '@/lib/vendor/vendor-posture';
import {
  buildCompareSide,
  recommendVendorForLeadership,
  type VendorCompareSide,
} from '@/lib/vendor/vendor-compare';
import { parseFindings, parseRemediationItems } from '@/lib/vendor/vendor-assessment-types';
import { cn, formatDateTime } from '@/lib/utils';
import {
  ArrowLeftRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Scale,
  ShieldAlert,
} from 'lucide-react';

type VendorListItem = {
  id: string;
  name: string;
  primaryDomain: string;
  tier: string;
  assessments: Array<{ status: string }>;
};

type VendorDetailPayload = {
  vendor: {
    id: string;
    name: string;
    primaryDomain: string;
    tier: string;
    dataAccess: string;
    industry: string;
    status: string;
    inherentRiskScore: number;
    lastAssessedAt: string | null;
    securityRating: number | null;
    aiRiskScore: number | null;
    ratingGrade?: string;
    domainScores?: unknown;
    aiRiskSummary?: string;
    certifications?: unknown;
    assessments: Array<{ status: string }>;
  };
  latestCompleted: {
    completedAt: string | null;
    templateName: string;
    aiSummary: string;
    findings: unknown;
    remediationItems: unknown;
  } | null;
  openFindingsCount: number;
  openRemediationCount: number;
};

function tierTone(tier: string): string {
  if (tier === 'critical') return 'bg-red-100 text-red-800';
  if (tier === 'high') return 'bg-orange-100 text-orange-800';
  if (tier === 'medium') return 'bg-amber-100 text-amber-800';
  return 'bg-emerald-100 text-emerald-800';
}

function DeltaCell({
  a,
  b,
  higherIsBetter = true,
  format = (n: number) => String(n),
}: {
  a: number | null;
  b: number | null;
  higherIsBetter?: boolean;
  format?: (n: number) => string;
}) {
  if (a == null || b == null) {
    return <span className="text-slate-400">—</span>;
  }
  const delta = a - b;
  if (delta === 0) return <span className="text-slate-500">Even</span>;
  const aWins = higherIsBetter ? delta > 0 : delta < 0;
  return (
    <span className={cn('font-medium', aWins ? 'text-emerald-700' : 'text-amber-700')}>
      {delta > 0 ? '+' : ''}
      {format(delta)} {aWins ? '→ A' : '→ B'}
    </span>
  );
}

function VendorColumn({
  side,
  label,
  preferred,
}: {
  side: VendorCompareSide;
  label: 'A' | 'B';
  preferred: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-5 shadow-sm',
        preferred ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Vendor {label}
            {preferred && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">
                Preferred posture
              </span>
            )}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{side.name}</h3>
          <p className="text-sm text-slate-500">{side.primaryDomain || 'No domain'}</p>
        </div>
        <TprmRatingBadge score100={side.posture.score100} score950={side.posture.score950} size="lg" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className={cn('rounded-full px-2.5 py-1 font-medium capitalize', tierTone(side.tier))}>
          {side.tier} tier
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium capitalize text-slate-700">
          {side.dataAccess} data
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
          Grade {side.posture.grade || '—'}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Score (0–950)</dt>
          <dd className="font-semibold tabular-nums text-slate-900">
            {side.posture.score950 ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Inherent risk</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{side.inherentRiskScore}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Open findings</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{side.openFindingsCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Open remediation</dt>
          <dd className="font-semibold tabular-nums text-slate-900">{side.openRemediationCount}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Domain posture
        </p>
        <VendorDomainBreakdown domainScores={side.posture.domainScores} />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          External surface
        </p>
        <div className="flex gap-3 text-xs">
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800">
            Pass {side.posture.externalSurface.pass}
          </span>
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-800">
            Warn {side.posture.externalSurface.warn}
          </span>
          <span className="rounded-lg bg-red-50 px-2 py-1 text-red-800">
            Fail {side.posture.externalSurface.fail}
          </span>
        </div>
        {side.posture.externalSurface.topRisks.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {side.posture.externalSurface.topRisks.map((r) => (
              <li key={r.label} className="flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3 text-amber-600" />
                {r.label} ({r.status})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Certifications
        </p>
        {side.posture.certifications.length === 0 ? (
          <p className="text-sm text-slate-500">None recorded</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-700">
            {side.posture.certifications.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span>{c.name}</span>
                <span className="text-[10px] font-semibold uppercase text-slate-500">{c.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {side.assessmentSummary && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Assessment summary
          </p>
          <p className="text-sm leading-relaxed text-slate-600 line-clamp-4">{side.assessmentSummary}</p>
        </div>
      )}

      <Link
        href={`/vendors/${side.id}?tab=profile`}
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        Open full profile <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function VendorCompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [vendorAId, setVendorAId] = useState(searchParams.get('a') ?? '');
  const [vendorBId, setVendorBId] = useState(searchParams.get('b') ?? '');
  const [sideA, setSideA] = useState<VendorCompareSide | null>(null);
  const [sideB, setSideB] = useState<VendorCompareSide | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedVendors = useMemo(
    () =>
      vendors.filter((v) => v.assessments.some((a) => a.status === 'completed')),
    [vendors]
  );

  useEffect(() => {
    setLoadingList(true);
    fetch('/api/vendors')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load vendors');
        setVendors(d.vendors ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    const a = searchParams.get('a') ?? '';
    const b = searchParams.get('b') ?? '';
    if (a) setVendorAId(a);
    if (b) setVendorBId(b);
  }, [searchParams]);

  const loadSide = async (id: string): Promise<VendorCompareSide> => {
    const r = await fetch(`/api/vendors/${id}`);
    const d = (await r.json()) as VendorDetailPayload & { error?: string };
    if (!r.ok) throw new Error(d.error ?? 'Failed to load vendor');
    if (!d.latestCompleted) {
      throw new Error(`${d.vendor.name} does not have a completed risk assessment yet`);
    }

    const findings = parseFindings(d.latestCompleted.findings);
    const remediation = parseRemediationItems(d.latestCompleted.remediationItems);
    const posture = buildVendorPosture(d.vendor, { questionnaireCompleted: true });

    return buildCompareSide({
      vendor: {
        id: d.vendor.id,
        name: d.vendor.name,
        primaryDomain: d.vendor.primaryDomain ?? '',
        tier: d.vendor.tier ?? 'medium',
        dataAccess: d.vendor.dataAccess ?? 'none',
        industry: d.vendor.industry ?? '',
        status: d.vendor.status ?? 'active',
        inherentRiskScore: d.vendor.inherentRiskScore ?? 50,
        lastAssessedAt: d.vendor.lastAssessedAt,
      },
      posture,
      openFindingsCount: d.openFindingsCount,
      openRemediationCount:
        d.openRemediationCount ??
        remediation.filter((x) => x.status !== 'completed' && x.status !== 'waived').length,
      latestCompleted: d.latestCompleted,
      findings,
    });
  };

  const runCompare = async (aId = vendorAId, bId = vendorBId) => {
    if (!aId || !bId) {
      setError('Select two vendors with completed assessments');
      return;
    }
    if (aId === bId) {
      setError('Choose two different vendors');
      return;
    }

    setLoadingCompare(true);
    setError(null);
    try {
      const [a, b] = await Promise.all([loadSide(aId), loadSide(bId)]);
      setSideA(a);
      setSideB(b);
      router.replace(`/vendors/compare?a=${aId}&b=${bId}`);
    } catch (e) {
      setSideA(null);
      setSideB(null);
      setError(e instanceof Error ? e.message : 'Compare failed');
    } finally {
      setLoadingCompare(false);
    }
  };

  useEffect(() => {
    const a = searchParams.get('a');
    const b = searchParams.get('b');
    if (a && b && a !== b) {
      void runCompare(a, b);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial deep-link only
  }, []);

  const recommendation =
    sideA && sideB ? recommendVendorForLeadership(sideA, sideB) : null;

  const swap = () => {
    setVendorAId(vendorBId);
    setVendorBId(vendorAId);
    setSideA(sideB);
    setSideB(sideA);
  };

  return (
    <TprmAppShell title="TPRM" subtitle="Third-party risk management platform">
      <TprmPageHeader
        title="Vendor comparison"
        description="Compare two vendors after risk assessment completion so leadership can decide from their risk portfolios."
      />

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto]">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Vendor A</label>
            <select
              value={vendorAId}
              onChange={(e) => setVendorAId(e.target.value)}
              disabled={loadingList}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">Select completed assessment…</option>
              {completedVendors.map((v) => (
                <option key={v.id} value={v.id} disabled={v.id === vendorBId}>
                  {v.name}
                  {v.primaryDomain ? ` · ${v.primaryDomain}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-center pb-1">
            <button
              type="button"
              onClick={swap}
              disabled={!vendorAId || !vendorBId}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              title="Swap vendors"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Vendor B</label>
            <select
              value={vendorBId}
              onChange={(e) => setVendorBId(e.target.value)}
              disabled={loadingList}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">Select completed assessment…</option>
              {completedVendors.map((v) => (
                <option key={v.id} value={v.id} disabled={v.id === vendorAId}>
                  {v.name}
                  {v.primaryDomain ? ` · ${v.primaryDomain}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => runCompare()}
              disabled={loadingCompare || !vendorAId || !vendorBId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loadingCompare ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scale className="h-4 w-4" />
              )}
              Compare
            </button>
          </div>
        </div>

        {!loadingList && completedVendors.length < 2 && (
          <p className="mt-3 text-sm text-amber-800">
            At least two vendors with <strong>completed</strong> risk assessments are required.
            Finish questionnaires and score them from each vendor profile first.
          </p>
        )}
      </section>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {recommendation && sideA && sideB && (
        <section
          className={cn(
            'mb-6 rounded-2xl border p-5 shadow-sm',
            recommendation.confidence === 'clear'
              ? 'border-emerald-200 bg-emerald-50/60'
              : recommendation.confidence === 'narrow'
                ? 'border-amber-200 bg-amber-50/60'
                : 'border-slate-200 bg-slate-50'
          )}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0',
                recommendation.confidence === 'tie' ? 'text-slate-500' : 'text-emerald-700'
              )}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Leadership recommendation
              </p>
              <h3 className="mt-1 text-base font-bold text-slate-900">{recommendation.headline}</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {recommendation.rationale.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {sideA && sideB && (
        <>
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <VendorColumn
              side={sideA}
              label="A"
              preferred={recommendation?.preferredVendorId === sideA.id}
            />
            <VendorColumn
              side={sideB}
              label="B"
              preferred={recommendation?.preferredVendorId === sideB.id}
            />
          </div>

          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Portfolio delta</h3>
              <p className="text-xs text-slate-500">
                Side-by-side metrics for residual risk decisioning
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Metric</th>
                    <th className="px-5 py-3">{sideA.name}</th>
                    <th className="px-5 py-3">{sideB.name}</th>
                    <th className="px-5 py-3">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-5 py-3 font-medium text-slate-700">Security rating</td>
                    <td className="px-5 py-3 tabular-nums">{sideA.posture.score950 ?? '—'}</td>
                    <td className="px-5 py-3 tabular-nums">{sideB.posture.score950 ?? '—'}</td>
                    <td className="px-5 py-3">
                      <DeltaCell a={sideA.posture.score950} b={sideB.posture.score950} />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-slate-700">Open findings</td>
                    <td className="px-5 py-3 tabular-nums">{sideA.openFindingsCount}</td>
                    <td className="px-5 py-3 tabular-nums">{sideB.openFindingsCount}</td>
                    <td className="px-5 py-3">
                      <DeltaCell
                        a={sideA.openFindingsCount}
                        b={sideB.openFindingsCount}
                        higherIsBetter={false}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-slate-700">Critical findings</td>
                    <td className="px-5 py-3 tabular-nums">
                      {sideA.findingsBySeverity.critical}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {sideB.findingsBySeverity.critical}
                    </td>
                    <td className="px-5 py-3">
                      <DeltaCell
                        a={sideA.findingsBySeverity.critical}
                        b={sideB.findingsBySeverity.critical}
                        higherIsBetter={false}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-slate-700">External fails</td>
                    <td className="px-5 py-3 tabular-nums">{sideA.posture.externalSurface.fail}</td>
                    <td className="px-5 py-3 tabular-nums">{sideB.posture.externalSurface.fail}</td>
                    <td className="px-5 py-3">
                      <DeltaCell
                        a={sideA.posture.externalSurface.fail}
                        b={sideB.posture.externalSurface.fail}
                        higherIsBetter={false}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-slate-700">Verified certs</td>
                    <td className="px-5 py-3 tabular-nums">
                      {sideA.posture.certifications.filter((c) => c.status === 'verified').length}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {sideB.posture.certifications.filter((c) => c.status === 'verified').length}
                    </td>
                    <td className="px-5 py-3">
                      <DeltaCell
                        a={sideA.posture.certifications.filter((c) => c.status === 'verified').length}
                        b={sideB.posture.certifications.filter((c) => c.status === 'verified').length}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium text-slate-700">Last assessed</td>
                    <td className="px-5 py-3 text-slate-600">
                      {sideA.assessmentCompletedAt
                        ? formatDateTime(sideA.assessmentCompletedAt)
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {sideB.assessmentCompletedAt
                        ? formatDateTime(sideB.assessmentCompletedAt)
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <VendorScoreBasisPanel
              components={sideA.posture.scoreComponents}
              band={sideA.posture.band}
              certificationMetSecurityBaseline={sideA.posture.certificationMetSecurityBaseline}
            />
            <VendorScoreBasisPanel
              components={sideB.posture.scoreComponents}
              band={sideB.posture.band}
              certificationMetSecurityBaseline={sideB.posture.certificationMetSecurityBaseline}
            />
          </div>
        </>
      )}
    </TprmAppShell>
  );
}

export default function VendorComparePage() {
  return (
    <Suspense
      fallback={
        <TprmAppShell title="TPRM" subtitle="Third-party risk management platform">
          <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading comparison…
          </div>
        </TprmAppShell>
      }
    >
      <VendorCompareContent />
    </Suspense>
  );
}
