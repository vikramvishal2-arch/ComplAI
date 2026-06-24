'use client';

import Link from 'next/link';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import type { Risk } from '@/lib/types';
import { RISK_STATUS_LABELS } from '@/lib/types';
import { formatRiskScoreDisplay, getPresentRiskScore } from '@/lib/risk/scoring';
import { isOpenRiskStatus } from '@/lib/risk/status';
import { cn } from '@/lib/utils';

interface ControlLinkedRisksPanelProps {
  controlId: string;
  risks: Risk[];
  compact?: boolean;
}

export function ControlLinkedRisksPanel({
  controlId,
  risks,
  compact = false,
}: ControlLinkedRisksPanelProps) {
  const openRisks = risks.filter((r) => isOpenRiskStatus(r.status));

  if (risks.length === 0) {
    return (
      <section
        className={cn(
          'rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5',
          compact && 'p-4'
        )}
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          No risks from the risk register are linked to this control.
        </div>
        <Link
          href="/risk-register"
          className="mt-2 inline-block text-xs font-medium text-brand-600 hover:underline"
        >
          Add risk in register →
        </Link>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'rounded-xl border border-purple-200 bg-purple-50/30 p-5 shadow-sm',
        openRisks.length > 0 && 'border-purple-300 bg-purple-50/60',
        compact && 'p-4'
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 inline-flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-purple-600" />
            Linked risks (risk register)
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {openRisks.length > 0
              ? `${openRisks.length} open risk${openRisks.length === 1 ? '' : 's'} linked to this control`
              : `${risks.length} risk${risks.length === 1 ? '' : 's'} linked — all closed or accepted`}
          </p>
        </div>
        <Link
          href="/risk-register"
          className="text-xs font-medium text-brand-600 hover:underline shrink-0"
        >
          Risk register →
        </Link>
      </div>

      <ul className="space-y-2">
        {risks.map((risk) => {
          const presentScore = getPresentRiskScore(risk);
          const inherentLabel = formatRiskScoreDisplay(risk.riskScore);
          const presentLabel =
            presentScore != null ? formatRiskScoreDisplay(presentScore) : '—';
          const isOpen = isOpenRiskStatus(risk.status);

          return (
            <li key={risk.id}>
              <Link
                href={`/risk-register/risks/${risk.id}`}
                className={cn(
                  'block rounded-lg border bg-white px-4 py-3 transition hover:border-brand-300 hover:shadow-sm',
                  isOpen ? 'border-purple-200' : 'border-slate-200 opacity-90'
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{risk.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 capitalize">
                      {RISK_STATUS_LABELS[risk.status as keyof typeof RISK_STATUS_LABELS] ??
                        risk.status}
                      {isOpen && (
                        <span className="ml-2 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
                          Open
                        </span>
                      )}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <span className="text-slate-600">
                    Inherent:{' '}
                    <span className="font-medium text-slate-800">{inherentLabel}</span>
                  </span>
                  <span className="text-slate-600">
                    Present:{' '}
                    <span className="font-medium text-slate-800">{presentLabel}</span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
