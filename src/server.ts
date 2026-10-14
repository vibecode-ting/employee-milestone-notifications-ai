import 'dotenv/config';
import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import { initAiClient } from './config/aiClient';
import apiRoutes from './routes/api.routes';
import { startCronScheduler } from './services/cronSchedulerService';

const app = express.default();
const PORT = parseInt(process.env.PORT || '3000');

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors.default());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : res.statusCode >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}${req.method}\x1b[0m ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'CultureOS AI — annual_notifications',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Static Frontend ────────────────────────────────────────────────────────
const distPath = path.join(__dirname, '..', 'dist', 'client');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: '🎉 CultureOS AI Backend is running!',
      api: `http://localhost:${PORT}/api`,
      health: `http://localhost:${PORT}/health`,
      frontend: 'Run `npm run dev:client` to start the React frontend.',
    });
  });
}

// ── Startup ────────────────────────────────────────────────────────────────
async function bootstrap() {
  // Initialize AI client
  initAiClient();

  // Create tmp uploads dir
  if (!fs.existsSync('tmp/uploads')) fs.mkdirSync('tmp/uploads', { recursive: true });

  // Start cron scheduler
  await startCronScheduler();

  app.listen(PORT, () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🎉 CultureOS AI — annual_notifications   ║');
    console.log('║   AI Builder Cup 2026 | JAPAC Edition      ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n🚀 Server running at: http://localhost:${PORT}`);
    console.log(`📡 API endpoints:     http://localhost:${PORT}/api`);
    console.log(`❤️  Health check:     http://localhost:${PORT}/health`);
    console.log('\nReady to celebrate your team! 🎂🏆\n');
  });
}

bootstrap().catch(err => {
  console.error('❌ Startup failed:', err);
  process.exit(1);
});

export default app;
