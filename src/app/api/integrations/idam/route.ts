import { NextResponse } from 'next/server';
import {
  connectIdamTool,
  getIdamIntegrationOverview,
} from '@/lib/db/idam-integration-repository';
import { requireDemoAdmin, requireDemoSession } from '@/lib/server/require-demo-admin';

export async function GET() {
  const auth = await requireDemoSession();
  if ('error' in auth) return auth.error;

  try {
    const overview = await getIdamIntegrationOverview();
    return NextResponse.json(overview);
  } catch (error) {
    console.error('GET /api/integrations/idam', error);
    return NextResponse.json({ error: 'Failed to load IDAM integrations' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await requireDemoAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const action = body.action as string;
    const toolId = body.toolId as string;
    const credentials = (body.credentials ?? {}) as Record<string, string>;

    if (!toolId) {
      return NextResponse.json({ error: 'toolId is required' }, { status: 400 });
    }

    if (action === 'test' || action === 'connect') {
      const result = await connectIdamTool({
        toolId,
        credentials,
        adminContact: body.adminContact,
        notes: body.notes,
        action,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'IDAM integration request failed';
    console.error('POST /api/integrations/idam', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
