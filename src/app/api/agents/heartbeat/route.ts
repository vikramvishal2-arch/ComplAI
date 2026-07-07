import { NextResponse } from 'next/server';
import { recordAgentHeartbeat } from '@/lib/db/idam-integration-repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agentId = String(body.agentId ?? '').trim();
    const agentSecret = String(body.agentSecret ?? '').trim();

    if (!agentId || !agentSecret) {
      return NextResponse.json({ error: 'agentId and agentSecret are required' }, { status: 400 });
    }

    const result = await recordAgentHeartbeat(agentId, agentSecret);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Heartbeat failed';
    console.error('POST /api/agents/heartbeat', error);
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
