export type InspectionMethod = 'dpi' | 'dns' | 'proxy' | 'hybrid_dpi_dns';

export type FailMode = 'fail_open' | 'fail_closed';

export type NspProvider = 'airtel' | 'vodafone' | 'jio' | 'other';

export interface IllConfig {
  enabled: boolean;
  inspectionMethod: InspectionMethod;
  defaultFailMode: FailMode;
  cacheTtlSeconds: number;
  syncIntervalMinutes: number;
  apiKey: string;
  gatewayRateLimitPerMinute: number;
  cloudRegion: string;
}

function parseInspectionMethod(value: string | undefined): InspectionMethod {
  const allowed: InspectionMethod[] = ['dpi', 'dns', 'proxy', 'hybrid_dpi_dns'];
  if (value && allowed.includes(value as InspectionMethod)) {
    return value as InspectionMethod;
  }
  return 'hybrid_dpi_dns';
}

function parseFailMode(value: string | undefined): FailMode {
  return value === 'fail_closed' ? 'fail_closed' : 'fail_open';
}

export function getIllConfig(): IllConfig {
  return {
    enabled: process.env.ILL_THREAT_ENABLED !== 'false',
    inspectionMethod: parseInspectionMethod(process.env.ILL_INSPECTION_METHOD),
    defaultFailMode: parseFailMode(process.env.ILL_DEFAULT_FAIL_MODE),
    cacheTtlSeconds: Number(process.env.ILL_CACHE_TTL_SECONDS ?? 900),
    syncIntervalMinutes: Number(process.env.ILL_SYNC_INTERVAL_MINUTES ?? 10),
    apiKey: process.env.ILL_API_GATEWAY_KEY?.trim() || '',
    gatewayRateLimitPerMinute: Number(process.env.ILL_GATEWAY_RATE_LIMIT ?? 1000),
    cloudRegion: process.env.ILL_CLOUD_REGION ?? 'ap-south-1',
  };
}

export const INSPECTION_METHOD_DECISION = {
  method: 'hybrid_dpi_dns' as InspectionMethod,
  rationale:
    'Hybrid DPI + DNS inspection at the NSP PE/BNG: DNS resolves hostnames for URL/domain checks; DPI extracts HTTP Host/SNI and destination IPs for inline ILL traffic without full TLS termination.',
  capabilities: {
    dpi: 'Extracts dest IP, HTTP Host header, TLS SNI from mirrored or inline ILL flows',
    dns: 'Inspects DNS queries/responses on customer resolver path for domain IOC matching',
    proxy: 'Optional explicit HTTP/S proxy for enterprise ILL tiers requiring full URL path visibility',
  },
  recommendedFor: ['Bharti Airtel', 'Vodafone Idea', 'Jio Business ILL handoff at POP edge'],
} as const;
