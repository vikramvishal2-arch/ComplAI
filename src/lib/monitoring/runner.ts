import 'server-only';
import { prisma } from '../db/prisma';
import { getDefaultOrganization } from '../db/repository';
import { runAwsChecks } from './checks/aws';
import { runAzureChecks } from './checks/azure';
import type { MonitorCheckOutcome, MonitorRunSummary } from './types';

export async function executeMonitorRun(provider: 'aws' | 'azure'): Promise<MonitorRunSummary> {
  const org = await getDefaultOrganization();

  const run = await prisma.monitorCheckRun.create({
    data: {
      organizationId: org.id,
      provider,
      status: 'running',
    },
  });

  let outcomes: MonitorCheckOutcome[] = [];
  try {
    outcomes = provider === 'aws' ? await runAwsChecks() : await runAzureChecks();
  } catch (err) {
    await prisma.monitorCheckRun.update({
      where: { id: run.id },
      data: {
        status: 'error',
        summary: err instanceof Error ? err.message : 'Run failed',
        completedAt: new Date(),
        errors: 1,
      },
    });
    throw err;
  }

  const passed = outcomes.filter((o) => o.status === 'pass').length;
  const failed = outcomes.filter((o) => o.status === 'fail').length;
  const errors = outcomes.filter((o) => o.status === 'error').length;
  const summary = `${passed} passed, ${failed} failed, ${errors} errors`;

  await prisma.monitorCheckResult.createMany({
    data: outcomes.map((o) => ({
      organizationId: org.id,
      runId: run.id,
      checkId: o.checkId,
      checkName: o.checkName,
      controlId: o.controlId ?? null,
      status: o.status,
      message: o.message,
      remediation: o.remediation,
    })),
  });

  await prisma.monitorCheckRun.update({
    where: { id: run.id },
    data: {
      status: failed > 0 ? 'failed' : 'passed',
      passed,
      failed,
      errors,
      summary,
      completedAt: new Date(),
    },
  });

  return {
    runId: run.id,
    provider,
    status: failed > 0 ? 'failed' : 'passed',
    passed,
    failed,
    errors,
    summary,
    results: outcomes,
    startedAt: run.startedAt.toISOString(),
    completedAt: new Date().toISOString(),
  };
}

export async function getLatestMonitorRuns(limit = 10) {
  const org = await getDefaultOrganization();
  const runs = await prisma.monitorCheckRun.findMany({
    where: { organizationId: org.id },
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: { results: true },
  });
  return runs;
}

export async function getMonitorDashboard() {
  const org = await getDefaultOrganization();
  const [latestAws, latestAzure, recentRuns] = await Promise.all([
    prisma.monitorCheckRun.findFirst({
      where: { organizationId: org.id, provider: 'aws' },
      orderBy: { startedAt: 'desc' },
      include: { results: true },
    }),
    prisma.monitorCheckRun.findFirst({
      where: { organizationId: org.id, provider: 'azure' },
      orderBy: { startedAt: 'desc' },
      include: { results: true },
    }),
    prisma.monitorCheckRun.findMany({
      where: { organizationId: org.id },
      orderBy: { startedAt: 'desc' },
      take: 5,
    }),
  ]);

  return { latestAws, latestAzure, recentRuns };
}
