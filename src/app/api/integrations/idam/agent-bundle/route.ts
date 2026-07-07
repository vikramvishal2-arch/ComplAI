import { NextResponse } from 'next/server';
import { prepareAgentInstallBundle } from '@/lib/db/idam-integration-repository';

export async function POST() {
  try {
    const bundle = await prepareAgentInstallBundle();
    return NextResponse.json({ ok: true, bundle });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to prepare agent bundle';
    console.error('POST /api/integrations/idam/agent-bundle', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
