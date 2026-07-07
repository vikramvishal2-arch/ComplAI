import { getIllConfig } from '@/lib/ill/config';

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(clientId: string): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const { gatewayRateLimitPerMinute } = getIllConfig();
  const now = Date.now();
  const windowMs = 60_000;
  const bucket = buckets.get(clientId) ?? { count: 0, windowStart: now };

  if (now - bucket.windowStart >= windowMs) {
    bucket.count = 0;
    bucket.windowStart = now;
  }

  bucket.count += 1;
  buckets.set(clientId, bucket);

  if (bucket.count > gatewayRateLimitPerMinute) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - bucket.windowStart)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}
