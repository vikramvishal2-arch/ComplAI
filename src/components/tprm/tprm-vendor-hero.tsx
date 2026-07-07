'use client';

import { Globe, Mail, ExternalLink, Shield } from 'lucide-react';
import { TprmRatingBadge } from '@/components/tprm/tprm-rating-badge';
import { toUpguardRating, getRatingBand, RATING_BAND_CONFIG } from '@/lib/vendor/tprm-rating';
import { cn } from '@/lib/utils';

export function TprmVendorHero({
  name,
  primaryDomain,
  website,
  contactEmail,
  tier,
  status,
  score100,
  lastAssessedAt,
}: {
  name: string;
  primaryDomain: string;
  website: string;
  contactEmail: string;
  tier: string;
  status: string;
  score100: number | null;
  lastAssessedAt: string | null;
}) {
  const score950 = toUpguardRating(score100);
  const band = getRatingBand(score950);
  const bandConfig = RATING_BAND_CONFIG[band];
  const monitored = status === 'active' || status === 'monitoring';

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-6 p-6 lg:p-8">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {monitored && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                <Shield className="h-3 w-3" /> Monitored
              </span>
            )}
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium capitalize">{tier} tier</span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold uppercase', bandConfig.bg)}>
              {bandConfig.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{name}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300">
            {primaryDomain && (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-slate-400" />
                {primaryDomain}
              </span>
            )}
            {contactEmail && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                {contactEmail}
              </span>
            )}
            {website && (
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-300 hover:text-brand-200"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {lastAssessedAt
              ? `Last assessed ${new Date(lastAssessedAt).toLocaleDateString()}`
              : 'No assessment completed — send a questionnaire to establish rating'}
          </p>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-white/5 p-4 backdrop-blur">
          <TprmRatingBadge score950={score950} size="hero" />
          <p className="mt-2 text-center text-xs text-slate-400">Security rating</p>
        </div>
      </div>
    </div>
  );
}

export function TprmVendorDetailTabs({
  active,
  onChange,
  findingCount,
}: {
  active: string;
  onChange: (tab: string) => void;
  findingCount: number;
}) {
  const tabs = [
    { id: 'profile', label: 'Security profile' },
    { id: 'questionnaires', label: 'Questionnaires' },
    { id: 'findings', label: 'Risks & findings' },
    { id: 'remediation', label: 'Remediation' },
    { id: 'details', label: 'Vendor details' },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            active === t.id
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          {t.label}
          {t.id === 'findings' && findingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-700">{findingCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}
