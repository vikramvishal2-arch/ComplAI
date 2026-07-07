import { PrismaClient } from '@prisma/client';
import { syncEdgeCacheFromDb } from '../src/lib/ill/cache/sync';
import { runFeedIngestionPipeline } from '../src/lib/ill/threat-db/feed-ingestion';

const prisma = new PrismaClient();

const PILOT_CIRCUITS = [
  {
    circuitId: 'ILL-AIRTEL-DEL-001',
    customerName: 'Pilot Enterprise — Delhi NCR',
    nsp: 'airtel',
    pop: 'DEL-POP-01',
    failMode: 'fail_open',
    policyProfile: 'standard',
  },
  {
    circuitId: 'ILL-AIRTEL-MUM-002',
    customerName: 'Pilot Enterprise — Mumbai',
    nsp: 'airtel',
    pop: 'MUM-POP-03',
    failMode: 'fail_open',
    policyProfile: 'standard',
  },
  {
    circuitId: 'ILL-VODAFONE-BLR-003',
    customerName: 'Pilot Enterprise — Bengaluru',
    nsp: 'vodafone',
    pop: 'BLR-POP-02',
    failMode: 'fail_closed',
    policyProfile: 'strict',
  },
];

async function main() {
  console.log('Seeding ILL threat intel data...');

  const ingestion = await runFeedIngestionPipeline();
  console.log(`Ingested ${ingestion.iocs} IOCs from ${ingestion.feeds} feeds`);

  for (const circuit of PILOT_CIRCUITS) {
    await prisma.illCircuit.upsert({
      where: { circuitId: circuit.circuitId },
      create: circuit,
      update: {
        customerName: circuit.customerName,
        nsp: circuit.nsp,
        pop: circuit.pop,
        failMode: circuit.failMode,
        policyProfile: circuit.policyProfile,
        active: true,
      },
    });
  }
  console.log(`Seeded ${PILOT_CIRCUITS.length} pilot ILL circuits`);

  const sync = await syncEdgeCacheFromDb(new Date(0));
  console.log(`Edge cache loaded ${sync.loaded} malicious IOCs`);

  console.log('ILL seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
