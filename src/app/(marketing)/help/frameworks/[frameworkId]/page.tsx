import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { FrameworkHelpGuideArticle } from '@/components/marketing/framework-help-guide-article';
import { FRAMEWORKS, getFrameworkById } from '@/lib/data/frameworks';
import { buildFrameworkGuide } from '@/lib/data/framework-guides';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

type PageProps = {
  params: Promise<{ frameworkId: string }>;
};

export function generateStaticParams() {
  return FRAMEWORKS.map((fw) => ({ frameworkId: fw.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { frameworkId } = await params;
  const framework = getFrameworkById(frameworkId);
  if (!framework) return { title: 'Framework guide not found' };
  return {
    title: `${framework.shortName} — Help Center | ${ORGANIZATION_NAME}`,
    description: `${framework.description} Learn how to implement ${framework.name} with ${PRODUCT_NAME} on the Propel Ready Solutions Help Center.`,
  };
}

export default async function FrameworkHelpGuidePage({ params }: PageProps) {
  const { frameworkId } = await params;
  const framework = getFrameworkById(frameworkId);
  if (!framework) notFound();

  const guide = buildFrameworkGuide(framework);

  return (
    <MarketingShell>
      <FrameworkHelpGuideArticle framework={framework} guide={guide} />
    </MarketingShell>
  );
}
