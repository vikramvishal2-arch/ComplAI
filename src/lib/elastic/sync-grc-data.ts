import 'server-only';
import { getElasticClient, isElasticAvailable } from './client';
import { GRC_INDICES, INDEX_MAPPINGS } from './index-templates';
import { FRAMEWORKS } from '@/lib/data/frameworks';
import { getControlsByFramework } from '@/lib/data/controls';
import { classifyControlRag } from '@/lib/compliance/rag-status';
import { DOMAIN_LABELS } from '@/lib/types';
import { getRisks, getControlComplianceBatch, createDefaultCompliance } from '@/lib/db/repository';
import { getVendors } from '@/lib/db/vendor-repository';
import { getPolicies } from '@/lib/db/policy-repository';
import { AUDIT_FINDINGS } from '@/lib/data/audits-demo';
import {
  DAST_FINDINGS,
  INFRASTRUCTURE_VULNERABILITIES,
  JIRA_TICKETS,
} from '@/lib/data/assurance-demo';
import { getCycles } from '@/lib/cycles/cycle-engine';
import { parseFindings, parseRemediationItems } from '@/lib/vendor/vendor-assessment-types';
import { parseExternalIntel } from '@/lib/vendor/intel/correlate';
import { parseBreachIntel } from '@/lib/vendor/breach-intelligence-shared';
import { syncVendorExternalIntelToElastic } from '@/lib/vendor/intel/elastic-sync';
import { PROGRAM_TYPE_LABELS } from '@/lib/types';
import { getDefaultOrganization } from '@/lib/db/repository';
import { getRiskDomainsForElasticSync } from '@/lib/db/risk-assessment-repository';
import { domainRiskSeverityBucket } from '@/lib/risk/domain-risk-item';

export interface SyncResult {
  success: boolean;
  indices: Record<string, number>;
  error?: string;
}

async function ensureIndex(indexName: string): Promise<void> {
  const client = getElasticClient();
  const exists = await client.indices.exists({ index: indexName });
  if (!exists) {
    await client.indices.create({
      index: indexName,
      mappings: {
        properties: INDEX_MAPPINGS[indexName],
      },
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
      },
    });
  }
}

async function bulkIndex(indexName: string, docs: Array<Record<string, unknown>>): Promise<number> {
  if (docs.length === 0) return 0;
  const client = getElasticClient();

  await client.deleteByQuery({
    index: indexName,
    query: { match_all: {} },
    refresh: true,
  }).catch(() => {});

  const operations = docs.flatMap((doc) => [
    { index: { _index: indexName, _id: doc.id as string ?? undefined } },
    doc,
  ]);

  const result = await client.bulk({ operations, refresh: 'true' });
  if (result.errors) {
    const firstError = result.items.find((i) => i.index?.error);
    console.error('[elastic-sync] Bulk error:', firstError?.index?.error);
  }
  return docs.length;
}

async function syncControls(): Promise<number> {
  await ensureIndex(GRC_INDICES.controls);

  const allControls: Array<{ id: string; frameworkId: string; frameworkName: string; title: string; domain: string; description: string }> = [];
  for (const fw of FRAMEWORKS) {
    for (const ctrl of getControlsByFramework(fw.id)) {
      allControls.push({ id: ctrl.id, frameworkId: fw.id, frameworkName: fw.name, title: ctrl.title, domain: ctrl.domain, description: ctrl.description });
    }
  }

  const complianceMap = await getControlComplianceBatch(allControls.map((c) => c.id));
  const docs: Array<Record<string, unknown>> = [];

  for (const ctrl of allControls) {
    const comp = complianceMap.get(ctrl.id) ?? createDefaultCompliance(ctrl.id);
    const rag = classifyControlRag({
      status: comp.status,
      complianceMethod: comp.complianceMethod,
      owner: comp.owner,
      openIssueCount: 0,
      openRiskCount: 0,
    });
    docs.push({
      id: `${ctrl.frameworkId}__${ctrl.id}`,
      controlId: ctrl.id,
      title: ctrl.title,
      domain: ctrl.domain,
      domainLabel: DOMAIN_LABELS[ctrl.domain as keyof typeof DOMAIN_LABELS] ?? ctrl.domain,
      frameworkId: ctrl.frameworkId,
      frameworkName: ctrl.frameworkName,
      status: comp.status,
      ragStatus: rag,
      description: ctrl.description,
      updatedAt: comp.lastUpdated ?? new Date().toISOString(),
    });
  }

  return bulkIndex(GRC_INDICES.controls, docs);
}

async function syncRisks(): Promise<number> {
  await ensureIndex(GRC_INDICES.risks);
  const risks = await getRisks();
  const docs = risks.map((r) => ({
    id: r.id,
    riskId: r.id,
    title: r.title,
    category: r.category,
    owner: r.owner,
    inherentLikelihood: r.likelihood,
    inherentImpact: r.impact,
    inherentRisk: String(r.riskScore),
    presentLikelihood: r.residualLikelihood ?? r.likelihood,
    presentImpact: r.residualImpact ?? r.impact,
    presentRisk: String(r.residualRiskScore ?? r.riskScore),
    status: r.status,
    treatmentPlan: r.treatment,
    description: r.description,
    updatedAt: r.updatedAt ?? new Date().toISOString(),
  }));
  return bulkIndex(GRC_INDICES.risks, docs);
}

async function syncVendors(): Promise<number> {
  await ensureIndex(GRC_INDICES.vendors);
  const vendors = await getVendors();
  const docs = vendors.map((v) => {
    const ds = (v.domainScores ?? {}) as Record<string, number>;
    let openFindings = 0;
    let openRemediations = 0;
    for (const a of v.assessments ?? []) {
      openFindings += parseFindings(a.findings).filter((f) => f.status !== 'resolved').length;
      openRemediations += parseRemediationItems(a.remediationItems).filter((r) => r.status !== 'completed').length;
    }
    const certs = Array.isArray(v.certifications)
      ? (v.certifications as Array<{ name: string }>).map((c) => c.name)
      : [];
    const externalIntel = parseExternalIntel(v.externalIntel);
    const breach = parseBreachIntel(v.breachIntel);

    return {
      id: v.id,
      vendorId: v.id,
      name: v.name,
      tier: v.tier,
      status: v.status,
      securityRating: v.securityRating,
      ratingGrade: v.ratingGrade,
      industry: v.industry,
      dataAccess: v.dataAccess,
      primaryDomain: v.primaryDomain,
      certifications: certs,
      domainSecurity: ds.security ?? ds.Security ?? 0,
      domainPrivacy: ds.privacy ?? ds.Privacy ?? 0,
      domainCompliance: ds.compliance ?? ds.Compliance ?? 0,
      domainResilience: ds.resilience ?? ds.Resilience ?? 0,
      domainOperations: ds.operations ?? ds.Operations ?? 0,
      assessmentStatus: (v.assessments ?? [])[0]?.status ?? 'none',
      openFindings,
      openRemediations,
      externalIntelScore: externalIntel?.correlatedScore100 ?? null,
      externalIntelLive: Boolean(externalIntel?.live),
      externalIntelFindingCount: externalIntel?.findings.length ?? 0,
      externalIntelSources: externalIntel?.providers.filter((p) => p.live).map((p) => p.source) ?? [],
      breachStatus: breach?.status ?? 'unknown',
      updatedAt: v.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
  });
  return bulkIndex(GRC_INDICES.vendors, docs);
}

async function syncVendorExternalIntel(): Promise<number> {
  await ensureIndex(GRC_INDICES.vendorIntel);
  const vendors = await getVendors();
  let total = 0;
  for (const v of vendors) {
    const intel = parseExternalIntel(v.externalIntel);
    if (!intel) continue;
    const result = await syncVendorExternalIntelToElastic({
      vendorId: v.id,
      vendorName: v.name,
      primaryDomain: v.primaryDomain,
      intel,
    });
    if (result.ok) total += result.indexed;
  }
  return total;
}

async function syncAudits(): Promise<number> {
  await ensureIndex(GRC_INDICES.audits);
  const docs = AUDIT_FINDINGS.map((f) => ({
    id: f.id,
    findingId: f.id,
    title: f.title,
    severity: f.severity,
    status: f.status,
    source: f.source,
    category: f.engagement,
    description: f.title,
    dueDate: f.dueDate,
    createdAt: f.dueDate,
  }));
  return bulkIndex(GRC_INDICES.audits, docs);
}

async function syncCycles(): Promise<number> {
  await ensureIndex(GRC_INDICES.cycles);
  const cycles = await getCycles();
  const docs = cycles.map((c) => ({
    id: c.id,
    cycleId: c.id,
    programType: c.programType,
    programLabel: PROGRAM_TYPE_LABELS[c.programType],
    title: c.title,
    status: c.status,
    owner: c.owner,
    dueDate: c.dueDate,
    periodStart: c.periodStart,
    periodEnd: c.periodEnd,
    daysUntilDue: c.daysUntilDue,
    isOverdue: c.isOverdue,
    completedAt: c.completedAt,
  }));
  return bulkIndex(GRC_INDICES.cycles, docs);
}

async function syncPolicies(): Promise<number> {
  await ensureIndex(GRC_INDICES.policies);
  const policies = await getPolicies();
  const docs = policies.map((p) => ({
    id: p.id,
    policyId: p.id,
    title: p.title,
    status: p.status,
    owner: p.owner,
    category: p.categoryId,
    documentType: p.documentType,
    version: p.version,
    isoReference: p.isoReference,
    createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: p.updatedAt?.toISOString() ?? new Date().toISOString(),
  }));
  return bulkIndex(GRC_INDICES.policies, docs);
}

async function syncAssurance(): Promise<number> {
  await ensureIndex(GRC_INDICES.assurance);

  const infraDocs = INFRASTRUCTURE_VULNERABILITIES.map((v) => ({
    id: v.id,
    findingId: v.id,
    title: v.title,
    severity: v.severity,
    status: v.status,
    source: 'infrastructure',
    scanner: v.scanner,
    environment: v.environment,
    application: '',
    cve: v.cve,
    cvss: v.cvss,
    jiraTicketId: v.jiraTicketId ?? '',
    hasJiraTicket: Boolean(v.jiraTicketId),
    detectedAt: v.firstSeen,
    updatedAt: v.lastSeen,
  }));

  const dastDocs = DAST_FINDINGS.map((f) => ({
    id: f.id,
    findingId: f.id,
    title: f.title,
    severity: f.severity,
    status: f.status,
    source: 'dast',
    scanner: f.scanner,
    environment: '',
    application: f.application,
    cve: '',
    cvss: 0,
    jiraTicketId: f.jiraTicketId ?? '',
    hasJiraTicket: Boolean(f.jiraTicketId),
    detectedAt: f.detectedAt,
    updatedAt: f.detectedAt,
  }));

  return bulkIndex(GRC_INDICES.assurance, [...infraDocs, ...dastDocs]);
}

async function syncAssuranceJira(): Promise<number> {
  await ensureIndex(GRC_INDICES.assuranceJira);
  const docs = JIRA_TICKETS.map((t) => ({
    id: t.id,
    ticketId: t.id,
    ticketKey: t.key,
    summary: t.summary,
    priority: t.priority,
    status: t.status,
    source: t.source,
    assignee: t.assignee,
    issueType: t.issueType,
    slaDue: t.slaDue,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
  return bulkIndex(GRC_INDICES.assuranceJira, docs);
}

async function syncRiskAssessment(): Promise<number> {
  await ensureIndex(GRC_INDICES.riskAssessment);
  const org = await getDefaultOrganization();
  const domains = await getRiskDomainsForElasticSync(org.id);
  const docs: Array<Record<string, unknown>> = [];

  for (const domain of domains) {
    docs.push({
      id: `domain-${domain.id}`,
      docType: 'domain_summary',
      domainId: domain.id,
      domainKey: domain.domainKey,
      domainName: domain.name,
      owner: domain.owner,
      criticalCount: domain.severityCounts.critical,
      highCount: domain.severityCounts.high,
      mediumCount: domain.severityCounts.medium,
      lowCount: domain.severityCounts.low,
      identificationStatus: domain.identification.status,
      analysisStatus: domain.analysis.status,
      evaluationStatus: domain.evaluation.status,
      updatedAt: domain.updatedAt,
    });

    for (const item of domain.riskItems) {
      docs.push({
        id: `${domain.id}-${item.id}`,
        docType: 'risk_item',
        domainId: domain.id,
        domainKey: domain.domainKey,
        domainName: domain.name,
        severity: domainRiskSeverityBucket(item),
        title: item.title,
        status: item.status,
        stage: item.stage,
        owner: domain.owner,
        updatedAt: domain.updatedAt,
      });
    }
  }

  return bulkIndex(GRC_INDICES.riskAssessment, docs);
}

export async function syncAllGrcData(): Promise<SyncResult> {
  const available = await isElasticAvailable();
  if (!available) {
    return { success: false, indices: {}, error: 'Elasticsearch is not reachable' };
  }

  try {
    const indices: Record<string, number> = {};
    indices.controls = await syncControls();
    indices.risks = await syncRisks();
    indices.vendors = await syncVendors();
    indices['vendor-intel'] = await syncVendorExternalIntel();
    indices.audits = await syncAudits();
    indices.cycles = await syncCycles();
    indices.policies = await syncPolicies();
    indices.assurance = await syncAssurance();
    indices['assurance-jira'] = await syncAssuranceJira();
    indices['risk-assessment'] = await syncRiskAssessment();

    return { success: true, indices };
  } catch (err) {
    return {
      success: false,
      indices: {},
      error: err instanceof Error ? err.message : 'Unknown sync error',
    };
  }
}
