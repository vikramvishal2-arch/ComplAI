import { NextResponse } from 'next/server';
import { syncEdgeCacheFromDb } from '@/lib/ill/cache/sync';
import { auditGatewayResponse, withIllGateway } from '@/lib/ill/gateway';
import { syncFeedsSince } from '@/lib/ill/threat-db/repository';

export async function GET(request: Request) {
  return withIllGateway(request, '/v1/feeds/sync', async (ctx) => {
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (Number.isNaN(since.getTime())) {
      const response = NextResponse.json({ error: 'Invalid since timestamp' }, { status: 400 });
      await auditGatewayResponse(ctx, '/v1/feeds/sync', response, { clientId: ctx.clientId });
      return response;
    }

    const iocs = await syncFeedsSince(since);
    const cacheSync = await syncEdgeCacheFromDb(since);

    const response = NextResponse.json({
      since: since.toISOString(),
      synced_at: new Date().toISOString(),
      added: iocs.length,
      updated: 0,
      removed: 0,
      edge_cache_loaded: cacheSync.loaded,
      iocs,
    });
    await auditGatewayResponse(ctx, '/v1/feeds/sync', response, { clientId: ctx.clientId });
    return response;
  });
}
