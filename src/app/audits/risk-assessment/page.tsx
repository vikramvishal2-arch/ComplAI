'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AuditSubNav } from '@/components/audits/audit-sub-nav';
import { AUDIT_RISK_ASSESSMENTS, RISK_LEVEL_STYLES } from '@/lib/data/audits-demo';
import { cn } from '@/lib/utils';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export default function AuditRiskAssessmentPage() {
  const router = useRouter();

  return (
    <AppShell
      title="Risk assessment"
      subtitle="Audit-focused risk view — inherent vs residual risk, controls tested, and gaps"
    >
      <AuditSubNav />

      <p className="mb-4 text-sm text-slate-500">Click a row to open the full assessment detail.</p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Area</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Inherent</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Residual</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Controls tested</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Gaps</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Owner</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Last reviewed</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-700">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {AUDIT_RISK_ASSESSMENTS.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer hover:bg-brand-50/60"
                onClick={() => router.push(`/audits/risk-assessment/${row.id}`)}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/audits/risk-assessment/${row.id}`}
                    className="font-medium text-slate-900 hover:text-brand-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {row.area}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <RiskBadge level={row.inherentRisk} />
                </td>
                <td className="px-4 py-3">
                  <RiskBadge level={row.residualRisk} />
                </td>
                <td className="px-4 py-3 text-slate-600">{row.controlsTested}</td>
                <td className="px-4 py-3">
                  {row.gapsIdentified > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {row.gapsIdentified}
                    </span>
                  ) : (
                    <span className="text-green-600">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.owner}</td>
                <td className="px-4 py-3 text-slate-600">{row.lastReviewed}</td>
                <td className="px-4 py-3 text-right text-slate-400">
                  <ChevronRight className="ml-auto h-4 w-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function RiskBadge({ level }: { level: keyof typeof RISK_LEVEL_STYLES }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        RISK_LEVEL_STYLES[level]
      )}
    >
      {level}
    </span>
  );
}
