#!/usr/bin/env node
/**
 * Smoke test for ILL threat intel APIs (no database required for auth/gateway checks).
 * Run after: npm run db:setup && npm run ill:seed && npm run dev
 */
const API_KEY = process.env.ILL_API_GATEWAY_KEY ?? 'ill-dev-gateway-key';
const BASE = process.env.ILL_API_BASE ?? 'http://localhost:3000/api';

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json();
  return { status: response.status, body };
}

async function main() {
  console.log('ILL Threat Intel — pilot smoke test\n');

  const clean = await request('/v1/threat-check?ip=8.8.8.8');
  console.log('Clean IP check:', clean.status, clean.body.status, clean.body.blacklisted);

  const malicious = await request('/v1/threat-check?ip=203.0.113.45');
  console.log('Malicious IP check:', malicious.status, malicious.body.status, malicious.body.blacklisted);

  const inspect = await request('/v1/ill/inspect', {
    method: 'POST',
    body: JSON.stringify({
      circuit_id: 'ILL-AIRTEL-DEL-001',
      src_ip: '10.1.1.50',
      dest_ip: '203.0.113.45',
      direction: 'outbound',
    }),
  });
  console.log('ILL inspect verdict:', inspect.status, inspect.body.decision?.verdict);

  const pilot = await request('/v1/ill/pilot/status');
  console.log('Pilot status:', pilot.status, pilot.body.pilot?.status);

  console.log('\nSmoke test complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
