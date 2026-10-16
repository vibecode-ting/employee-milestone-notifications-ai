// Zero-cost daily milestone check & auto email dispatcher
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  admin.initializeApp();
}

const db = admin.firestore();

async function run() {
  const now = new Date();
  const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  console.log(`Checking milestones for date pattern: ${todayStr}`);

  const usersSnap = await db.collection('users').get();
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const settingsSnap = await db.collection('settings').doc(userId).get();
    if (!settingsSnap.exists) continue;

    const settings = settingsSnap.data();
    const empSnap = await db.collection('employees')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    for (const empDoc of empSnap.docs) {
      const emp = empDoc.data();
      if (emp.dob && emp.dob.endsWith(todayStr)) {
        await send(userId, emp, 'BIRTHDAY', settings);
      }
      if (emp.joinedDate && emp.joinedDate.endsWith(todayStr)) {
        await send(userId, emp, 'ANNIVERSARY', settings);
      }
    }
  }
}

async function send(userId, emp, type, settings) {
  const { templates, smtp, teams, telegram } = settings || {};
  let msg = type === 'BIRTHDAY' ? templates?.birthday : templates?.anniversary;
  msg = (msg || '')
    .replace('{{employee_name}}', emp.name || '')
    .replace('{{department}}', emp.department || '');

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
      console.log(`Sent email to ${emp.name}`);
    } catch (e) {
      console.error(`Email error:`, e.message);
    }
  }

  if (teams?.enabled && teams?.webhookUrl) {
    try {
      await fetch(teams.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg }),
      });
    } catch (e) {
      console.error('Teams error:', e.message);
    }
  }

  if (telegram?.enabled && telegram?.botToken && telegram?.chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegram.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegram.chatId, text: msg }),
      });
    } catch (e) {
      console.error('Telegram error:', e.message);
    }
  }
}

run()
  .then(() => {
    console.log('Daily milestone dispatcher completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Dispatcher error:', err);
    process.exit(1);
  });
