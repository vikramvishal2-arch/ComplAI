import { createHash } from 'crypto';

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;

export function isValidIpv4(ip: string): boolean {
  return IPV4_REGEX.test(ip.trim());
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `http://${trimmed}`);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return trimmed;
  }
}

export function extractDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.includes('://') || trimmed.includes('/')) {
    try {
      const parsed = new URL(trimmed.includes('://') ? trimmed : `http://${trimmed}`);
      return parsed.hostname || null;
    } catch {
      return null;
    }
  }
  return trimmed.replace(/^\*\./, '');
}

export function hashUrl(url: string): string {
  return createHash('sha256').update(normalizeUrl(url)).digest('hex');
}

export function generateRequestId(): string {
  return `ill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
