'use client';

import { ExternalLink, Globe } from 'lucide-react';
import type { VendorCertification } from '@/lib/vendor/vendor-assessment-types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<
  VendorCertification['status'],
  { label: string; className: string }
> = {
  verified: { label: 'Internet verified', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  claimed: { label: 'Claimed', className: 'bg-sky-100 text-sky-800 border-sky-200' },
  in_progress: { label: 'In progress', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  expired: { label: 'Expired', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export function VendorCertificationsPanel({
  certifications,
  verifiedOverInternet = false,
  className,
}: {
  certifications: VendorCertification[];
  verifiedOverInternet?: boolean;
  className?: string;
}) {
  if (certifications.length === 0) {
    return null;
  }

  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white p-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Certifications & attestations</h3>
          {verifiedOverInternet && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-sky-700">
              <Globe className="h-3.5 w-3.5" />
              Checked against public trust centers and corporate disclosures on the internet
            </p>
          )}
        </div>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {certifications.map((cert) => {
          const status = STATUS_STYLES[cert.status];
          return (
            <li
              key={cert.id}
              className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{cert.name}</p>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    status.className
                  )}
                >
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-brand-700">{cert.framework}</p>
              {cert.scope && <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{cert.scope}</p>}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                {cert.verifiedAt && <span>Verified {cert.verifiedAt}</span>}
                {cert.expiresAt && <span>Expires {cert.expiresAt}</span>}
                {cert.sourceName && <span>Source: {cert.sourceName}</span>}
              </div>
              {cert.sourceUrl && (
                <a
                  href={cert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                  View public source
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
