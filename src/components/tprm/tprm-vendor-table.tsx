'use client';

import { useRouter } from 'next/navigation';
import { Globe, TrendingDown, TrendingUp, Minus, MoreHorizontal } from 'lucide-react';
import { TprmRatingBadge, TprmRatingPill } from '@/components/tprm/tprm-rating-badge';
import { cn } from '@/lib/utils';

export interface TprmVendorRow {
  id: string;
  name: string;
  primaryDomain: string;
  tier: string;
  status: string;
  securityRating: number | null;
  aiRiskScore: number | null;
  effectiveScore100?: number | null;
  lastAssessedAt: string | null;
  assessments: Array<{ status: string; aiScore: number | null }>;
}

function questionnaireStatus(vendor: TprmVendorRow): { label: string; color: string } {
  const inProgress = vendor.assessments.some((a) => a.status === 'in_progress');
  const completed = vendor.assessments.some((a) => a.status === 'completed');
  if (inProgress) return { label: 'In progress', color: 'bg-blue-100 text-blue-800' };
  if (completed) return { label: 'Completed', color: 'bg-emerald-100 text-emerald-800' };
  return { label: 'Not sent', color: 'bg-slate-100 text-slate-600' };
}

function trendIcon(vendor: TprmVendorRow) {
  const scores = vendor.assessments
    .filter((a) => a.aiScore != null)
    .map((a) => a.aiScore!)
    .reverse()
    .slice(-2);
  if (scores.length < 2) return <Minus className="h-4 w-4 text-slate-300" />;
  const diff = scores[1] - scores[0];
  if (diff > 3) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (diff < -3) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

export function TprmVendorTable({
  vendors,
  onDelete,
}: {
  vendors: TprmVendorRow[];
  onDelete: (id: string) => void;
}) {
  const router = useRouter();

  if (vendors.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
        <p className="text-sm font-medium text-slate-700">No vendors in your portfolio</p>
        <p className="mt-1 text-xs text-slate-500">Add third parties to monitor security ratings and run questionnaires</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3.5">Security rating</th>
            <th className="px-5 py-3.5">Vendor</th>
            <th className="px-5 py-3.5">Primary domain</th>
            <th className="px-5 py-3.5">Tier</th>
            <th className="px-5 py-3.5">Trend</th>
            <th className="px-5 py-3.5">Questionnaire</th>
            <th className="px-5 py-3.5">Last assessed</th>
            <th className="px-5 py-3.5 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vendors.map((v) => {
            const score = v.effectiveScore100 ?? v.securityRating ?? v.aiRiskScore;
            const qStatus = questionnaireStatus(v);
            const monitored = v.status === 'active' || v.status === 'monitoring';

            return (
              <tr
                key={v.id}
                onClick={() => router.push(`/vendors/${v.id}`)}
                className="cursor-pointer transition-colors hover:bg-brand-50/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <TprmRatingBadge score100={score} size="sm" showBand={false} />
                    <TprmRatingPill score100={score} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{v.name}</p>
                  {monitored && (
                    <span className="mt-0.5 inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                      Monitored
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    {v.primaryDomain || '—'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium capitalize',
                      v.tier === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : v.tier === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {v.tier}
                  </span>
                </td>
                <td className="px-5 py-4">{trendIcon(v)}</td>
                <td className="px-5 py-4">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', qStatus.color)}>
                    {qStatus.label}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {v.lastAssessedAt ? new Date(v.lastAssessedAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Remove vendor from portfolio?')) onDelete(v.id);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
