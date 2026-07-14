import { NextResponse } from 'next/server';
import { checkDueReminders, recordReminder } from '@/lib/cycles/cycle-engine';
import { sendCycleReminderEmail } from '@/lib/email/send-cycle-reminder';
import { requireCronOrDemoAdmin } from '@/lib/server/require-demo-admin';

/**
 * GET /api/cycles/reminders
 *
 * Cron-like endpoint that checks for due/overdue program cycles and:
 * 1. Creates in-app reminder log entries (always)
 * 2. Sends email reminders via Resend/SMTP/stub
 *
 * Authorize with `Authorization: Bearer <CRON_SECRET>` / `X-Cron-Secret`,
 * or a demo admin session. Pass ?dryRun=true to preview without sending.
 * Optional ?email= override is only applied for authorized callers.
 */
export async function GET(request: Request) {
  const gate = await requireCronOrDemoAdmin(request);
  if ('error' in gate) return gate.error;

  const url = new URL(request.url);
  const dryRun = url.searchParams.get('dryRun') === 'true';
  const recipientOverride = url.searchParams.get('email')?.trim() || '';

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
    return NextResponse.json({ error: 'Failed to process reminders' }, { status: 500 });
  }
}
