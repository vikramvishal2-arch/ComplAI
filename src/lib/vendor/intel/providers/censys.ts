import 'server-only';
import { promises as dns } from 'node:dns';
import { fetchJsonWithApiKey, isRecord, normalizeDomain } from '../http';
import type { ExternalIntelFinding, ExternalIntelProviderResult } from '../../external-intel-types';

const PLATFORM_BASE = 'https://api.platform.censys.io/v3/global';
const RISKY_PORTS = new Set([21, 22, 23, 445, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 9200, 27017]);

type CensysSearchResponse = {
  result?: {
    total_hits?: number;
    hits?: unknown[];
  };
  error?: string | { message?: string };
};

type CensysHostResponse = {
  result?: {
    resource?: CensysHostResource;
  };
  error?: string | { message?: string };
};

type CensysHostResource = {
  ip?: string;
  services?: Array<{
    port?: number;
    protocol?: string;
    transport_protocol?: string;
    software?: Array<{ product?: string; vendor?: string; version?: string }>;
    banner?: string;
  }>;
  service_count?: number;
  dns?: {
    names?: string[];
    reverse_dns?: { names?: string[] };
  };
  certifications?: unknown;
  certificates?: unknown;
};

function isCensysSearchResponse(data: unknown): data is CensysSearchResponse {
  return isRecord(data);
}

function isCensysHostResponse(data: unknown): data is CensysHostResponse {
  return isRecord(data);
}

function censysToken(): string {
  return (
    process.env.CENSYS_API_TOKEN?.trim() ||
    process.env.CENSYS_PAT?.trim() ||
    ''
  );
}

function authHeaders(token: string): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
  const orgId = process.env.CENSYS_ORG_ID?.trim();
  if (orgId) headers['X-Organization-ID'] = orgId;
  return headers;
}

function searchUrl(): string {
  const orgId = process.env.CENSYS_ORG_ID?.trim();
  const base = `${PLATFORM_BASE}/search/query`;
  return orgId ? `${base}?organization_id=${encodeURIComponent(orgId)}` : base;
}

function hostUrl(ip: string): string {
  const orgId = process.env.CENSYS_ORG_ID?.trim();
  // IPv4: plain. IPv6: keep colons (do not percent-encode — Platform rejects encoded host ids).
  const hostId = ip.includes(':') ? ip : encodeURIComponent(ip);
  const base = `${PLATFORM_BASE}/asset/host/${hostId}`;
  return orgId ? `${base}?organization_id=${encodeURIComponent(orgId)}` : base;
}

function explainCensysHttpError(status: number, bodyPreview?: string): string {
  if (status === 401) {
    return 'Censys rejected the Personal Access Token (401). Check CENSYS_API_TOKEN at Platform → API Access.';
  }
  if (status === 403) {
    return (
      'Censys returned 403 — set CENSYS_ORG_ID for Starter/Search/Core API access, or upgrade plan. ' +
      'Free accounts may be limited to Platform UI for search. ' +
      (bodyPreview ? `(${bodyPreview.slice(0, 120)})` : '')
    );
  }
  if (status === 422) {
    return (
      'Censys returned 422 — request may need CENSYS_ORG_ID for Starter/Search/Core plans, or the query is invalid. ' +
      (bodyPreview ? `(${bodyPreview.slice(0, 120)})` : '')
    );
  }
  if (status === 429) {
    return 'Censys rate limit exceeded (429). Retry later; concurrent limits depend on plan tier.';
  }
  return `Provider returned HTTP ${status}`;
}

function asResource(hit: unknown): CensysHostResource | null {
  if (!isRecord(hit)) return null;
  if (isRecord(hit.resource)) return hit.resource as CensysHostResource;
  if (typeof hit.ip === 'string' || Array.isArray(hit.services)) {
    return hit as CensysHostResource;
  }
  if (isRecord(hit.host) && (typeof hit.host.ip === 'string' || Array.isArray(hit.host.services))) {
    return hit.host as CensysHostResource;
  }
  return null;
}

function softwareLabel(svc: NonNullable<CensysHostResource['services']>[number]): string {
  const soft = svc.software?.[0];
  if (soft?.product) {
    const bits = [soft.vendor, soft.product, soft.version].filter(Boolean);
    return bits.join(' ');
  }
  return svc.protocol || '';
}

function portSeverity(port: number | undefined): ExternalIntelFinding['severity'] {
  if (port != null && RISKY_PORTS.has(port)) return 'high';
  if (port != null && port < 1024) return 'medium';
  return 'low';
}

function collectFromHosts(
  hosts: CensysHostResource[],
  domain: string
): { findings: ExternalIntelFinding[]; cves: string[]; openPorts: number } {
  const findings: ExternalIntelFinding[] = [];
  const cveSet = new Set<string>();
  const ports = new Set<number>();

  for (const host of hosts.slice(0, 25)) {
    const ip = host.ip ?? 'unknown';
    const services = host.services ?? [];

    for (const svc of services.slice(0, 40)) {
      const port = svc.port;
      if (typeof port === 'number') ports.add(port);
      const product = softwareLabel(svc);
      const severity = portSeverity(port);
      findings.push({
        id: `censys-svc-${ip}-${port ?? 'na'}-${svc.protocol ?? 'svc'}`,
        source: 'censys',
        type: 'exposed_service',
        title: `Censys: exposed ${ip}${port != null ? `:${port}` : ''}${product ? ` (${product})` : ''}`,
        detail:
          svc.transport_protocol || svc.protocol
            ? `${svc.transport_protocol ?? 'tcp'}/${svc.protocol ?? 'unknown'} observed on ${domain}`
            : `Internet-facing service observed by Censys for ${domain}`,
        severity,
        scoreImpact: severity === 'high' ? 30 : severity === 'medium' ? 50 : 60,
        asset: ip,
        evidenceUrl: `https://platform.censys.io/hosts/${encodeURIComponent(ip)}`,
        rawRef: `port:${port ?? ''}`,
      });

      if (product && /openssl|apache|nginx|openssh|exim|exchange/i.test(product)) {
        findings.push({
          id: `censys-sw-${ip}-${port ?? 'na'}-${product}`,
          source: 'censys',
          type: 'software',
          title: `Software fingerprint: ${product}`,
          detail: `Censys identified ${product} on ${ip}${port != null ? `:${port}` : ''}`,
          severity: 'info',
          scoreImpact: 75,
          asset: ip,
          evidenceUrl: `https://platform.censys.io/hosts/${encodeURIComponent(ip)}`,
        });
      }
    }

    const names = [
      ...(host.dns?.names ?? []),
      ...(host.dns?.reverse_dns?.names ?? []),
    ].filter(Boolean);
    for (const name of names.slice(0, 5)) {
      findings.push({
        id: `censys-dns-${ip}-${name}`,
        source: 'censys',
        type: 'dns',
        title: `DNS name on ${ip}: ${name}`,
        detail: `Censys associated hostname ${name} with ${ip}`,
        severity: 'info',
        scoreImpact: 80,
        asset: ip,
        evidenceUrl: `https://platform.censys.io/hosts/${encodeURIComponent(ip)}`,
      });
    }

    // Best-effort CVE extraction if present on nested service payloads
    for (const svc of services) {
      const raw = JSON.stringify(svc);
      for (const match of raw.matchAll(/CVE-\d{4}-\d{4,}/gi)) {
        const cve = match[0].toUpperCase();
        cveSet.add(cve);
        findings.push({
          id: `censys-cve-${cve}-${ip}`,
          source: 'censys',
          type: 'cve',
          title: `${cve} on ${ip}`,
          detail: `Censys associated ${cve} with host ${ip}`,
          severity: 'high',
          scoreImpact: 25,
          asset: ip,
          cve,
          evidenceUrl: `https://platform.censys.io/hosts/${encodeURIComponent(ip)}`,
        });
      }
    }
  }

  return { findings, cves: [...cveSet], openPorts: ports.size };
}

async function resolveDomainIps(domain: string): Promise<string[]> {
  const collected: string[] = [];
  // Prefer IPv4 for Platform host asset IDs; append IPv6 if needed.
  for (const family of [4, 6] as const) {
    try {
      const records = await dns.lookup(domain, { all: true, family });
      for (const r of records) {
        if (r.address && !collected.includes(r.address)) collected.push(r.address);
      }
    } catch {
      /* try next family */
    }
  }
  return collected.slice(0, 5);
}

async function fetchViaHostLookup(
  domain: string,
  token: string,
  checkedAt: string
): Promise<{
  provider: ExternalIntelProviderResult;
  findings: ExternalIntelFinding[];
  cves: string[];
  openPorts: number;
} | null> {
  const ips = await resolveDomainIps(domain);
  if (ips.length === 0) return null;

  const hosts: CensysHostResource[] = [];
  let lastError: string | undefined;

  for (const ip of ips) {
    const result = await fetchJsonWithApiKey<CensysHostResponse>({
      url: hostUrl(ip),
      headers: authHeaders(token),
      validate: isCensysHostResponse,
    });
    if (!result.ok) {
      lastError = explainCensysHttpError(result.status, result.bodyPreview);
      if (result.status === 401 || result.status === 429) {
        return {
          provider: {
            source: 'censys',
            status: 'error',
            live: false,
            checkedAt,
            message: lastError,
            error: result.error,
            findingCount: 0,
            configured: true,
          },
          findings: [],
          cves: [],
          openPorts: 0,
        };
      }
      continue;
    }
    const resource = result.data.result?.resource;
    if (resource) hosts.push({ ...resource, ip: resource.ip ?? ip });
  }

  if (hosts.length === 0) {
    return lastError
      ? {
          provider: {
            source: 'censys',
            status: 'error',
            live: false,
            checkedAt,
            message: `Censys host lookup fallback failed: ${lastError}`,
            error: lastError,
            findingCount: 0,
            configured: true,
          },
          findings: [],
          cves: [],
          openPorts: 0,
        }
      : null;
  }

  const collected = collectFromHosts(hosts, domain);
  const findingCount = collected.findings.length;
  return {
    provider: {
      source: 'censys',
      status: findingCount > 0 ? 'findings' : 'clear',
      live: true,
      checkedAt,
      message:
        findingCount > 0
          ? `Censys host lookup: ${hosts.length} IP(s), ${collected.openPorts} port(s), ${collected.cves.length} CVE(s). (Search API unavailable — used DNS + asset lookup.)`
          : `Censys host lookup for ${domain}: ${hosts.length} IP(s), no exposed services reported.`,
      findingCount,
      configured: true,
    },
    findings: collected.findings,
    cves: collected.cves,
    openPorts: collected.openPorts,
  };
}

export type CensysFetchResult = {
  provider: ExternalIntelProviderResult;
  findings: ExternalIntelFinding[];
  cves: string[];
  openPorts: number;
};

export async function fetchCensysDomainIntel(domainInput: string): Promise<CensysFetchResult> {
  const domain = normalizeDomain(domainInput);
  const checkedAt = new Date().toISOString();
  const token = censysToken();

  if (!domain) {
    return {
      provider: {
        source: 'censys',
        status: 'skipped',
        live: false,
        checkedAt,
        message: 'No primary domain — Censys skipped.',
        findingCount: 0,
        configured: Boolean(token),
      },
      findings: [],
      cves: [],
      openPorts: 0,
    };
  }

  if (!token) {
    return {
      provider: {
        source: 'censys',
        status: 'unconfigured',
        live: false,
        checkedAt,
        message: 'CENSYS_API_TOKEN (or CENSYS_PAT) not set — Censys not queried.',
        findingCount: 0,
        configured: false,
      },
      findings: [],
      cves: [],
      openPorts: 0,
    };
  }

  // Unified Platform search (Starter+). Free tier often lacks search — fall back to host lookup.
  const query = `host.dns.names: "${domain}" or host.dns.names: "*.${domain}"`;
  const search = await fetchJsonWithApiKey<CensysSearchResponse>({
    url: searchUrl(),
    method: 'POST',
    body: { query, page_size: 25 },
    headers: authHeaders(token),
    validate: isCensysSearchResponse,
    timeoutMs: 25000,
  });

  if (search.ok) {
    const hits = search.data.result?.hits ?? [];
    const hosts = hits.map(asResource).filter((h): h is CensysHostResource => Boolean(h));
    const collected = collectFromHosts(hosts, domain);
    const findingCount = collected.findings.length;
    const total = search.data.result?.total_hits ?? hits.length;
    return {
      provider: {
        source: 'censys',
        status: findingCount > 0 ? 'findings' : 'clear',
        live: true,
        checkedAt,
        message:
          findingCount > 0
            ? `Censys: ${total} host hit(s), ${collected.openPorts} distinct port(s), ${collected.cves.length} CVE(s).`
            : `Censys: no internet-facing hosts matched DNS names for ${domain}.`,
        findingCount,
        configured: true,
      },
      findings: collected.findings,
      cves: collected.cves,
      openPorts: collected.openPorts,
    };
  }

  if (search.status === 401) {
    return {
      provider: {
        source: 'censys',
        status: 'error',
        live: false,
        checkedAt,
        message: explainCensysHttpError(401, search.bodyPreview),
        error: search.error,
        findingCount: 0,
        configured: true,
      },
      findings: [],
      cves: [],
      openPorts: 0,
    };
  }

  if (search.status === 429) {
    return {
      provider: {
        source: 'censys',
        status: 'error',
        live: false,
        checkedAt,
        message: explainCensysHttpError(429, search.bodyPreview),
        error: search.error,
        findingCount: 0,
        configured: true,
      },
      findings: [],
      cves: [],
      openPorts: 0,
    };
  }

  // 403 / 422 / other — try free-tier host asset lookup via DNS
  if (search.status === 403 || search.status === 422 || search.status >= 400) {
    const fallback = await fetchViaHostLookup(domain, token, checkedAt);
    if (fallback) return fallback;
  }

  return {
    provider: {
      source: 'censys',
      status: 'error',
      live: false,
      checkedAt,
      message: `Censys check failed: ${explainCensysHttpError(search.status, search.bodyPreview)}`,
      error: search.error,
      findingCount: 0,
      configured: true,
    },
    findings: [],
    cves: [],
    openPorts: 0,
  };
}
