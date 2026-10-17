import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();
const db = admin.firestore();

/**
 * Scheduled Cloud Function running daily at 09:00 (Asia/Rangoon time zone).
 * Inspects all active employee records across all tenant users, identifies
 * birthdays and completed work anniversaries (>= 1 year of service),
 * personalizes messages with Gemini AI (with template fallback),
 * dispatches notifications via Email, Teams, and Telegram, and logs delivery
 * using canonical Firestore document IDs.
 */
export const dailyMilestoneCheck = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Rangoon')
  .onRun(async () => {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const usersSnap = await db.collection('users').get();

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const settingsSnap = await db.collection('settings').doc(userId).get();
      if (!settingsSnap.exists) continue;

      const settings = settingsSnap.data() as any;
      const empSnap = await db.collection('employees')
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .get();

      for (const empDoc of empSnap.docs) {
        const empData = empDoc.data() as any;
        const empDocId = empDoc.id;
        const emp = { ...empData, id: empDocId };

        // Check Birthday (MM-DD match)
        if (emp.dob && emp.dob.endsWith(todayStr)) {
          await sendNotification(userId, empDocId, emp, 'BIRTHDAY', settings);
        }

        // Check Work Anniversary (MM-DD match with >= 1 year completed service guard)
        if (emp.joinedDate && emp.joinedDate.endsWith(todayStr)) {
          const joinedYear = parseInt(emp.joinedDate.slice(0, 4), 10);
          const yearsOfService = !isNaN(joinedYear) ? today.getFullYear() - joinedYear : 0;
          if (yearsOfService >= 1) {
            await sendNotification(userId, empDocId, emp, 'ANNIVERSARY', settings, yearsOfService);
          }
        }
      }
    }
  });

/**
 * Optional Gemini AI greeting generator.
 * Uses Gemini API (gemini-2.5-flash) when GEMINI_API_KEY is provided in
 * environment variables or tenant settings to craft a warm, personalized
 * celebration message incorporating the employee's role, department, and tenure.
 * If no key is configured or the API request fails, gracefully falls back to the template.
 */
async function generateGeminiGreeting(
  type: 'BIRTHDAY' | 'ANNIVERSARY',
  emp: any,
  fallbackMsg: string,
  years?: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return fallbackMsg;

  try {
    const prompt = type === 'BIRTHDAY'
      ? `Write a warm, concise 1-2 sentence employee birthday celebration message for ${emp.name}, who works in the ${emp.department || 'our'} department. Include celebratory emojis. Output only the greeting text.`
      : `Write a warm, inspiring 1-2 sentence work anniversary message for ${emp.name}, celebrating ${years} year(s) of service in the ${emp.department || 'our'} department. Include celebratory emojis. Output only the greeting text.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn(`Gemini API returned status ${res.status}; using fallback message.`);
      return fallbackMsg;
    }

    const data: any = await res.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return candidate || fallbackMsg;
  } catch (err) {
    console.warn('Gemini AI greeting generation error; using fallback message:', err);
    return fallbackMsg;
  }
}

/**
 * Dispatches milestone celebration notification across configured channels (Email, Teams, Telegram)
 * and logs delivery status using the canonical Firestore employee document ID.
 */
async function sendNotification(
  userId: string,
  empDocId: string,
  emp: any,
  type: 'BIRTHDAY' | 'ANNIVERSARY',
  settings: any,
  years?: number
) {
  const { templates, smtp, teams, telegram } = settings;

  let msg = type === 'BIRTHDAY' ? templates?.birthday : templates?.anniversary;
  if (!msg) {
    msg = type === 'BIRTHDAY'
      ? 'Happy Birthday, {{employee_name}}! 🎂 Wishing you a wonderful day!'
      : 'Congratulations {{employee_name}} on {{years_of_service}} year(s) with {{department}}! 🏆';
  }

  // Populate template tokens
  msg = msg
    .replace(/\{\{employee_name\}\}/g, emp.name || 'Team Member')
    .replace(/\{\{department\}\}/g, emp.department || 'General')
    .replace(/\{\{years_of_service\}\}/g, String(years || 1))
    .replace(/\{\{job_title\}\}/g, emp.jobTitle || emp.role || 'Colleague');

  // Enhance with Gemini AI personalization when API key is available
  msg = await generateGeminiGreeting(type, emp, msg, years);

  const businessEmpId = emp.employeeId || empDocId;

  // 1. Email (SMTP)
  if (smtp?.enabled && smtp?.host) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        auth: { user: smtp.user, pass: smtp.pass },
      });

      await transporter.sendMail({
        from: smtp.user,
        to: smtp.sendToEmployee ? emp.email : smtp.user,
        subject: `Celebration: ${type} - ${emp.name}`,
        text: msg,
      });

      await logNotification(userId, empDocId, businessEmpId, type, 'email', 'success');
    } catch (e: any) {
      await logNotification(userId, empDocId, businessEmpId, type, 'email', 'failure', e.message);
    }
  }

  // 2. Microsoft Teams Webhook
  if (teams?.enabled && teams?.webhookUrl) {
    try {
      await fetch(teams.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg }),
      });
      await logNotification(userId, empDocId, businessEmpId, type, 'teams', 'success');
    } catch (e: any) {
      await logNotification(userId, empDocId, businessEmpId, type, 'teams', 'failure', e.message);
    }
  }

  // 3. Telegram Bot
  if (telegram?.enabled && telegram?.botToken && telegram?.chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegram.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegram.chatId, text: msg }),
      });
      await logNotification(userId, empDocId, businessEmpId, type, 'telegram', 'success');
    } catch (e: any) {
      await logNotification(userId, empDocId, businessEmpId, type, 'telegram', 'failure', e.message);
    }
  }
}

/**
 * Persists an audit delivery log in Firestore `notificationLogs` collection.
 */
async function logNotification(
  userId: string,
  employeeDocId: string,
  employeeBusinessId: string,
  milestoneType: string,
  channel: string,
  status: string,
  error?: string
) {
  await db.collection('notificationLogs').add({
    userId,
    employeeId: employeeDocId,
    employeeBusinessId: employeeBusinessId || '',
    milestoneType,
    channel,
    status,
    error: error || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}
