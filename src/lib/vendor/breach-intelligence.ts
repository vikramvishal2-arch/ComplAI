import 'server-only';
import type { VendorBreachIntel, VendorBreachRecord } from './breach-intelligence-types';

export type { VendorBreachIntel, VendorBreachRecord } from './breach-intelligence-types';
export { applyLiveBreachToVectors, parseBreachIntel } from './breach-intelligence-shared';

const HIBP_BREACHES_URL = 'https://haveibeenpwned.com/api/v3/breaches';

function normalizeDomain(domain: string | null | undefined): string {
  return (domain ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type HibpBreach = {
  Name?: string;
  Title?: string;
  Domain?: string;
  BreachDate?: string;
  AddedDate?: string;
  PwnCount?: number;
  DataClasses?: string[];
  IsVerified?: boolean;
  IsSensitive?: boolean;
  Description?: string;
};

function mapBreach(raw: HibpBreach, fallbackDomain: string): VendorBreachRecord {
  const name = raw.Name ?? 'Unknown';
  return {
    name,
    title: raw.Title ?? name,
    domain: (raw.Domain ?? fallbackDomain).toLowerCase(),
    breachDate: raw.BreachDate ?? '',
    addedDate: raw.AddedDate ?? '',
    pwnCount: typeof raw.PwnCount === 'number' ? raw.PwnCount : 0,
    dataClasses: Array.isArray(raw.DataClasses) ? raw.DataClasses : [],
    isVerified: Boolean(raw.IsVerified),
    isSensitive: Boolean(raw.IsSensitive),
    description: stripHtml(raw.Description ?? ''),
    sourceUrl: `https://haveibeenpwned.com/breach/${encodeURIComponent(name)}`,
  };
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'ComplAI-TPRM-PropelReady/1.0 (vendor breach check; tech@propelreadysolutions.in)',
  };
  const apiKey = process.env.HIBP_API_KEY?.trim();
  if (apiKey) {
    headers['hibp-api-key'] = apiKey;
  }
  return headers;
}

/**
 * Live fetch of publicly disclosed breaches for a vendor domain via Have I Been Pwned.
 * Uses the public breaches catalog filtered by domain (company breaches), not employee email dumps.
 */
export async function fetchDomainBreachHistory(
  primaryDomain: string | null | undefined
): Promise<VendorBreachIntel> {
  const domain = normalizeDomain(primaryDomain);
  const checkedAt = new Date().toISOString();

  if (!domain) {
    return {
      domain: '',
      checkedAt,
      live: false,
      source: 'haveibeenpwned',
      status: 'skipped',
      breachCount: 0,
      breaches: [],
      message: 'Add a primary domain to run a live breach check.',
    };
  }

  try {
    const url = `${HIBP_BREACHES_URL}?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url, {
      headers: buildHeaders(),
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 404) {
      return {
        domain,
        checkedAt,
        live: true,
        source: 'haveibeenpwned',
        status: 'clear',
        breachCount: 0,
        breaches: [],
        message: `No publicly disclosed breaches found for ${domain} on Have I Been Pwned.`,
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        domain,
        checkedAt,
        live: false,
        source: 'haveibeenpwned',
        status: 'error',
        breachCount: 0,
        breaches: [],
        error: `HIBP returned ${res.status}`,
        message:
          'Have I Been Pwned rejected the request. Set HIBP_API_KEY in .env (https://haveibeenpwned.com/API/Key).',
      };
    }

    if (res.status === 429) {
      return {
        domain,
        checkedAt,
        live: false,
        source: 'haveibeenpwned',
        status: 'error',
        breachCount: 0,
        breaches: [],
        error: 'rate_limited',
        message: 'Have I Been Pwned rate limit hit — try again in a minute.',
      };
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return {
        domain,
        checkedAt,
        live: false,
        source: 'haveibeenpwned',
        status: 'error',
        breachCount: 0,
        breaches: [],
        error: `HTTP ${res.status}`,
        message: `Live breach check failed (${res.status}). ${body.slice(0, 120)}`,
      };
    }

    const data = (await res.json()) as HibpBreach[] | null;
    const list = Array.isArray(data) ? data : [];
    const breaches = list
      .map((b) => mapBreach(b, domain))
      .sort((a, b) => (a.breachDate < b.breachDate ? 1 : -1));

    if (breaches.length === 0) {
      return {
        domain,
        checkedAt,
        live: true,
        source: 'haveibeenpwned',
        status: 'clear',
        breachCount: 0,
        breaches: [],
        message: `No publicly disclosed breaches found for ${domain} on Have I Been Pwned.`,
      };
    }

    return {
      domain,
      checkedAt,
      live: true,
      source: 'haveibeenpwned',
      status: 'breaches_found',
      breachCount: breaches.length,
      breaches,
      message: `Live check found ${breaches.length} publicly disclosed breach(es) for ${domain}.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return {
      domain,
      checkedAt,
      live: false,
      source: 'haveibeenpwned',
      status: 'error',
      breachCount: 0,
      breaches: [],
      error: msg,
      message: `Live breach check could not reach Have I Been Pwned (${msg}).`,
    };
  }
}
