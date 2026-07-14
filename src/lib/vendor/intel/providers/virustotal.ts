import 'server-only';
import { fetchJsonWithApiKey, isRecord, normalizeDomain } from '../http';
import type { ExternalIntelFinding, ExternalIntelProviderResult } from '../../external-intel-types';

type VirusTotalDomain = {
  data?: {
    id?: string;
    attributes?: {
      last_analysis_stats?: {
        malicious?: number;
        suspicious?: number;
        harmless?: number;
        undetected?: number;
      };
      reputation?: number;
      categories?: Record<string, string>;
      last_https_certificate?: { validity?: { not_after?: string } };
    };
  };
};

function isVirusTotalDomain(data: unknown): data is VirusTotalDomain {
  return isRecord(data);
}

export type VirusTotalFetchResult = {
  provider: ExternalIntelProviderResult;
  findings: ExternalIntelFinding[];
  malicious: number;
  suspicious: number;
  reputation: number | null;
};

export async function fetchVirusTotalDomainIntel(
  domainInput: string
): Promise<VirusTotalFetchResult> {
  const domain = normalizeDomain(domainInput);
  const checkedAt = new Date().toISOString();
  const apiKey = process.env.VIRUSTOTAL_API_KEY?.trim() ?? '';

  if (!domain) {
    return {
      provider: {
        source: 'virustotal',
        status: 'skipped',
        live: false,
        checkedAt,
        message: 'No primary domain — VirusTotal skipped.',
        findingCount: 0,
        configured: Boolean(apiKey),
      },
      findings: [],
      malicious: 0,
      suspicious: 0,
      reputation: null,
    };
  }

  if (!apiKey) {
    return {
      provider: {
        source: 'virustotal',
        status: 'unconfigured',
        live: false,
        checkedAt,
        message: 'VIRUSTOTAL_API_KEY not set — VirusTotal not queried.',
        findingCount: 0,
        configured: false,
      },
      findings: [],
      malicious: 0,
      suspicious: 0,
      reputation: null,
    };
  }

  const url = `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(domain)}`;
  const result = await fetchJsonWithApiKey<VirusTotalDomain>({
    url,
    apiKeyHeader: { name: 'x-apikey', value: apiKey },
    validate: isVirusTotalDomain,
  });

  if (!result.ok) {
    return {
      provider: {
        source: 'virustotal',
        status: 'error',
        live: false,
        checkedAt,
        message: `VirusTotal check failed: ${result.error}`,
        error: result.error,
        findingCount: 0,
        configured: true,
      },
      findings: [],
      malicious: 0,
      suspicious: 0,
      reputation: null,
    };
  }

  const attrs = result.data.data?.attributes;
  const stats = attrs?.last_analysis_stats ?? {};
  const malicious = Number(stats.malicious ?? 0);
  const suspicious = Number(stats.suspicious ?? 0);
  const reputation = typeof attrs?.reputation === 'number' ? attrs.reputation : null;
  const findings: ExternalIntelFinding[] = [];

  if (malicious > 0) {
    findings.push({
      id: `vt-malicious-${domain}`,
      source: 'virustotal',
      type: 'reputation',
      title: `VirusTotal: ${malicious} malicious engine(s)`,
      detail: `${malicious} engines flagged ${domain} as malicious; ${suspicious} suspicious.`,
      severity: malicious >= 5 ? 'critical' : malicious >= 2 ? 'high' : 'medium',
      scoreImpact: Math.max(10, 90 - malicious * 12),
      asset: domain,
      evidenceUrl: `https://www.virustotal.com/gui/domain/${encodeURIComponent(domain)}`,
    });
  }

  if (suspicious > 0 && malicious === 0) {
    findings.push({
      id: `vt-suspicious-${domain}`,
      source: 'virustotal',
      type: 'reputation',
      title: `VirusTotal: ${suspicious} suspicious engine(s)`,
      detail: `${suspicious} engines marked ${domain} as suspicious.`,
      severity: 'medium',
      scoreImpact: Math.max(40, 80 - suspicious * 8),
      asset: domain,
      evidenceUrl: `https://www.virustotal.com/gui/domain/${encodeURIComponent(domain)}`,
    });
  }

  if (reputation != null && reputation < 0) {
    findings.push({
      id: `vt-rep-${domain}`,
      source: 'virustotal',
      type: 'reputation',
      title: `Negative community reputation (${reputation})`,
      detail: `VirusTotal community reputation for ${domain} is ${reputation}.`,
      severity: reputation <= -50 ? 'high' : 'medium',
      scoreImpact: Math.max(20, 70 + reputation),
      asset: domain,
      evidenceUrl: `https://www.virustotal.com/gui/domain/${encodeURIComponent(domain)}`,
    });
  }

  const findingCount = findings.length;
  return {
    provider: {
      source: 'virustotal',
      status: findingCount > 0 ? 'findings' : 'clear',
      live: true,
      checkedAt,
      message:
        findingCount > 0
          ? `VirusTotal: ${malicious} malicious / ${suspicious} suspicious detections.`
          : `VirusTotal: no malicious detections for ${domain}.`,
      findingCount,
      configured: true,
    },
    findings,
    malicious,
    suspicious,
    reputation,
  };
}
