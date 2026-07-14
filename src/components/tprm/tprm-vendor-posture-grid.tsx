'use client';

import Link from 'next/link';
import { ArrowRight, Globe, Radar, Shield } from 'lucide-react';
import { TprmRatingBadge, TprmRatingPill } from '@/components/tprm/tprm-rating-badge';
import { VendorDomainBreakdown } from '@/components/vendors/vendor-domain-breakdown';
import { buildVendorPosture, type VendorPostureInput } from '@/lib/vendor/vendor-posture';
import { cn } from '@/lib/utils';

function PostureCard({ vendor }: { vendor: VendorPostureInput }) {
  const posture = buildVendorPosture(vendor);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/vendors/${posture.vendorId}?tab=profile`}
            className="text-base font-semibold text-slate-900 hover:text-brand-600"
          >
            {posture.name}
          </Link>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
            <Globe className="h-3 w-3" />
            {posture.primaryDomain || 'No domain'}
          </p>
          <span
            className={cn(
              'mt-2 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              posture.tier === 'critical'
                ? 'bg-red-100 text-red-800'
                : posture.tier === 'high'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-slate-100 text-slate-700'
            )}
          >
            {posture.tier} tier
          </span>
        </div>
        <TprmRatingBadge score100={posture.score100} size="sm" showBand={false} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TprmRatingPill score100={posture.score100} />
        {posture.fromPublicIntelligence && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-800">
            <Radar className="h-3 w-3" />
            Public intelligence
          </span>
        )}
      </div>

      {posture.summary && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{posture.summary}</p>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Security posture by domain
        </p>
        <VendorDomainBreakdown
          domainScores={posture.domainScores}
          recordScores={
            posture.domainScores.length === 0
              ? undefined
              : Object.fromEntries(posture.domainScores.map((d) => [d.domain, d.percentage]))
          }
        />
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
        <p className="text-xs font-semibold text-slate-700">External attack surface</p>
        <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-medium">
          <span className="text-emerald-700">{posture.externalSurface.pass} pass</span>
          <span className="text-amber-700">{posture.externalSurface.warn} watch</span>
          <span className="text-red-700">{posture.externalSurface.fail} fail</span>
        </div>
        {posture.externalSurface.topRisks.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {posture.externalSurface.topRisks.map((risk) => (
              <li key={risk.label} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full',
                    risk.status === 'fail' ? 'bg-red-500' : 'bg-amber-500'
                  )}
                />
                {risk.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {posture.certifications.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            Internet-listed certifications
          </p>
          <div className="flex flex-wrap gap-1.5">
            {posture.certifications.slice(0, 4).map((cert) => (
              <span
                key={cert.id}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800"
                title={cert.scope}
              >
                {cert.framework}
                {cert.status === 'verified' ? ' ✓' : ''}
              </span>
            ))}
            {posture.certifications.length > 4 && (
              <span className="text-[10px] text-slate-500">+{posture.certifications.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      <Link
        href={`/vendors/${posture.vendorId}?tab=profile`}
        className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-brand-600 hover:underline"
      >
        Full security profile
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

export function TprmVendorPostureGrid({ vendors }: { vendors: VendorPostureInput[] }) {
  if (vendors.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Vendor security posture</h2>
        <p className="mt-1 text-xs text-slate-500">
          Ratings, domain scores, illustrative attack-surface signals, and certifications. Breach
          history is live HIBP when checked; other attack-surface vectors are demo/illustrative.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        {vendors.map((vendor) => (
          <PostureCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </section>
  );
}
