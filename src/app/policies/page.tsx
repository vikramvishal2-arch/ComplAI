'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  Loader2,
  Plus,
  Upload,
  FileText,
  ChevronRight,
  Trash2,
  BookOpen,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolicyCategory {
  id: string;
  label: string;
  description: string;
}

interface PolicyTemplate {
  id: string;
  categoryId: string;
  title: string;
  isoReference: string;
  description: string;
  documentType: 'policy' | 'procedure';
  controlIds: string[];
  frameworkTags: string[];
}

const FRAMEWORK_BADGE_STYLES: Record<string, string> = {
  iso27001: 'bg-blue-100 text-blue-800',
  dpdp: 'bg-orange-100 text-orange-800',
  gdpr: 'bg-indigo-100 text-indigo-800',
  ai: 'bg-purple-100 text-purple-800',
  soc2: 'bg-teal-100 text-teal-800',
  'pci-dss': 'bg-rose-100 text-rose-800',
  hipaa: 'bg-emerald-100 text-emerald-800',
};

const FRAMEWORK_LABELS: Record<string, string> = {
  iso27001: 'ISO 27001',
  dpdp: 'DPDP',
  gdpr: 'GDPR',
  ai: 'AI',
  soc2: 'SOC 2',
  'pci-dss': 'PCI DSS',
  hipaa: 'HIPAA',
};

interface Policy {
  id: string;
  templateId: string | null;
  categoryId: string;
  title: string;
  status: string;
  version: string;
  owner: string;
  source: string;
  isoReference: string;
  originalFileName: string | null;
  updatedAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  review: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-200 text-slate-600',
};

export default function PoliciesPage() {
  const [categories, setCategories] = useState<PolicyCategory[]>([]);
  const [templates, setTemplates] = useState<PolicyTemplate[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('governance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showBlank, setShowBlank] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', owner: '', templateId: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [blankForm, setBlankForm] = useState({ title: '', owner: '' });
  const [templateCounts, setTemplateCounts] = useState<{ policies: number; procedures: number; total: number } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, polRes] = await Promise.all([
        fetch('/api/policies/templates'),
        fetch('/api/policies'),
      ]);
      const tplData = await tplRes.json();
      const polData = await polRes.json();
      if (!tplRes.ok) throw new Error(tplData.error ?? 'Failed to load templates');
      if (!polRes.ok) throw new Error(polData.error ?? 'Failed to load policies');
      setCategories(tplData.categories);
      setTemplates(tplData.templates);
      setTemplateCounts(tplData.counts ?? null);
      setPolicies(polData.policies);
      if (tplData.categories.length && !tplData.categories.find((c: PolicyCategory) => c.id === activeCategory)) {
        setActiveCategory(tplData.categories[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryTemplates = useMemo(
    () => templates.filter((t) => t.categoryId === activeCategory),
    [templates, activeCategory]
  );

  const categoryPolicyTemplates = useMemo(
    () => categoryTemplates.filter((t) => t.documentType === 'policy'),
    [categoryTemplates]
  );

  const categoryProcedureTemplates = useMemo(
    () => categoryTemplates.filter((t) => t.documentType === 'procedure'),
    [categoryTemplates]
  );

  const templateCountByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of templates) {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + 1;
    }
    return map;
  }, [templates]);

  const categoryPolicies = useMemo(
    () => policies.filter((p) => p.categoryId === activeCategory),
    [policies, activeCategory]
  );

  const policyByTemplateId = useMemo(() => {
    const map: Record<string, Policy> = {};
    for (const p of policies) {
      if (!p.templateId) continue;
      const existing = map[p.templateId];
      if (!existing || new Date(p.updatedAt) > new Date(existing.updatedAt)) {
        map[p.templateId] = p;
      }
    }
    return map;
  }, [policies]);

  const activeCategoryMeta = categories.find((c) => c.id === activeCategory);

  const createFromTemplate = async (templateId: string) => {
    setBusy(templateId);
    setError(null);
    try {
      const r = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'from_template', templateId }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Create failed');
      window.location.href = `/policies/${d.policy.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(null);
    }
  };

  const createBlank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('blank');
    setError(null);
    try {
      const r = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'blank',
          title: blankForm.title,
          categoryId: activeCategory,
          owner: blankForm.owner,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Create failed');
      setShowBlank(false);
      setBlankForm({ title: '', owner: '' });
      window.location.href = `/policies/${d.policy.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(null);
    }
  };

  const uploadPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('Select a file to upload');
      return;
    }
    setBusy('upload');
    setError(null);
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      form.append('title', uploadForm.title);
      form.append('categoryId', activeCategory);
      form.append('owner', uploadForm.owner);
      if (uploadForm.templateId) form.append('templateId', uploadForm.templateId);

      const r = await fetch('/api/policies/upload', { method: 'POST', body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Upload failed');
      setShowUpload(false);
      setUploadForm({ title: '', owner: '', templateId: '' });
      setUploadFile(null);
      window.location.href = `/policies/${d.policy.id}?review=1`;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(null);
    }
  };

  const deletePolicy = async (id: string) => {
    if (!confirm('Delete this policy?')) return;
    setBusy(id);
    try {
      const r = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error ?? 'Delete failed');
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell
      title="Policies"
      subtitle={
        templateCounts
          ? `${templateCounts.total} ISMS templates (${templateCounts.policies} policies, ${templateCounts.procedures} procedures) — upload, create, or edit`
          : 'ISMS policy library — upload existing policies, create from templates, or edit in place'
      }
    >
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => { setShowUpload(true); setShowBlank(false); }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Upload className="h-4 w-4" />
          Upload existing policy
        </button>
        <button
          type="button"
          onClick={() => { setShowBlank(true); setShowUpload(false); }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          Create a new policy
        </button>
        <Link
          href="/policies/approvals"
          className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
        >
          My approvals
        </Link>
      </div>

      {showUpload && (
        <form onSubmit={uploadPolicy} className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Upload policy document</h3>
          <p className="mt-1 text-sm text-slate-500">
            PDF, Word, or Markdown — category: {activeCategoryMeta?.label}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Title</span>
              <input
                required
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Owner</span>
              <input
                value={uploadForm.owner}
                onChange={(e) => setUploadForm({ ...uploadForm, owner: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Map to template (optional)</span>
              <select
                value={uploadForm.templateId}
                onChange={(e) => setUploadForm({ ...uploadForm, templateId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">None — custom upload</option>
                {categoryTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">File</span>
              <input
                required
                type="file"
                accept=".pdf,.doc,.docx,.md,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={busy === 'upload'}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy === 'upload' ? 'Uploading…' : 'Upload'}
            </button>
            <button type="button" onClick={() => setShowUpload(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showBlank && (
        <form onSubmit={createBlank} className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">New policy</h3>
          <p className="mt-1 text-sm text-slate-500">Category: {activeCategoryMeta?.label}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Title</span>
              <input
                required
                value={blankForm.title}
                onChange={(e) => setBlankForm({ ...blankForm, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Owner</span>
              <input
                value={blankForm.owner}
                onChange={(e) => setBlankForm({ ...blankForm, owner: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={busy === 'blank'}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Create & edit
            </button>
            <button type="button" onClick={() => setShowBlank(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading policies…
        </div>
      ) : (
        <div className="flex gap-6">
          <nav className="w-64 shrink-0 space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              ISMS sections
            </p>
            {categories.map((cat) => {
              const count = policies.filter((p) => p.categoryId === cat.id).length;
              const tplCount = templateCountByCategory[cat.id] ?? 0;
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'bg-brand-50 font-medium text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="flex-1 leading-tight">{cat.label}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{tplCount}</span>
                  {count > 0 && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">{count}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeCategoryMeta?.label}</h2>
              <p className="mt-1 text-sm text-slate-500">{activeCategoryMeta?.description}</p>
            </div>

            {(['policy', 'procedure'] as const).map((docType) => {
              const items = docType === 'policy' ? categoryPolicyTemplates : categoryProcedureTemplates;
              if (items.length === 0) return null;
              return (
                <section key={docType}>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    <FileText className="h-4 w-4" />
                    {docType === 'policy' ? 'Policy templates' : 'Procedure templates'} ({items.length})
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{tpl.title}</p>
                            <p className="mt-0.5 text-xs text-brand-600">ISO 27001 {tpl.isoReference}</p>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase',
                              tpl.documentType === 'policy'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-violet-100 text-violet-800'
                            )}
                          >
                            {tpl.documentType}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{tpl.description}</p>
                        {tpl.frameworkTags.filter((f) => f !== 'iso27001').length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tpl.frameworkTags
                              .filter((f) => f !== 'iso27001')
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                    FRAMEWORK_BADGE_STYLES[tag] ?? 'bg-slate-100 text-slate-600'
                                  )}
                                >
                                  {FRAMEWORK_LABELS[tag] ?? tag}
                                </span>
                              ))}
                          </div>
                        )}
                        {tpl.controlIds.length > 0 && (
                          <p className="mt-2 text-xs text-slate-500">
                            Links {tpl.controlIds.length} control{tpl.controlIds.length === 1 ? '' : 's'} — auto-green when uploaded
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          {policyByTemplateId[tpl.id] && (
                            <Link
                              href={`/policies/${policyByTemplateId[tpl.id].id}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                            >
                              Open policy
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            type="button"
                            disabled={busy === tpl.id}
                            onClick={() => createFromTemplate(tpl.id)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50"
                          >
                            {busy === tpl.id ? 'Creating…' : 'Use template'}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Your policies ({categoryPolicies.length})
              </h3>
              {categoryPolicies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  No policies in this section yet. Upload an existing document or create from a template above.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categoryPolicies.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/policies/${p.id}`}
                              className="font-medium text-slate-900 hover:text-brand-600"
                            >
                              {p.title}
                            </Link>
                            {p.isoReference && (
                              <p className="text-xs text-slate-500">{p.isoReference}</p>
                            )}
                            {p.originalFileName && (
                              <p className="text-xs text-slate-400">{p.originalFileName}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 capitalize text-slate-600">{p.source}</td>
                          <td className="px-4 py-3">
                            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[p.status] ?? STATUS_STYLES.draft)}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(p.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <a
                                href={`/api/policies/${p.id}/download?format=docx`}
                                download
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-brand-600"
                                title="Download as Word (.docx)"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <Link
                                href={`/policies/${p.id}`}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-brand-600 hover:bg-brand-50"
                                title="Open policy"
                              >
                                <FileText className="h-4 w-4" />
                                Open
                              </Link>
                              <button
                                type="button"
                                disabled={busy === p.id}
                                onClick={() => deletePolicy(p.id)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
