import 'server-only';
import { getElasticClient, isElasticAvailable } from './client';
import { GRC_INDICES } from './index-templates';

export interface TermBucket {
  key: string;
  count: number;
}

export interface AnalyticsSummary {
  controlsByRag: TermBucket[];
  controlsByFramework: TermBucket[];
  risksBySeverity: TermBucket[];
  vendorsByTier: TermBucket[];
  auditsBySeverity: TermBucket[];
  cyclesByStatus: TermBucket[];
  policiesByStatus: TermBucket[];
  assuranceBySeverity: TermBucket[];
  assuranceVmBySeverity: TermBucket[];
  assuranceDastBySeverity: TermBucket[];
  assuranceByStatus: TermBucket[];
  totals: {
    controls: number;
    risks: number;
    vendors: number;
    audits: number;
    cycles: number;
    policies: number;
    assurance: number;
  };
}

async function termsAgg(index: string, field: string, size = 10): Promise<TermBucket[]> {
  const client = getElasticClient();
  const result = await client.search({
    index,
    size: 0,
    aggs: {
      buckets: { terms: { field, size } },
    },
  });

  const buckets = result.aggregations?.buckets as { buckets?: Array<{ key: string; doc_count: number }> } | undefined;
  return (buckets?.buckets ?? []).map((b) => ({ key: String(b.key), count: b.doc_count }));
}

async function termsAggFiltered(
  index: string,
  field: string,
  filterField: string,
  filterValue: string,
  size = 10
): Promise<TermBucket[]> {
  const client = getElasticClient();
  const result = await client.search({
    index,
    size: 0,
    query: { term: { [filterField]: filterValue } },
    aggs: {
      buckets: { terms: { field, size } },
    },
  });

  const buckets = result.aggregations?.buckets as { buckets?: Array<{ key: string; doc_count: number }> } | undefined;
  return (buckets?.buckets ?? []).map((b) => ({ key: String(b.key), count: b.doc_count }));
}

async function countIndex(index: string): Promise<number> {
  const client = getElasticClient();
  const result = await client.count({ index });
  return result.count;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary | null> {
  if (!(await isElasticAvailable())) return null;

  const [
    controlsByRag,
    controlsByFramework,
    risksBySeverity,
    vendorsByTier,
    auditsBySeverity,
    cyclesByStatus,
    policiesByStatus,
    assuranceBySeverity,
    assuranceVmBySeverity,
    assuranceDastBySeverity,
    assuranceByStatus,
    controls,
    risks,
    vendors,
    audits,
    cycles,
    policies,
    assurance,
  ] = await Promise.all([
    termsAgg(GRC_INDICES.controls, 'ragStatus', 5),
    termsAgg(GRC_INDICES.controls, 'frameworkName', 8),
    termsAgg(GRC_INDICES.risks, 'presentRisk', 10),
    termsAgg(GRC_INDICES.vendors, 'tier', 5),
    termsAgg(GRC_INDICES.audits, 'severity', 5),
    termsAgg(GRC_INDICES.cycles, 'status', 5),
    termsAgg(GRC_INDICES.policies, 'status', 10),
    termsAgg(GRC_INDICES.assurance, 'severity', 5),
    termsAggFiltered(GRC_INDICES.assurance, 'severity', 'source', 'infrastructure', 5),
    termsAggFiltered(GRC_INDICES.assurance, 'severity', 'source', 'dast', 5),
    termsAgg(GRC_INDICES.assurance, 'status', 8),
    countIndex(GRC_INDICES.controls),
    countIndex(GRC_INDICES.risks),
    countIndex(GRC_INDICES.vendors),
    countIndex(GRC_INDICES.audits),
    countIndex(GRC_INDICES.cycles),
    countIndex(GRC_INDICES.policies),
    countIndex(GRC_INDICES.assurance),
  ]);

  return {
    controlsByRag,
    controlsByFramework,
    risksBySeverity,
    vendorsByTier,
    auditsBySeverity,
    cyclesByStatus,
    policiesByStatus,
    assuranceBySeverity,
    assuranceVmBySeverity,
    assuranceDastBySeverity,
    assuranceByStatus,
    totals: { controls, risks, vendors, audits, cycles, policies, assurance },
  };
}
