'use client';

import { Shield, AlertTriangle, ClipboardList, Users, TrendingUp } from 'lucide-react';
import { TprmRatingBadge, TprmRatingDistribution } from '@/components/tprm/tprm-rating-badge';
import type { PortfolioStats } from '@/lib/vendor/tprm-rating';

export function TprmPortfolioStats({ stats }: { stats: PortfolioStats }) {
  const cards = [
    {
      label: 'Portfolio rating',
      value: stats.averageRating950?.toString() ?? '—',
      sub: 'Average security score',
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: 'Monitored vendors',
      value: stats.monitoredCount.toString(),
      sub: `${stats.vendorCount} total in register`,
      icon: Users,
    },
    {
      label: 'Critical findings',
      value: stats.criticalFindings.toString(),
      sub: 'Require attention',
      icon: AlertTriangle,
      alert: stats.criticalFindings > 0,
    },
    {
      label: 'Open questionnaires',
      value: stats.pendingQuestionnaires.toString(),
      sub: 'In progress or draft',
      icon: ClipboardList,
    },
    {
      label: 'Open remediation',
      value: stats.openRemediations.toString(),
      sub: 'Pending vendor action',
      icon: Shield,
    },
  ];

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-12">
      <div className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white lg:col-span-4">
        <TprmRatingBadge score950={stats.averageRating950} size="hero" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Portfolio security rating</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {stats.averageRating950 ?? 'Not rated'}
            {stats.averageRating950 != null && <span className="text-lg text-slate-400"> / 950</span>}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Continuous third-party risk posture across your vendor ecosystem
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
        {cards.slice(1).map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-4 ${c.alert ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{c.label}</p>
                <p className={`mt-1 text-2xl font-bold tabular-nums ${c.alert ? 'text-red-700' : 'text-slate-900'}`}>
                  {c.value}
                </p>
                <p className="text-xs text-slate-400">{c.sub}</p>
              </div>
              <c.icon className={`h-5 w-5 ${c.alert ? 'text-red-400' : 'text-slate-300'}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
        <p className="mb-3 text-sm font-semibold text-slate-900">Rating distribution</p>
        <TprmRatingDistribution distribution={stats.distribution} />
      </div>
    </div>
  );
}
