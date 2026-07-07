'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { StatusBadge, FrameworkBadge } from '@/components/ui/badges';
import { RemediationForm } from '@/components/controls/remediation-form';
import { ControlIssuesPanel } from '@/components/controls/control-issues-panel';
import { EvidenceUploadPanel } from '@/components/controls/evidence-upload-panel';
import {
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_METHOD_LABELS,
  REMEDIATION_STATUS_LABELS,
  type ControlCompliance,
  type ControlRemediation,
  type ControlIssue,
  type ControlEvidence,
  type ComplianceStatus,
  type ComplianceMethod,
  type PrivacyControl,
} from '@/lib/types';
import { cn, formatDateTime } from '@/lib/utils';
import {
  hasEvidenceForContext,
  EVIDENCE_REQUIRED_MESSAGES,
} from '@/lib/evidence/validation';
import { getAuditReadyBlockers } from '@/lib/compliance/audit-ready';
import {
  getComplianceTemplates,
  getRemediationTemplates,
  getIssueTemplates,
  remediationTemplateToAction,
} from '@/lib/data/control-templates';
import { TemplatePicker } from '@/components/controls/template-picker';
import { ArrowLeft, Save, ShieldCheck, Wrench, AlertTriangle } from 'lucide-react';

type TabId = 'compliance' | 'remediation' | 'issues';

function tabFromSearchParams(tab: string | null): TabId {
  if (tab === 'remediation') return 'remediation';
  if (tab === 'issues') return 'issues';
  return 'compliance';
}

export default function ControlDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const initialTab = tabFromSearchParams(searchParams.get('tab'));

  const [control, setControl] = useState<PrivacyControl | null>(null);
  const [form, setForm] = useState<ControlCompliance | null>(null);
  const [remediation, setRemediation] = useState<ControlRemediation | null>(null);
  const [issues, setIssues] = useState<ControlIssue[]>([]);
  const [evidence, setEvidence] = useState<ControlEvidence[]>([]);
  const [frameworks, setFrameworks] = useState<{ reference: string; framework?: { shortName: string } }[]>([]);
  const [moduleName, setModuleName] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [appliedComplianceTemplateId, setAppliedComplianceTemplateId] = useState<string | null>(null);
  const [appliedRemediationTemplateId, setAppliedRemediationTemplateId] = useState<string | null>(null);
  const [templateNotice, setTemplateNotice] = useState<string | null>(null);
  const complianceFormRef = useRef<HTMLDivElement>(null);
  const remediationFormRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setPageLoading(true);
    setPageError(null);
    fetch(`/api/controls/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load control');
        return d;
      })
      .then((d) => {
        setControl(d.control);
        setForm(d.compliance);
        setRemediation(d.remediation);
        setIssues(d.issues ?? []);
        setEvidence(d.evidence ?? []);
        setFrameworks(d.frameworks ?? []);
        setModuleName(d.module?.name ?? '');
      })
      .catch((err: Error) => {
        setControl(null);
        setForm(null);
        setRemediation(null);
        setPageError(err.message);
      })
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    setActiveTab(tabFromSearchParams(searchParams.get('tab')));
  }, [searchParams]);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const saveCompliance = async () => {
    if (!form) return;
    if (!hasEvidenceForContext(evidence, 'compliance')) {
      setSaveError(EVIDENCE_REQUIRED_MESSAGES.compliance);
      return;
    }
    if (form.status === 'audit_ready') {
      const blocker = getAuditReadyBlockers(issues);
      if (blocker) {
        setSaveError(blocker);
        return;
      }
    }
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch(`/api/controls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? 'Failed to save');
        return;
      }
      setForm(data.compliance);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const saveRemediation = async () => {
    if (!remediation) return;
    if (!hasEvidenceForContext(evidence, 'remediation')) {
      setSaveError(EVIDENCE_REQUIRED_MESSAGES.remediation);
      return;
    }
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch(`/api/controls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remediation: { actions: remediation.actions } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? 'Failed to save remediation');
        return;
      }
      setRemediation(data.remediation);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <AppShell title="Loading control..." subtitle="">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </AppShell>
    );
  }

  if (pageError || !control || !form || !remediation) {
    return (
      <AppShell title="Control not found" subtitle="">
        <p className="text-sm text-slate-600">{pageError ?? 'This control does not exist.'}</p>
        <Link href="/controls" className="mt-4 inline-flex text-sm font-medium text-brand-600">
          ← Back to controls
        </Link>
      </AppShell>
    );
  }

  const openIssues = issues.filter((i) => i.status === 'open' || i.status === 'in_progress').length;

  const complianceTemplates = control
    ? getComplianceTemplates(control.id, control.moduleId)
    : [];
  const remediationTemplates = control
    ? getRemediationTemplates(control.id, control.moduleId)
    : [];
  const issueTemplates = control ? getIssueTemplates(control.id, control.moduleId) : [];

  const showTemplateNotice = (message: string) => {
    setTemplateNotice(message);
    setTimeout(() => setTemplateNotice(null), 4000);
  };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const applyComplianceTemplate = (templateId: string) => {
    const t = complianceTemplates.find((x) => x.id === templateId);
    if (!t || !form) return;
    setForm({
      ...form,
      status: t.status,
      complianceMethod: t.complianceMethod,
      owner: t.owner,
      implementationApproach: t.implementationApproach,
      evidenceNotes: t.evidenceNotes,
    });
    setAppliedComplianceTemplateId(templateId);
    setSaveError(null);
    showTemplateNotice(`"${t.name}" applied to the compliance plan below.`);
    scrollToRef(complianceFormRef);
  };

  const applyRemediationTemplate = (templateId: string) => {
    const t = remediationTemplates.find((x) => x.id === templateId);
    if (!t || !remediation) return;
    setRemediation({
      ...remediation,
      actions: [...remediation.actions, remediationTemplateToAction(t)],
    });
    setAppliedRemediationTemplateId(templateId);
    setSaveError(null);
    showTemplateNotice(`"${t.name}" added to remediation actions below.`);
    scrollToRef(remediationFormRef);
  };

  const tabs: { id: TabId; label: string; icon: typeof ShieldCheck; count?: number }[] = [
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'remediation', label: 'Remediation', icon: Wrench },
    { id: 'issues', label: 'Issues', icon: AlertTriangle, count: openIssues },
  ];

  return (
    <AppShell title={control.title} subtitle={`${control.reference} · ${moduleName}`}>
      <Link href="/controls" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to control register
      </Link>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Control requirement</h2>
        <p className="mt-2 text-sm text-slate-600">{control.description}</p>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">Guidance: </span>
          {control.guidance}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {frameworks.map((f) => (
            <FrameworkBadge key={f.reference} name={`${f.framework?.shortName ?? ''} ${f.reference}`} />
          ))}
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px',
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {templateNotice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {templateNotice}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TemplatePicker
              title="Compliance templates"
              variant="compliance"
              appliedId={appliedComplianceTemplateId}
              templates={complianceTemplates.map((t) => ({
                id: t.id,
                name: t.name,
                description: t.implementationApproach,
                previewFields: [
                  { label: 'Status', value: COMPLIANCE_STATUS_LABELS[t.status] },
                  { label: 'Compliance method', value: COMPLIANCE_METHOD_LABELS[t.complianceMethod] },
                  { label: 'Owner', value: t.owner },
                  { label: 'Implementation approach', value: t.implementationApproach },
                  { label: 'Evidence notes', value: t.evidenceNotes },
                ],
              }))}
              onApply={applyComplianceTemplate}
            />
            <EvidenceUploadPanel
              controlId={id}
              context="compliance"
              evidence={evidence}
              onChange={setEvidence}
              required
            />
            <div ref={complianceFormRef} className="privacy-card scroll-mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Compliance plan</h2>
                <StatusBadge status={form.status} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Status</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ComplianceStatus })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {(Object.keys(COMPLIANCE_STATUS_LABELS) as ComplianceStatus[]).map((s) => (
                      <option key={s} value={s}>{COMPLIANCE_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Compliance method</span>
                  <select
                    value={form.complianceMethod ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        complianceMethod: (e.target.value || null) as ComplianceMethod | null,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Select method...</option>
                    {(Object.keys(COMPLIANCE_METHOD_LABELS) as ComplianceMethod[]).map((m) => (
                      <option key={m} value={m}>{COMPLIANCE_METHOD_LABELS[m]}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Owner</span>
                  <input
                    type="text"
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Target date</span>
                  <input
                    type="date"
                    value={form.targetDate ?? ''}
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value || null })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-slate-500">Implementation approach</span>
                <textarea
                  value={form.implementationApproach}
                  onChange={(e) => setForm({ ...form, implementationApproach: e.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-slate-500">Evidence notes</span>
                <textarea
                  value={form.evidenceNotes}
                  onChange={(e) => setForm({ ...form, evidenceNotes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveCompliance}
                  disabled={saving}
                  className="app-primary-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save compliance plan'}
                </button>
                {saved && <span className="text-sm text-emerald-600">Saved successfully.</span>}
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="privacy-card">
              <h3 className="text-sm font-semibold text-slate-900">Module</h3>
              <Link href={`/modules/${control.moduleId}`} className="mt-1 text-sm text-brand-600 hover:text-brand-700">
                {moduleName} →
              </Link>
            </div>
            <div className="privacy-card text-xs text-slate-500" suppressHydrationWarning>
              Last updated: {formatDateTime(form.lastUpdated)}
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'remediation' && (
        <div className="space-y-6">
          <TemplatePicker
            title="Remediation templates"
            variant="remediation"
            appliedId={appliedRemediationTemplateId}
            templates={remediationTemplates.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.action.description,
              previewFields: [
                { label: 'Action title', value: t.action.title },
                { label: 'Description', value: t.action.description },
                { label: 'Assignee', value: t.action.assignee },
                { label: 'Status', value: REMEDIATION_STATUS_LABELS[t.action.status] },
              ],
            }))}
            onApply={applyRemediationTemplate}
          />
          <EvidenceUploadPanel
            controlId={id}
            context="remediation"
            evidence={evidence}
            onChange={setEvidence}
            required
          />
          <div ref={remediationFormRef} className="scroll-mt-6">
            <RemediationForm
              actions={remediation.actions}
              onChange={(actions) => setRemediation({ ...remediation, actions })}
            />
          </div>
          <button
            type="button"
            onClick={saveRemediation}
            disabled={saving}
            className="app-primary-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save remediation plan'}
          </button>
          {saved && <span className="ml-3 text-sm text-emerald-600">Saved successfully.</span>}
        </div>
      )}

      {activeTab === 'issues' && (
        <ControlIssuesPanel
          controlId={id}
          issues={issues}
          onChange={setIssues}
          issueTemplates={issueTemplates}
        />
      )}
    </AppShell>
  );
}
