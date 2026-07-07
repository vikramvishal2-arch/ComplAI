'use client';

import {
  Activity,
  AlertTriangle,
  BookOpen,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Crown,
  Download,
  FileText,
  Library,
  ListChecks,
  Plug,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { MarketingPreviewChrome } from '@/components/marketing/marketing-preview-chrome';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { INTEGRATION_DOMAINS, INTEGRATION_TOOLS } from '@/lib/data/integration-catalog';
import { MARKETING_LEADERSHIP_DASHBOARD_PREVIEW } from '@/lib/data/marketing-leadership-dashboard-preview';
import { POLICY_TEMPLATE_CATALOG } from '@/lib/data/policy-template-catalog';
import { cn } from '@/lib/utils';

const featuredIntegrationIds = [
  'okta',
  'workday',
  'microsoft-sentinel',
  'crowdstrike-logscale',
  'tenable-io',
  'microsoft-entra',
];

function DashboardPreview() {
  const data = MARKETING_LEADERSHIP_DASHBOARD_PREVIEW;
  const topAttention = data.leadershipAttention[0];

  return (
    <MarketingPreviewChrome label="ComplAI · Leadership dashboard">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-100 p-2">
            <Crown className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Leadership view
            </p>
            <p className="text-sm font-bold text-slate-900">
              {data.totals.total} controls · {data.totals.readinessPercent}% green
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          Live
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Green', value: data.totals.green, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Amber', value: data.totals.amber, tone: 'text-amber-800 bg-amber-50 border-amber-100' },
          { label: 'Red', value: data.totals.red, tone: 'text-red-700 bg-red-50 border-red-100' },
        ].map((stat) => (
          <div key={stat.label} className={cn('rounded-lg border px-2 py-2', stat.tone)}>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] uppercase opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {data.frameworks.slice(0, 2).map((fw) => (
          <div key={fw.frameworkId} className="rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-semibold text-slate-900">{fw.frameworkName}</p>
              <span className="text-xs font-bold text-emerald-700">{fw.readiness}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                style={{ width: `${fw.readiness}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {topAttention && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-semibold">{topAttention.title}</p>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-amber-800/90">
              {topAttention.description}
            </p>
          </div>
        </div>
      )}
    </MarketingPreviewChrome>
  );
}

function PoliciesPreview() {
  const templates = POLICY_TEMPLATE_CATALOG.slice(0, 4);

  return (
    <MarketingPreviewChrome label="ComplAI · Policies & ISMS">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-sky-100 p-2">
            <FileText className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              ISMS library
            </p>
            <p className="text-sm font-bold text-slate-900">
              {POLICY_TEMPLATE_CATALOG.length} Annex A templates
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
          <Download className="h-3 w-3" />
          Export Word
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {templates.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">{doc.title}</p>
              <p className="text-[10px] text-slate-500">
                {doc.documentType === 'policy' ? 'Policy' : 'Procedure'} · {doc.isoReference}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
              Ready
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Upload existing docs or start from auditor-approved templates.
      </div>
    </MarketingPreviewChrome>
  );
}

function ApprovalsPreview() {
  const pending = [
    { title: 'Access Control Policy v3', stage: 'Review', owner: 'CISO', due: 'Today' },
    { title: 'Incident Response Procedure', stage: 'Approve', owner: 'COO', due: 'Tomorrow' },
    { title: 'Vendor Risk Assessment — Acme Corp', stage: 'Prepare', owner: 'GRC Analyst', due: '3 days' },
  ];

  return (
    <MarketingPreviewChrome label="ComplAI · My Approvals">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-violet-100 p-2">
          <ClipboardCheck className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Approval workflows
          </p>
          <p className="text-sm font-bold text-slate-900">3 pending in your inbox</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {['Prepare', 'Review', 'Approve'].map((stage, i) => (
          <div
            key={stage}
            className={cn(
              'flex-1 rounded-lg border px-2 py-2 text-center text-[10px] font-semibold',
              i === 1
                ? 'border-violet-300 bg-violet-50 text-violet-800'
                : 'border-slate-200 bg-white text-slate-600'
            )}
          >
            {stage}
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {pending.map((item) => (
          <li
            key={item.title}
            className="rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900">{item.title}</p>
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">
                {item.stage}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {item.owner}
              </span>
              <span>Due {item.due}</span>
            </div>
          </li>
        ))}
      </ul>
    </MarketingPreviewChrome>
  );
}

function FrameworksPreview() {
  const featured = FRAMEWORKS.filter((f) => f.popular).slice(0, 4);
  const readiness = [84, 76, 91, 68];

  return (
    <MarketingPreviewChrome label="ComplAI · Framework compliance">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-indigo-100 p-2">
          <Library className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Multi-framework
          </p>
          <p className="text-sm font-bold text-slate-900">{FRAMEWORKS.length}+ frameworks mapped</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {featured.map((fw, i) => (
          <div key={fw.id} className="rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900">{fw.shortName ?? fw.name}</p>
              <span className="text-xs font-bold text-emerald-700">{readiness[i]}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                style={{ width: `${readiness[i]}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500">
              {fw.controlCount} controls · {fw.region}
            </p>
          </div>
        ))}
      </div>
    </MarketingPreviewChrome>
  );
}

function ControlsPreview() {
  const controls = [
    { name: 'A.5.15 — Access control', evidence: '3 files', status: 'green' as const },
    { name: 'CC6.1 — Logical access', evidence: 'Okta sync', status: 'green' as const },
    { name: 'A.8.16 — Monitoring', evidence: 'Stale', status: 'red' as const },
    { name: 'A.5.19 — Supplier security', evidence: '1 file', status: 'amber' as const },
  ];
  const dot = { green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' };

  return (
    <MarketingPreviewChrome label="ComplAI · Controls & evidence">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-100 p-2">
            <ListChecks className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Control tracking
            </p>
            <p className="text-sm font-bold text-slate-900">Evidence linked per control</p>
          </div>
        </div>
        <Activity className="h-4 w-4 text-emerald-600" />
      </div>

      <ul className="mt-4 space-y-2">
        {controls.map((ctrl) => (
          <li
            key={ctrl.name}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', dot[ctrl.status])} />
              <span className="truncate text-xs font-medium text-slate-800">{ctrl.name}</span>
            </div>
            <span className="shrink-0 text-[10px] text-slate-500">{ctrl.evidence}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
        Remediation playbook suggested for A.8.16 — SIEM log retention gap.
      </div>
    </MarketingPreviewChrome>
  );
}

function IntegrationsCapabilityPreview() {
  const tools = INTEGRATION_TOOLS.filter((t) => featuredIntegrationIds.includes(t.id));

  return (
    <MarketingPreviewChrome label="ComplAI · Integrations hub">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-teal-100 p-2">
          <Plug className="h-4 w-4 text-teal-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Tech stack
          </p>
          <p className="text-sm font-bold text-slate-900">{INTEGRATION_TOOLS.length} tools catalogued</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {INTEGRATION_DOMAINS.map((d) => (
          <span
            key={d.id}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600"
          >
            {d.label}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2"
          >
            <Cloud className="h-3.5 w-3.5 shrink-0 text-teal-600" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-900">{tool.name}</p>
              <p className="text-[9px] text-slate-500 capitalize">{tool.deployment}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800">
        <BookOpen className="h-3.5 w-3.5 shrink-0" />
        Setup guides and GRC evidence mapping for every integration.
      </div>
    </MarketingPreviewChrome>
  );
}

function IntelligencePreview() {
  return (
    <MarketingPreviewChrome label="ComplAI · Intelligence">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-purple-100 p-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
            AI copilot
          </p>
          <p className="text-sm font-bold text-slate-900">Gap analysis & guidance</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl rounded-tl-sm border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700">
          Which SOC 2 controls are missing evidence for logical access?
        </div>
        <div className="rounded-xl rounded-tr-sm border border-purple-200 bg-purple-50 px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-purple-700">
            <Bot className="h-3.5 w-3.5" />
            ComplAI Intelligence
          </div>
          <p className="text-xs leading-relaxed text-slate-800">
            2 controls need attention: <strong>CC6.1</strong> (Okta evidence stale) and{' '}
            <strong>CC6.2</strong> (no privileged access review this quarter). I can draft a
            remediation plan.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        {[
          { label: 'Gaps found', value: '7' },
          { label: 'Auto-checks', value: '24/7' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-100 bg-slate-50 py-2">
            <p className="text-sm font-bold text-slate-900">{stat.value}</p>
            <p className="text-[10px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </MarketingPreviewChrome>
  );
}

function RiskPreview() {
  const risks = [
    { title: 'Third-party SaaS data residency', score: 16, level: 'High', owner: 'CRO' },
    { title: 'Privileged access review gaps', score: 12, level: 'Medium', owner: 'CISO' },
    { title: 'Backup recovery untested', score: 9, level: 'Medium', owner: 'IT Ops' },
  ];

  return (
    <MarketingPreviewChrome label="ComplAI · Risk register">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-orange-100 p-2">
          <ShieldAlert className="h-4 w-4 text-orange-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
            Living risk register
          </p>
          <p className="text-sm font-bold text-slate-900">Linked to mitigating controls</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {risks.map((risk) => (
          <li
            key={risk.title}
            className="rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900">{risk.title}</p>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold',
                  risk.level === 'High'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
                )}
              >
                {risk.level}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
              <span>Score {risk.score}</span>
              <span>{risk.owner}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-900">
        Surfaced on leadership dashboard for executive review.
      </div>
    </MarketingPreviewChrome>
  );
}

function VendorsPreview() {
  const vendors = [
    { name: 'Acme Cloud Services', status: 'Assessment due', tier: 'Critical' },
    { name: 'PayrollPro Inc.', status: 'Compliant', tier: 'High' },
    { name: 'DevTools SaaS', status: 'Questionnaire sent', tier: 'Medium' },
  ];

  return (
    <MarketingPreviewChrome label="ComplAI · Vendor assessments">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-slate-200 p-2">
          <Building2 className="h-4 w-4 text-slate-700" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Third-party risk
          </p>
          <p className="text-sm font-bold text-slate-900">Due diligence tracking</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {vendors.map((vendor) => (
          <li
            key={vendor.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/90 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">{vendor.name}</p>
              <p className="text-[10px] text-slate-500">{vendor.status}</p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold',
                vendor.tier === 'Critical'
                  ? 'bg-red-100 text-red-700'
                  : vendor.tier === 'High'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-600'
              )}
            >
              {vendor.tier}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
        <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-slate-600" />
        Questionnaire templates tied to ISO A.5.19 supplier controls.
      </div>
    </MarketingPreviewChrome>
  );
}

const capabilityPreviewById = {
  dashboard: DashboardPreview,
  policies: PoliciesPreview,
  approvals: ApprovalsPreview,
  frameworks: FrameworksPreview,
  controls: ControlsPreview,
  integrations: IntegrationsCapabilityPreview,
  intelligence: IntelligencePreview,
  risk: RiskPreview,
  vendors: VendorsPreview,
} as const;

export type PlatformCapabilityPreviewId = keyof typeof capabilityPreviewById;

export function PlatformCapabilityPreview({
  capabilityId,
}: {
  capabilityId: PlatformCapabilityPreviewId;
}) {
  const Preview = capabilityPreviewById[capabilityId];
  return <Preview />;
}
