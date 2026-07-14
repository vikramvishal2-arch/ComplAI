import 'server-only';
import { fetchJsonWithApiKey, isRecord } from '../http';
import type {
  ExternalIntelFinding,
  ExternalIntelProviderResult,
  ExternalIntelSourceId,
} from '../../external-intel-types';

type NvdCveResponse = {
  vulnerabilities?: Array<{
    cve?: {
      id?: string;
      descriptions?: Array<{ lang?: string; value?: string }>;
      metrics?: {
        cvssMetricV31?: Array<{ cvssData?: { baseScore?: number } }>;
        cvssMetricV30?: Array<{ cvssData?: { baseScore?: number } }>;
        cvssMetricV2?: Array<{ cvssData?: { baseScore?: number } }>;
      };
    };
  }>;
};

type EpssResponse = {
  data?: Array<{ cve?: string; epss?: string | number; percentile?: string | number }>;
};

function isNvd(data: unknown): data is NvdCveResponse {
  return isRecord(data);
}

function isEpss(data: unknown): data is EpssResponse {
  return isRecord(data);
}

function extractCvss(metrics: unknown): number | null {
  if (!metrics || typeof metrics !== 'object') return null;
  const m = metrics as {
    cvssMetricV31?: Array<{ cvssData?: { baseScore?: number } }>;
    cvssMetricV30?: Array<{ cvssData?: { baseScore?: number } }>;
    cvssMetricV2?: Array<{ cvssData?: { baseScore?: number } }>;
  };
  const score =
    m.cvssMetricV31?.[0]?.cvssData?.baseScore ??
    m.cvssMetricV30?.[0]?.cvssData?.baseScore ??
    m.cvssMetricV2?.[0]?.cvssData?.baseScore;
  return typeof score === 'number' ? score : null;
}

function parseCveFromNvdItem(item: NonNullable<NvdCveResponse['vulnerabilities']>[number]): {
  cve: string;
  summary: string;
  cvss: number | null;
} | null {
  const id = item.cve?.id?.toUpperCase();
  if (!id || !/^CVE-\d{4}-\d+$/i.test(id)) return null;
  const desc =
    item.cve?.descriptions?.find((d) => d.lang === 'en')?.value ??
    item.cve?.descriptions?.[0]?.value ??
    '';
  return {
    cve: id,
    summary: desc.slice(0, 400),
    cvss: extractCvss(item.cve?.metrics),
  };
}

export type NvdEpssFetchResult = {
  nvdProvider: ExternalIntelProviderResult;
  epssProvider: ExternalIntelProviderResult;
  findings: ExternalIntelFinding[];
  cves: Array<{
    cve: string;
    cvss: number | null;
    epss: number | null;
    summary: string;
    sources: ExternalIntelSourceId[];
  }>;
};

async function discoverCvesByKeyword(domain: string, nvdKey: string): Promise<string[]> {
  const keyword = domain.replace(/\.(com|io|net|org|co|in|ai)$/i, '').replace(/[^a-z0-9.-]/gi, ' ').trim();
  if (!keyword || keyword.length < 3) return [];

  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=8`;
  const nvd = await fetchJsonWithApiKey<NvdCveResponse>({
    url,
    apiKeyHeader: nvdKey ? { name: 'apiKey', value: nvdKey } : undefined,
    timeoutMs: 25000,
    validate: isNvd,
  });
  if (!nvd.ok) return [];

  const ids: string[] = [];
  for (const item of nvd.data.vulnerabilities ?? []) {
    const parsed = parseCveFromNvdItem(item);
    if (parsed) ids.push(parsed.cve);
  }
  return ids;
}

/**
 * Required NVD + EPSS enrichment.
 * Always runs: uses upstream CVEs when present, otherwise keyword-searches NVD by domain brand.
 */
export async function enrichCvesWithNvdAndEpss(
  cveIds: string[],
  sourceHint: ExternalIntelSourceId[] = ['shodan'],
  options?: { domain?: string }
): Promise<NvdEpssFetchResult> {
  const checkedAt = new Date().toISOString();
  const nvdKey = process.env.NVD_API_KEY?.trim() ?? '';
  const nvdConfigured = Boolean(nvdKey);

  let unique = [...new Set(cveIds.map((c) => c.toUpperCase()).filter((c) => /^CVE-\d{4}-\d+$/i.test(c)))].slice(
    0,
    12
  );
  let discoverySource: ExternalIntelSourceId[] = sourceHint;

  if (unique.length === 0 && options?.domain) {
    const discovered = await discoverCvesByKeyword(options.domain, nvdKey);
    unique = discovered.slice(0, 8);
    discoverySource = ['nvd'];
  }

  if (unique.length === 0) {
    return {
      nvdProvider: {
        source: 'nvd',
        status: nvdConfigured ? 'clear' : 'unconfigured',
        live: nvdConfigured,
        checkedAt,
        message: nvdConfigured
          ? `NVD: no CVEs matched for ${options?.domain || 'vendor'} (live keyword + upstream search).`
          : 'NVD_API_KEY required — set a free NIST key for reliable CVE enrichment.',
        findingCount: 0,
        configured: nvdConfigured,
      },
      epssProvider: {
        source: 'epss',
        status: 'clear',
        live: true,
        checkedAt,
        message: 'EPSS: no CVEs to score (FIRST.org; no API key required).',
        findingCount: 0,
        configured: true,
      },
      findings: [],
      cves: [],
    };
  }

  const findings: ExternalIntelFinding[] = [];
  const enriched: NvdEpssFetchResult['cves'] = [];
  let nvdErrors = 0;
  let epssErrors = 0;
  let nvdOk = 0;
  let epssOk = 0;

  for (const cve of unique) {
    const nvdUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cve)}`;
    const nvd = await fetchJsonWithApiKey<NvdCveResponse>({
      url: nvdUrl,
      apiKeyHeader: nvdKey ? { name: 'apiKey', value: nvdKey } : undefined,
      timeoutMs: 25000,
      validate: isNvd,
    });

    let summary = '';
    let cvss: number | null = null;
    if (nvd.ok) {
      nvdOk += 1;
      const item = nvd.data.vulnerabilities?.[0];
      const parsed = item ? parseCveFromNvdItem(item) : null;
      summary = parsed?.summary || '';
      cvss = parsed?.cvss ?? null;
      findings.push({
        id: `nvd-${cve}`,
        source: 'nvd',
        type: 'cve',
        title: cve,
        detail: summary || 'NVD record retrieved',
        severity: cvss != null && cvss >= 9 ? 'critical' : cvss != null && cvss >= 7 ? 'high' : 'medium',
        scoreImpact: cvss != null ? Math.max(5, 100 - Math.round(cvss * 8)) : 40,
        cve,
        cvss,
        evidenceUrl: `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cve)}`,
      });
    } else {
      nvdErrors += 1;
    }

    const epssUrl = `https://api.first.org/data/v1/epss?cve=${encodeURIComponent(cve)}`;
    const epss = await fetchJsonWithApiKey<EpssResponse>({
      url: epssUrl,
      validate: isEpss,
      timeoutMs: 15000,
    });

    let epssScore: number | null = null;
    if (epss.ok) {
      epssOk += 1;
      const row = epss.data.data?.[0];
      const raw = row?.epss;
      epssScore = typeof raw === 'number' ? raw : raw != null ? Number(raw) : null;
      if (epssScore != null && !Number.isNaN(epssScore)) {
        findings.push({
          id: `epss-${cve}`,
          source: 'epss',
          type: 'exploit_probability',
          title: `EPSS ${cve}: ${(epssScore * 100).toFixed(2)}%`,
          detail: `FIRST EPSS exploit probability for ${cve}`,
          severity: epssScore >= 0.5 ? 'critical' : epssScore >= 0.1 ? 'high' : 'medium',
          scoreImpact: Math.max(5, Math.round(100 - epssScore * 100)),
          cve,
          epss: epssScore,
          evidenceUrl: 'https://www.first.org/epss/',
        });
      }
    } else {
      epssErrors += 1;
    }

    enriched.push({
      cve,
      cvss,
      epss: epssScore,
      summary: summary || `${cve} enrichment`,
      sources: [...discoverySource, 'nvd', 'epss'],
    });

    await new Promise((r) => setTimeout(r, nvdKey ? 200 : 650));
  }

  return {
    nvdProvider: {
      source: 'nvd',
      status: nvdOk > 0 ? (findings.some((f) => f.source === 'nvd') ? 'findings' : 'ok') : nvdErrors > 0 ? 'error' : 'skipped',
      live: nvdOk > 0,
      checkedAt,
      message:
        nvdOk > 0
          ? `NVD: enriched ${nvdOk}/${unique.length} CVE(s)${nvdKey ? '' : ' (unauthenticated; rate-limited — set NVD_API_KEY)'}.`
          : nvdConfigured
            ? `NVD enrichment failed for ${unique.length} CVE(s).`
            : 'NVD_API_KEY required for reliable enrichment — requests failed without a key.',
      error: nvdOk === 0 && nvdErrors > 0 ? 'NVD requests failed' : undefined,
      findingCount: findings.filter((f) => f.source === 'nvd').length,
      configured: nvdConfigured || nvdOk > 0,
    },
    epssProvider: {
      source: 'epss',
      status: epssOk > 0 ? 'ok' : epssErrors > 0 ? 'error' : 'skipped',
      live: epssOk > 0,
      checkedAt,
      message:
        epssOk > 0
          ? `EPSS: scored ${epssOk}/${unique.length} CVE(s) via FIRST.org.`
          : `EPSS enrichment failed for ${unique.length} CVE(s).`,
      error: epssOk === 0 && epssErrors > 0 ? 'EPSS requests failed' : undefined,
      findingCount: findings.filter((f) => f.source === 'epss').length,
      configured: true,
    },
    findings,
    cves: enriched,
  };
}
