import 'server-only';
import { normalizeDomain } from './http';
import { fetchShodanDomainIntel } from './providers/shodan';
import { fetchCensysDomainIntel } from './providers/censys';
import { fetchVirusTotalDomainIntel } from './providers/virustotal';
import { enrichCvesWithNvdAndEpss } from './providers/nvd-epss';
import { fetchDomainBreachHistory } from '../breach-intelligence';
import { correlateExternalIntelligence } from './correlate';
import type { VendorExternalIntel } from '../external-intel-types';
import type { ExternalIntelProviderResult } from '../external-intel-types';

/**
 * Intelligence Integration Service
 * Providers: Shodan, Censys, VirusTotal, NVD (+ EPSS), HIBP
 */
export async function runIntelligenceIntegrationService(
  primaryDomain: string | null | undefined
): Promise<VendorExternalIntel> {
  const domain = normalizeDomain(primaryDomain);
  const checkedAt = new Date().toISOString();
  const hibpKeyConfigured = Boolean(process.env.HIBP_API_KEY?.trim());

  const [shodan, censys, vt, hibp] = await Promise.all([
    fetchShodanDomainIntel(domain),
    fetchCensysDomainIntel(domain),
    fetchVirusTotalDomainIntel(domain),
    fetchDomainBreachHistory(domain),
  ]);

  let hibpStatus: ExternalIntelProviderResult['status'] =
    hibp.status === 'clear'
      ? 'clear'
      : hibp.status === 'breaches_found'
        ? 'findings'
        : hibp.status === 'error'
          ? 'error'
          : 'skipped';

  if (!hibpKeyConfigured && (hibp.status === 'error' || hibp.status === 'skipped')) {
    hibpStatus = 'unconfigured';
  }

  const hibpProvider: ExternalIntelProviderResult = {
    source: 'hibp',
    status: !hibpKeyConfigured && !hibp.live ? 'unconfigured' : hibpStatus,
    live: hibp.live,
    checkedAt: hibp.checkedAt || checkedAt,
    message: !hibpKeyConfigured
      ? hibp.live
        ? `${hibp.message} (HIBP_API_KEY recommended for reliable pilot use.)`
        : 'HIBP_API_KEY required — get a key at https://haveibeenpwned.com/API/Key'
      : hibp.message,
    error: hibp.error,
    findingCount: hibp.breachCount,
    configured: hibpKeyConfigured || hibp.live,
  };

  const hibpFindings =
    hibp.status === 'breaches_found'
      ? hibp.breaches.slice(0, 20).map((b) => ({
          id: `hibp-${b.name}`,
          source: 'hibp' as const,
          type: 'breach',
          title: b.title,
          detail: b.description || `${b.pwnCount} accounts; ${b.dataClasses.join(', ')}`,
          severity: 'high' as const,
          scoreImpact: 20,
          asset: hibp.domain,
          evidenceUrl: b.sourceUrl,
        }))
      : [];

  const upstreamCves = [...new Set([...shodan.cves, ...censys.cves])];
  const nvdEpss = await enrichCvesWithNvdAndEpss(upstreamCves, ['shodan', 'censys'], {
    domain,
  });

  return correlateExternalIntelligence({
    domain,
    providers: [
      shodan.provider,
      censys.provider,
      vt.provider,
      nvdEpss.nvdProvider,
      nvdEpss.epssProvider,
      hibpProvider,
    ],
    findings: [
      ...shodan.findings,
      ...censys.findings,
      ...vt.findings,
      ...nvdEpss.findings,
      ...hibpFindings,
    ],
    cves: nvdEpss.cves,
    breachIntel: hibp,
  });
}
