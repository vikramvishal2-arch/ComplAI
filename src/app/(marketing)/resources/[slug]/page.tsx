import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { ScrutOutlineButton, ScrutPrimaryButton } from '@/components/marketing/marketing-ui';
import {
  getAllFrameworkGuideSlugs,
  getFrameworkGuide,
} from '@/lib/data/marketing-resources';
import { ComplAIBrandLink, ComplAIText } from '@/components/marketing/complai-brand-link';
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
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-scrut-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            All framework guides
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-scrut-teal">
            {guide.shortName} Hub
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-3 text-lg text-zinc-400">{guide.tagline}</p>

          <div className="mt-10 max-w-none space-y-10">
            <Section title="Overview">{guide.overview}</Section>
            <Section title="Who needs it?">{guide.whoNeedsIt}</Section>

            <div>
              <h2 className="text-xl font-bold text-zinc-100">Key topics</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
                {guide.keyTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>

            <Section title="Typical timeline">{guide.auditTimeline}</Section>

            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                How <ComplAIBrandLink inheritWeight className="text-xl" /> helps
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
                {guide.howComplAIHelps.map((item) => (
                  <li key={item}>
                    <ComplAIText>{item}</ComplAIText>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-10">
            <ScrutPrimaryButton href="/company?contact=1">
              Talk to us about {guide.shortName}
              <ArrowRight className="h-4 w-4" />
            </ScrutPrimaryButton>
            <ScrutOutlineButton href="/resources#faqs">View FAQs</ScrutOutlineButton>
          </div>
        </div>
      </article>
    </MarketingShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
      <p className="mt-3 leading-relaxed text-zinc-400">{children}</p>
    </div>
  );
}
