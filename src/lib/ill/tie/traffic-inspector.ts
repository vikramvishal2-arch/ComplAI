import { INSPECTION_METHOD_DECISION, getIllConfig } from '@/lib/ill/config';
import { evaluateTrafficPolicy } from '@/lib/ill/pep/policy-engine';
import type { PolicyDecision, TrafficInspectionPayload } from '@/lib/ill/types';
import { extractDomain, isValidIpv4 } from '@/lib/ill/utils';

export interface InspectionResult {
  payload: TrafficInspectionPayload;
  inspection_method: string;
  method_notes: string;
  extracted: {
    src_ip: string;
    dest_ip?: string;
    url?: string;
    domain?: string;
  };
  decision: PolicyDecision;
}

export function extractTrafficFields(raw: TrafficInspectionPayload): {
  ok: true;
  payload: TrafficInspectionPayload;
} | { ok: false; error: string } {
  const circuitId = raw.circuit_id?.trim();
  const srcIp = raw.src_ip?.trim();

  if (!circuitId) return { ok: false, error: 'circuit_id is required' };
  if (!srcIp || !isValidIpv4(srcIp)) return { ok: false, error: 'Valid src_ip is required' };

  const destIp = raw.dest_ip?.trim();
  if (destIp && !isValidIpv4(destIp)) return { ok: false, error: 'dest_ip must be a valid IPv4 address' };

  const url = raw.url?.trim() || undefined;
  const domain = raw.domain?.trim() ?? (url ? extractDomain(url) : undefined) ?? undefined;

  return {
    ok: true,
    payload: {
      circuit_id: circuitId,
      src_ip: srcIp,
      dest_ip: destIp,
      url,
      domain,
      direction: raw.direction,
    },
  };
}

export async function inspectAndEnforce(
  raw: TrafficInspectionPayload
): Promise<InspectionResult | { error: string }> {
  const extracted = extractTrafficFields(raw);
  if (!extracted.ok) return { error: extracted.error };

  const { inspectionMethod } = getIllConfig();
  const decision = await evaluateTrafficPolicy(extracted.payload);

  return {
    payload: extracted.payload,
    inspection_method: inspectionMethod,
    method_notes: INSPECTION_METHOD_DECISION.rationale,
    extracted: {
      src_ip: extracted.payload.src_ip,
      dest_ip: extracted.payload.dest_ip,
      url: extracted.payload.url,
      domain: extracted.payload.domain,
    },
    decision,
  };
}
