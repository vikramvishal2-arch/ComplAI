'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Loader2,
  Wrench,
} from 'lucide-react';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

interface GuideData {
  tool: {
    id: string;
    name: string;
    domains: string[];
    websiteUrl: string;
    docsUrl?: string;
    helpGuidePath: string;
    helpGuideUrl: string;
    capabilities: string[];
  };
  guide: {
    overview: string;
    prerequisites: string[];
    steps: { title: string; description: string; substeps?: string[] }[];
    grcBenefits: string[];
    relatedControls: string[];
    verificationChecklist: string[];
    troubleshooting: { issue: string; resolution: string }[];
    lastUpdated: string;
  };
}

export default function IntegrationHelpGuidePage() {
  const params = useParams();
  const toolId = params.toolId as string;
  const [data, setData] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/integrations/${toolId}/guide`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? 'Guide not found');
        return d as GuideData;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [toolId]);

  if (loading) {
    return (
      <AppShell title="Integration guide" subtitle="Loading…">
        <div className="flex justify-center py-20 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Guide not found" subtitle="">
        <p className="text-sm text-slate-600">{error ?? 'Unknown integration'}</p>
        <Link href="/integrations" className="mt-4 inline-block text-brand-600 hover:underline">
          Back to integrations
        </Link>
      </AppShell>
    );
  }

  const { tool, guide } = data;

  return (
    <AppShell
      title={`${tool.name} — Integration guide`}
      subtitle={`${ORGANIZATION_NAME} help centre · ${PRODUCT_NAME}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/integrations"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All integrations
        </Link>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={tool.helpGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
            title="Public help URL on Propel Ready Solutions website"
          >
            Public help URL
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
          >
            Vendor website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-slate-700">
        <div className="flex items-start gap-2">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p>
            This guide describes how to connect <strong>{tool.name}</strong> to {PRODUCT_NAME} for
            audit-ready GRC evidence. Share the public help link with your integration team or publish
            it on the {ORGANIZATION_NAME} website.
          </p>
        </div>
      </div>

      <article className="mx-auto max-w-3xl space-y-10">
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BookOpen className="h-5 w-5 text-brand-600" />
            Overview
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{guide.overview}</p>
          <p className="mt-2 text-xs text-slate-500">Last updated: {guide.lastUpdated}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Prerequisites</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {guide.prerequisites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Integration process</h2>
          <ol className="mt-4 space-y-6">
            {guide.steps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-medium text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{step.description}</p>
                {step.substeps && step.substeps.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {step.substeps.map((sub) => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">GRC benefits</h2>
          <ul className="mt-3 space-y-2">
            {guide.grcBenefits.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Related controls</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {guide.relatedControls.map((ctrl) => (
              <span
                key={ctrl}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {ctrl}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Verification checklist</h2>
          <ul className="mt-3 space-y-2">
            {guide.verificationChecklist.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400">☐</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Wrench className="h-5 w-5 text-slate-500" />
            Troubleshooting
          </h2>
          <div className="mt-4 space-y-3">
            {guide.troubleshooting.map((item) => (
              <div
                key={item.issue}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              >
                <p className="font-medium text-slate-900">{item.issue}</p>
                <p className="mt-1 text-slate-600">{item.resolution}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Capabilities covered</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {tool.capabilities.map((cap) => (
              <li
                key={cap}
                className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-800"
              >
                {cap}
              </li>
            ))}
          </ul>
        </section>
      </article>
    </AppShell>
  );
}
