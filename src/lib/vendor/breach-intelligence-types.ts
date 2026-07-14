/** Client-safe types for live Have I Been Pwned breach intelligence. */

export type VendorBreachRecord = {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  pwnCount: number;
  dataClasses: string[];
  isVerified: boolean;
  isSensitive: boolean;
  description: string;
  sourceUrl: string;
};

export type VendorBreachIntel = {
  domain: string;
  checkedAt: string;
  live: boolean;
  source: 'haveibeenpwned';
  status: 'clear' | 'breaches_found' | 'error' | 'skipped';
  breachCount: number;
  breaches: VendorBreachRecord[];
  error?: string;
  message: string;
};
