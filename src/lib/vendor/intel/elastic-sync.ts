import 'server-only';
import { getElasticClient, isElasticAvailable } from '@/lib/elastic/client';
import { GRC_INDICES } from '@/lib/elastic/index-templates';
import type { VendorExternalIntel } from '../external-intel-types';

/** Index one vendor's correlated findings into Elasticsearch for effective search. */
export async function syncVendorExternalIntelToElastic(input: {
  vendorId: string;
  vendorName: string;
  primaryDomain: string;
  intel: VendorExternalIntel;
}): Promise<{ ok: boolean; indexed: number; error?: string }> {
  const available = await isElasticAvailable();
  if (!available) {
    return { ok: false, indexed: 0, error: 'Elasticsearch is not reachable' };
  }

  const client = getElasticClient();
  const index = GRC_INDICES.vendorIntel;

  try {
    const exists = await client.indices.exists({ index });
    if (!exists) {
      const { INDEX_MAPPINGS } = await import('@/lib/elastic/index-templates');
      await client.indices.create({
        index,
        mappings: { properties: INDEX_MAPPINGS[index] },
        settings: { number_of_shards: 1, number_of_replicas: 0 },
      });
    }

    await client.deleteByQuery({
      index,
      query: { term: { vendorId: input.vendorId } },
      refresh: true,
    }).catch(() => {});

    const docs: Array<Record<string, unknown>> = input.intel.findings.map((f) => ({
      id: `${input.vendorId}:${f.id}`,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      domain: input.primaryDomain || input.intel.domain,
      source: f.source,
      findingType: f.type,
      title: f.title,
      detail: f.detail,
      severity: f.severity,
      cve: f.cve ?? '',
      epss: f.epss ?? null,
      cvss: f.cvss ?? null,
      asset: f.asset ?? '',
      evidenceUrl: f.evidenceUrl ?? '',
      correlatedScore100: input.intel.correlatedScore100,
      checkedAt: input.intel.checkedAt,
      searchText: [f.title, f.detail, f.cve, f.asset, f.source, input.vendorName, input.primaryDomain]
        .filter(Boolean)
        .join(' '),
    }));

    // Always index a summary doc so vendors with clear results are searchable
    docs.unshift({
      id: `${input.vendorId}:summary`,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      domain: input.primaryDomain || input.intel.domain,
      source: 'summary',
      findingType: 'summary',
      title: `External intel: ${input.vendorName}`,
      detail: input.intel.summary,
      severity: 'info',
      cve: '',
      epss: null,
      cvss: null,
      asset: input.intel.domain,
      evidenceUrl: '',
      correlatedScore100: input.intel.correlatedScore100,
      checkedAt: input.intel.checkedAt,
      searchText: [
        input.vendorName,
        input.primaryDomain,
        input.intel.summary,
        ...input.intel.providers.map((p) => `${p.source} ${p.status} ${p.message}`),
        ...input.intel.cves.map((c) => c.cve),
      ].join(' '),
    });

    if (docs.length === 0) return { ok: true, indexed: 0 };

    const operations = docs.flatMap((doc) => [
      { index: { _index: index, _id: doc.id } },
      doc,
    ]);
    await client.bulk({ operations, refresh: 'true' });
    return { ok: true, indexed: docs.length };
  } catch (err) {
    return {
      ok: false,
      indexed: 0,
      error: err instanceof Error ? err.message : 'Elasticsearch index failed',
    };
  }
}

export async function searchVendorExternalIntel(query: string, size = 25): Promise<{
  ok: boolean;
  hits: Array<Record<string, unknown>>;
  error?: string;
}> {
  const available = await isElasticAvailable();
  if (!available) {
    return { ok: false, hits: [], error: 'Elasticsearch is not reachable' };
  }

  const q = query.trim();
  if (!q) return { ok: true, hits: [] };

  try {
    const client = getElasticClient();
    const result = await client.search({
      index: GRC_INDICES.vendorIntel,
      size,
      query: {
        multi_match: {
          query: q,
          fields: ['searchText', 'title^2', 'detail', 'cve^3', 'vendorName^2', 'domain', 'source', 'asset'],
          fuzziness: 'AUTO',
        },
      },
    });

    const hits = (result.hits.hits ?? []).map((h) => ({
      id: h._id,
      score: h._score,
      ...(h._source as Record<string, unknown>),
    }));
    return { ok: true, hits };
  } catch (err) {
    return {
      ok: false,
      hits: [],
      error: err instanceof Error ? err.message : 'Search failed',
    };
  }
}
