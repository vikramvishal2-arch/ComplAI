import { NextResponse } from 'next/server';
import {
  getIntegrationCatalogStats,
  getIntegrationDomains,
  getIntegrationTools,
  type IntegrationDomain,
} from '@/lib/data/integration-catalog';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') as IntegrationDomain | null;

    const tools = getIntegrationTools(domain ?? undefined);
    const domains = getIntegrationDomains();
    const stats = getIntegrationCatalogStats();

    return NextResponse.json({ tools, domains, stats });
  } catch (error) {
    console.error('GET /api/integrations', error);
    return NextResponse.json({ error: 'Failed to load integrations' }, { status: 503 });
  }
}
