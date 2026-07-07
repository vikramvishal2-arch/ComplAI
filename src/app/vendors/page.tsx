'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { TprmPageHeader } from '@/components/tprm/tprm-sub-nav';
import { TprmPortfolioStats } from '@/components/tprm/tprm-portfolio-stats';
import { TprmVendorTable } from '@/components/tprm/tprm-vendor-table';
import { TprmVendorPostureGrid } from '@/components/tprm/tprm-vendor-posture-grid';
import { TprmTemplatePicker } from '@/components/tprm/tprm-template-picker';
import { computePortfolioStats } from '@/lib/vendor/tprm-rating';
import { buildVendorPosture } from '@/lib/vendor/vendor-posture';
import { Loader2, Plus, Radar, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'monitored' | 'high_risk' | 'needs_questionnaire';

interface Vendor {
  id: string;
  name: string;
  primaryDomain: string;
  tier: string;
  status: string;
  securityRating: number | null;
  aiRiskScore: number | null;
  ratingGrade?: string;
  domainScores?: unknown;
  aiRiskSummary?: string;
  certifications?: unknown;
  lastAssessedAt: string | null;
  assessments: Array<{ status: string; aiScore: number | null }>;
}

function vendorFetchErrorMessage(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : fallback;
  if (msg === 'Failed to fetch') {
    return 'Could not reach the server. Stop dev (Ctrl+C), run `npm run db:generate`, then `npm run dev`.';
  }
  return msg;
}

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    primaryDomain: '',
    tier: 'medium',
    dataAccess: 'none',
    contactEmail: '',
    industry: '',
  });
  const [assessmentTemplate, setAssessmentTemplate] = useState('tprm-standard');
  const [startAssessment, setStartAssessment] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/vendors')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d.vendors as Vendor[];
      })
      .then((list) => setVendors(Array.isArray(list) ? list : []))
      .catch((e: Error) => setError(vendorFetchErrorMessage(e, 'Failed to load')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const vendorsWithScores = useMemo(
    () =>
      vendors.map((v) => {
        const posture = buildVendorPosture(v, {
          questionnaireCompleted: v.assessments.some((a) => a.status === 'completed'),
        });
        return { ...v, effectiveScore100: posture.score100 };
      }),
    [vendors]
  );

  const filtered = useMemo(() => {
    let list = vendorsWithScores;
    if (filter === 'monitored') {
      list = list.filter((v) => v.status === 'active' || v.status === 'monitoring');
    } else if (filter === 'high_risk') {
      list = list.filter((v) => {
        const s = v.effectiveScore100 ?? v.securityRating ?? v.aiRiskScore;
        return s != null && s < 60;
      });
    } else if (filter === 'needs_questionnaire') {
      list = list.filter(
        (v) =>
          !v.assessments.some((a) => a.status === 'completed') ||
          v.assessments.some((a) => a.status === 'in_progress')
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.primaryDomain ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [vendorsWithScores, filter, search]);

  const stats = useMemo(
    () =>
      computePortfolioStats(
        vendorsWithScores.map((v) => ({
          status: v.status,
          securityRating: v.effectiveScore100 ?? v.securityRating,
          aiRiskScore: v.aiRiskScore,
          assessments: v.assessments,
        }))
      ),
    [vendorsWithScores]
  );

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'monitoring' }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Create failed');
      setShowForm(false);

      if (startAssessment) {
        const assessRes = await fetch(`/api/vendors/${d.vendor.id}/assessment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate', templateId: assessmentTemplate }),
        });
        const assessData = await assessRes.json();
        if (assessRes.ok) {
          router.push(`/vendors/${d.vendor.id}?tab=questionnaires&assessment=${assessData.assessment.id}`);
          return;
        }
      }

      router.push(`/vendors/${d.vendor.id}`);
    } catch (err) {
      setError(vendorFetchErrorMessage(err, 'Create failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const loadDemoPortfolio = async (replaceExisting = false) => {
    if (
      replaceExisting &&
      vendors.length > 0 &&
      !window.confirm(
        'Replace all vendors in your portfolio with the demo set (Stripe, Policy Bazaar, Okta, Cloudflare, ValueFirst)?'
      )
    ) {
      return;
    }

    const shouldReplace = replaceExisting || vendors.length === 0;

    setLoadingDemo(true);
    setError(null);
    setDemoMessage(null);
    try {
      const r = await fetch('/api/vendors/demo-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replaceExisting: shouldReplace }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Failed to load demo portfolio');

      if (d.created?.length === 0 && d.skipped?.length > 0 && !shouldReplace) {
        return loadDemoPortfolio(true);
      }

      if (d.errors?.length) {
        throw new Error(d.errors.join('; '));
      }

      setDemoMessage(d.message ?? `Loaded ${d.created?.length ?? 0} demo vendor(s).`);
      load();
    } catch (err) {
      setError(vendorFetchErrorMessage(err, 'Failed to load demo portfolio'));
    } finally {
      setLoadingDemo(false);
    }
  };

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All vendors' },
    { id: 'monitored', label: 'Monitored' },
    { id: 'high_risk', label: 'High risk' },
    { id: 'needs_questionnaire', label: 'Needs questionnaire' },
  ];

  return (
    <AppShell title="TPRM" subtitle="Third-party risk management platform">
      <TprmPageHeader
        title="Vendor portfolio"
        description="Monitor security ratings, send questionnaires, track findings, and manage remediation — your third-party risk command center."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                setLoadingDemo(true);
                setError(null);
                try {
                  const r = await fetch('/api/vendors/refresh-intelligence', { method: 'POST' });
                  const d = await r.json();
                  if (!r.ok) throw new Error(d.error);
                  setDemoMessage(d.message);
                  load();
                } catch (e) {
                  setError(vendorFetchErrorMessage(e, 'Refresh failed'));
                } finally {
                  setLoadingDemo(false);
                }
              }}
              disabled={loadingDemo || vendors.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
            >
              <Radar className="h-4 w-4" />
              Sync all from internet
            </button>
            <button
              type="button"
              onClick={() => loadDemoPortfolio(false)}
              disabled={loadingDemo}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-60"
            >
              <Radar className="h-4 w-4" />
              {loadingDemo ? 'Loading…' : 'Load demo portfolio'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> Add vendor
            </button>
          </div>
        }
      />

      {demoMessage && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {demoMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <TprmPortfolioStats stats={stats} />

      {!loading && filtered.length > 0 && <TprmVendorPostureGrid vendors={filtered} />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f.id ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Search vendors or domains…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={createVendor} className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/30 p-6">
          <h3 className="font-semibold text-slate-900">Add vendor to portfolio</h3>
          <p className="mt-1 text-xs text-slate-500">
            Use a public domain (stripe.com, policybazaar.com, okta.com) for real internet intelligence, or
            click Load demo portfolio.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              required
              placeholder="Vendor name *"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Primary domain (e.g. acme.com)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.primaryDomain}
              onChange={(e) => setForm({ ...form, primaryDomain: e.target.value })}
            />
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value })}
            >
              <option value="critical">Critical tier</option>
              <option value="high">High tier</option>
              <option value="medium">Medium tier</option>
              <option value="low">Low tier</option>
            </select>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.dataAccess}
              onChange={(e) => setForm({ ...form, dataAccess: e.target.value })}
            >
              <option value="none">No data access</option>
              <option value="internal">Internal data</option>
              <option value="pii">PII / personal data</option>
              <option value="regulated">Regulated data</option>
            </select>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={startAssessment}
                onChange={(e) => setStartAssessment(e.target.checked)}
                className="rounded border-slate-300"
              />
              Start security assessment with template
            </label>
            {startAssessment && (
              <div className="mt-3">
                <TprmTemplatePicker
                  value={assessmentTemplate}
                  onChange={setAssessmentTemplate}
                  compact
                />
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={submitting} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {submitting ? 'Adding…' : 'Add & monitor'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading vendor portfolio…
        </div>
      ) : (
        <TprmVendorTable vendors={filtered} onDelete={async (id) => { await fetch(`/api/vendors/${id}`, { method: 'DELETE' }); load(); }} />
      )}
    </AppShell>
  );
}
