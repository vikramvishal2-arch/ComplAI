/**
 * Outbound URL / hostname guards (SSRF hygiene).
 * Used by Jira config validation and vendor intel domain lookups.
 */

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home'];

function isPrivateOrLoopbackIpv4(hostname: string): boolean {
  if (!IPV4.test(hostname)) return false;
  const [a, b] = hostname.split('.').map(Number);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isIpv6Literal(hostname: string): boolean {
  return hostname.includes(':');
}

/** True when hostname must not be used as an outbound fetch target. */
export function isBlockedOutboundHostname(hostname: string): boolean {
  const h = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!h) return true;
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1' || h === '[::1]') return true;
  if (h.startsWith('[') && h.endsWith(']')) {
    const inner = h.slice(1, -1);
    if (inner === '::1' || inner.toLowerCase().startsWith('fc') || inner.toLowerCase().startsWith('fd')) {
      return true;
    }
  }
  if (BLOCKED_HOST_SUFFIXES.some((s) => h.endsWith(s))) return true;
  if (isPrivateOrLoopbackIpv4(h)) return true;
  if (isIpv6Literal(h)) return true; // avoid link-local / unique-local SSRF via IPv6 literals
  return false;
}

/**
 * DNS-label style public domain (or public IPv4) for intel lookups.
 * Rejects empty, URLs with paths, private hosts, and control characters.
 */
export function isSafePublicLookupHost(host: string): boolean {
  const h = host.trim().toLowerCase().replace(/\.$/, '');
  if (!h || h.length > 253) return false;
  if (isBlockedOutboundHostname(h)) return false;
  if (IPV4.test(h)) return true;
  // Domain labels: a-z0-9 and hyphen, at least one dot preferred but allow single-label for intranet? No — require a dot for public lookup.
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(h)) {
    return false;
  }
  return true;
}

/**
 * Parse and validate an HTTPS URL safe for server-side outbound calls.
 * Blocks private/loopback hosts and non-HTTPS schemes.
 */
export function parseSafeHttpsUrl(
  raw: string,
  options?: { allowHttpLocalhost?: boolean }
): { ok: true; url: URL } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'URL is required' };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: 'URL must be a valid absolute URL' };
  }

  const allowHttpLocal =
    options?.allowHttpLocalhost &&
    url.protocol === 'http:' &&
    (url.hostname === 'localhost' || url.hostname === '127.0.0.1');

  if (url.protocol !== 'https:' && !allowHttpLocal) {
    return { ok: false, error: 'Only HTTPS URLs are allowed' };
  }

  if (isBlockedOutboundHostname(url.hostname) && !allowHttpLocal) {
    return { ok: false, error: 'Host is not allowed for outbound requests' };
  }

  if (url.username || url.password) {
    return { ok: false, error: 'URLs with embedded credentials are not allowed' };
  }

  return { ok: true, url };
}
