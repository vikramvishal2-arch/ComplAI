import { prisma } from '@/lib/db/prisma';
import { upsertIoc } from '@/lib/ill/threat-db/repository';

export interface FeedSource {
  name: string;
  feedType: 'commercial' | 'opensource' | 'internal';
  iocs: Array<{
    iocType: 'ip' | 'url' | 'domain';
    value: string;
    category: string;
    confidence: number;
  }>;
}

const BUILTIN_FEEDS: FeedSource[] = [
  {
    name: 'abuseipdb-sample',
    feedType: 'opensource',
    iocs: [
      { iocType: 'ip', value: '203.0.113.45', category: 'botnet', confidence: 0.95 },
      { iocType: 'ip', value: '198.51.100.77', category: 'c2', confidence: 0.92 },
      { iocType: 'ip', value: '192.0.2.100', category: 'malware', confidence: 0.88 },
    ],
  },
  {
    name: 'alienvault-otx-sample',
    feedType: 'opensource',
    iocs: [
      { iocType: 'domain', value: 'malicious-banking.example', category: 'phishing', confidence: 0.97 },
      { iocType: 'domain', value: 'c2-beacon.example', category: 'c2', confidence: 0.94 },
      { iocType: 'url', value: 'http://phish-login.example/steal', category: 'phishing', confidence: 0.96 },
    ],
  },
  {
    name: 'nsp-internal-soc',
    feedType: 'internal',
    iocs: [
      { iocType: 'ip', value: '185.220.101.50', category: 'spam', confidence: 0.85 },
      { iocType: 'domain', value: 'torrent-piracy.example', category: 'other', confidence: 0.8 },
    ],
  },
];

export async function ingestBuiltinFeeds(): Promise<{ feeds: number; iocs: number }> {
  let iocCount = 0;

  for (const feed of BUILTIN_FEEDS) {
    await prisma.threatFeed.upsert({
      where: { name: feed.name },
      create: {
        name: feed.name,
        feedType: feed.feedType,
        status: 'active',
        lastSyncAt: new Date(),
      },
      update: {
        lastSyncAt: new Date(),
        status: 'active',
      },
    });

    for (const ioc of feed.iocs) {
      await upsertIoc({
        iocType: ioc.iocType,
        value: ioc.value,
        category: ioc.category,
        confidence: ioc.confidence,
        sourceFeed: feed.name,
        blacklisted: true,
      });
      iocCount += 1;
    }
  }

  return { feeds: BUILTIN_FEEDS.length, iocs: iocCount };
}

export async function runFeedIngestionPipeline() {
  const result = await ingestBuiltinFeeds();
  return {
    ...result,
    synced_at: new Date().toISOString(),
    region: process.env.ILL_CLOUD_REGION ?? 'ap-south-1',
  };
}
