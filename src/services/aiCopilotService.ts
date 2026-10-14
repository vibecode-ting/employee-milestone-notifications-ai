import { PrismaClient } from '@prisma/client';
import { getGenerativeModel, isAiAvailable } from '../config/aiClient';
import { runCelebrationPipeline } from './celebrationPipelineService';

const prisma = new PrismaClient();

// ── Tool Definitions ────────────────────────────────────────────────────────

const tools = [
  {
    functionDeclarations: [
      {
        name: 'search_and_filter_employees',
        description: 'Search and filter employees by name, department, role, birth month, upcoming milestone window (days), tenure years, autoSendEmail status, or any custom attribute. Use this whenever the user asks about specific employees or groups.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'Free-text search on name or email' },
            department: { type: 'STRING', description: 'Filter by department name' },
            role: { type: 'STRING', description: 'Filter by role' },
            birthMonth: { type: 'NUMBER', description: 'Filter employees born in this month (1-12)' },
            upcomingMilestoneDays: { type: 'NUMBER', description: 'Find employees with a birthday or anniversary in the next N days' },
            autoSendEmail: { type: 'BOOLEAN', description: 'Filter by auto-email enabled/disabled' },
            customAttributeKey: { type: 'STRING', description: 'Key of custom attribute to search within' },
            customAttributeValue: { type: 'STRING', description: 'Value to match in custom attribute' },
          },
          required: [],
        },
      },
      {
        name: 'get_workforce_analytics',
        description: 'Compute real-time workforce aggregations: total employees, department breakdown, average tenure, upcoming milestone counts, email opt-in rates, and data source distribution.',
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'get_app_configuration_and_health',
        description: 'Get current AppSettings, email provider status, external DB sync status, and recent notification delivery history. Use when user asks about app config or email status.',
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'preview_or_send_celebration_card',
        description: 'Generate an AI celebration card and email draft for a named employee. If sendNow is true, dispatches the email immediately via Nodemailer.',
        parameters: {
          type: 'OBJECT',
          properties: {
            employeeName: { type: 'STRING', description: 'Name of the employee to celebrate' },
            eventType: { type: 'STRING', description: '"BIRTHDAY" or "WORK_ANNIVERSARY"' },
            sendNow: { type: 'BOOLEAN', description: 'If true, sends the email immediately' },
            overrideEmail: { type: 'STRING', description: 'Optional: send to this email instead of the employee\'s email' },
          },
          required: ['employeeName', 'eventType'],
        },
      },
      {
        name: 'update_employee_or_setting_via_chat',
        description: 'Update employee records or app settings conversationally. E.g., enable auto-email for a department, update a custom attribute, or change the email provider.',
        parameters: {
          type: 'OBJECT',
          properties: {
            updateType: { type: 'STRING', description: '"employee_field" | "bulk_employees" | "app_setting"' },
            employeeId: { type: 'STRING', description: 'Single employee ID to update' },
            department: { type: 'STRING', description: 'Filter by department for bulk updates' },
            field: { type: 'STRING', description: 'Field name to update (e.g., "autoSendEmail", "customAttributes.hobbies")' },
            value: { type: 'STRING', description: 'New value for the field' },
            settingKey: { type: 'STRING', description: 'AppSettings field key for app_setting updates' },
          },
          required: ['updateType', 'field', 'value'],
        },
      },
      {
        name: 'generate_gift_and_party_plan',
        description: 'Generate personalized gift ideas and celebration activity suggestions for an employee based on their custom attributes, hobbies, and department.',
        parameters: {
          type: 'OBJECT',
          properties: {
            employeeName: { type: 'STRING', description: 'Employee name' },
            budgetUsd: { type: 'NUMBER', description: 'Gift budget in USD' },
            eventType: { type: 'STRING', description: '"BIRTHDAY" or "WORK_ANNIVERSARY"' },
          },
          required: ['employeeName', 'eventType'],
        },
      },
    ],
  },
];

// ── Tool Execution ──────────────────────────────────────────────────────────

async function executeToolCall(name: string, args: any): Promise<string> {
  switch (name) {
    case 'search_and_filter_employees': {
      const today = new Date();
      let where: any = { isActive: true };
      if (args.department) where.department = { contains: args.department, mode: 'insensitive' };
      if (args.role) where.role = { contains: args.role, mode: 'insensitive' };
      if (typeof args.autoSendEmail === 'boolean') where.autoSendEmail = args.autoSendEmail;

      let employees = await prisma.employee.findMany({ where, take: 50 });

      if (args.query) {
        const q = args.query.toLowerCase();
        employees = employees.filter(e => e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
      }

      if (args.birthMonth) {
        employees = employees.filter(e => e.birthDate && new Date(e.birthDate).getMonth() + 1 === args.birthMonth);
      }

      if (args.upcomingMilestoneDays) {
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() + args.upcomingMilestoneDays);
        employees = employees.filter(e => {
          const bd = e.birthDate ? new Date(e.birthDate) : null;
          const hd = e.hireDate ? new Date(e.hireDate) : null;
          const checkDate = (d: Date | null) => {
            if (!d) return false;
            const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
            if (next < today) next.setFullYear(today.getFullYear() + 1);
            return next <= cutoff;
          };
          return checkDate(bd) || checkDate(hd);
        });
      }

      if (args.customAttributeKey && args.customAttributeValue) {
        employees = employees.filter(e => {
          try {
            const attrs = JSON.parse(e.customAttributes as string);
            return String(attrs[args.customAttributeKey] || '').toLowerCase().includes(args.customAttributeValue.toLowerCase());
          } catch { return false; }
        });
      }

      const result = employees.map(e => {
        let attrs: any = {};
        try { attrs = JSON.parse(e.customAttributes as string); } catch {}
        return {
          id: e.id,
          name: e.fullName,
          email: e.email,
          role: e.role,
          department: e.department,
          autoSendEmail: e.autoSendEmail,
          birthDate: e.birthDate,
          hireDate: e.hireDate,
          customAttributes: attrs,
        };
      });
      return JSON.stringify({ count: result.length, employees: result });
    }

    case 'get_workforce_analytics': {
      const total = await prisma.employee.count({ where: { isActive: true } });
      const allEmployees = await prisma.employee.findMany({ where: { isActive: true } });
      const today = new Date();

      const deptCounts: Record<string, number> = {};
      let totalTenureYears = 0;
      let tenureCount = 0;
      let upcomingBirthdays30 = 0;
      let upcomingAnniversaries30 = 0;
      let autoEmailEnabled = 0;
      const dataSourceCounts: Record<string, number> = { manual: 0, csv: 0, external_db: 0 };

      allEmployees.forEach(e => {
        if (e.department) deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
        if (e.hireDate) {
          const years = (today.getTime() - new Date(e.hireDate).getTime()) / (365.25 * 24 * 3600 * 1000);
          totalTenureYears += years;
          tenureCount++;
        }
        if (e.autoSendEmail) autoEmailEnabled++;
        dataSourceCounts[e.dataSource] = (dataSourceCounts[e.dataSource] || 0) + 1;

        const cutoff30 = new Date(today); cutoff30.setDate(cutoff30.getDate() + 30);
        const checkUpcoming = (d: Date | null) => {
          if (!d) return false;
          const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
          if (next < today) next.setFullYear(today.getFullYear() + 1);
          return next <= cutoff30;
        };
        if (checkUpcoming(e.birthDate ? new Date(e.birthDate) : null)) upcomingBirthdays30++;
        if (checkUpcoming(e.hireDate ? new Date(e.hireDate) : null)) upcomingAnniversaries30++;
      });

      return JSON.stringify({
        totalEmployees: total,
        autoEmailEnabledCount: autoEmailEnabled,
        autoEmailOptInRate: `${Math.round((autoEmailEnabled / total) * 100)}%`,
        averageTenureYears: tenureCount > 0 ? Math.round((totalTenureYears / tenureCount) * 10) / 10 : 0,
        departmentBreakdown: deptCounts,
        dataSourceBreakdown: dataSourceCounts,
        upcomingMilestones30Days: { birthdays: upcomingBirthdays30, anniversaries: upcomingAnniversaries30 },
      });
    }

    case 'get_app_configuration_and_health': {
      const settings = await prisma.appSettings.findFirst({ where: { id: 'default_org' } });
      const recentLogs = await prisma.notificationLog.findMany({ orderBy: { sentAt: 'desc' }, take: 10 });
      const connectors = await prisma.externalDbConnection.findMany();
      return JSON.stringify({
        emailProvider: settings?.emailProvider,
        enableAutoEmail: settings?.enableAutoEmail,
        dailyTriggerTime: settings?.dailyTriggerTime,
        timezone: settings?.timezone,
        aiTone: settings?.aiTone,
        cardVisualStyle: settings?.cardVisualStyle,
        connectedDatabases: connectors.map(c => ({ name: c.name, type: c.dbType, lastSync: c.lastSyncedAt, status: c.lastSyncStatus })),
        recentDeliveries: recentLogs.map(l => ({ employee: l.recipientEmail, event: l.eventType, status: l.deliveryStatus, date: l.sentAt, previewUrl: l.previewUrl })),
      });
    }

    case 'preview_or_send_celebration_card': {
      const employees = await prisma.employee.findMany({ where: { isActive: true } });
      const emp = employees.find(e => e.fullName.toLowerCase().includes(args.employeeName.toLowerCase()));
      if (!emp) return JSON.stringify({ error: `Employee "${args.employeeName}" not found` });

      let milestoneYear: number | undefined;
      if (args.eventType === 'WORK_ANNIVERSARY' && emp.hireDate) {
        milestoneYear = new Date().getFullYear() - new Date(emp.hireDate).getFullYear();
      }

      const result = await runCelebrationPipeline({
        employeeId: emp.id,
        eventType: args.eventType,
        milestoneYear,
        forcePreview: !args.sendNow,
        overrideEmail: args.overrideEmail,
      });
      return JSON.stringify(result);
    }

    case 'update_employee_or_setting_via_chat': {
      if (args.updateType === 'app_setting' && args.settingKey) {
        let value: any = args.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        await prisma.appSettings.update({ where: { id: 'default_org' }, data: { [args.settingKey]: value } });
        return JSON.stringify({ success: true, updated: { [args.settingKey]: value } });
      }

      if (args.updateType === 'bulk_employees' && args.department) {
        const employees = await prisma.employee.findMany({ where: { department: { contains: args.department, mode: 'insensitive' } } });
        let value: any = args.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        const updated = await prisma.employee.updateMany({
          where: { department: { contains: args.department, mode: 'insensitive' } },
          data: { [args.field]: value },
        });
        return JSON.stringify({ success: true, updatedCount: updated.count, department: args.department });
      }

      if (args.updateType === 'employee_field' && args.employeeId) {
        let value: any = args.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        await prisma.employee.update({ where: { id: args.employeeId }, data: { [args.field]: value } });
        return JSON.stringify({ success: true, updated: { employeeId: args.employeeId, [args.field]: value } });
      }
      return JSON.stringify({ error: 'Invalid update parameters' });
    }

    case 'generate_gift_and_party_plan': {
      const employees = await prisma.employee.findMany({ where: { isActive: true } });
      const emp = employees.find(e => e.fullName.toLowerCase().includes(args.employeeName.toLowerCase()));
      if (!emp) return JSON.stringify({ error: 'Employee not found' });

      let attrs: any = {};
      try { attrs = JSON.parse(emp.customAttributes as string); } catch {}
      const budget = args.budgetUsd || 50;

      const suggestions = {
        employeeName: emp.fullName,
        eventType: args.eventType,
        giftIdeas: [
          `${attrs.hobbies ? 'Related to their hobbies (' + attrs.hobbies + ')' : 'Premium gift card'} (~$${Math.round(budget * 0.6)})`,
          `${attrs.favorite_treat ? 'Gourmet version of their favorite: ' + attrs.favorite_treat : 'Experience voucher (spa, cooking class)'} (~$${Math.round(budget * 0.8)})`,
          `${emp.department ? emp.department + ' team celebration lunch' : 'Team outing'} (~$${budget} per person)`,
        ],
        celebrationIdeas: [
          'Surprise decoration of their workspace with team photos',
          `Ask their manager to give a 5-min shoutout in the next all-hands meeting highlighting: ${attrs.recent_win || 'recent achievements'}`,
          'Create a digital memory board where teammates share their favorite moments',
        ],
      };
      return JSON.stringify(suggestions);
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ── Main Chat Function ──────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function processCopilotMessage(
  userMessage: string,
  history: ChatMessage[] = [],
  preferredLanguage: string = 'en'
): Promise<{ response: string; toolsUsed: string[] }> {
  if (!isAiAvailable()) {
    return {
      response: 'AI Copilot is not configured. Please set your GEMINI_API_KEY in .env to enable the AI assistant.',
      toolsUsed: [],
    };
  }

  const languageInstruction = preferredLanguage !== 'en'
    ? `IMPORTANT: The user's UI is in "${preferredLanguage}" locale. Reply in English by default, but if the user writes in a non-English language or explicitly asks for a specific language, respond in that language.`
    : '';

  const systemInstruction = `You are CultureOS AI Copilot — an elite, omniscient enterprise HR intelligence assistant for the annual_notifications platform.

You have direct access to ALL employee data, app settings, notification logs, and can trigger real actions (send emails, update records, generate cards) via your tools.

Your capabilities:
1. search_and_filter_employees — Find employees by any criteria
2. get_workforce_analytics — Real-time workforce stats & KPIs
3. get_app_configuration_and_health — Check email settings, sync status, delivery history
4. preview_or_send_celebration_card — Generate or send AI celebration cards
5. update_employee_or_setting_via_chat — Update employee records or app settings conversationally
6. generate_gift_and_party_plan — Personalized gift & celebration suggestions

Behavior rules:
- Always use tools to get REAL data before answering factual questions about employees
- When displaying employees, show name, role, department, milestone info, and auto-email status
- When generating cards, always describe what was created
- Format responses with markdown for clarity (tables, bullet points, bold highlights)
- Be concise but thorough — this is an executive-grade assistant
${languageInstruction}`;

  const model = getGenerativeModel('gemini-2.5-flash');
  const chat = model.startChat({
    systemInstruction,
    tools: tools as any,
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }],
    })),
  });

  const toolsUsed: string[] = [];
  let response = await chat.sendMessage(userMessage);
  let result = response.response;

  // Agentic tool-calling loop
  while (result.functionCalls() && result.functionCalls()!.length > 0) {
    const calls = result.functionCalls()!;
    const toolResults = [];

    for (const call of calls) {
      console.log(`🔧 AI Copilot calling tool: ${call.name}(${JSON.stringify(call.args)})`);
      toolsUsed.push(call.name);
      const toolResult = await executeToolCall(call.name, call.args);
      toolResults.push({
        functionResponse: {
          name: call.name,
          response: { result: JSON.parse(toolResult) },
        },
      });
    }

    response = await chat.sendMessage(toolResults as any);
    result = response.response;
  }

  return {
    response: result.text(),
    toolsUsed,
  };
}
