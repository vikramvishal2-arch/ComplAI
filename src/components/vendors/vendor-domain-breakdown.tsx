'use client';

import type { VendorDomainScore } from '@/lib/vendor/vendor-assessment-types';
import { DOMAIN_LABELS, type VendorRiskDomain } from '@/lib/vendor/vendor-assessment-types';

export function VendorDomainBreakdown({
  domainScores,
  recordScores,
}: {
  domainScores?: VendorDomainScore[];
  recordScores?: Record<string, number>;
}) {
  const items: VendorDomainScore[] =
    domainScores ??
    (Object.entries(recordScores ?? {}).map(([domain, percentage]) => ({
      domain: domain as VendorRiskDomain,
      label: DOMAIN_LABELS[domain as VendorRiskDomain] ?? domain,
      score: percentage,
      maxScore: 100,
      percentage,
      findingsCount: 0,
    })) as VendorDomainScore[]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">Complete an assessment to see domain breakdown.</p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((d) => (
        <div key={d.domain}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-slate-700">{d.label}</span>
            <span className="text-slate-600">{d.percentage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                d.percentage >= 80 ? 'bg-emerald-500' : d.percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${d.percentage}%` }}
            />
          </div>
          {d.findingsCount > 0 && (
            <p className="mt-0.5 text-xs text-slate-400">{d.findingsCount} open finding(s)</p>
          )}
        </div>
      ))}
    </div>
  );
}
