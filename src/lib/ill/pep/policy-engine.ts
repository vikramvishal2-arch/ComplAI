import { getIllConfig, type FailMode } from '@/lib/ill/config';
import { performThreatLookup } from '@/lib/ill/services/threat-lookup';
import { getCircuit, logPolicyDecision } from '@/lib/ill/threat-db/repository';
import type { PolicyDecision, TrafficInspectionPayload } from '@/lib/ill/types';
import { extractDomain } from '@/lib/ill/utils';

async function resolveFailMode(circuitId: string): Promise<FailMode> {
  const circuit = await getCircuit(circuitId);
  if (circuit?.failMode === 'fail_closed') return 'fail_closed';
  const { defaultFailMode } = getIllConfig();
  return defaultFailMode;
}

export async function evaluateTrafficPolicy(
  payload: TrafficInspectionPayload
): Promise<PolicyDecision> {
  const checkedAt = new Date().toISOString();
  const failMode = await resolveFailMode(payload.circuit_id);
  const domain = payload.domain ?? (payload.url ? extractDomain(payload.url) : undefined);

  try {
    const checks = await Promise.all([
      performThreatLookup({
        ip: payload.src_ip,
        url: payload.url,
        domain: domain ?? undefined,
      }),
      payload.dest_ip
        ? performThreatLookup({
            ip: payload.dest_ip,
            url: payload.url,
            domain: domain ?? undefined,
          })
        : Promise.resolve(null),
    ]);

    const threat =
      checks.find((c) => c?.blacklisted) ??
      checks.find((c) => c !== null) ??
      checks[0];

    const verdict = threat.blacklisted ? 'block' : 'allow';
    const reason = threat.blacklisted
      ? `Blacklisted ${threat.category ?? 'threat'} from feed ${threat.source_feed ?? 'unknown'}`
      : 'Not found in threat intel blacklist';

    await logPolicyDecision({
      circuitId: payload.circuit_id,
      srcIp: payload.src_ip,
      destIp: payload.dest_ip,
      url: payload.url,
      domain: domain ?? undefined,
      verdict,
      reason,
      cacheHit: Boolean(threat.cache_hit),
    });

    return {
      circuit_id: payload.circuit_id,
      src_ip: payload.src_ip,
      dest_ip: payload.dest_ip,
      url: payload.url,
      domain: domain ?? undefined,
      verdict,
      reason,
      threat,
      cache_hit: Boolean(threat.cache_hit),
      fail_mode: failMode,
      checked_at: checkedAt,
    };
  } catch (error) {
    const allowOnFailure = failMode === 'fail_open';
    const verdict = allowOnFailure ? 'allow' : 'block';
    const reason =
      error instanceof Error
        ? `Policy engine error (${failMode}): ${error.message}`
        : `Policy engine error (${failMode})`;

    await logPolicyDecision({
      circuitId: payload.circuit_id,
      srcIp: payload.src_ip,
      destIp: payload.dest_ip,
      url: payload.url,
      domain: domain ?? undefined,
      verdict,
      reason,
      cacheHit: false,
    });

    return {
      circuit_id: payload.circuit_id,
      src_ip: payload.src_ip,
      dest_ip: payload.dest_ip,
      url: payload.url,
      domain: domain ?? undefined,
      verdict,
      reason,
      cache_hit: false,
      fail_mode: failMode,
      checked_at: checkedAt,
    };
  }
}
