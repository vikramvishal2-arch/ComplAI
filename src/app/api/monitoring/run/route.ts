import { NextResponse } from 'next/server';
import { getAwsMonitorConfig, getAzureMonitorConfig } from '@/lib/monitoring/config';
import { executeMonitorRun } from '@/lib/monitoring/runner';
import { requireCronOrDemoAdmin } from '@/lib/server/require-demo-admin';

/**
 * POST /api/monitoring/run
 *
 * Triggers an AWS/Azure monitoring check run.
 * Authorize with `Authorization: Bearer <CRON_SECRET>` / `X-Cron-Secret`,
 * or a demo admin session.
 */
export async function POST(request: Request) {
  const gate = await requireCronOrDemoAdmin(request);
  if ('error' in gate) return gate.error;

  try {
    const body = await request.json();
    const provider = body.provider as 'aws' | 'azure';

    if (provider !== 'aws' && provider !== 'azure') {
      return NextResponse.json({ error: 'provider must be aws or azure' }, { status: 400 });
    }

    const config = provider === 'aws' ? getAwsMonitorConfig() : getAzureMonitorConfig();
    if (!config.configured) {
      return NextResponse.json(
        {
          error: `${provider.toUpperCase()} monitoring not configured. See .env.example for lab credentials.`,
        },
        { status: 400 }
      );
    }

    const summary = await executeMonitorRun(provider);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('POST /api/monitoring/run', error);
    const message = error instanceof Error ? error.message : 'Monitoring run failed';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
