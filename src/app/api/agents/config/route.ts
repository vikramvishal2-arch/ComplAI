import { NextResponse } from 'next/server';
import { getAgentConfig } from '@/lib/db/idam-integration-repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId')?.trim();
    const agentSecret = searchParams.get('agentSecret')?.trim();

    if (!agentId || !agentSecret) {
      return NextResponse.json({ error: 'agentId and agentSecret are required' }, { status: 400 });
    }

    const config = await getAgentConfig(agentId, agentSecret);
    return NextResponse.json({ ok: true, config });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load agent config';
    console.error('GET /api/agents/config', error);
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
