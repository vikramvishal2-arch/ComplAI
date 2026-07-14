import type { VendorBreachIntel } from '../breach-intelligence-types';
import type {
  ExternalIntelFinding,
  ExternalIntelProviderResult,
  VendorExternalIntel,
} from '../external-intel-types';
import { ensureExternalIntelProviders } from '../external-intel-types';
import type { ExternalRiskVector } from '../tprm-rating';
import { applyLiveBreachToVectors } from '../breach-intelligence-shared';
function severityRank(s: ExternalIntelFinding['severity']): number {
  switch (s) {
    case 'critical':
      return 5;
    case 'high':
      return 4;
    case 'medium':
      return 3;
    case 'low':
      return 2;
    default:
      return 1;
  }
}

function dedupeFindings(findings: ExternalIntelFinding[]): ExternalIntelFinding[] {
  const map = new Map<string, ExternalIntelFinding>();
  for (const f of findings) {
    const key = f.cve
      ? `cve:${f.cve}:${f.source}`
      : `${f.source}:${f.type}:${f.title}:${f.asset ?? ''}`;
    const prev = map.get(key);
    if (!prev || severityRank(f.severity) > severityRank(prev.severity)) {
      map.set(key, f);
    }
  }
  return [...map.values()].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function computeCorrelatedScore(findings: ExternalIntelFinding[], liveProviders: number): number | null {
  if (liveProviders === 0) return null;
  const impacts = findings
    .map((f) => f.scoreImpact)
    .filter((n): n is number => typeof n === 'number');
  if (impacts.length === 0) return 92;
  const worst = Math.min(...impacts);
  const avg = Math.round(impacts.reduce((a, b) => a + b, 0) / impacts.length);
  return Math.max(5, Math.min(98, Math.round(worst * 0.55 + avg * 0.45)));
}

export function correlateExternalIntelligence(input: {
  domain: string;
  providers: ExternalIntelProviderResult[];
  findings: ExternalIntelFinding[];
  cves: VendorExternalIntel['cves'];
  breachIntel: VendorBreachIntel;
}): VendorExternalIntel {
  const findings = dedupeFindings(input.findings);
  const liveProviders = input.providers.filter((p) => p.live && (p.status === 'ok' || p.status === 'clear' || p.status === 'findings')).length;
  const correlatedScore100 = computeCorrelatedScore(findings, liveProviders);

  const configured = input.providers.filter((p) => p.configured).length;
  const errored = input.providers.filter((p) => p.status === 'error').length;
  const summaryParts = [
    `Correlated ${findings.length} finding(s) across ${liveProviders} live source(s)`,
    `${configured} provider(s) configured`,
  ];
  if (errored) summaryParts.push(`${errored} provider error(s)`);
  if (input.cves.length) summaryParts.push(`${input.cves.length} CVE(s) enriched`);

  const checkedAt = new Date().toISOString();
  return {
    domain: input.domain,
    checkedAt,
    live: liveProviders > 0,
    correlatedScore100,
    providers: ensureExternalIntelProviders(input.providers, checkedAt),
    findings,
    cves: input.cves,
    summary: summaryParts.join(' · '),
    breachIntel: input.breachIntel,
  };
}

/** Overlay live correlated intel onto attack-surface vectors; never fake clear on errors. */
export function applyExternalIntelToVectors(
  vectors: ExternalRiskVector[],
  intel: VendorExternalIntel | null
): ExternalRiskVector[] {
  if (!intel) return vectors;
  let next = [...vectors];

  const breach = intel.breachIntel as VendorBreachIntel | undefined;
  if (breach) {
    next = applyLiveBreachToVectors(next, breach);
  }

  const surfaceProviders = intel.providers.filter(
    (p) => (p.source === 'shodan' || p.source === 'censys') && p.live
  );
  if (surfaceProviders.length > 0) {
    const openHigh = intel.findings.filter(
      (f) =>
        (f.source === 'shodan' || f.source === 'censys') &&
        f.type === 'exposed_service' &&
        (f.severity === 'high' || f.severity === 'critical')
    ).length;
    const ports = intel.findings.filter(
      (f) =>
        (f.source === 'shodan' || f.source === 'censys') && f.type === 'exposed_service'
    ).length;
    const allClear = surfaceProviders.every((p) => p.status === 'clear');
    const score = allClear ? 90 : Math.max(15, 85 - openHigh * 18 - Math.min(30, ports * 2));
    const detail = surfaceProviders.map((p) => p.message).join(' · ');
    next = next.map((v) =>
      v.id === 'network' || v.id === 'ssl'
        ? {
            ...v,
            score: v.id === 'network' ? score : Math.min(95, score + 5),
            status: score >= 75 ? 'pass' : score >= 55 ? 'warn' : 'fail',
            detail,
          }
        : v
    );
  }

  const vt = intel.providers.find((p) => p.source === 'virustotal');
  if (vt?.live) {
    const score =
      vt.status === 'clear'
        ? 92
        : Math.max(
            10,
            intel.findings.find((f) => f.source === 'virustotal')?.scoreImpact ?? 45
          );
    next = next.map((v) =>
      v.id === 'web'
        ? {
            ...v,
            score,
            status: score >= 75 ? 'pass' : score >= 55 ? 'warn' : 'fail',
            detail: vt.message,
          }
        : v
    );
  }

  const cveFindings = intel.findings.filter(
    (f) =>
      f.cve &&
      (f.source === 'nvd' || f.source === 'epss' || f.source === 'shodan' || f.source === 'censys')
  );
  if (cveFindings.length > 0) {
    const worstEpss = Math.max(0, ...intel.cves.map((c) => c.epss ?? 0));
    const score = Math.max(8, Math.round(88 - cveFindings.length * 6 - worstEpss * 40));
    next = next.map((v) =>
      v.id === 'network'
        ? {
            ...v,
            score: Math.min(v.score, score),
            status: Math.min(v.score, score) >= 75 ? 'pass' : Math.min(v.score, score) >= 55 ? 'warn' : 'fail',
            detail: `${v.detail}; ${cveFindings.length} correlated CVE signal(s)`,
          }
        : v
    );
  }

  return next;
}

export function parseExternalIntel(value: unknown): VendorExternalIntel | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Partial<VendorExternalIntel>;
  if (typeof v.domain !== 'string' || typeof v.checkedAt !== 'string' || !Array.isArray(v.providers)) {
    return null;
  }
  const checkedAt = v.checkedAt;
  return {
    domain: v.domain,
    checkedAt,
    live: Boolean(v.live),
    correlatedScore100: typeof v.correlatedScore100 === 'number' ? v.correlatedScore100 : null,
    providers: ensureExternalIntelProviders(
      v.providers as VendorExternalIntel['providers'],
      checkedAt
    ),
    findings: Array.isArray(v.findings) ? (v.findings as VendorExternalIntel['findings']) : [],
    cves: Array.isArray(v.cves) ? (v.cves as VendorExternalIntel['cves']) : [],
    summary: typeof v.summary === 'string' ? v.summary : '',
    breachIntel: v.breachIntel,
  };
}
