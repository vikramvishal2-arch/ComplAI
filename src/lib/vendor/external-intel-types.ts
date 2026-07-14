/** Client-safe types for correlated vendor external intelligence. */

export type ExternalIntelSourceId =
  | 'shodan'
  | 'censys'
  | 'virustotal'
  | 'nvd'
  | 'epss'
  | 'hibp';

/** Canonical panel order — every card must appear even when a snapshot omits a source. */
export const EXTERNAL_INTEL_PROVIDER_IDS: readonly ExternalIntelSourceId[] = [
  'shodan',
  'censys',
  'virustotal',
  'nvd',
  'epss',
  'hibp',
] as const;

export const EXTERNAL_INTEL_SOURCE_LABEL: Record<ExternalIntelSourceId, string> = {
  shodan: 'Shodan',
  censys: 'Censys',
  virustotal: 'VirusTotal',
  nvd: 'NVD',
  epss: 'EPSS',
  hibp: 'Have I Been Pwned',
};

export type ExternalIntelProviderStatus =
  | 'ok'
  | 'clear'
  | 'findings'
  | 'error'
  | 'skipped'
  | 'unconfigured';

export type ExternalIntelSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type ExternalIntelFinding = {
  id: string;
  source: ExternalIntelSourceId;
  type: string;
  title: string;
  detail: string;
  severity: ExternalIntelSeverity;
  scoreImpact: number | null;
  asset?: string;
  cve?: string;
  epss?: number | null;
  cvss?: number | null;
  evidenceUrl?: string;
  rawRef?: string;
};

export type ExternalIntelProviderResult = {
  source: ExternalIntelSourceId;
  status: ExternalIntelProviderStatus;
  live: boolean;
  checkedAt: string;
  message: string;
  error?: string;
  findingCount: number;
  configured: boolean;
};

export type VendorExternalIntel = {
  domain: string;
  checkedAt: string;
  live: boolean;
  /** Overall 0–100 posture from correlated live sources only (null if none succeeded). */
  correlatedScore100: number | null;
  providers: ExternalIntelProviderResult[];
  findings: ExternalIntelFinding[];
  cves: Array<{
    cve: string;
    cvss: number | null;
    epss: number | null;
    summary: string;
    sources: ExternalIntelSourceId[];
  }>;
  summary: string;
  breachIntel?: unknown;
};

/** Backfill + order providers so UI never silently drops a source (e.g. pre-Censys snapshots). */
export function ensureExternalIntelProviders(
  providers: ExternalIntelProviderResult[],
  checkedAt: string
): ExternalIntelProviderResult[] {
  const bySource = new Map<ExternalIntelSourceId, ExternalIntelProviderResult>();
  for (const p of providers) {
    if ((EXTERNAL_INTEL_PROVIDER_IDS as readonly string[]).includes(p.source)) {
      bySource.set(p.source, p);
    }
  }
  return EXTERNAL_INTEL_PROVIDER_IDS.map((source) => {
    const existing = bySource.get(source);
    if (existing) return existing;
    return {
      source,
      status: 'skipped',
      live: false,
      checkedAt,
      message: `${EXTERNAL_INTEL_SOURCE_LABEL[source]} was not included in the last snapshot — run Refresh intelligence.`,
      findingCount: 0,
      configured: false,
    };
  });
}
