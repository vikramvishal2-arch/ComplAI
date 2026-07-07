import { prisma } from '@/lib/db/prisma';
import type { ThreatCategory, ThreatCheckResult } from '@/lib/ill/types';
import { extractDomain, hashUrl, isValidIpv4, normalizeUrl } from '@/lib/ill/utils';

function toThreatResult(
  partial: Omit<ThreatCheckResult, 'checked_at'> & { checked_at?: string }
): ThreatCheckResult {
  return {
    ...partial,
    checked_at: partial.checked_at ?? new Date().toISOString(),
  };
}

function mapCategory(value: string): ThreatCategory {
  const allowed: ThreatCategory[] = ['botnet', 'c2', 'phishing', 'malware', 'spam', 'other'];
  return allowed.includes(value as ThreatCategory) ? (value as ThreatCategory) : 'other';
}

function activeBlacklistWhere() {
  return {
    blacklisted: true,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

export async function lookupThreatInDb(params: {
  ip?: string;
  url?: string;
  domain?: string;
}): Promise<ThreatCheckResult> {
  const checkedAt = new Date().toISOString();
  const ip = params.ip?.trim();
  const url = params.url?.trim();
  const domain = params.domain?.trim() ?? (url ? extractDomain(url) : null);

  if (ip && isValidIpv4(ip)) {
    const match = await prisma.threatIoc.findFirst({
      where: {
        iocType: 'ip',
        value: ip,
        ...activeBlacklistWhere(),
      },
    });
    if (match) {
      return toThreatResult({
        ip,
        status: 'malicious',
        blacklisted: true,
        category: mapCategory(match.category),
        confidence: match.confidence,
        source_feed: match.sourceFeed,
        checked_at: checkedAt,
      });
    }
  }

  if (url) {
    const normalized = normalizeUrl(url);
    const urlHash = hashUrl(normalized);
    const match = await prisma.threatIoc.findFirst({
      where: {
        AND: [
          {
            OR: [
              { iocType: 'url', urlHash },
              { iocType: 'url', value: normalized },
            ],
          },
          activeBlacklistWhere(),
        ],
      },
    });
    if (match) {
      return toThreatResult({
        ip,
        url: normalized,
        status: 'malicious',
        blacklisted: true,
        category: mapCategory(match.category),
        confidence: match.confidence,
        source_feed: match.sourceFeed,
        checked_at: checkedAt,
      });
    }
  }

  if (domain) {
    const match = await prisma.threatIoc.findFirst({
      where: {
        iocType: 'domain',
        value: domain,
        ...activeBlacklistWhere(),
      },
    });
    if (match) {
      return toThreatResult({
        ip,
        url,
        domain,
        status: 'malicious',
        blacklisted: true,
        category: mapCategory(match.category),
        confidence: match.confidence,
        source_feed: match.sourceFeed,
        checked_at: checkedAt,
      });
    }
  }

  return toThreatResult({
    ip,
    url: url ? normalizeUrl(url) : undefined,
    domain: domain ?? undefined,
    status: 'clean',
    blacklisted: false,
    confidence: 1,
    source_feed: 'local-db',
    checked_at: checkedAt,
  });
}

export async function syncFeedsSince(since: Date) {
  const iocs = await prisma.threatIoc.findMany({
    where: { updatedAt: { gte: since } },
    orderBy: { updatedAt: 'asc' },
  });

  return iocs.map((ioc) => ({
    ioc_type: ioc.iocType,
    value: ioc.value,
    category: ioc.category,
    blacklisted: ioc.blacklisted,
    confidence: ioc.confidence,
    source_feed: ioc.sourceFeed,
    updated_at: ioc.updatedAt.toISOString(),
  }));
}

export async function upsertIoc(entry: {
  iocType: string;
  value: string;
  category: string;
  confidence: number;
  sourceFeed: string;
  blacklisted?: boolean;
  expiresAt?: Date | null;
}) {
  const normalizedValue = entry.iocType === 'url' ? normalizeUrl(entry.value) : entry.value;
  const urlHash = entry.iocType === 'url' ? hashUrl(normalizedValue) : null;
  return prisma.threatIoc.upsert({
    where: {
      iocType_value: {
        iocType: entry.iocType,
        value: normalizedValue,
      },
    },
    create: {
      iocType: entry.iocType,
      value: normalizedValue,
      urlHash,
      category: entry.category,
      confidence: entry.confidence,
      sourceFeed: entry.sourceFeed,
      blacklisted: entry.blacklisted ?? true,
      expiresAt: entry.expiresAt ?? null,
    },
    update: {
      urlHash,
      category: entry.category,
      confidence: entry.confidence,
      sourceFeed: entry.sourceFeed,
      blacklisted: entry.blacklisted ?? true,
      expiresAt: entry.expiresAt ?? null,
    },
  });
}

export async function logPolicyDecision(input: {
  circuitId: string;
  srcIp: string;
  destIp?: string;
  url?: string;
  domain?: string;
  verdict: string;
  reason: string;
  cacheHit: boolean;
}) {
  return prisma.illPolicyDecision.create({
    data: {
      circuitId: input.circuitId,
      srcIp: input.srcIp,
      destIp: input.destIp,
      url: input.url,
      domain: input.domain,
      verdict: input.verdict,
      reason: input.reason,
      cacheHit: input.cacheHit,
    },
  });
}

export async function getCircuit(circuitId: string) {
  return prisma.illCircuit.findUnique({ where: { circuitId } });
}
