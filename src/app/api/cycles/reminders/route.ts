import { NextResponse } from 'next/server';
import { checkDueReminders, recordReminder } from '@/lib/cycles/cycle-engine';
import { sendCycleReminderEmail } from '@/lib/email/send-cycle-reminder';
import { PROGRAM_TYPE_LABELS } from '@/lib/types';

/**
 * GET /api/cycles/reminders
 *
 * Cron-like endpoint that checks for due/overdue program cycles and:
 * 1. Creates in-app reminder log entries (always)
 * 2. Sends email reminders via Resend/SMTP/stub
 *
 * Intended to be called by an external cron (Vercel, Railway, etc.)
 * or manually for testing. Pass ?dryRun=true to preview without sending.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === 'true';
  const recipientOverride = url.searchParams.get('email');

  try {
    const checks = await checkDueReminders();
    const pending = checks.filter((c) => !c.alreadySent);

    const sent: Array<{ cycleTitle: string; reminderType: string; channel: string }> = [];
    const skipped = checks.filter((c) => c.alreadySent).length;

    for (const check of pending) {
      const reminderType = check.triggerDays < 0 ? 'overdue' : `${check.triggerDays}d-before`;
      const triggerLabel =
        check.triggerDays < 0
          ? `OVERDUE: ${check.cycle.title}`
          : `Due in ${check.triggerDays} days: ${check.cycle.title}`;

      if (dryRun) {
        sent.push({ cycleTitle: check.cycle.title, reminderType, channel: 'dry_run' });
        continue;
      }

      await recordReminder(check.cycle.id, 'in_app', reminderType);
      sent.push({ cycleTitle: check.cycle.title, reminderType, channel: 'in_app' });

      const recipientEmail = recipientOverride || process.env.CYCLE_REMINDER_TO?.trim() || '';
      if (recipientEmail) {
        await sendCycleReminderEmail({
          cycle: check.cycle,
          triggerLabel,
          recipientEmail,
        });
        await recordReminder(check.cycle.id, 'email', reminderType, recipientEmail);
        sent.push({ cycleTitle: check.cycle.title, reminderType, channel: 'email' });
      }
    }

    return NextResponse.json({
      processed: checks.length,
      sent: sent.length,
      skipped,
      dryRun,
      details: sent,
    });
  } catch (error) {
    console.error('GET /api/cycles/reminders', error);
    const message = error instanceof Error ? error.message : 'Failed to process reminders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
