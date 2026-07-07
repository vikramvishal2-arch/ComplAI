import { NextResponse } from 'next/server';
import { getEdgeCacheStats } from '@/lib/ill/cache/edge-cache';
import { getLastSyncAt } from '@/lib/ill/cache/sync';
import { INSPECTION_METHOD_DECISION, getIllConfig } from '@/lib/ill/config';
import { auditGatewayResponse, withIllGateway } from '@/lib/ill/gateway';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  return withIllGateway(request, '/v1/ill/pilot/status', async (ctx) => {
    const config = getIllConfig();
    const [iocCount, circuitCount, decisionCount, recentBlocks] = await Promise.all([
      prisma.threatIoc.count({ where: { blacklisted: true } }),
      prisma.illCircuit.count({ where: { active: true } }),
      prisma.illPolicyDecision.count(),
      prisma.illPolicyDecision.count({
        where: {
          verdict: 'block',
          checkedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const response = NextResponse.json({
      pilot: {
        status: config.enabled ? 'active' : 'disabled',
        nsp_targets: ['Bharti Airtel', 'Vodafone Idea'],
        cloud_region: config.cloudRegion,
        inspection_method: config.inspectionMethod,
        default_fail_mode: config.defaultFailMode,
      },
      metrics: {
        blacklisted_iocs: iocCount,
        active_circuits: circuitCount,
        total_decisions: decisionCount,
        blocks_last_24h: recentBlocks,
        edge_cache: getEdgeCacheStats(),
        last_cache_sync: getLastSyncAt(),
      },
      inspection: INSPECTION_METHOD_DECISION,
    });
    await auditGatewayResponse(ctx, '/v1/ill/pilot/status', response, { clientId: ctx.clientId });
    return response;
  });
}
