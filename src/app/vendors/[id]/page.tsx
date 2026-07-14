'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { TprmAppShell } from '@/components/tprm/tprm-app-shell';
import { TprmVendorHero, TprmVendorDetailTabs } from '@/components/tprm/tprm-vendor-hero';
import { TprmExternalRiskGrid, TprmIntelligenceBanner } from '@/components/tprm/tprm-external-risk-grid';
import { TprmBreachHistoryPanel } from '@/components/tprm/tprm-breach-history-panel';
import { TprmExternalIntelPanel } from '@/components/tprm/tprm-external-intel-panel';
import { TprmFindingsBoard } from '@/components/tprm/tprm-findings-board';
import {
  applyLiveBreachToVectors,
  parseBreachIntel,
} from '@/lib/vendor/breach-intelligence-shared';
import type { VendorBreachIntel } from '@/lib/vendor/breach-intelligence-types';
import { applyExternalIntelToVectors, parseExternalIntel } from '@/lib/vendor/intel/correlate';
import type { VendorExternalIntel } from '@/lib/vendor/external-intel-types';
import { TprmRatingTrend } from '@/components/tprm/tprm-rating-badge';
import { VendorDomainBreakdown } from '@/components/vendors/vendor-domain-breakdown';
import { VendorRemediationPanel } from '@/components/vendors/vendor-remediation-panel';
import {
  VendorAssessmentChecklist,
  checklistProgress,
  type ChecklistStatus,
} from '@/components/vendors/vendor-assessment-checklist';
import { TprmQuestionnaireHub } from '@/components/tprm/tprm-questionnaire-hub';
import { TprmQuestionnaireDetail } from '@/components/tprm/tprm-questionnaire-detail';
import { TprmQuestionnaireUpload } from '@/components/tprm/tprm-questionnaire-upload';
import { TprmTemplatePicker } from '@/components/tprm/tprm-template-picker';
import { parseFindings, parseRemediationItems, type VendorRemediationItem } from '@/lib/vendor/vendor-assessment-types';
import { getPredefinedVendorAssessmentQuestions } from '@/lib/data/vendor-assessment-controls';
import type { ImportableQuestion } from '@/lib/vendor/questionnaire-import';
import { resolveExternalRiskVectors } from '@/lib/vendor/public-vendor-profiles';
import { resolveVendorCertifications } from '@/lib/vendor/vendor-certification-intelligence';
import { VendorCertificationsPanel } from '@/components/vendors/vendor-certifications-panel';
import { buildVendorPosture } from '@/lib/vendor/vendor-posture';
import { toUpguardRating } from '@/lib/vendor/tprm-rating';
import { VendorScoreBasisPanel } from '@/components/vendors/vendor-score-basis-panel';
import { ArrowLeft, Loader2, RefreshCw, Save, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'questionnaires' | 'findings' | 'remediation' | 'details';

const TAB_ALIASES: Record<string, Tab> = {
  profile: 'profile',
  overview: 'profile',
  questionnaires: 'questionnaires',
  questionnaire: 'questionnaires',
  findings: 'findings',
  remediation: 'remediation',
  details: 'details',
  assessments: 'questionnaires',
};

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const tab = TAB_ALIASES[searchParams.get('tab') ?? 'profile'] ?? 'profile';
  const assessmentParam = searchParams.get('assessment');

  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchDetail>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [selectedTemplate, setSelectedTemplate] = useState('tprm-standard');
  const [assessing, setAssessing] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<{
    id: string;
    questions: Parameters<typeof VendorAssessmentChecklist>[0]['items'];
    responses: Record<string, { status: ChecklistStatus; notes: string }>;
  } | null>(null);
  const [remediationItems, setRemediationItems] = useState<VendorRemediationItem[]>([]);
  const [remediationAssessmentId, setRemediationAssessmentId] = useState<string | null>(null);
  const [refreshingIntel, setRefreshingIntel] = useState(false);
  const [checkingBreaches, setCheckingBreaches] = useState(false);
  const [intelMessage, setIntelMessage] = useState<string | null>(null);

  async function fetchDetail(vendorId: string) {
    const r = await fetch(`/api/vendors/${vendorId}`);
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? 'Not found');
    return d as {
      vendor: {
        id: string;
        name: string;
        description: string;
        tier: string;
        dataAccess: string;
        status: string;
        contactEmail: string;
        website: string;
        primaryDomain: string;
        industry: string;
        inherentRiskScore: number;
        securityRating: number | null;
        ratingGrade: string;
        domainScores: unknown;
        certifications: unknown;
        breachIntel?: unknown;
        externalIntel?: unknown;
        aiRiskScore: number | null;
        aiRiskSummary: string;
        lastAssessedAt: string | null;
        assessments: Array<{
          id: string;
          status: string;
          templateId: string;
          templateName: string;
          aiScore: number | null;
          aiSummary?: string;
          questionnaireStatus: string;
          dueDate: string | null;
          completedAt: string | null;
          findings: unknown;
          remediationItems: unknown;
          domainScores: unknown;
          questions: unknown;
          responses: unknown;
        }>;
      };
      domainScores: Record<string, number>;
      openFindingsCount: number;
    };
  }

  const load = useCallback(() => {
    setLoading(true);
    fetchDetail(id)
      .then((d) => {
        setDetail(d);
        setForm({
          name: d.vendor.name,
          description: d.vendor.description,
          tier: d.vendor.tier,
          dataAccess: d.vendor.dataAccess,
          status: d.vendor.status,
          contactEmail: d.vendor.contactEmail,
          website: d.vendor.website,
          primaryDomain: d.vendor.primaryDomain,
          industry: d.vendor.industry,
          inherentRiskScore: d.vendor.inherentRiskScore,
        });
        const latest = d.vendor.assessments.find((a) => a.status === 'completed');
        if (latest) {
          setRemediationItems(parseRemediationItems(latest.remediationItems));
          setRemediationAssessmentId(latest.id);
        }
        const target =
          d.vendor.assessments.find((a) => a.id === assessmentParam) ??
          d.vendor.assessments.find((a) => a.status === 'in_progress');
        if (target?.status === 'in_progress' && Array.isArray(target.questions) && target.questions.length > 0) {
          setActiveAssessment({
            id: target.id,
            questions: target.questions as Parameters<typeof VendorAssessmentChecklist>[0]['items'],
            responses: responsesToMap(target.responses),
          });
        } else if (!assessmentParam) {
          setActiveAssessment(null);
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, tab, assessmentParam]);

  useEffect(() => {
    load();
  }, [load]);

  const vendor = detail?.vendor;
  const questionnaireCompleted = Boolean(
    vendor?.assessments.some((a) => a.status === 'completed')
  );
  const posture = useMemo(
    () => (vendor ? buildVendorPosture(vendor, { questionnaireCompleted }) : null),
    [vendor, questionnaireCompleted]
  );
  const score100 = posture?.score100 ?? vendor?.securityRating ?? vendor?.aiRiskScore ?? null;

  const allFindings = useMemo(
    () => (vendor ? vendor.assessments.flatMap((a) => parseFindings(a.findings)) : []),
    [vendor]
  );
  const openFindings = allFindings.filter((f) => f.status !== 'resolved' && f.status !== 'accepted');

  const externalRisk = useMemo(() => {
    if (!vendor) {
      return {
        vectors: [] as ReturnType<typeof resolveExternalRiskVectors>['vectors'],
        intelligence: null as ReturnType<typeof resolveExternalRiskVectors>['intelligence'],
        mode: 'simulated' as const,
        breachIntel: null as VendorBreachIntel | null,
        externalIntel: null as VendorExternalIntel | null,
      };
    }
    const resolved = resolveExternalRiskVectors({
      primaryDomain: vendor.primaryDomain,
      securityRating100: score100,
      tier: vendor.tier,
    });
    const externalIntel = parseExternalIntel(vendor.externalIntel);
    const intel =
      parseBreachIntel(vendor.breachIntel) ?? parseBreachIntel(externalIntel?.breachIntel);
    const vectors = externalIntel
      ? applyExternalIntelToVectors(resolved.vectors, externalIntel)
      : applyLiveBreachToVectors(resolved.vectors, intel);
    return {
      vectors,
      intelligence: resolved.intelligence,
      mode: (externalIntel?.live
        ? 'live_correlated'
        : resolved.intelligence
          ? 'curated_demo'
          : 'simulated') as 'curated_demo' | 'simulated' | 'live_correlated',
      breachIntel: intel,
      externalIntel,
    };
  }, [vendor, score100]);

  const breachIntel = externalRisk.breachIntel;
  const externalIntel = externalRisk.externalIntel;

  const vendorCertifications = useMemo(
    () =>
      vendor
        ? resolveVendorCertifications(vendor.primaryDomain, vendor.certifications)
        : { certifications: [], fromPublicProfile: false, verifiedOverInternet: false },
    [vendor]
  );

  const ratingTrend = useMemo(() => {
    if (externalRisk.intelligence?.profile.ratingTrend950.length) {
      return externalRisk.intelligence.profile.ratingTrend950;
    }
    return (vendor?.assessments ?? [])
      .filter((a) => a.aiScore != null && a.status === 'completed')
      .map((a) => toUpguardRating(a.aiScore)!)
      .reverse();
  }, [vendor, externalRisk.intelligence]);

  const questionnaireItems = useMemo(
    () =>
      (vendor?.assessments ?? []).map((a) => ({
        id: a.id,
        vendorId: vendor!.id,
        vendorName: vendor!.name,
        templateName: a.templateName ?? 'TPRM Standard',
        status: a.status,
        questionnaireStatus: a.questionnaireStatus,
        dueDate: a.dueDate,
        aiScore: a.aiScore,
        completedAt: a.completedAt,
      })),
    [vendor]
  );

  const selectedAssessment = useMemo(
    () => (assessmentParam ? vendor?.assessments.find((a) => a.id === assessmentParam) ?? null : null),
    [vendor, assessmentParam]
  );

  const importQuestions = useMemo(
    () =>
      getPredefinedVendorAssessmentQuestions({
        tier: vendor?.tier ?? 'medium',
        dataAccess: vendor?.dataAccess ?? 'none',
        templateId: selectedTemplate,
      }),
    [vendor?.tier, vendor?.dataAccess, selectedTemplate]
  );

  const handleImportComplete = useCallback(
    async (assessmentId: string) => {
      router.push(`/vendors/${id}?tab=questionnaires&assessment=${assessmentId}`);
      try {
        const d = await fetchDetail(id);
        setDetail(d);
        const target = d.vendor.assessments.find((a) => a.id === assessmentId);
        if (target && Array.isArray(target.questions) && target.questions.length > 0) {
          setActiveAssessment({
            id: target.id,
            questions: target.questions as Parameters<typeof VendorAssessmentChecklist>[0]['items'],
            responses: responsesToMap(target.responses),
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to refresh assessment');
      }
    },
    [router, id]
  );

  const openQuestionnaire = useCallback(
    (assessmentId: string) => {
      router.push(`/vendors/${id}?tab=questionnaires&assessment=${assessmentId}`);
      const a = vendor?.assessments.find((x) => x.id === assessmentId);
      if (a?.status === 'in_progress' && Array.isArray(a.questions) && a.questions.length > 0) {
        setActiveAssessment({
          id: a.id,
          questions: a.questions as Parameters<typeof VendorAssessmentChecklist>[0]['items'],
          responses: responsesToMap(a.responses),
        });
      }
    },
    [router, id, vendor]
  );

  const closeQuestionnaire = useCallback(() => {
    setActiveAssessment(null);
    router.push(`/vendors/${id}?tab=questionnaires`);
  }, [router, id]);

  const setTab = (t: Tab) => router.push(`/vendors/${id}?tab=${t}`);

  const refreshInternetIntelligence = async () => {
    setRefreshingIntel(true);
    setError(null);
    setIntelMessage(null);
    try {
      const r = await fetch(`/api/vendors/${id}/refresh-intelligence`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Refresh failed');
      setIntelMessage(typeof d.message === 'string' ? d.message : 'Intelligence refreshed.');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    } finally {
      setRefreshingIntel(false);
    }
  };

  const checkBreachesNow = async () => {
    setCheckingBreaches(true);
    setError(null);
    setIntelMessage(null);
    try {
      const r = await fetch(`/api/vendors/${id}/breach-check`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Breach check failed');
      setIntelMessage(typeof d.message === 'string' ? d.message : 'Breach check complete.');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Breach check failed');
    } finally {
      setCheckingBreaches(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const launchQuestionnaire = async () => {
    setAssessing(true);
    try {
      const r = await fetch(`/api/vendors/${id}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', templateId: selectedTemplate }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setActiveAssessment({ id: d.assessment.id, questions: d.questions, responses: {} });
      router.push(`/vendors/${id}?tab=questionnaires&assessment=${d.assessment.id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setAssessing(false);
    }
  };

  const submitQuestionnaire = async () => {
    const assessmentId = activeAssessment?.id ?? selectedAssessment?.id;
    if (!assessmentId || !activeAssessment) return;
    const progress = checklistProgress(activeAssessment.questions, activeAssessment.responses);
    if (progress.answered < progress.total) {
      setError(`Complete all items (${progress.answered}/${progress.total})`);
      return;
    }
    setAssessing(true);
    try {
      const responses = activeAssessment.questions.map((q) => ({
        questionId: q.id,
        status: activeAssessment.responses[q.id]?.status,
        answer: activeAssessment.responses[q.id]?.notes ?? '',
      }));
      const r = await fetch(`/api/vendors/${id}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'score', assessmentId, responses }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setActiveAssessment(null);
      setTab('findings');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setAssessing(false);
    }
  };

  const saveRemediation = async () => {
    if (!remediationAssessmentId) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remediationUpdate: true,
          assessmentId: remediationAssessmentId,
          remediationItems,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !detail?.vendor) {
    return (
      <TprmAppShell title="TPRM" subtitle="Loading…">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </TprmAppShell>
    );
  }

  if (error && !vendor) {
    return (
      <TprmAppShell title="TPRM" subtitle="Error">
        <Link href="/vendors" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Vendor portfolio
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      </TprmAppShell>
    );
  }

  if (!vendor) {
    return (
      <TprmAppShell title="TPRM" subtitle="Not found">
        <Link href="/vendors" className="text-brand-600 hover:underline">← Back to portfolio</Link>
      </TprmAppShell>
    );
  }

  const inProgressResponses =
    activeAssessment && selectedAssessment?.id === activeAssessment.id ? activeAssessment.responses : undefined;

  return (
    <TprmAppShell title={vendor.name} subtitle="Vendor security profile">
      <Link href="/vendors" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Vendor portfolio
      </Link>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <TprmVendorHero
        name={vendor.name}
        primaryDomain={vendor.primaryDomain}
        website={vendor.website}
        contactEmail={vendor.contactEmail}
        tier={vendor.tier}
        status={vendor.status}
        score100={score100}
        lastAssessedAt={vendor.lastAssessedAt}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={refreshInternetIntelligence}
          disabled={refreshingIntel}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-60"
        >
          <RefreshCw className={cn('h-4 w-4', refreshingIntel && 'animate-spin')} />
          {refreshingIntel
            ? 'Syncing…'
            : 'Refresh intelligence (Shodan · Censys · VirusTotal · NVD/EPSS · HIBP)'}
        </button>
      </div>

      {intelMessage && (
        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          {intelMessage}
        </div>
      )}

      <TprmVendorDetailTabs
        active={tab}
        onChange={(t) => setTab(t as Tab)}
        findingCount={openFindings.length}
      />

      {tab === 'profile' && (
        <div className="space-y-6">
          {posture?.summary && (
            <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Security posture summary</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{posture.summary}</p>
              {posture.fromPublicIntelligence && (
                <p className="mt-2 text-xs text-amber-800">
                  Summary includes a curated demo profile for {vendor.primaryDomain} — not a live
                  attack-surface scan. Breach history uses live HIBP when checked.
                </p>
              )}
            </div>
          )}

          <VendorCertificationsPanel
            certifications={vendorCertifications.certifications}
            verifiedOverInternet={vendorCertifications.verifiedOverInternet}
            className="order-first lg:order-none"
          />

          {posture && (
            <VendorScoreBasisPanel
              components={posture.scoreComponents}
              band={posture.band}
              certificationMetSecurityBaseline={posture.certificationMetSecurityBaseline}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Rating trend</h3>
              <TprmRatingTrend points={ratingTrend} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Security posture by domain</h3>
              <VendorDomainBreakdown
                domainScores={posture?.domainScores}
                recordScores={detail?.domainScores}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">External attack surface</h3>
            <p className="mb-3 text-xs text-slate-500">
              Attack-surface grid with live overlays from Shodan / Censys / VirusTotal / NVD / EPSS / HIBP when
              refresh succeeds. Unconfigured APIs stay unconfigured — never faked as clear.
            </p>
            {externalRisk.intelligence && (
              <TprmIntelligenceBanner sources={externalRisk.intelligence.profile.sources} />
            )}
            <TprmExternalRiskGrid vectors={externalRisk.vectors} mode={externalRisk.mode} />
          </div>

          <TprmExternalIntelPanel intel={externalIntel} />

          <TprmBreachHistoryPanel
            intel={breachIntel}
            checking={checkingBreaches}
            onCheck={checkBreachesNow}
          />

          {vendor.aiRiskSummary && !posture?.summary && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Assessment summary</h3>
              <p className="mt-2 text-sm text-slate-700">{vendor.aiRiskSummary}</p>
            </div>
          )}

          {openFindings.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Top risks ({openFindings.length})</h3>
                <button type="button" onClick={() => setTab('findings')} className="text-xs font-medium text-brand-600 hover:underline">
                  View all →
                </button>
              </div>
              <TprmFindingsBoard findings={openFindings.slice(0, 8)} />
            </div>
          )}
        </div>
      )}

      {tab === 'questionnaires' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">Send security questionnaire</h3>
            <p className="mt-1 text-xs text-slate-500">
              Choose a pre-defined template — questions are auto-populated from ISO 27001 / SOC 2 mapped controls
            </p>
            <div className="mt-4">
              <TprmTemplatePicker value={selectedTemplate} onChange={setSelectedTemplate} disabled={assessing} />
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={launchQuestionnaire}
                disabled={assessing}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {assessing ? 'Sending…' : 'Send questionnaire'}
              </button>
            </div>
          </div>

          <TprmQuestionnaireUpload
            vendorId={id}
            vendorTier={vendor.tier}
            vendorDataAccess={vendor.dataAccess}
            defaultTemplateId={selectedTemplate}
            assessmentId={
              selectedAssessment?.status === 'in_progress' ? selectedAssessment.id : activeAssessment?.id
            }
            questions={
              activeAssessment?.questions ??
              (selectedAssessment?.status === 'in_progress' && Array.isArray(selectedAssessment.questions)
                ? (selectedAssessment.questions as ImportableQuestion[])
                : importQuestions)
            }
            onImported={handleImportComplete}
            onError={(message) => setError(message)}
          />

          <TprmQuestionnaireHub
            items={questionnaireItems}
            selectedId={assessmentParam}
            onOpen={(_, assessmentId) => openQuestionnaire(assessmentId)}
          />

          {selectedAssessment && (
            <TprmQuestionnaireDetail
              assessment={{
                ...selectedAssessment,
                aiSummary: selectedAssessment.aiSummary ?? vendor.aiRiskSummary,
              }}
              vendorName={vendor.name}
              activeResponses={inProgressResponses}
              onResponsesChange={
                selectedAssessment.status === 'in_progress' && activeAssessment
                  ? (itemId, patch) =>
                      setActiveAssessment((prev) => {
                        if (!prev) return prev;
                        const cur = prev.responses[itemId] ?? { status: '' as ChecklistStatus, notes: '' };
                        return { ...prev, responses: { ...prev.responses, [itemId]: { ...cur, ...patch } } };
                      })
                  : undefined
              }
              onSubmit={selectedAssessment.status === 'in_progress' ? submitQuestionnaire : undefined}
              onClose={closeQuestionnaire}
              onViewFindings={() => setTab('findings')}
              submitting={assessing}
            />
          )}
        </div>
      )}

      {tab === 'findings' && <TprmFindingsBoard findings={allFindings} />}

      {tab === 'remediation' && (
        <div className="space-y-4">
          <VendorRemediationPanel items={remediationItems} onUpdate={setRemediationItems} />
          {remediationItems.length > 0 && (
            <button
              type="button"
              onClick={saveRemediation}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
            >
              <Save className="h-4 w-4" /> Save remediation updates
            </button>
          )}
        </div>
      )}

      {tab === 'details' && (
        <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Vendor details</h3>
          {(['name', 'primaryDomain', 'industry', 'website', 'contactEmail', 'description'] as const).map((field) => (
            <label key={field} className="block text-sm">
              <span className="font-medium capitalize text-slate-700">{field.replace(/([A-Z])/g, ' $1')}</span>
              {field === 'description' ? (
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                  value={String(form[field] ?? '')}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              ) : (
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={String(form[field] ?? '')}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              )}
            </label>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={saveProfile} disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">
              Save
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm('Delete vendor?')) {
                  await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
                  router.push('/vendors');
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </TprmAppShell>
  );
}

function responsesToMap(raw: unknown): Record<string, { status: ChecklistStatus; notes: string }> {
  if (!Array.isArray(raw)) return {};
  const map: Record<string, { status: ChecklistStatus; notes: string }> = {};
  for (const r of raw as { questionId: string; status?: ChecklistStatus; answer?: string }[]) {
    map[r.questionId] = { status: r.status ?? '', notes: r.answer ?? '' };
  }
  return map;
}
