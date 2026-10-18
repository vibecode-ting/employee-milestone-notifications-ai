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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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

/* =========================================================================
 * HR COPILOT — Gemini Function Calling (AI Builder Cup architecture upgrade)
 * Two tenant-scoped tools: query_employees, get_milestone_stats.
 * ========================================================================= */

const GEMINI_MODEL = 'gemini-3.6-flash';

/** Tool 1: search the caller's own tenant roster (never crosses tenants). */
async function queryEmployeesTool(
  uid: string,
  args: { department?: string; search?: string; status?: string; limit?: number }
) {
  const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);
  const q = db
    .collection('employees')
    .where('userId', '==', uid)
    .where('status', '==', args.status || 'active')
    .limit(limit);
  const snap = await q.get();
  return snap.docs
    .map((d) => {
      const e = d.data();
      return {
        employeeId: e.employeeId || d.id,
        name: e.name,
        department: e.department || null,
        jobTitle: e.jobTitle || null,
        email: e.email || null,
        joinedDate: e.joinedDate || null,
        dob: e.dob || null,
        status: e.status,
      };
    })
    .filter(
      (e) =>
        (!args.department ||
          (e.department || '').toLowerCase().includes(args.department.toLowerCase())) &&
        (!args.search ||
          (e.name || '').toLowerCase().includes(args.search.toLowerCase()) ||
          (e.employeeId || '').toLowerCase().includes(args.search.toLowerCase()) ||
          (e.email || '').toLowerCase().includes(args.search.toLowerCase()))
    );
}

/** Tool 2: milestone stats for the next N days (default 30). */
async function getMilestoneStatsTool(uid: string, args: { daysAhead?: number }) {
  const daysAhead = Math.min(Math.max(args.daysAhead ?? 30, 1), 366);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const snap = await db
    .collection('employees')
    .where('userId', '==', uid)
    .where('status', '==', 'active')
    .get();

  let birthdays = 0;
  let anniversaries = 0;
  const upcoming: Array<{ name: string; type: string; daysUntil: number; years?: number }> = [];

  for (const doc of snap.docs) {
    const e = doc.data();
    for (const [field, type] of [
      ['dob', 'BIRTHDAY'],
      ['joinedDate', 'ANNIVERSARY'],
    ] as const) {
      const raw = e[field];
      if (!raw) continue;
      const d = new Date(raw);
      let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const daysUntil = Math.round((next.getTime() - today.getTime()) / 86400000);
      if (daysUntil >= 0 && daysUntil <= daysAhead) {
        if (type === 'BIRTHDAY') {
          birthdays++;
        } else {
          const years = today.getFullYear() - d.getFullYear();
          if (years < 1) continue; // same >= 1yr guard as dailyMilestoneCheck
          anniversaries++;
        }
        upcoming.push({
          name: e.name,
          type,
          daysUntil,
          ...(type === 'ANNIVERSARY' ? { years: today.getFullYear() - d.getFullYear() } : {}),
        });
      }
    }
  }
  return {
    totalActiveEmployees: snap.size,
    windowDays: daysAhead,
    birthdays,
    anniversaries,
    upcoming: upcoming.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 25),
  };
}

export const hrCopilotQuery = functions.runWith({ timeoutSeconds: 60, memory: '512MB' }).https.onCall(async (data, context) => {
    // 1. Auth + role gate (admin or paying tier only)
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    }
    const uid = context.auth.uid;
    const userSnap = await db.collection('users').doc(uid).get();
    const role = userSnap.data()?.role || 'user';
    if (!['admin', 'pro', 'pro_plus'].includes(role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'HR Copilot requires Pro, Ultra, or Admin access.'
      );
    }

    const message: string = (data?.message || '').toString().trim().slice(0, 2000);
    if (!message) {
      throw new functions.https.HttpsError('invalid-argument', 'Message text is required.');
    }
    const history: Array<{ role: 'user' | 'model'; parts: Array<Record<string, unknown>> }> =
      Array.isArray(data?.history) ? data.history.slice(-10) : [];

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'GEMINI_API_KEY is not configured.'
      );
    }

    const functionDeclarations = [
      {
        name: 'query_employees',
        description:
          'Search the company employee roster. Filter by department (e.g. "Engineering"), free-text search over name/employeeId/email, and status. Returns sanitized employee records. Use for questions about who works here, headcount per department, or individual employee details.',
        parameters: {
          type: 'OBJECT',
          properties: {
            department: { type: 'STRING', description: 'Partial department name to filter by.' },
            search: {
              type: 'STRING',
              description: 'Free-text search: name, employee ID, or email.',
            },
            status: {
              type: 'STRING',
              enum: ['active', 'inactive'],
              description: 'Employee status. Defaults to active.',
            },
            limit: { type: 'INTEGER', description: 'Max records to return (1-50). Default 20.' },
          },
          required: [],
        },
      },
      {
        name: 'get_milestone_stats',
        description:
          'Compute birthday and work-anniversary statistics for a future date window. Use for questions like "how many birthdays next month", "what milestones are coming up", or "who is celebrating soon".',
        parameters: {
          type: 'OBJECT',
          properties: {
            daysAhead: { type: 'INTEGER', description: 'Lookahead window in days (1-366). Default 30.' },
          },
          required: [],
        },
      },
    ];

    const systemInstruction = {
      parts: [
        {
          text:
            'You are the HR Copilot for Milestone, an employee milestone notification platform. ' +
            'Answer concisely and professionally. Use the provided tools to look up REAL data — never guess employee numbers or dates. ' +
            'All data is scoped to the requesting company only. If a tool fails, say so plainly.',
        },
      ],
    };

    // 2. Agentic loop: up to 4 tool-call rounds
    const contents: Array<{ role: 'user' | 'model'; parts: Array<Record<string, unknown>> }> = [
      ...history,
      { role: 'user', parts: [{ text: message }] },
    ];
    const toolCallPills: Array<{ name: string; summary: string }> = [];
    let finalText = '';

    for (let round = 0; round < 4; round++) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction,
            contents,
            tools: [{ functionDeclarations }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
          }),
        }
      );
      if (!res.ok) {
        console.warn(`Copilot Gemini call failed: ${res.status}`);
        throw new functions.https.HttpsError('internal', 'AI model request failed. Please retry.');
      }
      const body: any = await res.json();
      const parts = body?.candidates?.[0]?.content?.parts || [];
      const calls = parts.filter((p: any) => p.functionCall);
      const textPart = parts.find((p: any) => p.text)?.text;

      if (calls.length === 0) {
        finalText = textPart || 'I could not generate a response. Please rephrase.';
        break;
      }

      // Record model turn, then execute each requested tool
      contents.push({
        role: 'model',
        parts: calls.map((c: any) => ({ functionCall: c.functionCall })),
      });

      const functionResponses: Array<Record<string, unknown>> = [];
      for (const { functionCall } of calls) {
        const args = (functionCall.args || {}) as any;
        let result: { name: string; result: unknown };
        try {
          if (functionCall.name === 'query_employees') {
            const rows = await queryEmployeesTool(uid, args);
            toolCallPills.push({
              name: 'query_employees',
              summary: `🔍 Queried ${rows.length} employee(s)`,
            });
            result = { name: 'query_employees', result: rows };
          } else if (functionCall.name === 'get_milestone_stats') {
            const stats = await getMilestoneStatsTool(uid, args);
            toolCallPills.push({
              name: 'get_milestone_stats',
              summary: `📈 ${stats.birthdays} birthday(s), ${stats.anniversaries} anniversary(s) in ${stats.windowDays}d`,
            });
            result = { name: 'get_milestone_stats', result: stats };
          } else {
            result = { name: functionCall.name, result: { error: 'Unknown tool.' } };
          }
        } catch (e: any) {
          console.warn('Copilot tool execution failed:', e);
          result = { name: functionCall.name, result: { error: 'Tool execution failed.' } };
        }
        functionResponses.push({
          functionResponse: { name: result.name, response: result.result },
        });
      }
      contents.push({ role: 'user', parts: functionResponses });
    }

    // 3. Return answer + Tool Call Pill metadata for multimodal transparency
    return { reply: finalText, toolCalls: toolCallPills, model: GEMINI_MODEL };
  });

/**
 * Backend Cloud Function: extractDocumentOcr
 * Enables frontend users and judges to run Gemini Multimodal Vision OCR securely
 * via backend environment secrets without having to provide or expose their own API key.
 */
export const extractDocumentOcr = functions
  .runWith({ timeoutSeconds: 60, memory: '512MB' })
  .https.onCall(async (data) => {
    const fileBase64 = data?.fileBase64;
    const mimeType = data?.mimeType || 'image/jpeg';
    if (!fileBase64 || typeof fileBase64 !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Missing fileBase64 data.');
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Backend GEMINI_API_KEY is not configured.'
      );
    }

    const prompt = `You are an expert HR Document AI parser for enterprise workforce systems.
Analyze this uploaded document/image (employee badge, roster spreadsheet, ID card, business card, onboarding slip, or team roster).
Extract all individual employee records present in the document.

For each employee found, return a JSON object with:
- "name": Full name (required)
- "department": Department or functional division (e.g. Engineering, People & Culture, Cloud DevOps, Product Design, Marketing, Finance). If not explicitly visible, infer from job title.
- "role": Job title (e.g. Senior Software Engineer, HR Business Partner)
- "email": Work email address (if not found in document, infer from name and standard company domain @company.com)
- "phone": Phone number if visible (or empty string)
- "dob": Date of birth in YYYY-MM-DD or MM-DD format if visible (or estimate e.g. "1994-06-15")
- "joinedDate": Hire date or work anniversary in YYYY-MM-DD format if visible (or current year estimate e.g. "2023-05-01")
- "location": City or country if visible
- "confidence": Estimated parsing confidence between 0.0 and 1.0

Return ONLY a valid JSON array of employee objects matching this schema (no markdown formatting, no backticks, no explanatory text):
[
  {
    "name": "Alex Morgan",
    "department": "Engineering",
    "role": "Cloud Architect",
    "email": "alex.m@company.com",
    "phone": "+65 9123 4567",
    "dob": "1991-04-12",
    "joinedDate": "2021-03-01",
    "location": "Singapore",
    "confidence": 0.97
  }
]
If the image does not contain any employee data, return an empty array [].`;

    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
    ];

    let lastError: any = null;
    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType,
                        data: fileBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 404 || response.status === 503) {
            continue;
          }
          const errText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errText}`);
        }

        const resData: any = await response.json();
        const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          let parsed: any;
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
            if (match) parsed = JSON.parse(match[0]);
            else throw new Error('Unparseable output from Gemini Vision');
          }

          const candidates = (Array.isArray(parsed) ? parsed : [parsed]).filter(
            (c: any) => c && typeof c.name === 'string' && c.name.trim().length > 0
          );

          return {
            candidates,
            model: `Backend Gemini Vision (${model})`,
            isLiveApi: true,
          };
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw new functions.https.HttpsError(
      'internal',
      lastError?.message || 'Failed to process document with Gemini Vision.'
    );
  });

