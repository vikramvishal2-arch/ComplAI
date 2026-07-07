import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { IntegrationHelpGuideArticle } from '@/components/marketing/integration-help-guide-article';
import { INTEGRATION_TOOLS, getIntegrationToolById } from '@/lib/data/integration-catalog';
import { buildIntegrationGuide } from '@/lib/data/integration-guides';
import { ORGANIZATION_NAME, PRODUCT_NAME } from '@/lib/brand';

type PageProps = {
  params: Promise<{ toolId: string }>;
};

export function generateStaticParams() {
  return INTEGRATION_TOOLS.map((tool) => ({ toolId: tool.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { toolId } = await params;
  const tool = getIntegrationToolById(toolId);
  if (!tool) return { title: 'Integration guide not found' };
  return {
    title: `${tool.name} — Help Center | ${ORGANIZATION_NAME}`,
    description: `${tool.description} Setup guide, product details, and GRC evidence mapping for connecting ${tool.name} to ${PRODUCT_NAME}.`,
  };
}

export default async function IntegrationGuidePage({ params }: PageProps) {
  const { toolId } = await params;
  const tool = getIntegrationToolById(toolId);
  if (!tool) notFound();

  const guide = buildIntegrationGuide(tool);

  return (
    <MarketingShell>
      <IntegrationHelpGuideArticle tool={tool} guide={guide} />
    </MarketingShell>
  );
}
