import { NextResponse } from 'next/server';
import { enrollEndpointAgent } from '@/lib/db/idam-integration-repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enrollmentToken = String(body.enrollmentToken ?? '').trim();
    const hostname = String(body.hostname ?? '').trim() || 'unknown-host';
    const platform = String(body.platform ?? '').trim() || 'unknown';
    const agentVersion = body.agentVersion ? String(body.agentVersion) : undefined;

    if (!enrollmentToken) {
      return NextResponse.json({ error: 'enrollmentToken is required' }, { status: 400 });
    }

    const result = await enrollEndpointAgent({
      enrollmentToken,
      hostname,
      platform,
      agentVersion,
    });

    return NextResponse.json({
      ok: true,
      ...result,
      configUrl: `/api/agents/config`,
      heartbeatUrl: `/api/agents/heartbeat`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Enrollment failed';
    console.error('POST /api/agents/enroll', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
