import { NextResponse } from 'next/server';
import { getIntegrationToolById } from '@/lib/data/integration-catalog';
import { buildIntegrationGuide } from '@/lib/data/integration-guides';

type RouteContext = { params: Promise<{ toolId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { toolId } = await context.params;
    const tool = getIntegrationToolById(toolId);
    if (!tool) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }
    const guide = buildIntegrationGuide(tool);
    return NextResponse.json({ tool, guide });
  } catch (error) {
    console.error('GET /api/integrations/[toolId]/guide', error);
    return NextResponse.json({ error: 'Failed to load guide' }, { status: 503 });
  }
}
