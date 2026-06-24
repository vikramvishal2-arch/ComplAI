'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { StatusBadge, MethodBadge } from '@/components/ui/badges';
import { RemediationForm } from '@/components/controls/remediation-form';
import { AccessConnectionsPanel } from '@/components/controls/access-connections-panel';
import { ControlIssuesPanel } from '@/components/controls/control-issues-panel';
import { ControlLinkedRisksPanel } from '@/components/controls/control-linked-risks-panel';
import { EvidenceUploadPanel } from '@/components/controls/evidence-upload-panel';
import {
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_METHOD_LABELS,
  DOMAIN_LABELS,
  type Control,
  type ControlCompliance,
  type ControlRemediation,
  type ControlIssue,
  type ControlEvidence,
  type Risk,
  type ComplianceStatus,
  type ComplianceMethod,
  type RemediationPlaybookLink,
  type AccessIntegrationProvider,
} from '@/lib/types';
import { formatDateTime, cn } from '@/lib/utils';
import {
  hasEvidenceForContext,
  EVIDENCE_REQUIRED_MESSAGES,
} from '@/lib/evidence/validation';
import { ArrowLeft, Save, Lightbulb, CheckCircle2, Wrench, ShieldCheck, AlertTriangle } from 'lucide-react';
import { isOpenRiskStatus } from '@/lib/risk/status';
import { getAuditReadyBlockers } from '@/lib/compliance/audit-ready';

type TabId = 'compliance' | 'remediation' | 'issues';

function tabFromSearchParams(tab: string | null): TabId {
  if (tab === 'remediation') return 'remediation';
  if (tab === 'issues') return 'issues';
  return 'compliance';
}

export default function ControlDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const initialTab = tabFromSearchParams(searchParams.get('tab'));

  const [control, setControl] = useState<Control | null>(null);
  const [framework, setFramework] = useState<{ shortName: string; name: string } | null>(null);
  const [form, setForm] = useState<ControlCompliance | null>(null);
  const [remediation, setRemediation] = useState<ControlRemediation | null>(null);
  const [issues, setIssues] = useState<ControlIssue[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [evidence, setEvidence] = useState<ControlEvidence[]>([]);
  const [suggestedLinks, setSuggestedLinks] = useState<RemediationPlaybookLink[]>([]);
  const [accessProviders, setAccessProviders] = useState<AccessIntegrationProvider[]>([]);
  const [isAccessControl, setIsAccessControl] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadControl = () => {
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
        setFramework(d.framework);
        setForm(d.compliance);
        setRemediation(d.remediation);
        setIssues(d.issues ?? []);
        setRisks(d.risks ?? []);
        setEvidence(d.evidence ?? []);
        setSuggestedLinks(d.suggestedRemediationLinks ?? []);
        setAccessProviders(d.accessIntegrationProviders ?? []);
        setIsAccessControl(d.isAccessControl ?? false);
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
    if (!id) return;
    loadControl();
  }, [id]);

  const saveCompliance = async () => {
    if (!form) return;
    if (!hasEvidenceForContext(evidence, 'compliance')) {
      setSaveError(EVIDENCE_REQUIRED_MESSAGES.compliance);
      return;
    }
    if (form.status === 'audit_ready') {
      const blocker = getAuditReadyBlockers(issues, risks);
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
        body: JSON.stringify({
          status: form.status,
          complianceMethod: form.complianceMethod,
          implementationApproach: form.implementationApproach,
          owner: form.owner,
          targetDate: form.targetDate,
          evidenceNotes: form.evidenceNotes,
          naJustification: form.naJustification,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? 'Failed to save compliance plan');
        return;
      }
      setForm(data.compliance);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Network error while saving compliance plan');
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
        body: JSON.stringify({
          remediation: {
            actions: remediation.actions,
            accessConnections: remediation.accessConnections,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? 'Failed to save remediation plan');
        return;
      }
      setRemediation(data.remediation);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Network error while saving remediation plan');
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <AppShell title="Loading control..." subtitle="">
        <div className="animate-pulse h-96 rounded-xl bg-slate-200" />
      </AppShell>
    );
  }

  if (pageError || !control || !form || !remediation) {
    return (
      <AppShell title="Control unavailable" subtitle="">
        <Link
          href="/controls"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to controls
        </Link>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-medium">Could not load this control</p>
          <p className="mt-2">{pageError ?? 'Unknown error'}</p>
          <p className="mt-2 text-xs">
            Ensure PostgreSQL is running, then restart the app:{' '}
            <code className="rounded bg-amber-100 px-1">npm run dev</code>
          </p>
          <button
            type="button"
            onClick={loadControl}
            className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  const openActions = remediation.actions.filter((a) => a.status !== 'completed').length;
  const openIssues = issues.filter(
    (i) => i.status === 'open' || i.status === 'in_progress'
  ).length;
  const openRisks = risks.filter((r) => isOpenRiskStatus(r.status)).length;
  const hasRegisterExposure = openIssues > 0 || openRisks > 0;
  const auditReadyBlocker = getAuditReadyBlockers(issues, risks);
  const connectedIntegrations = remediation.accessConnections.filter(
    (c) => c.status === 'connected'
  ).length;

  const hasComplianceEvidence = hasEvidenceForContext(evidence, 'compliance');
  const hasRemediationEvidence = hasEvidenceForContext(evidence, 'remediation');

  const tabRequiredBadge = (missing: boolean) =>
    missing ? (
      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-800">
        Required
      </span>
    ) : null;

  return (
    <AppShell title={control.title} subtitle={`${framework?.shortName} · ${control.reference}`}>
      <Link
        href="/controls"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to controls
      </Link>

      <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => {
            setActiveTab('compliance');
            setSaveError(null);
            setSaving(false);
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
            activeTab === 'compliance'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          Compliance plan
          {tabRequiredBadge(!hasComplianceEvidence)}
          {openRisks > 0 && (
            <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
              {openRisks}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('remediation');
            setSaveError(null);
            setSaving(false);
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
            activeTab === 'remediation'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Wrench className="h-4 w-4" />
          Remediation
          {tabRequiredBadge(!hasRemediationEvidence)}
          {openActions > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
              {openActions}
            </span>
          )}
          {openRisks > 0 && (
            <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
              {openRisks}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('issues');
            setSaveError(null);
            setSaving(false);
          }}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
            activeTab === 'issues'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <AlertTriangle className="h-4 w-4" />
          Risk/Issue
          {openIssues > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-800">
              {openIssues}
            </span>
          )}
          {openRisks > 0 && (
            <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
              {openRisks}
            </span>
          )}
        </button>
      </div>

      {hasRegisterExposure && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Open register items on this control
          </p>
          <p className="mt-1 text-xs text-amber-900">
            {openRisks > 0 && (
              <span>
                {openRisks} open risk{openRisks === 1 ? '' : 's'} from the risk register
              </span>
            )}
            {openRisks > 0 && openIssues > 0 && ' · '}
            {openIssues > 0 && (
              <span>
                {openIssues} open issue{openIssues === 1 ? '' : 's'} on this control
              </span>
            )}
            . Review linked risks below before updating compliance or remediation.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Control requirement</h2>
            <p className="mt-3 text-sm text-slate-600">{control.description}</p>
            <div className="mt-4 rounded-lg bg-brand-50 p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-brand-800">Implementation guidance</p>
                  <p className="mt-1 text-sm text-brand-700">{control.guidance}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Domain: {DOMAIN_LABELS[control.domain]}
            </p>
          </section>

          <ControlLinkedRisksPanel controlId={id} risks={risks} />

          {activeTab === 'compliance' ? (
            <section className="rounded-xl border-2 border-brand-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  How will you comply with this control?
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Define your organization&apos;s chosen compliance approach. This is your audit
                  narrative for this control.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Compliance status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as ComplianceStatus })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {(Object.keys(COMPLIANCE_STATUS_LABELS) as ComplianceStatus[]).map((s) => (
                      <option
                        key={s}
                        value={s}
                        disabled={s === 'audit_ready' && auditReadyBlocker != null}
                      >
                        {COMPLIANCE_STATUS_LABELS[s]}
                        {s === 'audit_ready' && auditReadyBlocker != null ? ' (blocked)' : ''}
                      </option>
                    ))}
                  </select>
                  {auditReadyBlocker && (
                    <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {auditReadyBlocker}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Compliance method
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(Object.keys(COMPLIANCE_METHOD_LABELS) as ComplianceMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setForm({ ...form, complianceMethod: method })}
                        className={cn(
                          'rounded-lg border px-3 py-2.5 text-left text-sm transition',
                          form.complianceMethod === method
                            ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {COMPLIANCE_METHOD_LABELS[method]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Implementation approach
                  </label>
                  <textarea
                    rows={5}
                    value={form.implementationApproach}
                    onChange={(e) =>
                      setForm({ ...form, implementationApproach: e.target.value })
                    }
                    placeholder="Describe exactly how your organization implements this control..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                {form.status === 'not_applicable' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Not applicable justification
                    </label>
                    <textarea
                      rows={3}
                      value={form.naJustification}
                      onChange={(e) => setForm({ ...form, naJustification: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Control owner
                    </label>
                    <input
                      type="text"
                      value={form.owner}
                      onChange={(e) => setForm({ ...form, owner: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Target completion date
                    </label>
                    <input
                      type="date"
                      value={form.targetDate ?? ''}
                      onChange={(e) =>
                        setForm({ ...form, targetDate: e.target.value || null })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Evidence notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.evidenceNotes}
                    onChange={(e) => setForm({ ...form, evidenceNotes: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <EvidenceUploadPanel
                  controlId={id}
                  context="compliance"
                  evidence={evidence}
                  onChange={setEvidence}
                  required
                />

                {saveError && activeTab === 'compliance' && (
                  <p className="text-sm text-red-600">{saveError}</p>
                )}

                <SaveButton
                  saving={saving}
                  saved={saved}
                  onClick={saveCompliance}
                  label="Save compliance plan"
                  disabled={!hasComplianceEvidence}
                  disabledHint={EVIDENCE_REQUIRED_MESSAGES.compliance}
                />
              </div>
            </section>
          ) : activeTab === 'remediation' ? (
            <section className="rounded-xl border-2 border-amber-200 bg-white p-6 shadow-sm space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Remediation actions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Document remediation steps with links to runbooks, vendor consoles, and guides to
                  close control gaps.
                </p>
              </div>

              <RemediationForm
                actions={remediation.actions}
                suggestedLinks={suggestedLinks}
                onChange={(actions) => setRemediation({ ...remediation, actions })}
              />

              {isAccessControl && (
                <AccessConnectionsPanel
                  connections={remediation.accessConnections}
                  providers={accessProviders}
                  onChange={(accessConnections) =>
                    setRemediation({ ...remediation, accessConnections })
                  }
                />
              )}

              <EvidenceUploadPanel
                controlId={id}
                context="remediation"
                evidence={evidence}
                onChange={setEvidence}
                required
              />

              {saveError && activeTab === 'remediation' && (
                <p className="text-sm text-red-600">{saveError}</p>
              )}

              <SaveButton
                saving={saving}
                saved={saved}
                onClick={saveRemediation}
                label="Save remediation plan"
                disabled={!hasRemediationEvidence}
                disabledHint={EVIDENCE_REQUIRED_MESSAGES.remediation}
              />
            </section>
          ) : (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Control issues</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Optionally raise audit findings or compliance concerns. Risks from the register
                  are listed above.
                </p>
              </div>

              <EvidenceUploadPanel
                controlId={id}
                context="issues"
                evidence={evidence}
                onChange={setEvidence}
                issues={issues}
              />

              <ControlIssuesPanel controlId={id} issues={issues} onChange={setIssues} />
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Current status</h3>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={form.status} />
                </div>
                {form.status === 'audit_ready' && auditReadyBlocker && (
                  <p className="mt-2 text-xs text-amber-800">
                    Open risks or issues must be resolved before this control can remain Audit Ready.
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500">Method</p>
                <div className="mt-1">
                  <MethodBadge method={form.complianceMethod} />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Open issues</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{openIssues}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Open risks (register)</p>
                <p
                  className={cn(
                    'mt-1 text-sm font-medium',
                    openRisks > 0 ? 'text-purple-700' : 'text-slate-900'
                  )}
                >
                  {openRisks}
                  {risks.length > openRisks && (
                    <span className="text-xs font-normal text-slate-500">
                      {' '}
                      / {risks.length} total
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Open remediation actions</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{openActions}</p>
              </div>
              {isAccessControl && (
                <div>
                  <p className="text-xs text-slate-500">Connected integrations</p>
                  <p className="mt-1 text-sm font-medium text-emerald-600">
                    {connectedIntegrations} / {accessProviders.length}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500">Last updated</p>
                <p className="mt-1 text-sm text-slate-700">{formatDateTime(form.lastUpdated)}</p>
              </div>
            </div>
          </section>

          {activeTab === 'compliance' && (
            <section className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <h3 className="text-sm font-semibold text-amber-900">Need to remediate?</h3>
              <p className="mt-2 text-xs text-amber-800">
                Switch to the Remediation tab to add action items with documentation links
                {isAccessControl ? ' and configure access control integrations.' : '.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('remediation')}
                className="mt-3 text-xs font-medium text-brand-600 hover:underline"
              >
                Open remediation form →
              </button>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Framework</h3>
            <p className="mt-2 text-sm font-medium text-brand-600">{framework?.name}</p>
            <Link
              href={`/frameworks/${control.frameworkId}`}
              className="mt-3 inline-block text-xs text-brand-600 hover:underline"
            >
              View all {framework?.shortName} controls →
            </Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function SaveButton({
  saving,
  saved,
  onClick,
  label,
  disabled = false,
  disabledHint,
}: {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <div className="flex items-center gap-3">
        <button
          onClick={onClick}
          disabled={saving || disabled}
          title={disabled ? disabledHint : undefined}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : label}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
      {disabled && disabledHint && (
        <p className="text-xs text-red-600">{disabledHint}</p>
      )}
    </div>
  );
}
