'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Download, Save } from 'lucide-react';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('');
  const [frameworkCount, setFrameworkCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setOrgName(d.organizationName));
    fetch('/api/frameworks')
      .then((r) => r.json())
      .then((d) => setFrameworkCount(d.frameworks.length));
  }, []);

  const saveOrg = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationName: orgName }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Organization profile and compliance exports"
    >
      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Organization</h2>
          <p className="mt-1 text-sm text-slate-500">
            Customer tenant — each organization manages its own framework activations and
            compliance plans
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Organization name</label>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={saveOrg}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Export compliance plans</h2>
          <p className="mt-1 text-sm text-slate-500">
            Download how your organization plans to comply with each control — for internal
            review or auditor handoff
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/api/export?format=json"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> JSON export
            </a>
            <a
              href="/api/export?format=csv"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Download className="h-4 w-4" /> CSV export
            </a>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Framework library</h2>
          <p className="mt-1 text-sm text-slate-500">
            {frameworkCount} prebuilt security and privacy frameworks included in this MVP
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Activate frameworks from the{' '}
            <a href="/frameworks" className="text-brand-600 hover:underline">
              Framework Library
            </a>
            , then define per-control compliance in{' '}
            <a href="/controls" className="text-brand-600 hover:underline">
              Controls
            </a>
            .
          </p>
        </section>

        <section className="rounded-xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="font-semibold text-brand-900">Intelligence (AI & integrations)</h2>
          <p className="mt-1 text-sm text-brand-800">
            Scrut-style capabilities: gap analysis, AI copilot, and questionnaire auto-fill.
          </p>
          <a
            href="/intelligence"
            className="mt-3 inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Open Intelligence hub
          </a>
          <ul className="mt-4 space-y-1 text-sm text-brand-800">
            <li>• Gap analysis — active without API key</li>
            <li>• Questionnaire auto-fill — rule-based + optional AI polish</li>
            <li>• AI Copilot — free via Ollama, or Groq/OpenAI API key</li>
          </ul>
        </section>

        <section className="rounded-xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="font-semibold text-brand-900">Sellable MVP scope</h2>
          <ul className="mt-3 space-y-2 text-sm text-brand-800">
            <li>• Full framework library (Scrut-style coverage)</li>
            <li>• Customer chooses compliance method per control</li>
            <li>• Implementation approach narrative for audit readiness</li>
            <li>• Framework activation per customer need</li>
            <li>• Compliance plan export (JSON / CSV)</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
