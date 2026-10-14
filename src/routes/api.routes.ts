import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as multer from 'multer';
import * as fs from 'fs';
import { runCelebrationPipeline, checkAndSendTodaysMilestones } from '../services/celebrationPipelineService';
import { analyzeCsvWithAI, importCsvData } from '../services/csvSmartMapperService';
import { testConnection, previewTable, listTables, syncExternalDatabase } from '../services/externalDbConnectorService';
import { processCopilotMessage } from '../services/aiCopilotService';
import { handleCloudSchedulerWebhook, restartCronWithNewSettings } from '../services/cronSchedulerService';

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'tmp/uploads/' });

// ── Helpers ────────────────────────────────────────────────────────────────

function parseJsonField<T>(field: any, fallback: T): T {
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch { return fallback; }
  }
  return field ?? fallback;
}

function serializeEmployee(e: any) {
  return {
    ...e,
    customAttributes: parseJsonField(e.customAttributes, {}),
  };
}

// ── AppSettings ────────────────────────────────────────────────────────────

router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findFirst({ where: { id: 'default_org' } });
    if (!settings) return res.status(404).json({ error: 'Settings not found' });
    res.json({
      ...settings,
      customColumnSchema: parseJsonField(settings.customColumnSchema, []),
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.customColumnSchema && typeof body.customColumnSchema !== 'string') {
      body.customColumnSchema = JSON.stringify(body.customColumnSchema);
    }
    const updated = await prisma.appSettings.upsert({
      where: { id: 'default_org' },
      update: body,
      create: { id: 'default_org', ...body },
    });
    // Restart cron if timing changed
    if (body.dailyTriggerTime || body.timezone) {
      await restartCronWithNewSettings();
    }
    res.json({ ...updated, customColumnSchema: parseJsonField(updated.customColumnSchema, []) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Employees CRUD ─────────────────────────────────────────────────────────

router.get('/employees', async (req: Request, res: Response) => {
  try {
    const { department, search, autoSendEmail, active = 'true' } = req.query as any;
    const where: any = { isActive: active !== 'false' };
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (typeof autoSendEmail === 'string') where.autoSendEmail = autoSendEmail === 'true';

    let employees = await prisma.employee.findMany({ where, orderBy: { fullName: 'asc' } });

    if (search) {
      const q = (search as string).toLowerCase();
      employees = employees.filter(e => e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
    }

    res.json(employees.map(serializeEmployee));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/employees/:id', async (req: Request, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(serializeEmployee(employee));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/employees', async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.customAttributes && typeof body.customAttributes !== 'string') {
      body.customAttributes = JSON.stringify(body.customAttributes);
    }
    if (body.birthDate) body.birthDate = new Date(body.birthDate);
    if (body.hireDate) body.hireDate = new Date(body.hireDate);
    const employee = await prisma.employee.create({ data: body });
    res.status(201).json(serializeEmployee(employee));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/employees/:id', async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.customAttributes && typeof body.customAttributes !== 'string') {
      body.customAttributes = JSON.stringify(body.customAttributes);
    }
    if (body.birthDate) body.birthDate = new Date(body.birthDate);
    if (body.hireDate) body.hireDate = new Date(body.hireDate);
    delete body.id;
    const employee = await prisma.employee.update({ where: { id: req.params.id }, data: body });
    res.json(serializeEmployee(employee));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/employees/:id', async (req: Request, res: Response) => {
  try {
    await prisma.employee.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/employees', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!ids?.length) return res.status(400).json({ error: 'No IDs provided' });
    await prisma.employee.deleteMany({ where: { id: { in: ids } } });
    res.json({ success: true, deleted: ids.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Celebration Pipeline ───────────────────────────────────────────────────

router.post('/employees/:id/celebrate', async (req: Request, res: Response) => {
  try {
    const { eventType, milestoneYear, forcePreview, overrideEmail } = req.body;
    const result = await runCelebrationPipeline({
      employeeId: req.params.id,
      eventType: eventType || 'BIRTHDAY',
      milestoneYear,
      forcePreview: forcePreview !== false,
      overrideEmail,
    });
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/milestones/check-today', async (req: Request, res: Response) => {
  try {
    const results = await checkAndSendTodaysMilestones();
    res.json({ processed: results.length, results });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Upcoming Milestones ────────────────────────────────────────────────────

router.get('/milestones/upcoming', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string || '30');
    const today = new Date();
    const employees = await prisma.employee.findMany({ where: { isActive: true } });
    const upcoming: any[] = [];

    employees.forEach(e => {
      const checkDate = (d: Date | null, type: string) => {
        if (!d) return;
        const thisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());
        const nextOccurrence = thisYear < today
          ? new Date(today.getFullYear() + 1, d.getMonth(), d.getDate())
          : thisYear;
        const daysUntil = Math.round((nextOccurrence.getTime() - today.getTime()) / (24 * 3600 * 1000));
        if (daysUntil <= days) {
          const milestoneYear = type === 'WORK_ANNIVERSARY' ? today.getFullYear() - new Date(d).getFullYear() + (thisYear < today ? 1 : 0) : undefined;
          upcoming.push({
            employee: serializeEmployee(e),
            eventType: type,
            daysUntil,
            nextDate: nextOccurrence.toISOString().split('T')[0],
            milestoneYear,
          });
        }
      };
      if (e.notifyOnBirthday) checkDate(e.birthDate ? new Date(e.birthDate) : null, 'BIRTHDAY');
      if (e.notifyOnAnniversary) checkDate(e.hireDate ? new Date(e.hireDate) : null, 'WORK_ANNIVERSARY');
    });

    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    res.json(upcoming);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── CSV Import ─────────────────────────────────────────────────────────────

router.post('/employees/csv-analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const content = fs.readFileSync(file.path, 'utf-8');
    fs.unlinkSync(file.path);

    // Extract headers and sample rows
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const sampleRows = lines.slice(1, 3).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
    });

    const result = await analyzeCsvWithAI(headers, sampleRows);
    res.json({ headers, sampleRows, ...result });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/employees/csv-import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const content = fs.readFileSync(file.path, 'utf-8');
    fs.unlinkSync(file.path);

    const mappings = JSON.parse(req.body.mappings || '{}');
    const result = await importCsvData(content, mappings);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── DB Connectors ──────────────────────────────────────────────────────────

router.get('/connectors', async (req: Request, res: Response) => {
  try {
    const connectors = await prisma.externalDbConnection.findMany();
    res.json(connectors.map(c => ({
      ...c,
      connectionConfig: { isDemoMode: JSON.parse(c.connectionConfig as string).isDemoMode },
      columnMapping: parseJsonField(c.columnMapping, {}),
    })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/connectors', async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.connectionConfig && typeof body.connectionConfig !== 'string') {
      body.connectionConfig = JSON.stringify(body.connectionConfig);
    }
    if (body.columnMapping && typeof body.columnMapping !== 'string') {
      body.columnMapping = JSON.stringify(body.columnMapping);
    }
    const connector = await prisma.externalDbConnection.create({ data: body });
    res.status(201).json(connector);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.put('/connectors/:id', async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (body.connectionConfig && typeof body.connectionConfig !== 'string') body.connectionConfig = JSON.stringify(body.connectionConfig);
    if (body.columnMapping && typeof body.columnMapping !== 'string') body.columnMapping = JSON.stringify(body.columnMapping);
    delete body.id;
    const connector = await prisma.externalDbConnection.update({ where: { id: req.params.id }, data: body });
    res.json(connector);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.delete('/connectors/:id', async (req: Request, res: Response) => {
  try {
    await prisma.externalDbConnection.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/connectors/:id/test', async (req: Request, res: Response) => {
  try {
    const result = await testConnection(req.params.id);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/connectors/:id/preview', async (req: Request, res: Response) => {
  try {
    const result = await previewTable(req.params.id);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/connectors/:id/tables', async (req: Request, res: Response) => {
  try {
    const tables = await listTables(req.params.id);
    res.json(tables);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/connectors/:id/sync', async (req: Request, res: Response) => {
  try {
    const result = await syncExternalDatabase(req.params.id);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Notification Logs ──────────────────────────────────────────────────────

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { limit = '50', employeeId } = req.query as any;
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    const logs = await prisma.notificationLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: parseInt(limit),
      include: { employee: { select: { fullName: true, avatarUrl: true } } },
    });
    res.json(logs.map(l => ({
      ...l,
      giftSuggestions: parseJsonField(l.giftSuggestions, []),
      channelsDispatched: parseJsonField(l.channelsDispatched, []),
    })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── AI Copilot Chat ────────────────────────────────────────────────────────

router.post('/copilot/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], preferredLanguage = 'en' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const result = await processCopilotMessage(message, history, preferredLanguage);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Cloud Scheduler Webhook ────────────────────────────────────────────────

router.post('/scheduler/trigger', async (req: Request, res: Response) => {
  try {
    const result = await handleCloudSchedulerWebhook();
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Judge Demo ─────────────────────────────────────────────────────────────

router.post('/demo/seed', async (req: Request, res: Response) => {
  try {
    // Re-run the seed (upserts are safe)
    const { execSync } = require('child_process');
    execSync('npx tsx prisma/seed.ts', { cwd: process.cwd(), stdio: 'inherit' });
    const count = await prisma.employee.count();
    res.json({ success: true, employeeCount: count, message: '20 JAPAC demo employees seeded with today\'s milestones!' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/demo/send-quick-card', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    // Send a birthday card to the demo email
    const demoEmployee = await prisma.employee.findFirst({ where: { isActive: true } });
    if (!demoEmployee) return res.status(404).json({ error: 'No employees found. Please seed data first.' });
    const result = await runCelebrationPipeline({
      employeeId: demoEmployee.id,
      eventType: 'BIRTHDAY',
      forcePreview: false,
      overrideEmail: email,
    });
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
