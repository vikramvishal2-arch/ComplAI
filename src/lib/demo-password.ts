import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 } as const;

export function hashDemoPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 32, SCRYPT_PARAMS);
  return `scrypt$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export function verifyDemoPassword(password: string, stored: string): boolean {
  const [algo, saltB64, hashB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
  try {
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const derived = scryptSync(password, salt, 32, SCRYPT_PARAMS);
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

