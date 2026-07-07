import { NextResponse } from 'next/server';
import { validateGatewayApiKey, validateThreatCheckInput } from '@/lib/ill/gateway/auth';
import { writeGatewayAuditLog } from '@/lib/ill/gateway/audit-log';
import { checkRateLimit } from '@/lib/ill/gateway/rate-limit';
import type { GatewayContext } from '@/lib/ill/types';
import { generateRequestId } from '@/lib/ill/utils';

export function createGatewayContext(request: Request): GatewayContext {
  return {
    requestId: request.headers.get('x-request-id')?.trim() || generateRequestId(),
    startTime: Date.now(),
  };
}

export async function withIllGateway(
  request: Request,
  endpoint: string,
  handler: (ctx: GatewayContext & { clientId: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  const ctx = createGatewayContext(request);
  const auth = validateGatewayApiKey(request);

  if (!auth.ok) {
    await writeGatewayAuditLog({
      requestId: ctx.requestId,
      endpoint,
      statusCode: 401,
      latencyMs: Date.now() - ctx.startTime,
    });
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const rate = checkRateLimit(auth.clientId);
  if (!rate.allowed) {
    await writeGatewayAuditLog({
      requestId: ctx.requestId,
      endpoint,
      clientId: auth.clientId,
      statusCode: 429,
      latencyMs: Date.now() - ctx.startTime,
    });
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const response = await handler({ ...ctx, clientId: auth.clientId });
  return response;
}

export async function auditGatewayResponse(
  ctx: GatewayContext,
  endpoint: string,
  response: NextResponse,
  meta?: { clientId?: string; ip?: string; url?: string; verdict?: string }
) {
  await writeGatewayAuditLog({
    requestId: ctx.requestId,
    endpoint,
    clientId: meta?.clientId,
    ip: meta?.ip,
    url: meta?.url,
    statusCode: response.status,
    verdict: meta?.verdict,
    latencyMs: Date.now() - ctx.startTime,
  });
}

export { validateThreatCheckInput };
