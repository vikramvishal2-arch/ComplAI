import { getPublicVendorProfile, normalizeVendorDomain } from './public-vendor-profiles';
import type { VendorCertification } from './vendor-assessment-types';
import { parseCertifications } from './vendor-assessment-types';

export type ResolvedVendorCertifications = {
  certifications: VendorCertification[];
  /** From curated demo trust-center profile (not a live continuous scan) */
  fromPublicProfile: boolean;
  verifiedOverInternet: boolean;
};

/**
 * Resolve vendor certifications for the risk profile.
 * Prefers curated public trust-center entries for known demo domains; falls back to stored records.
 */
export function resolveVendorCertifications(
  primaryDomain: string | null | undefined,
  stored?: unknown
): ResolvedVendorCertifications {
  const domain = normalizeVendorDomain(primaryDomain);
  const internetCerts = lookupInternetVerifiedCertifications(domain);

  if (internetCerts.length > 0) {
    return {
      certifications: internetCerts,
      fromPublicProfile: true,
      verifiedOverInternet: true,
    };
  }

  const parsed = parseCertifications(stored);
  if (parsed.length > 0) {
    return {
      certifications: parsed,
      fromPublicProfile: false,
      verifiedOverInternet: false,
    };
  }

  return {
    certifications: [],
    fromPublicProfile: false,
    verifiedOverInternet: false,
  };
}

/** Certifications sourced from public trust centers, privacy notices, and corporate disclosures. */
export function lookupInternetVerifiedCertifications(
  domain: string | null | undefined
): VendorCertification[] {
  const key = normalizeVendorDomain(domain);
  if (!key) return [];
  const profile = getPublicVendorProfile(key);
  return profile?.certifications ?? [];
}
