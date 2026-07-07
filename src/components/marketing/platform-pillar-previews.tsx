'use client';

import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LifeBuoy,
  Settings2,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { MarketingPreviewChrome } from '@/components/marketing/marketing-preview-chrome';
import { cn } from '@/lib/utils';

const ragDot = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
} as const;

/** Continuous control monitoring — live RAG status and gap alerts */
export function ControlMonitoringPillarPreview() {
  const controls = [
    { name: 'A.5.15 — Access control', status: 'green' as const, checked: '2m ago' },
    { name: 'A.8.2 — Privileged access', status: 'amber' as const, checked: '14m ago' },
    { name: 'CC6.1 — Logical access', status: 'green' as const, checked: '5m ago' },
    { name: 'A.8.16 — Monitoring activities', status: 'red' as const, checked: '1m ago' },
    { name: 'A.5.18 — Access rights', status: 'green' as const, checked: '8m ago' },
  ];

  return (
    <MarketingPreviewChrome label="ComplAI · Control monitoring">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-100 p-2">
            <Activity className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Continuous monitoring
            </p>
            <p className="text-sm font-bold text-slate-900">196 controls tracked</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Green', value: 142, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Amber', value: 38, tone: 'text-amber-800 bg-amber-50 border-amber-100' },
          { label: 'Red', value: 16, tone: 'text-red-700 bg-red-50 border-red-100' },
        ].map((stat) => (
          <div key={stat.label} className={cn('rounded-lg border px-2 py-2', stat.tone)}>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] uppercase opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
        <span className="font-semibold">Gap detected</span> — A.8.16 monitoring evidence stale. Remediation
        guide attached.
      </div>

      <ul className="mt-4 space-y-2">
        {controls.map((ctrl) => (
          <li
            key={ctrl.name}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', ragDot[ctrl.status])} />
              <span className="truncate text-xs font-medium text-slate-800">{ctrl.name}</span>
            </div>
            <span className="shrink-0 text-[10px] text-slate-500">{ctrl.checked}</span>
          </li>
        ))}
      </ul>
    </MarketingPreviewChrome>
  );
}

/** Configurability — approval matrix and custom mappings */
export function ConfigurabilityPillarPreview() {
  const stages = ['Prepare', 'Review', 'Approve'];
  const rows = [
    { doc: 'Access Control Policy', roles: ['Security', 'CISO', 'CEO'] },
    { doc: 'Incident Response Procedure', roles: ['SOC Lead', 'CISO', 'COO'] },
    { doc: 'Vendor Risk Assessment', roles: ['GRC Analyst', 'Legal', 'CRO'] },
  ];

  return (
    <MarketingPreviewChrome label="ComplAI · Workflows & configuration">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-violet-100 p-2">
          <SlidersHorizontal className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Approval matrix
          </p>
          <p className="text-sm font-bold text-slate-900">Configurable per document type</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {stages.map((stage, i) => (
          <div key={stage} className="flex flex-1 flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                i === 0 && 'bg-brand-500 text-white',
                i === 1 && 'bg-brand-100 text-brand-700 ring-2 ring-brand-300',
                i === 2 && 'bg-slate-100 text-slate-600'
              )}
            >
              {i + 1}
            </div>
            <p className="mt-1 text-[10px] font-medium text-slate-600">{stage}</p>
            {i < stages.length - 1 && (
              <div className="absolute hidden" aria-hidden />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Document</th>
              {stages.map((s) => (
                <th key={s} className="px-2 py-2 font-semibold">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.doc} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium text-slate-800">{row.doc}</td>
                {row.roles.map((role) => (
                  <td key={role} className="px-2 py-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-700">
                      <Users className="h-3 w-3" />
                      {role}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Settings2 className="h-3.5 w-3.5 text-brand-600" />
          Custom ISO ↔ SOC 2 control mapping
        </div>
        <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          On
        </span>
      </div>
    </MarketingPreviewChrome>
  );
}

/** Ready-to-use library — policies, frameworks, templates */
export function LibraryPillarPreview() {
  const templates = [
    { title: 'Information Security Policy', tag: 'ISO A.5', type: 'Policy' },
    { title: 'Access Control Procedure', tag: 'ISO A.5.15', type: 'Procedure' },
    { title: 'Incident Response Plan', tag: 'SOC 2 CC7', type: 'Policy' },
    { title: 'Vendor Risk Questionnaire', tag: 'ISO A.5.19', type: 'Template' },
  ];

  return (
    <MarketingPreviewChrome label="ComplAI · ISMS library">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-sky-100 p-2">
            <FileText className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Ready-to-use library
            </p>
            <p className="text-sm font-bold text-slate-900">142 auditor-approved templates</p>
          </div>
        </div>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
          Annex A
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {templates.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100/80">
              <ClipboardCheck className="h-4 w-4 text-sky-600" />
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-slate-900">
              {item.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                {item.type}
              </span>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-700">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Pre-mapped to unified controls — deploy in minutes, not weeks.
      </div>
    </MarketingPreviewChrome>
  );
}

/** Expert assist — Help Center integration guides */
export function ExpertAssistPillarPreview() {
  const guides = [
    { name: 'Okta', domain: 'IDAM · SSO', status: 'Connected' },
    { name: 'Workday', domain: 'HRMS', status: 'Guide ready' },
    { name: 'Microsoft Sentinel', domain: 'SIEM', status: 'Guide ready' },
    { name: 'Tenable.io', domain: 'VAPT', status: 'Guide ready' },
  ];

  return (
    <MarketingPreviewChrome label="Propel Ready Solutions · Help Center">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-teal-100 p-2">
          <LifeBuoy className="h-4 w-4 text-teal-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Expert assist
          </p>
          <p className="text-sm font-bold text-slate-900">Integration setup guides</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {guides.map((guide) => (
          <li
            key={guide.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5 transition-colors hover:border-teal-200 hover:bg-teal-50/50"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <BookOpen className="h-4 w-4 shrink-0 text-teal-600" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">{guide.name}</p>
                <p className="text-[10px] text-slate-500">{guide.domain}</p>
              </div>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold',
                guide.status === 'Connected'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-600'
              )}
            >
              {guide.status}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg border border-dashed border-teal-300 bg-teal-50/50 px-3 py-2.5 text-center text-xs text-teal-800">
        + 83 more tools · Step-by-step guides · GRC evidence mapping
      </div>
    </MarketingPreviewChrome>
  );
}

const pillarPreviewById = {
  ccm: ControlMonitoringPillarPreview,
  config: ConfigurabilityPillarPreview,
  library: LibraryPillarPreview,
  assist: ExpertAssistPillarPreview,
} as const;

export function PlatformPillarPreview({ pillarId }: { pillarId: keyof typeof pillarPreviewById }) {
  const Preview = pillarPreviewById[pillarId];
  return <Preview />;
}
