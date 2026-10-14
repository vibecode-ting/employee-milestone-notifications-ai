import * as https from 'https';
import * as http from 'http';

interface WebhookPayload {
  employee: any;
  aiContent: any;
  eventType: string;
  milestoneYear?: number;
  cardDataUrl?: string;
}

export async function sendTeamsNotification(webhookUrl: string, payload: WebhookPayload): Promise<void> {
  const { employee, aiContent, eventType, milestoneYear } = payload;
  const milestoneLabel =
    eventType === 'BIRTHDAY'
      ? '🎂 Birthday'
      : eventType === 'WORK_ANNIVERSARY'
      ? `🏆 ${milestoneYear}-Year Work Anniversary`
      : '⭐ Special Recognition';

  const adaptiveCard = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              text: `${milestoneLabel} — ${employee.fullName}`,
              weight: 'Bolder',
              size: 'Large',
              color: 'Accent',
            },
            {
              type: 'TextBlock',
              text: aiContent.cardSubtext,
              wrap: true,
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Role', value: employee.role || 'Team Member' },
                { title: 'Department', value: employee.department || '—' },
              ],
            },
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: '🎉 View Full Celebration',
              url: 'http://localhost:3000',
            },
          ],
        },
      },
    ],
  };

  await postJson(webhookUrl, adaptiveCard);
}

export async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  payload: Omit<WebhookPayload, 'cardDataUrl'>
): Promise<void> {
  const { employee, aiContent, eventType, milestoneYear } = payload;
  const milestoneLabel =
    eventType === 'BIRTHDAY'
      ? '🎂 Birthday'
      : eventType === 'WORK_ANNIVERSARY'
      ? `🏆 ${milestoneYear}-Year Work Anniversary`
      : '⭐ Special Recognition';

  const text = `${milestoneLabel} — *${employee.fullName}*\n\n${aiContent.cardSubtext}\n\n_${employee.role || 'Team Member'} · ${employee.department || 'Company'}_`;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await postJson(url, { chat_id: chatId, text, parse_mode: 'Markdown' });
}

function postJson(url: string, data: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = lib.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve());
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
