'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Loader2, Plus, Building2, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Vendor {
  id: string;
  name: string;
  description: string;
  tier: string;
  dataAccess: string;
  status: string;
  contactEmail: string;
  website: string;
  inherentRiskScore: number;
  aiRiskScore: number | null;
  aiRiskSummary: string;
  lastAssessedAt: string | null;
  assessments: { id: string; status: string; aiScore: number | null }[];
}

interface VendorQuestion {
  id: string;
  category: string;
  question: string;
  weight: number;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assessingId, setAssessingId] = useState<string | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<{
    vendorId: string;
    assessmentId: string;
    questions: VendorQuestion[];
    responses: Record<string, string>;
    result?: { score: number; summary: string; gaps: { area: string; severity: string; recommendation: string }[] };
  } | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    tier: 'medium',
    dataAccess: 'none',
    contactEmail: '',
    website: '',
    inherentRiskScore: 50,
  });

  const load = () => {
    setLoading(true);
    fetch('/api/vendors')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load');
        return d.vendors as Vendor[];
      })
      .then(setVendors)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Create failed');
      setShowForm(false);
      setForm({
        name: '',
        description: '',
        tier: 'medium',
        dataAccess: 'none',
        contactEmail: '',
        website: '',
        inherentRiskScore: 50,
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const startAssessment = async (vendorId: string) => {
    setAssessingId(vendorId);
    setError(null);
    try {
      const r = await fetch(`/api/vendors/${vendorId}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Assessment failed');
      setActiveAssessment({
        vendorId,
        assessmentId: d.assessment.id,
        questions: d.questions,
        responses: {},
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setAssessingId(null);
    }
  };

  const submitAssessment = async () => {
    if (!activeAssessment) return;
    setAssessingId(activeAssessment.vendorId);
    setError(null);
    try {
      const responses = activeAssessment.questions.map((q) => ({
        questionId: q.id,
        answer: activeAssessment.responses[q.id] ?? '',
      }));
      const r = await fetch(`/api/vendors/${activeAssessment.vendorId}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'score',
          assessmentId: activeAssessment.assessmentId,
          responses,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Scoring failed');
      setActiveAssessment({
        ...activeAssessment,
        result: d.result,
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setAssessingId(null);
    }
  };

  const deleteVendor = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <AppShell
      title="Vendor Risk"
      subtitle="Third-party register with AI-assisted security questionnaires"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Generate tailored questionnaires and score vendor responses — works with Ollama locally or
          rule-based fallback without AI.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add vendor
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={createVendor}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <h3 className="font-semibold text-slate-900">New vendor</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" required>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Tier">
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>
            <Field label="Data access">
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={form.dataAccess}
                onChange={(e) => setForm({ ...form, dataAccess: e.target.value })}
              >
                <option value="none">None</option>
                <option value="internal">Internal only</option>
                <option value="pii">PII / personal data</option>
                <option value="regulated">Regulated / sensitive</option>
              </select>
            </Field>
            <Field label="Inherent risk (0–100)">
              <input
                type="number"
                min={0}
                max={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                value={form.inherentRiskScore}
                onChange={(e) =>
                  setForm({ ...form, inherentRiskScore: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save vendor'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {activeAssessment && (
        <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" /> AI vendor assessment
            </h3>
            <button
              type="button"
              onClick={() => setActiveAssessment(null)}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>

          {activeAssessment.result ? (
            <div className="space-y-3">
              <p className="text-2xl font-bold text-slate-900">
                Risk score: {activeAssessment.result.score}/100
              </p>
              <p className="text-sm text-slate-700">{activeAssessment.result.summary}</p>
              {activeAssessment.result.gaps.length > 0 && (
                <ul className="space-y-2">
                  {activeAssessment.result.gaps.map((g, i) => (
                    <li key={i} className="rounded-lg bg-white p-3 text-sm border border-slate-200">
                      <span className="font-medium capitalize">{g.severity}</span> — {g.area}:{' '}
                      {g.recommendation}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              {activeAssessment.questions.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-slate-800">
                    <span className="text-xs text-slate-500">{q.category}</span>
                    <br />
                    {q.question}
                  </label>
                  <textarea
                    className="mt-1 w-full min-h-[60px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    value={activeAssessment.responses[q.id] ?? ''}
                    onChange={(e) =>
                      setActiveAssessment({
                        ...activeAssessment,
                        responses: { ...activeAssessment.responses, [q.id]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={submitAssessment}
                disabled={assessingId !== null}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {assessingId ? 'Scoring…' : 'Submit & score with AI'}
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading vendors…
        </div>
      ) : vendors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
          No vendors yet. Add your first third party to start AI assessments.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Inherent</th>
                <th className="px-4 py-3">AI score</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{v.name}</p>
                        {v.aiRiskSummary && (
                          <p className="text-xs text-slate-500 line-clamp-1">{v.aiRiskSummary}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{v.tier}</td>
                  <td className="px-4 py-3 capitalize">{v.dataAccess.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{v.inherentRiskScore}</td>
                  <td className="px-4 py-3">
                    {v.aiRiskScore != null ? (
                      <span
                        className={cn(
                          'font-semibold',
                          v.aiRiskScore >= 70 ? 'text-green-700' : v.aiRiskScore >= 40 ? 'text-amber-700' : 'text-red-700'
                        )}
                      >
                        {v.aiRiskScore}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startAssessment(v.id)}
                        disabled={assessingId === v.id}
                        className="text-brand-600 hover:underline text-xs font-medium"
                      >
                        {assessingId === v.id ? 'Starting…' : 'AI assess'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVendor(v.id)}
                        className="text-red-600 hover:underline"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Also available from{' '}
        <Link href="/intelligence" className="text-brand-600 hover:underline">
          Intelligence
        </Link>{' '}
        overview.
      </p>
    </AppShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {required && ' *'}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
