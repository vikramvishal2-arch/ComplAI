import { getPublicVendorProfile, normalizeVendorDomain } from './public-vendor-profiles';
import type { VendorCertification } from './vendor-assessment-types';
import { parseCertifications } from './vendor-assessment-types';

export type ResolvedVendorCertifications = {
  certifications: VendorCertification[];
  /** Curated from public internet / trust-center intelligence */
  fromPublicProfile: boolean;
  verifiedOverInternet: boolean;
};

/**
 * Resolve vendor certifications for the risk profile.
 * Prefers internet-verified public intelligence; falls back to stored vendor records; otherwise blank.
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
