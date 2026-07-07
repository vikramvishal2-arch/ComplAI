import { NextResponse } from 'next/server';
import { auditGatewayResponse, withIllGateway } from '@/lib/ill/gateway';
import { performBulkThreatLookup } from '@/lib/ill/services/threat-lookup';
import type { BulkCheckRequest } from '@/lib/ill/types';

export async function POST(request: Request) {
  return withIllGateway(request, '/v1/bulk-check', async (ctx) => {
    let body: BulkCheckRequest;
    try {
      body = (await request.json()) as BulkCheckRequest;
    } catch {
      const response = NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      await auditGatewayResponse(ctx, '/v1/bulk-check', response, { clientId: ctx.clientId });
      return response;
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      const response = NextResponse.json({ error: 'items array is required' }, { status: 400 });
      await auditGatewayResponse(ctx, '/v1/bulk-check', response, { clientId: ctx.clientId });
      return response;
    }

    if (body.items.length > 100) {
      const response = NextResponse.json({ error: 'Maximum 100 items per request' }, { status: 400 });
      await auditGatewayResponse(ctx, '/v1/bulk-check', response, { clientId: ctx.clientId });
      return response;
    }

    const results = await performBulkThreatLookup(body.items);
    const response = NextResponse.json({
      results,
      checked_at: new Date().toISOString(),
    });
    await auditGatewayResponse(ctx, '/v1/bulk-check', response, {
      clientId: ctx.clientId,
      verdict: results.some((r) => r.blacklisted) ? 'malicious' : 'clean',
    });
    return response;
  });
}
