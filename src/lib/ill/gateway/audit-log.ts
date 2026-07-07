import { prisma } from '@/lib/db/prisma';

export async function writeGatewayAuditLog(input: {
  requestId: string;
  endpoint: string;
  clientId?: string;
  ip?: string;
  url?: string;
  statusCode: number;
  verdict?: string;
  latencyMs?: number;
}) {
  try {
    await prisma.threatGatewayAuditLog.create({
      data: {
        requestId: input.requestId,
        endpoint: input.endpoint,
        clientId: input.clientId,
        ip: input.ip,
        url: input.url,
        statusCode: input.statusCode,
        verdict: input.verdict,
        latencyMs: input.latencyMs,
      },
    });
  } catch (error) {
    console.error('Failed to write gateway audit log', error);
  }
}
