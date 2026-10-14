import * as nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmailOptions {
  to: string;
  cc?: string;
  subject: string;
  htmlBody: string;
  attachments?: nodemailer.SendMailOptions['attachments'];
  cardImageBuffer?: Buffer;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  provider?: string;
  error?: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedProvider: string = '';
let etherealAccount: nodemailer.TestAccount | null = null;

async function getTransporter(): Promise<{ transporter: nodemailer.Transporter; provider: string }> {
  const settings = await prisma.appSettings.findFirst({ where: { id: 'default_org' } });
  const provider = settings?.emailProvider || 'ethereal_sandbox';

  // Don't reuse cached transporter if provider changed
  if (cachedTransporter && cachedProvider === provider) {
    return { transporter: cachedTransporter, provider };
  }

  let transporter: nodemailer.Transporter;

  switch (provider) {
    case 'gmail': {
      const user = settings?.smtpUser || process.env.GMAIL_USER;
      const pass = settings?.smtpPassEncrypted || process.env.GMAIL_APP_PASSWORD;
      if (!user || !pass) throw new Error('Gmail credentials not configured');
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
      });
      break;
    }

    case 'smtp': {
      const host = settings?.smtpHost || process.env.SMTP_HOST;
      const port = settings?.smtpPort || parseInt(process.env.SMTP_PORT || '587');
      const secure = settings?.smtpSecure || process.env.SMTP_SECURE === 'true';
      const user = settings?.smtpUser || process.env.SMTP_USER;
      const pass = settings?.smtpPassEncrypted || process.env.SMTP_PASS;
      if (!host || !user || !pass) throw new Error('SMTP credentials not fully configured');
      transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
      break;
    }

    case 'resend': {
      const apiKey = settings?.smtpPassEncrypted || process.env.RESEND_API_KEY;
      const senderEmail = settings?.senderEmail || process.env.SMTP_USER || 'noreply@example.com';
      if (!apiKey) throw new Error('Resend API key not configured');
      transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: { user: 'resend', pass: apiKey },
      });
      break;
    }

    case 'ethereal_sandbox':
    default: {
      // Zero-config free test inbox
      if (!etherealAccount) {
        etherealAccount = await nodemailer.createTestAccount();
        console.log('📬 Ethereal Sandbox created:', etherealAccount.user);
      }
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: etherealAccount.user, pass: etherealAccount.pass },
      });
      break;
    }
  }

  cachedTransporter = transporter;
  cachedProvider = provider;
  return { transporter, provider };
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const settings = await prisma.appSettings.findFirst({ where: { id: 'default_org' } });
  const senderName = settings?.senderName || 'People & Culture AI';
  const senderEmail = settings?.senderEmail || 'noreply@acme-japac.com';

  try {
    const { transporter, provider } = await getTransporter();

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: options.to,
      cc: options.cc,
      subject: options.subject,
      html: options.htmlBody,
      attachments: options.attachments || [],
    };

    // Embed card image inline with CID
    if (options.cardImageBuffer) {
      mailOptions.attachments = [
        ...(mailOptions.attachments || []),
        {
          filename: 'celebration-card.png',
          content: options.cardImageBuffer,
          cid: 'milestone_card_image',
          contentType: 'image/png',
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    if (previewUrl) {
      console.log(`📬 Ethereal preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl as string | undefined,
      provider,
    };
  } catch (error: any) {
    console.error('Email send error:', error);
    // Reset cached transporter on error so it's recreated next time
    cachedTransporter = null;
    return { success: false, error: error.message };
  }
}

export function buildCelebrationEmailHtml(
  employeeName: string,
  emailBodyHtml: string,
  hasCard: boolean,
  companyName: string = 'Acme JAPAC Technologies'
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Celebration Email</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .card-container { padding: 24px; text-align: center; background: #fafafa; }
    .card-container img { max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
    .body { padding: 24px 32px; color: #333; line-height: 1.7; font-size: 16px; }
    .footer { background: #f0f0f0; padding: 20px; text-align: center; color: #888; font-size: 13px; }
    .footer a { color: #667eea; text-decoration: none; }
    p { margin-top: 0; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${companyName}</h1>
    </div>
    ${hasCard ? `<div class="card-container"><img src="cid:milestone_card_image" alt="Celebration Card" /></div>` : ''}
    <div class="body">
      ${emailBodyHtml}
      <p><em>You can download and share your celebration card on LinkedIn! 🎉</em></p>
    </div>
    <div class="footer">
      <p>This celebration message was crafted with ❤️ by the AI Culture Engine</p>
      <p>${companyName} • People & Culture Team</p>
    </div>
  </div>
</body>
</html>`;
}
