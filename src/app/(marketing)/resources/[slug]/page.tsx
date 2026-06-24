import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import {
  getAllFrameworkGuideSlugs,
  getFrameworkGuide,
} from '@/lib/data/marketing-resources';
import { PRODUCT_NAME } from '@/lib/brand';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllFrameworkGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getFrameworkGuide(slug);
  if (!guide) return { title: 'Resource not found' };
  return {
    title: `${guide.title} | ${PRODUCT_NAME} Resources`,
    description: guide.tagline,
  };
}

export default async function FrameworkGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getFrameworkGuide(slug);
  if (!guide) notFound();

  return (
    <MarketingShell>
      <article className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/resources#frameworks"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-scrut-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            All framework guides
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-scrut-teal">
            {guide.shortName} Hub
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-scrut-navy sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{guide.tagline}</p>

          <div className="prose prose-slate mt-10 max-w-none">
            <Section title="Overview">{guide.overview}</Section>
            <Section title="Who needs it?">{guide.whoNeedsIt}</Section>

            <h2 className="text-xl font-bold text-scrut-navy">Key topics</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              {guide.keyTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>

            <Section title="Typical timeline">{guide.auditTimeline}</Section>

            <h2 className="mt-10 text-xl font-bold text-scrut-navy">
              How {PRODUCT_NAME} helps
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              {guide.howComplAIHelps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-slate-200 pt-10">
            <ScrutPrimaryButton href="/company?contact=1">
              Talk to us about {guide.shortName}
              <ArrowRight className="h-4 w-4" />
            </ScrutPrimaryButton>
            <Link
              href="/resources#faqs"
              className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-scrut-navy hover:bg-slate-50"
            >
              View FAQs
            </Link>
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-scrut-navy">{title}</h2>
      <p className="mt-3 leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
