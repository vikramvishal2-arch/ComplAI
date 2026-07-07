import 'server-only';
import { prisma } from '@/lib/db/prisma';
import { getDefaultOrganization } from '@/lib/db/repository';
import type {
  ProgramCycle,
  CycleReminder,
  CycleWithReminders,
  ProgramType,
  CycleStatus,
} from '@/lib/types';

function toDateString(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function parseDateString(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(`${s}T00:00:00.000Z`);
}

function computeStatus(
  row: { status: string; dueDate: Date; periodStart: Date; completedAt: Date | null }
): CycleStatus {
  if (row.completedAt || row.status === 'completed') return 'completed';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(row.dueDate);
  due.setHours(0, 0, 0, 0);
  if (now > due) return 'overdue';
  if (row.status === 'in_progress') return 'in_progress';
  const start = new Date(row.periodStart);
  start.setHours(0, 0, 0, 0);
  if (now >= start) return 'in_progress';
  return 'upcoming';
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00.000Z`);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function mapCycle(row: {
  id: string;
  programType: string;
  title: string;
  description: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  status: string;
  owner: string;
  lastCompletedAt: Date | null;
  completedAt: Date | null;
  reminderDays: unknown;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): ProgramCycle {
  const resolvedStatus = computeStatus(row);
  return {
    id: row.id,
    programType: row.programType as ProgramType,
    title: row.title,
    description: row.description,
    periodStart: toDateString(row.periodStart)!,
    periodEnd: toDateString(row.periodEnd)!,
    dueDate: toDateString(row.dueDate)!,
    status: resolvedStatus,
    owner: row.owner,
    lastCompletedAt: toDateString(row.lastCompletedAt),
    completedAt: toDateString(row.completedAt),
    reminderDays: (row.reminderDays as number[]) ?? [30, 14, 7],
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapReminder(row: {
  id: string;
  cycleId: string;
  channel: string;
  reminderType: string;
  recipientEmail: string;
  sentAt: Date;
  acknowledged: boolean;
  acknowledgedAt: Date | null;
}): CycleReminder {
  return {
    id: row.id,
    cycleId: row.cycleId,
    channel: row.channel as 'in_app' | 'email',
    reminderType: row.reminderType,
    recipientEmail: row.recipientEmail,
    sentAt: row.sentAt.toISOString(),
    acknowledged: row.acknowledged,
    acknowledgedAt: row.acknowledgedAt?.toISOString() ?? null,
  };
}

export async function getCycles(): Promise<CycleWithReminders[]> {
  const org = await getDefaultOrganization();
  const rows = await prisma.programCycle.findMany({
    where: { organizationId: org.id },
    include: { reminderLogs: { orderBy: { sentAt: 'desc' } } },
    orderBy: { dueDate: 'asc' },
  });

  return rows.map((row) => {
    const cycle = mapCycle(row);
    const reminders = row.reminderLogs.map(mapReminder);
    const days = daysUntil(cycle.dueDate);
    return {
      ...cycle,
      reminders,
      daysUntilDue: days,
      isOverdue: days < 0 && cycle.status !== 'completed',
      activeReminderCount: reminders.filter((r) => !r.acknowledged).length,
    };
  });
}

export async function getCycleById(cycleId: string): Promise<CycleWithReminders | null> {
  const org = await getDefaultOrganization();
  const row = await prisma.programCycle.findFirst({
    where: { id: cycleId, organizationId: org.id },
    include: { reminderLogs: { orderBy: { sentAt: 'desc' } } },
  });
  if (!row) return null;
  const cycle = mapCycle(row);
  const reminders = row.reminderLogs.map(mapReminder);
  const days = daysUntil(cycle.dueDate);
  return {
    ...cycle,
    reminders,
    daysUntilDue: days,
    isOverdue: days < 0 && cycle.status !== 'completed',
    activeReminderCount: reminders.filter((r) => !r.acknowledged).length,
  };
}

export async function createCycle(input: {
  programType: ProgramType;
  title: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  owner?: string;
  reminderDays?: number[];
  notes?: string;
}): Promise<ProgramCycle> {
  const org = await getDefaultOrganization();
  const row = await prisma.programCycle.create({
    data: {
      organizationId: org.id,
      programType: input.programType,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      periodStart: parseDateString(input.periodStart)!,
      periodEnd: parseDateString(input.periodEnd)!,
      dueDate: parseDateString(input.dueDate)!,
      owner: input.owner?.trim() ?? '',
      reminderDays: input.reminderDays ?? [30, 14, 7],
      notes: input.notes?.trim() ?? '',
    },
  });
  return mapCycle(row);
}

export async function updateCycle(
  cycleId: string,
  updates: Partial<{
    title: string;
    description: string;
    periodStart: string;
    periodEnd: string;
    dueDate: string;
    status: CycleStatus;
    owner: string;
    reminderDays: number[];
    notes: string;
  }>
): Promise<ProgramCycle | null> {
  const org = await getDefaultOrganization();
  const existing = await prisma.programCycle.findFirst({
    where: { id: cycleId, organizationId: org.id },
  });
  if (!existing) return null;

  const completedAt =
    updates.status === 'completed' && !existing.completedAt
      ? new Date()
      : undefined;

  const row = await prisma.programCycle.update({
    where: { id: cycleId },
    data: {
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
      ...(updates.periodStart !== undefined ? { periodStart: parseDateString(updates.periodStart)! } : {}),
      ...(updates.periodEnd !== undefined ? { periodEnd: parseDateString(updates.periodEnd)! } : {}),
      ...(updates.dueDate !== undefined ? { dueDate: parseDateString(updates.dueDate)! } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.owner !== undefined ? { owner: updates.owner.trim() } : {}),
      ...(updates.reminderDays !== undefined ? { reminderDays: updates.reminderDays } : {}),
      ...(updates.notes !== undefined ? { notes: updates.notes.trim() } : {}),
      ...(completedAt ? { completedAt, lastCompletedAt: completedAt } : {}),
    },
  });
  return mapCycle(row);
}

export async function deleteCycle(cycleId: string): Promise<boolean> {
  const org = await getDefaultOrganization();
  const existing = await prisma.programCycle.findFirst({
    where: { id: cycleId, organizationId: org.id },
  });
  if (!existing) return false;
  await prisma.programCycle.delete({ where: { id: cycleId } });
  return true;
}

export async function acknowledgeReminder(reminderId: string): Promise<boolean> {
  const row = await prisma.cycleReminderLog.findUnique({ where: { id: reminderId } });
  if (!row) return false;
  await prisma.cycleReminderLog.update({
    where: { id: reminderId },
    data: { acknowledged: true, acknowledgedAt: new Date() },
  });
  return true;
}

export async function getUpcomingReminders(): Promise<CycleWithReminders[]> {
  const cycles = await getCycles();
  return cycles.filter(
    (c) =>
      c.status !== 'completed' &&
      (c.daysUntilDue <= 30 || c.isOverdue)
  );
}

export async function getUnacknowledgedReminderCount(): Promise<number> {
  const org = await getDefaultOrganization();
  const count = await prisma.cycleReminderLog.count({
    where: {
      cycle: { organizationId: org.id },
      acknowledged: false,
    },
  });
  return count;
}

export interface DueCycleCheck {
  cycle: ProgramCycle;
  triggerDays: number;
  alreadySent: boolean;
}

export async function checkDueReminders(): Promise<DueCycleCheck[]> {
  const cycles = await getCycles();
  const results: DueCycleCheck[] = [];

  for (const cycle of cycles) {
    if (cycle.status === 'completed') continue;

    const reminderDays = cycle.reminderDays;
    for (const days of reminderDays) {
      if (cycle.daysUntilDue <= days) {
        const reminderType = `${days}d-before`;
        const alreadySent = cycle.reminders.some(
          (r) => r.reminderType === reminderType
        );
        results.push({ cycle, triggerDays: days, alreadySent });
      }
    }

    if (cycle.isOverdue) {
      const alreadySent = cycle.reminders.some(
        (r) => r.reminderType === 'overdue'
      );
      results.push({ cycle, triggerDays: -1, alreadySent });
    }
  }

  return results;
}

export async function recordReminder(
  cycleId: string,
  channel: 'in_app' | 'email',
  reminderType: string,
  recipientEmail?: string
): Promise<CycleReminder> {
  const row = await prisma.cycleReminderLog.create({
    data: {
      cycleId,
      channel,
      reminderType,
      recipientEmail: recipientEmail ?? '',
    },
  });
  return mapReminder(row);
}

export async function seedCycles(orgId: string): Promise<void> {
  const existing = await prisma.programCycle.count({ where: { organizationId: orgId } });
  if (existing > 0) return;

  const now = new Date();
  const year = now.getFullYear();

  const cycles = [
    {
      programType: 'internal_audit',
      title: `FY${year} Annual Internal Audit`,
      description: 'Comprehensive internal audit covering all control domains per the annual plan.',
      periodStart: `${year}-01-01`,
      periodEnd: `${year}-12-31`,
      dueDate: `${year}-09-30`,
      status: 'in_progress',
      owner: 'Internal Audit — Priya Sharma',
    },
    {
      programType: 'external_audit',
      title: `SOC 2 Type II — FY${year}`,
      description: 'External SOC 2 Type II certification audit by independent auditor.',
      periodStart: `${year}-03-01`,
      periodEnd: `${year}-05-30`,
      dueDate: `${year}-08-31`,
      status: 'in_progress',
      owner: 'GRC Program — Jane Doe',
    },
    {
      programType: 'risk_assessment',
      title: `FY${year} Annual Risk Assessment`,
      description: 'Enterprise-wide risk assessment across all business functions and technology.',
      periodStart: `${year}-01-15`,
      periodEnd: `${year}-03-31`,
      dueDate: `${year}-04-30`,
      status: 'completed',
      owner: 'Risk & Compliance — Alice Chen',
      completedAt: `${year}-04-22`,
    },
    {
      programType: 'vendor_assessment',
      title: `FY${year} Vendor Annual Review`,
      description: 'Annual assessment of all critical and high-tier vendors for security posture and compliance.',
      periodStart: `${year}-06-01`,
      periodEnd: `${year}-08-31`,
      dueDate: `${year}-09-15`,
      status: 'upcoming',
      owner: 'Vendor Management — Bob Smith',
    },
    {
      programType: 'risk_register_update',
      title: `FY${year} Risk Register Refresh`,
      description: 'Quarterly review and annual refresh of the enterprise risk register with updated scoring.',
      periodStart: `${year}-07-01`,
      periodEnd: `${year}-07-31`,
      dueDate: `${year}-07-31`,
      status: 'upcoming',
      owner: 'Risk & Compliance — Alice Chen',
    },
  ];

  for (const c of cycles) {
    const completedAt = (c as { completedAt?: string }).completedAt;
    await prisma.programCycle.create({
      data: {
        organizationId: orgId,
        programType: c.programType,
        title: c.title,
        description: c.description,
        periodStart: new Date(`${c.periodStart}T00:00:00.000Z`),
        periodEnd: new Date(`${c.periodEnd}T00:00:00.000Z`),
        dueDate: new Date(`${c.dueDate}T00:00:00.000Z`),
        status: c.status,
        owner: c.owner,
        reminderDays: [30, 14, 7],
        completedAt: completedAt ? new Date(`${completedAt}T00:00:00.000Z`) : null,
        lastCompletedAt: completedAt ? new Date(`${completedAt}T00:00:00.000Z`) : null,
      },
    });
  }

  const upcomingCycles = await prisma.programCycle.findMany({
    where: {
      organizationId: orgId,
      status: { not: 'completed' },
    },
  });

  for (const cycle of upcomingCycles) {
    const mapped = mapCycle(cycle);
    if (mapped.status !== 'completed' && daysUntil(mapped.dueDate) <= 30) {
      await prisma.cycleReminderLog.create({
        data: {
          cycleId: cycle.id,
          channel: 'in_app',
          reminderType: '30d-before',
          recipientEmail: '',
        },
      });
    }
  }
}
