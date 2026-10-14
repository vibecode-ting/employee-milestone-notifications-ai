import { PrismaClient, Employee } from '@prisma/client';
import { generateCelebrationContent, EmployeeContext } from './aiMessageService';
import { generateCelebrationCard, CardStyle, EventType } from './cardGeneratorService';
import { sendEmail, buildCelebrationEmailHtml } from './emailService';
import { sendTeamsNotification, sendTelegramNotification } from './webhookService';

const prisma = new PrismaClient();

export interface PipelineOptions {
  employeeId: string;
  eventType: EventType;
  milestoneYear?: number;
  forcePreview?: boolean; // Don't actually send, just generate
  overrideEmail?: string; // Send to this email instead (for judge demo)
}

export interface PipelineResult {
  success: boolean;
  employeeName: string;
  eventType: string;
  cardDataUrl?: string;
  emailSubject?: string;
  previewUrl?: string;
  deliveryStatus: string;
  channelsDispatched: string[];
  logId?: string;
  error?: string;
}

export async function runCelebrationPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { employeeId, eventType, milestoneYear, forcePreview = false, overrideEmail } = options;

  // 1. Fetch employee and settings
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  const settings = await prisma.appSettings.findFirst({ where: { id: 'default_org' } });

  if (!employee) {
    return { success: false, employeeName: 'Unknown', eventType, deliveryStatus: 'FAILED', channelsDispatched: [], error: 'Employee not found' };
  }

  // 2. Eligibility check
  const autoEmailEnabled = settings?.enableAutoEmail && employee.autoSendEmail;
  const notifyBirthday = eventType === 'BIRTHDAY' && employee.notifyOnBirthday;
  const notifyAnniversary = eventType === 'WORK_ANNIVERSARY' && employee.notifyOnAnniversary;
  const shouldSend = forcePreview || overrideEmail || autoEmailEnabled && (notifyBirthday || notifyAnniversary || eventType === 'MANUAL_RECOGNITION');

  // 3. Parse custom attributes
  let customAttributes: Record<string, string> = {};
  try {
    const rawAttrs = typeof employee.customAttributes === 'string'
      ? JSON.parse(employee.customAttributes)
      : employee.customAttributes;

    // Filter to only AI-enabled columns
    let aiColumns: string[] = [];
    try {
      const schemaRaw = settings?.customColumnSchema || '[]';
      const schema = JSON.parse(schemaRaw as string);
      aiColumns = schema.filter((c: any) => c.useInAiPrompt).map((c: any) => c.key);
    } catch { }

    customAttributes = aiColumns.length > 0
      ? Object.fromEntries(Object.entries(rawAttrs).filter(([k]) => aiColumns.includes(k))) as Record<string, string>
      : rawAttrs;
  } catch { }

  // 4. Generate AI content
  const aiContext: EmployeeContext = {
    fullName: employee.fullName,
    role: employee.role || undefined,
    department: employee.department || undefined,
    preferredLanguage: employee.preferredLanguage || 'English',
    eventType,
    milestoneYear,
    companyName: settings?.companyName || 'Acme JAPAC Technologies',
    customAttributes,
    aiTone: settings?.aiTone || 'warm_professional',
    giftBudgetUsd: settings?.defaultGiftBudgetUsd || 50,
  };

  const aiContent = await generateCelebrationContent(aiContext);

  // 5. Generate celebration card
  let cardBuffer: Buffer | undefined;
  let cardDataUrl: string | undefined;
  try {
    const cardInput = {
      employeeName: employee.fullName,
      role: employee.role || undefined,
      companyName: settings?.companyName || 'Acme JAPAC Technologies',
      eventType,
      milestoneYear,
      cardHeadline: aiContent.cardHeadline,
      cardSubtext: aiContent.cardSubtext,
      style: (settings?.cardVisualStyle || 'modern_gradient') as CardStyle,
    };
    const card = await generateCelebrationCard(cardInput);
    cardBuffer = card.pngBuffer;
    cardDataUrl = card.dataUrl;
  } catch (err) {
    console.warn('Card generation failed:', (err as Error).message);
  }

  const channelsDispatched: string[] = [];
  let deliveryStatus = 'SANDBOX_PREVIEW';
  let previewUrl: string | undefined;
  let smtpMessageId: string | undefined;
  let errorMessage: string | undefined;

  // 6. Send email (if enabled or override)
  if (shouldSend) {
    const recipientEmail = overrideEmail || employee.email;
    const ccEmail = settings?.ccManagerOnEmail && employee.managerEmail ? employee.managerEmail : undefined;
    const emailHtml = buildCelebrationEmailHtml(
      employee.fullName,
      aiContent.emailBodyHtml,
      !!cardBuffer,
      settings?.companyName || 'Acme JAPAC Technologies'
    );

    const emailResult = await sendEmail({
      to: recipientEmail,
      cc: ccEmail,
      subject: aiContent.subject,
      htmlBody: emailHtml,
      cardImageBuffer: cardBuffer,
    });

    if (emailResult.success) {
      deliveryStatus = 'SENT';
      channelsDispatched.push('email');
      previewUrl = emailResult.previewUrl;
      smtpMessageId = emailResult.messageId;
    } else {
      deliveryStatus = 'FAILED';
      errorMessage = emailResult.error;
    }
  }

  // 7. Webhooks
  if (settings?.enableTeamsWebhook && settings.teamsWebhookUrl && !forcePreview) {
    try {
      await sendTeamsNotification(settings.teamsWebhookUrl, { employee, aiContent, eventType, milestoneYear, cardDataUrl });
      channelsDispatched.push('teams');
    } catch (e) { console.error('Teams webhook error:', e); }
  }
  if (settings?.enableTelegram && settings.telegramBotToken && settings.telegramChatId && !forcePreview) {
    try {
      await sendTelegramNotification(settings.telegramBotToken, settings.telegramChatId, { employee, aiContent, eventType, milestoneYear });
      channelsDispatched.push('telegram');
    } catch (e) { console.error('Telegram webhook error:', e); }
  }

  // 8. Log to database
  const logEntry = await prisma.notificationLog.create({
    data: {
      employeeId: employee.id,
      eventType,
      milestoneYear,
      emailSubject: aiContent.subject,
      generatedMessage: aiContent.emailBodyHtml,
      cardImageDataUrl: cardDataUrl,
      giftSuggestions: JSON.stringify(aiContent.giftRecommendations),
      channelsDispatched: JSON.stringify(channelsDispatched),
      recipientEmail: overrideEmail || employee.email,
      deliveryStatus,
      smtpMessageId,
      previewUrl,
      errorMessage,
    },
  });

  return {
    success: deliveryStatus !== 'FAILED',
    employeeName: employee.fullName,
    eventType,
    cardDataUrl,
    emailSubject: aiContent.subject,
    previewUrl,
    deliveryStatus,
    channelsDispatched,
    logId: logEntry.id,
  };
}

export async function checkAndSendTodaysMilestones(): Promise<PipelineResult[]> {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const currentYear = today.getFullYear();

  const employees = await prisma.employee.findMany({ where: { isActive: true } });
  const results: PipelineResult[] = [];

  for (const emp of employees) {
    // Check birthday
    if (emp.birthDate && emp.notifyOnBirthday) {
      const bd = new Date(emp.birthDate);
      if (bd.getMonth() + 1 === todayMonth && bd.getDate() === todayDay) {
        const result = await runCelebrationPipeline({ employeeId: emp.id, eventType: 'BIRTHDAY' });
        results.push(result);
      }
    }

    // Check work anniversary
    if (emp.hireDate && emp.notifyOnAnniversary) {
      const hd = new Date(emp.hireDate);
      if (hd.getMonth() + 1 === todayMonth && hd.getDate() === todayDay) {
        const milestoneYear = currentYear - hd.getFullYear();
        if (milestoneYear > 0) {
          const result = await runCelebrationPipeline({ employeeId: emp.id, eventType: 'WORK_ANNIVERSARY', milestoneYear });
          results.push(result);
        }
      }
    }
  }

  return results;
}
