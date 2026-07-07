import { NextResponse } from 'next/server';
import { auditGatewayResponse, validateThreatCheckInput, withIllGateway } from '@/lib/ill/gateway';
import { performThreatLookup } from '@/lib/ill/services/threat-lookup';

export async function GET(request: Request) {
  return withIllGateway(request, '/v1/threat-check', async (ctx) => {
    const { searchParams } = new URL(request.url);
    const input = validateThreatCheckInput(searchParams);
    if (!input.ok) {
      const response = NextResponse.json({ error: input.error }, { status: 400 });
      await auditGatewayResponse(ctx, '/v1/threat-check', response, { clientId: ctx.clientId });
      return response;
    }

    const result = await performThreatLookup(input);
    const response = NextResponse.json(result);
    await auditGatewayResponse(ctx, '/v1/threat-check', response, {
      clientId: ctx.clientId,
      ip: input.ip,
      url: input.url,
      verdict: result.blacklisted ? 'malicious' : 'clean',
    });
    return response;
  });
}
