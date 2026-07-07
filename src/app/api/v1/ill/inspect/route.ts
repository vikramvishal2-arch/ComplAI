import { NextResponse } from 'next/server';
import { auditGatewayResponse, withIllGateway } from '@/lib/ill/gateway';
import { inspectAndEnforce } from '@/lib/ill/tie/traffic-inspector';
import type { TrafficInspectionPayload } from '@/lib/ill/types';

export async function POST(request: Request) {
  return withIllGateway(request, '/v1/ill/inspect', async (ctx) => {
    let body: TrafficInspectionPayload;
    try {
      body = (await request.json()) as TrafficInspectionPayload;
    } catch {
      const response = NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      await auditGatewayResponse(ctx, '/v1/ill/inspect', response, { clientId: ctx.clientId });
      return response;
    }

    const result = await inspectAndEnforce(body);
    if ('error' in result) {
      const response = NextResponse.json({ error: result.error }, { status: 400 });
      await auditGatewayResponse(ctx, '/v1/ill/inspect', response, { clientId: ctx.clientId });
      return response;
    }

    const response = NextResponse.json(result);
    await auditGatewayResponse(ctx, '/v1/ill/inspect', response, {
      clientId: ctx.clientId,
      ip: result.extracted.src_ip,
      url: result.extracted.url,
      verdict: result.decision.verdict,
    });
    return response;
  });
}
