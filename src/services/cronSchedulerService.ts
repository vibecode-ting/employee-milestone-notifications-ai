import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { checkAndSendTodaysMilestones } from './celebrationPipelineService';

const prisma = new PrismaClient();
let currentCronTask: cron.ScheduledTask | null = null;

export async function startCronScheduler(): Promise<void> {
  const settings = await prisma.appSettings.findFirst({ where: { id: 'default_org' } });
  const triggerTime = settings?.dailyTriggerTime || '08:30';
  const [hour, minute] = triggerTime.split(':').map(Number);

  // Stop existing cron if running
  if (currentCronTask) {
    currentCronTask.stop();
    currentCronTask = null;
  }

  const cronExpression = `${minute} ${hour} * * *`;
  console.log(`⏰ Cron scheduler started: daily at ${triggerTime} (cron: "${cronExpression}")`);

  currentCronTask = cron.schedule(cronExpression, async () => {
    console.log(`\n🚀 [${new Date().toISOString()}] Daily milestone check triggered`);
    try {
      const results = await checkAndSendTodaysMilestones();
      console.log(`✅ Daily milestone check complete. Processed ${results.length} celebration(s).`);
      results.forEach(r => {
        console.log(`  ${r.success ? '✅' : '❌'} ${r.employeeName} (${r.eventType}): ${r.deliveryStatus}`);
      });
    } catch (err) {
      console.error('❌ Daily milestone check failed:', err);
    }
  }, {
    timezone: settings?.timezone || 'Asia/Singapore',
  });

  console.log(`📅 Milestone emails will auto-send to eligible employees each day at ${triggerTime}.`);
}

export async function restartCronWithNewSettings(): Promise<void> {
  console.log('🔄 Restarting cron scheduler with updated settings...');
  await startCronScheduler();
}

// Handler for Google Cloud Scheduler webhook triggers
export async function handleCloudSchedulerWebhook(): Promise<{ processed: number; results: any[] }> {
  console.log(`☁️ Cloud Scheduler webhook triggered at ${new Date().toISOString()}`);
  const results = await checkAndSendTodaysMilestones();
  return { processed: results.length, results };
}
