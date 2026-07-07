'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PRODUCT_NAME, ORGANIZATION_NAME } from '@/lib/brand';
import { MODULES_WITH_COUNTS } from '@/lib/data/program-stats';
import type { PrivacyFrameworkId } from '@/lib/types';

const JURISDICTIONS = [
  { value: 'india', label: 'India (DPDP Act)' },
  { value: 'eu', label: 'European Union (GDPR)' },
  { value: 'us', label: 'United States' },
  { value: 'global', label: 'Global / Multi-jurisdiction' },
] as const;

const STORAGE_KEY = 'privycore-settings';

type FrameworkRow = {
  id: PrivacyFrameworkId;
  shortName: string;
  activated: boolean;
};

type SettingsState = {
  organizationName: string;
  jurisdiction: string;
};

const DEFAULT_SETTINGS: SettingsState = {
  organizationName: ORGANIZATION_NAME,
  jurisdiction: 'india',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [frameworks, setFrameworks] = useState<FrameworkRow[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadFrameworks = () => {
    fetch('/api/frameworks')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Failed to load frameworks');
        setFrameworks(
          (d.frameworks ?? []).map((f: FrameworkRow) => ({
            id: f.id,
            shortName: f.shortName,
            activated: f.activated,
          }))
        );
      })
      .catch((err: Error) => setFetchError(err.message));
  };

  useEffect(() => {
    fetch('/api/settings')
      .then(async (r) => {
        const d = await r.json();
        if (r.ok && d.organizationName) {
          setSettings((prev) => ({ ...prev, organizationName: d.organizationName }));
        }
      })
      .catch(() => {});
    loadFrameworks();
  }, []);

  const save = async () => {
    setFetchError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName: settings.organizationName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const toggleFramework = async (id: PrivacyFrameworkId, activated: boolean) => {
    setLoading(id);
    setFetchError(null);
    try {
      const res = await fetch('/api/frameworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameworkId: id, action: activated ? 'deactivate' : 'activate' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update framework');
      loadFrameworks();
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to update framework');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Configure your privacy program scope and organizational context"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {fetchError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {fetchError}. Run <code className="font-mono text-xs">npm run db:setup</code> in privacy-platform.
          </div>
        )}

        <section className="privacy-card">
          <h2 className="font-semibold text-zinc-900">Organization</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {PRODUCT_NAME} is a standalone privacy platform by {ORGANIZATION_NAME}, separate from
            ComplAI GRC.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-500">Organization name</span>
              <input
                type="text"
                placeholder="Your organization"
                value={settings.organizationName}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, organizationName: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-500">Primary jurisdiction</span>
              <select
                value={settings.jurisdiction}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, jurisdiction: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="privacy-card">
          <h2 className="font-semibold text-zinc-900">Active frameworks</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Toggle which regulatory frameworks are active for your program. Changes persist to the database.
          </p>
          <ul className="mt-4 space-y-2">
            {frameworks.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => toggleFramework(f.id, f.activated)}
                  disabled={loading === f.id}
                  className="flex w-full items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-left text-sm transition-colors hover:border-brand-200 hover:bg-brand-50/50 disabled:opacity-60"
                >
                  <span className="font-medium text-zinc-800">{f.shortName}</span>
                  <span
                    className={`text-xs font-medium ${f.activated ? 'text-emerald-600' : 'text-zinc-400'}`}
                  >
                    {loading === f.id ? 'Updating...' : f.activated ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="privacy-card">
          <h2 className="font-semibold text-zinc-900">Enabled modules</h2>
          <p className="mt-1 text-sm text-zinc-500">{MODULES_WITH_COUNTS.length} privacy modules active.</p>
          <ul className="mt-4 grid gap-1 sm:grid-cols-2">
            {MODULES_WITH_COUNTS.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/modules/${m.id}`}
                  className="block rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-brand-50 hover:text-brand-700"
                >
                  ✓ {m.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-3">
          <button type="button" onClick={save} className="app-primary-btn rounded-lg px-4 py-2 text-sm font-medium">
            Save settings
          </button>
          {saved && <span className="text-sm text-emerald-600">Settings saved.</span>}
        </div>
      </div>
    </AppShell>
  );
}
