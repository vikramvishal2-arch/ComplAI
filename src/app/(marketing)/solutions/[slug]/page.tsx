import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { SolutionDetailContent } from '@/components/marketing/solution-detail-content';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';
import {
  getAllSolutionSlugs,
  getSolutionGuide,
} from '@/lib/data/marketing-solutions';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSolutionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolutionGuide(slug);
  if (!solution) return { title: 'Solution not found' };
  return {
    title: `${solution.title} — ${PRODUCT_NAME} | ${ORGANIZATION_NAME}`,
    description: solution.description,
  };
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const solution = getSolutionGuide(slug);
  if (!solution) notFound();

  return (
    <MarketingShell>
      <SolutionDetailContent solution={solution} />
    </MarketingShell>
  );
}
