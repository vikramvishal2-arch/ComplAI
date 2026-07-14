'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CATEGORY_LABELS, type FrameworkCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';

type CatalogRow = {
  id: string;
  frameworkId: string;
  source: 'custom' | 'builtin_override';
  name: string;
  shortName: string;
  description: string;
  category: FrameworkCategory;
  region: string;
  version: string;
  popular: boolean;
  published: boolean;
  tags: string[];
};

type StaticRef = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: FrameworkCategory;
  region: string;
  version: string;
  popular: boolean;
  tags: string[];
};

type FrameworkFormState = {
  frameworkId: string;
  name: string;
  shortName: string;
  description: string;
  category: FrameworkCategory;
  region: string;
  version: string;
  popular: boolean;
  published: boolean;
  tags: string;
};

const EMPTY_FORM: FrameworkFormState = {
  frameworkId: '',
  name: '',
  shortName: '',
  description: '',
  category: 'security',
  region: 'Global',
  version: '',
  popular: false,
  published: true,
  tags: '',
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as FrameworkCategory[];

function tagsToString(tags: string[]) {
  return tags.join(', ');
}

function stringToTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function FrameworkCatalogAdmin() {
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [staticFrameworks, setStaticFrameworks] = useState<StaticRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FrameworkFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/settings/frameworks')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Failed to load framework catalog');
        setCatalog(data.catalog ?? []);
        setStaticFrameworks(data.staticFrameworks ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const catalogById = new Map(catalog.map((entry) => [entry.frameworkId, entry]));
    const staticRows = staticFrameworks.map((framework) => {
      const entry = catalogById.get(framework.id);
      return {
        frameworkId: framework.id,
        name: entry?.name ?? framework.name,
        shortName: entry?.shortName ?? framework.shortName,
        category: entry?.category ?? framework.category,
        source: entry?.source ?? ('builtin' as const),
        published: entry?.published ?? true,
        popular: entry?.popular ?? framework.popular,
        region: entry?.region ?? framework.region,
        version: entry?.version ?? framework.version,
        description: entry?.description ?? framework.description,
        tags: entry?.tags ?? framework.tags,
        editable: true,
      };
    });

    const customRows = catalog
      .filter((entry) => entry.source === 'custom' && !staticFrameworks.some((item) => item.id === entry.frameworkId))
      .map((entry) => ({
        frameworkId: entry.frameworkId,
        name: entry.name,
        shortName: entry.shortName,
        category: entry.category,
        source: entry.source,
        published: entry.published,
        popular: entry.popular,
        region: entry.region,
        version: entry.version,
        description: entry.description,
        tags: entry.tags,
        editable: true,
      }));

    return [...staticRows, ...customRows].sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog, staticFrameworks]);

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (frameworkId: string) => {
    const entry = catalog.find((item) => item.frameworkId === frameworkId);
    const builtIn = staticFrameworks.find((item) => item.id === frameworkId);
    const row = rows.find((item) => item.frameworkId === frameworkId);
    if (!row) return;

    setMode('edit');
    setEditingId(frameworkId);
    setForm({
      frameworkId,
      name: entry?.name ?? builtIn?.name ?? row.name,
      shortName: entry?.shortName ?? builtIn?.shortName ?? row.shortName,
      description: entry?.description ?? builtIn?.description ?? row.description,
      category: entry?.category ?? builtIn?.category ?? row.category,
      region: entry?.region ?? builtIn?.region ?? row.region,
      version: entry?.version ?? builtIn?.version ?? row.version,
      popular: entry?.popular ?? builtIn?.popular ?? row.popular,
      published: entry?.published ?? row.published,
      tags: tagsToString(entry?.tags ?? builtIn?.tags ?? row.tags),
    });
  };

  const closeForm = () => {
    setMode('list');
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const saveForm = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        tags: stringToTags(form.tags),
      };

      const response =
        mode === 'create'
          ? await fetch('/api/settings/frameworks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/settings/frameworks/${editingId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to save framework');
      closeForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save framework');
    } finally {
      setSaving(false);
    }
  };

  const hideOrDelete = async (frameworkId: string, source: string) => {
    if (!confirm(source === 'custom' ? 'Delete this custom framework?' : 'Hide this built-in framework from the library?')) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/settings/frameworks/${frameworkId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to update framework');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update framework');
    } finally {
      setSaving(false);
    }
  };

  const restoreBuiltIn = async (frameworkId: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/settings/frameworks/${frameworkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to restore framework');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore framework');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Framework catalog (admin)</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add custom frameworks or edit built-in metadata. Changes appear in the{' '}
            <Link href="/frameworks" className="text-brand-600 hover:underline">
              Framework Library
            </Link>
            .
          </p>
        </div>
        {mode === 'list' && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Add framework
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {mode !== 'list' && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {mode === 'create' ? 'New framework' : `Edit ${editingId}`}
            </h3>
            <button type="button" onClick={closeForm} className="text-slate-500 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Framework ID">
              <input
                value={form.frameworkId}
                onChange={(e) => setForm((prev) => ({ ...prev, frameworkId: e.target.value }))}
                disabled={mode === 'edit'}
                placeholder="e.g. un-r157"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
              />
            </Field>
            <Field label="Short name">
              <input
                value={form.shortName}
                onChange={(e) => setForm((prev) => ({ ...prev, shortName: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Name" className="md:col-span-2">
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value as FrameworkCategory }))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Region">
              <input
                value={form.region}
                onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Version">
              <input
                value={form.version}
                onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Tags (comma-separated)" className="md:col-span-2">
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.popular}
                onChange={(e) => setForm((prev) => ({ ...prev, popular: e.target.checked }))}
              />
              Mark as popular
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
              />
              Published in library
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={saveForm}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save framework
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading framework catalog…
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Framework</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.frameworkId} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    <div className="text-xs text-slate-500">{row.frameworkId}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{CATEGORY_LABELS[row.category]}</td>
                  <td className="px-3 py-3">
                    <SourceBadge source={row.source} />
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        row.published
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {row.published ? 'Published' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row.frameworkId)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!row.published && row.source !== 'custom' && (
                        <button
                          type="button"
                          onClick={() => restoreBuiltIn(row.frameworkId)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => hideOrDelete(row.frameworkId, row.source)}
                        className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50"
                        title={row.source === 'custom' ? 'Delete' : 'Hide'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SourceBadge({ source }: { source: 'custom' | 'builtin_override' | 'builtin' }) {
  const label =
    source === 'custom' ? 'Custom' : source === 'builtin_override' ? 'Built-in override' : 'Built-in';
  const className =
    source === 'custom'
      ? 'bg-violet-50 text-violet-700'
      : source === 'builtin_override'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-slate-600';

  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
}
