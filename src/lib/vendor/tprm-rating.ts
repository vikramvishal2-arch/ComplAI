/** UpGuard-style 0–950 security rating bands */

export function toUpguardRating(score100: number | null): number | null {
  if (score100 == null) return null;
  return Math.round(Math.max(0, Math.min(950, score100 * 9.5)));
}

export function fromUpguardRating(r950: number): number {
  return Math.round(r950 / 9.5);
}

export type RatingBand = 'excellent' | 'good' | 'fair' | 'poor' | 'critical' | 'unrated';

export function getRatingBand(r950: number | null): RatingBand {
  if (r950 == null) return 'unrated';
  if (r950 >= 801) return 'excellent';
  if (r950 >= 701) return 'good';
  if (r950 >= 601) return 'fair';
  if (r950 >= 501) return 'poor';
  return 'critical';
}

export const RATING_BAND_CONFIG: Record<
  RatingBand,
  { label: string; bg: string; text: string; ring: string; bar: string }
> = {
  excellent: {
    label: 'Excellent',
    bg: 'bg-emerald-600',
    text: 'text-emerald-700',
    ring: 'stroke-emerald-500',
    bar: 'bg-emerald-500',
  },
  good: {
    label: 'Good',
    bg: 'bg-lime-600',
    text: 'text-lime-700',
    ring: 'stroke-lime-500',
    bar: 'bg-lime-500',
  },
  fair: {
    label: 'Fair',
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    ring: 'stroke-amber-500',
    bar: 'bg-amber-500',
  },
  poor: {
    label: 'Poor',
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    ring: 'stroke-orange-500',
    bar: 'bg-orange-500',
  },
  critical: {
    label: 'Critical',
    bg: 'bg-red-600',
    text: 'text-red-700',
    ring: 'stroke-red-500',
    bar: 'bg-red-500',
  },
  unrated: {
    label: 'Unrated',
    bg: 'bg-slate-400',
    text: 'text-slate-500',
    ring: 'stroke-slate-300',
    bar: 'bg-slate-300',
  },
};

export interface ExternalRiskVector {
  id: string;
  label: string;
  score: number;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

/** Simulated external attack-surface vectors (UpGuard-style) derived from vendor profile */
export function computeExternalRiskVectors(input: {
  primaryDomain: string;
  securityRating100: number | null;
  tier: string;
}): ExternalRiskVector[] {
  const base = input.securityRating100 ?? 55;
  const seed = hashString(input.primaryDomain || input.tier);
  const jitter = (n: number) => Math.max(20, Math.min(98, base + ((seed >> n) % 25) - 12));

  const vectors: ExternalRiskVector[] = [
    {
      id: 'network',
      label: 'Network security',
      score: jitter(1),
      status: statusFromScore(jitter(1)),
      detail: 'Open ports, firewall exposure, and service fingerprinting',
    },
    {
      id: 'dns',
      label: 'DNS health',
      score: jitter(2),
      status: statusFromScore(jitter(2)),
      detail: 'DNSSEC, dangling records, and subdomain hygiene',
    },
    {
      id: 'ssl',
      label: 'SSL / TLS',
      score: jitter(3),
      status: statusFromScore(jitter(3)),
      detail: 'Certificate validity, protocol versions, and cipher strength',
    },
    {
      id: 'email',
      label: 'Email security',
      score: jitter(4),
      status: statusFromScore(jitter(4)),
      detail: 'SPF, DKIM, DMARC, and phishing exposure',
    },
    {
      id: 'breach',
      label: 'Breach & leak exposure',
      score: jitter(5),
      status: statusFromScore(jitter(5)),
      detail: 'Known breaches, credential leaks, and dark web mentions',
    },
    {
      id: 'web',
      label: 'Web application security',
      score: jitter(6),
      status: statusFromScore(jitter(6)),
      detail: 'HTTP headers, cookie flags, and common misconfigurations',
    },
  ];

  return vectors;
}

function statusFromScore(score: number): 'pass' | 'warn' | 'fail' {
  if (score >= 75) return 'pass';
  if (score >= 55) return 'warn';
  return 'fail';
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export interface PortfolioStats {
  vendorCount: number;
  monitoredCount: number;
  averageRating950: number | null;
  criticalFindings: number;
  pendingQuestionnaires: number;
  openRemediations: number;
  distribution: { band: RatingBand; count: number }[];
}

export function computePortfolioStats(
  vendors: Array<{
    status: string;
    securityRating: number | null;
    aiRiskScore: number | null;
    assessments: Array<{ status: string }>;
  }>,
  openFindings = 0,
  openRemediations = 0
): PortfolioStats {
  const ratings = vendors
    .map((v) => toUpguardRating(v.securityRating ?? v.aiRiskScore))
    .filter((r): r is number => r != null);

  const distribution: Record<RatingBand, number> = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    critical: 0,
    unrated: 0,
  };

  for (const v of vendors) {
    const r = toUpguardRating(v.securityRating ?? v.aiRiskScore);
    distribution[getRatingBand(r)]++;
  }

  return {
    vendorCount: vendors.length,
    monitoredCount: vendors.filter((v) => v.status === 'active' || v.status === 'monitoring').length,
    averageRating950:
      ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null,
    criticalFindings: openFindings,
    pendingQuestionnaires: vendors.filter((v) =>
      v.assessments.some((a) => a.status === 'in_progress' || a.status === 'draft')
    ).length,
    openRemediations,
    distribution: (['excellent', 'good', 'fair', 'poor', 'critical', 'unrated'] as RatingBand[]).map(
      (band) => ({ band, count: distribution[band] })
    ),
  };
}
