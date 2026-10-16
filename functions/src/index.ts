import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();
const db = admin.firestore();

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
        const emp = empDoc.data() as any;

        // Check Birthday
        if (emp.dob && emp.dob.endsWith(todayStr)) {
          await sendNotification(userId, emp, 'BIRTHDAY', settings);
        }

        // Check Work Anniversary
        if (emp.joinedDate && emp.joinedDate.endsWith(todayStr)) {
          await sendNotification(userId, emp, 'ANNIVERSARY', settings);
        }
      }
    }
  });

async function sendNotification(userId: string, emp: any, type: 'BIRTHDAY' | 'ANNIVERSARY', settings: any) {
  const { templates, smtp, teams, telegram } = settings;

  let msg = type === 'BIRTHDAY' ? templates?.birthday : templates?.anniversary;
  msg = msg
    ?.replace('{{employee_name}}', emp.name)
    ?.replace('{{department}}', emp.department);

  // Email
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

      await logNotification(userId, emp.id, type, 'email', 'success');
    } catch (e: any) {
      await logNotification(userId, emp.id, type, 'email', 'failure', e.message);
    }
  }

  // Teams Webhook
  if (teams?.enabled && teams?.webhookUrl) {
    try {
      await fetch(teams.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg }),
      });
      await logNotification(userId, emp.id, type, 'teams', 'success');
    } catch (e: any) {
      await logNotification(userId, emp.id, type, 'teams', 'failure', e.message);
    }
  }

  // Telegram
  if (telegram?.enabled && telegram?.botToken && telegram?.chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegram.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegram.chatId, text: msg }),
      });
      await logNotification(userId, emp.id, type, 'telegram', 'success');
    } catch (e: any) {
      await logNotification(userId, emp.id, type, 'telegram', 'failure', e.message);
    }
  }
}

async function logNotification(
  userId: string,
  employeeId: string,
  milestoneType: string,
  channel: string,
  status: string,
  error?: string
) {
  await db.collection('notificationLogs').add({
    userId,
    employeeId: employeeId || '',
    milestoneType,
    channel,
    status,
    error: error || null,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}
