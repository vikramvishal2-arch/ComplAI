import 'server-only';
import { fetchJsonWithApiKey, isRecord, normalizeDomain } from '../http';
import type { ExternalIntelFinding, ExternalIntelProviderResult } from '../../external-intel-types';

type ShodanHostSearch = {
  total?: number;
  matches?: Array<{
    ip_str?: string;
    port?: number;
    transport?: string;
    product?: string;
    org?: string;
    vulns?: string[] | Record<string, unknown>;
    http?: { title?: string };
  }>;
  error?: string;
};

type ShodanDnsDomain = {
  domain?: string;
  tags?: string[];
  data?: Array<{
    subdomain?: string;
    type?: string;
    value?: string;
    ports?: number[];
  }>;
  subdomains?: string[];
  error?: string;
};

type ShodanHost = {
  ip_str?: string;
  ports?: number[];
  org?: string;
  isp?: string;
  hostnames?: string[];
  vulns?: string[] | Record<string, unknown>;
  data?: Array<{
    port?: number;
    product?: string;
    transport?: string;
    http?: { title?: string };
  }>;
  error?: string;
};

function isShodanHostSearch(data: unknown): data is ShodanHostSearch {
  return isRecord(data);
}

function isShodanDnsDomain(data: unknown): data is ShodanDnsDomain {
  return isRecord(data);
}

function isShodanHost(data: unknown): data is ShodanHost {
  return isRecord(data);
}

function vulnList(raw: string[] | Record<string, unknown> | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === 'string');
  return Object.keys(raw);
}

function explainShodanHttpError(status: number, bodyPreview?: string): string {
  if (status === 401) {
    return 'Shodan rejected the API key (401). Check SHODAN_API_KEY at https://account.shodan.io/';
  }
  if (status === 403) {
    return (
      'Shodan returned 403 — host search usually requires a paid Shodan membership. ' +
      'Free keys can use DNS/domain lookup only. Upgrade at https://account.shodan.io/billing/.' +
      (bodyPreview ? ` (${bodyPreview.slice(0, 120)})` : '')
    );
  }
  return `Provider returned HTTP ${status}`;
}

export type ShodanFetchResult = {
  provider: ExternalIntelProviderResult;
  findings: ExternalIntelFinding[];
  cves: string[];
  openPorts: number;
};

function collectFromMatches(
  matches: NonNullable<ShodanHostSearch['matches']>
): { findings: ExternalIntelFinding[]; cves: string[]; openPorts: number } {
  const findings: ExternalIntelFinding[] = [];
  const cveSet = new Set<string>();
  const ports = new Set<number>();

  for (const m of matches.slice(0, 40)) {
    const ip = m.ip_str ?? 'unknown';
    const port = m.port;
    if (typeof port === 'number') ports.add(port);
    const product = m.product ? ` (${m.product})` : '';
    findings.push({
      id: `shodan-host-${ip}-${port ?? 'na'}`,
      source: 'shodan',
      type: 'exposed_service',
      title: `Exposed service ${ip}${port != null ? `:${port}` : ''}${product}`,
      detail: m.http?.title || m.org || 'Internet-facing service observed by Shodan',
      severity: port === 22 || port === 3389 || port === 445 ? 'high' : port && port < 1024 ? 'medium' : 'low',
      scoreImpact: port === 22 || port === 3389 || port === 445 ? 35 : 55,
      asset: ip,
      evidenceUrl: `https://www.shodan.io/host/${encodeURIComponent(ip)}`,
      rawRef: `port:${port ?? ''}`,
    });

    for (const cve of vulnList(m.vulns)) {
      cveSet.add(cve.toUpperCase());
      findings.push({
        id: `shodan-cve-${cve}-${ip}`,
        source: 'shodan',
        type: 'cve',
        title: `${cve} on ${ip}`,
        detail: `Shodan associated ${cve} with host ${ip}`,
        severity: 'high',
        scoreImpact: 25,
        asset: ip,
        cve: cve.toUpperCase(),
        evidenceUrl: `https://www.shodan.io/host/${encodeURIComponent(ip)}`,
      });
    }
  }

  return { findings, cves: [...cveSet], openPorts: ports.size };
}

async function fetchViaDnsDomain(
  domain: string,
  apiKey: string
): Promise<ShodanFetchResult | null> {
  const checkedAt = new Date().toISOString();
  const dnsUrl = `https://api.shodan.io/dns/domain/${encodeURIComponent(domain)}?key=${encodeURIComponent(apiKey)}`;
  const dns = await fetchJsonWithApiKey<ShodanDnsDomain>({
    url: dnsUrl,
    validate: isShodanDnsDomain,
  });

  if (!dns.ok) return null;

  const findings: ExternalIntelFinding[] = [];
  const cveSet = new Set<string>();
  const ports = new Set<number>();
  const ips = new Set<string>();

  for (const row of dns.data.data ?? []) {
    if (row.type === 'A' || row.type === 'AAAA') {
      if (row.value) ips.add(row.value);
    }
    for (const p of row.ports ?? []) ports.add(p);
    if (row.subdomain || row.value) {
      findings.push({
        id: `shodan-dns-${row.type ?? 'rec'}-${row.subdomain ?? ''}-${row.value ?? ''}`,
        source: 'shodan',
        type: 'dns',
        title: `DNS ${row.type ?? 'record'}: ${row.subdomain ? `${row.subdomain}.` : ''}${domain}`,
        detail: row.value ? `Resolves to ${row.value}` : 'Shodan DNS domain record',
        severity: 'info',
        scoreImpact: 80,
        asset: row.value || domain,
        evidenceUrl: `https://www.shodan.io/domain/${encodeURIComponent(domain)}`,
      });
    }
  }

  // Enrich a few resolved IPs with host details (uses query credits on free plans)
  for (const ip of [...ips].slice(0, 3)) {
    const hostUrl = `https://api.shodan.io/shodan/host/${encodeURIComponent(ip)}?key=${encodeURIComponent(apiKey)}`;
    const host = await fetchJsonWithApiKey<ShodanHost>({
      url: hostUrl,
      validate: isShodanHost,
    });
    if (!host.ok) continue;

    for (const p of host.data.ports ?? []) ports.add(p);
    for (const svc of host.data.data ?? []) {
      if (typeof svc.port === 'number') ports.add(svc.port);
      findings.push({
        id: `shodan-host-${ip}-${svc.port ?? 'na'}`,
        source: 'shodan',
        type: 'exposed_service',
        title: `Exposed service ${ip}${svc.port != null ? `:${svc.port}` : ''}${svc.product ? ` (${svc.product})` : ''}`,
        detail: svc.http?.title || host.data.org || 'Shodan host detail',
        severity:
          svc.port === 22 || svc.port === 3389 || svc.port === 445
            ? 'high'
            : svc.port && svc.port < 1024
              ? 'medium'
              : 'low',
        scoreImpact: svc.port === 22 || svc.port === 3389 || svc.port === 445 ? 35 : 55,
        asset: ip,
        evidenceUrl: `https://www.shodan.io/host/${encodeURIComponent(ip)}`,
      });
    }
    for (const cve of vulnList(host.data.vulns)) {
      cveSet.add(cve.toUpperCase());
      findings.push({
        id: `shodan-cve-${cve}-${ip}`,
        source: 'shodan',
        type: 'cve',
        title: `${cve} on ${ip}`,
        detail: `Shodan associated ${cve} with host ${ip}`,
        severity: 'high',
        scoreImpact: 25,
        asset: ip,
        cve: cve.toUpperCase(),
        evidenceUrl: `https://www.shodan.io/host/${encodeURIComponent(ip)}`,
      });
    }
  }

  const findingCount = findings.length;
  return {
    provider: {
      source: 'shodan',
      status: findingCount > 0 ? 'findings' : 'clear',
      live: true,
      checkedAt,
      message:
        findingCount > 0
          ? `Shodan DNS/host fallback: ${ips.size} IP(s), ${ports.size} port(s), ${cveSet.size} CVE(s). (Host search needs paid membership.)`
          : `Shodan DNS lookup for ${domain} returned no records.`,
      findingCount,
      configured: true,
    },
    findings,
    cves: [...cveSet],
    openPorts: ports.size,
  };
}

export async function fetchShodanDomainIntel(domainInput: string): Promise<ShodanFetchResult> {
  const domain = normalizeDomain(domainInput);
  const checkedAt = new Date().toISOString();
  const apiKey = process.env.SHODAN_API_KEY?.trim() ?? '';

  if (!domain) {
    return {
      provider: {
        source: 'shodan',
        status: 'skipped',
        live: false,
        checkedAt,
        message: 'No primary domain — Shodan skipped.',
        findingCount: 0,
        configured: Boolean(apiKey),
      },
      findings: [],
      cves: [],
      openPorts: 0,
    };
  }

  if (!apiKey) {
    return {
      provider: {
        source: 'shodan',
        status: 'unconfigured',
        live: false,
        checkedAt,
        message: 'SHODAN_API_KEY not set — Shodan not queried.',
        findingCount: 0,
        configured: false,
      },
      findings: [],
      cves: [],
      openPorts: 0,
    };
  }

  const searchUrl = `https://api.shodan.io/shodan/host/search?key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(`hostname:${domain}`)}`;
  const result = await fetchJsonWithApiKey<ShodanHostSearch>({
    url: searchUrl,
    validate: isShodanHostSearch,
  });

  if (result.ok) {
    const matches = result.data.matches ?? [];
    const collected = collectFromMatches(matches);
    const findingCount = collected.findings.length;
    return {
      provider: {
        source: 'shodan',
        status: findingCount > 0 ? 'findings' : 'clear',
        live: true,
        checkedAt,
        message:
          findingCount > 0
            ? `Shodan: ${matches.length} host match(es), ${collected.openPorts} distinct port(s), ${collected.cves.length} CVE(s).`
            : `Shodan: no internet-facing matches for hostname:${domain}.`,
        findingCount,
        configured: true,
      },
      findings: collected.findings,
      cves: collected.cves,
      openPorts: collected.openPorts,
    };
  }

  // Free / limited plans: host search is often 401/403 — fall back to DNS + host detail
  if (result.status === 401 || result.status === 403) {
    const fallback = await fetchViaDnsDomain(domain, apiKey);
    if (fallback) return fallback;

    return {
      provider: {
        source: 'shodan',
        status: 'error',
        live: false,
        checkedAt,
        message: explainShodanHttpError(result.status, result.bodyPreview),
        error: result.error,
        findingCount: 0,
        configured: true,
      },
      findings: [],
      cves: [],
      openPorts: 0,
    };
  }

  return {
    provider: {
      source: 'shodan',
      status: 'error',
      live: false,
      checkedAt,
      message: `Shodan check failed: ${result.error}`,
      error: result.error,
      findingCount: 0,
      configured: true,
    },
    findings: [],
    cves: [],
    openPorts: 0,
  };
}
