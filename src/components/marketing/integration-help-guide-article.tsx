import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Layers,
  Server,
  Wrench,
} from 'lucide-react';
import type { IntegrationGuide } from '@/lib/data/integration-guides';
import type { IntegrationTool } from '@/lib/data/integration-catalog';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import { PRODUCT_NAME } from '@/lib/brand';

type IntegrationHelpGuideArticleProps = {
  tool: IntegrationTool;
  guide: IntegrationGuide;
  backHref?: string;
  backLabel?: string;
};

export function IntegrationHelpGuideArticle({
  tool,
  guide,
  backHref = '/help',
  backLabel = 'All integration guides',
}: IntegrationHelpGuideArticleProps) {
  return (
    <article className="bg-marketing-surface py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-scrut-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-scrut-teal">
          Help Center · Integration guide
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          {tool.name}
        </h1>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-scrut-teal/20 bg-scrut-teal/[0.06] px-4 py-3 text-sm text-zinc-300">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-scrut-teal" />
          <p>
            Complete reference for <strong>{tool.name}</strong> — product details, ComplAI
            connection steps, GRC evidence mapping, and troubleshooting. All information is hosted
            in the Propel Ready Solutions Help Center.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <Layers className="h-5 w-5 text-scrut-teal" />
              Product information
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-400">{guide.productDescription}</p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Deployment
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-200">{guide.deploymentLabel}</dd>
                <dd className="mt-1 text-sm text-zinc-400">{guide.deploymentSummary}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Categories
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {guide.domainLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-zinc-300"
                    >
                      {label}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-200">Key capabilities</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {guide.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="rounded-full bg-scrut-teal/10 px-2.5 py-0.5 text-xs text-scrut-teal"
                  >
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-200">Typical use cases</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-zinc-400">
                {guide.typicalUseCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <Server className="h-5 w-5 text-scrut-teal" />
              Connection methods
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              {guide.integrationMethods.map((method) => (
                <li key={method}>{method}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <FileText className="h-5 w-5 text-scrut-teal" />
              Documentation topics
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Review the following areas in {tool.name} admin and product documentation before
              connecting to {PRODUCT_NAME}:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              {guide.documentationTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <BookOpen className="h-5 w-5 text-scrut-teal" />
              ComplAI integration overview
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-400">{guide.overview}</p>
            <p className="mt-2 text-xs text-zinc-500">Last updated: {guide.lastUpdated}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-100">GRC evidence available</h2>
            <ul className="mt-3 space-y-2">
              {guide.grcDataPoints.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-zinc-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-100">Prerequisites</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              {guide.prerequisites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-100">Integration process</h2>
            <ol className="mt-4 space-y-4">
              {guide.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-scrut-teal">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 font-semibold text-zinc-100">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{step.description}</p>
                  {step.substeps && step.substeps.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-500">
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
            <h2 className="text-xl font-bold text-zinc-100">GRC benefits</h2>
            <ul className="mt-3 space-y-2">
              {guide.grcBenefits.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-zinc-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-100">Related controls</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {guide.relatedControls.map((ctrl) => (
                <span
                  key={ctrl}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-zinc-300"
                >
                  {ctrl}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-zinc-100">Verification checklist</h2>
            <ul className="mt-3 space-y-2">
              {guide.verificationChecklist.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-zinc-400">
                  <span className="text-zinc-600">☐</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-100">
              <Wrench className="h-5 w-5 text-zinc-400" />
              Troubleshooting
            </h2>
            <div className="mt-4 space-y-3">
              {guide.troubleshooting.map((item) => (
                <div
                  key={item.issue}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-zinc-100">{item.issue}</p>
                  <p className="mt-1 text-zinc-400">{item.resolution}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-10">
          <ScrutPrimaryButton href="/company?contact=1">
            Need help connecting {tool.name}?
          </ScrutPrimaryButton>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-scrut-teal/40 hover:bg-white/5"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    </article>
  );
}
