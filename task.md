# Build Checklist: annual\_notifications (AI Builder Cup 2026)

> \*\*Source Docs:\*\* \[plan.md](file:///D:/AN/plan.md) + \[design.md](file:///D:/AN/design.md) — both must be followed together.
> Design spec adds: 5-language i18n, script-safe typography, 4-Zone layout, Metabase wizard, Judge Demo bar.

## Phase 1: Database \& Backend Core Setup

* \[x] 1.1 Initialize Node.js + TypeScript project (`package.json`, `tsconfig.json`)
* \[ ] 1.2 Install all dependencies (express, cors, dotenv, prisma, nodemailer, @google/genai, knex, papaparse, node-cron, satori, @resvg/resvg-js, etc.)
* \[ ] 1.3 Create `.env.example` with documented env vars
* \[ ] 1.4 Create `prisma/schema.prisma` (AppSettings, Employee, ExternalDbConnection, NotificationLog)
* \[ ] 1.5 Create `prisma/seed.ts` (15 JAPAC employees + AppSettings, 2 employees with today's milestone)
* \[ ] 1.6 Create `src/server.ts` (Express server + static host + routes)
* \[ ] 1.7 Create `src/config/aiClient.ts` (Dual-mode Gemini AI Studio + Vertex AI)
* \[ ] 1.8 Create `src/routes/api.routes.ts` (Unified REST endpoints)

## Phase 2: Easy Auto-Email Engine \& Multimodal Card Studio

* \[ ] 2.1 Create `src/services/cardGeneratorService.ts` (3 SVG card templates + Satori PNG renderer)
* \[ ] 2.2 Create `src/services/emailService.ts` (Nodemailer: Gmail, SMTP, Resend, Ethereal Sandbox)
* \[ ] 2.3 Create `src/services/aiMessageService.ts` (Gemini 2.5 Flash JSON structured copywriter)
* \[ ] 2.4 Create `src/services/celebrationPipelineService.ts` (Orchestrates card + email pipeline)
* \[ ] 2.5 Create `src/services/webhookService.ts` (MS Teams, Telegram, Slack)
* \[ ] 2.6 Create `src/services/cronSchedulerService.ts` (node-cron + Cloud Scheduler handler)

## Phase 3: 3-Way Data Ingestion

* \[ ] 3.1 Employee CRUD API endpoints (GET, POST, PUT, DELETE)
* \[ ] 3.2 AppSettings CRUD endpoints (GET, PUT)
* \[ ] 3.3 Custom Column Schema API endpoints
* \[ ] 3.4 Create `src/services/csvSmartMapperService.ts` (Gemini AI header mapper + date normalizer)
* \[ ] 3.5 CSV analyze endpoint (`POST /api/employees/csv-analyze`)
* \[ ] 3.6 CSV import endpoint (`POST /api/employees/csv-import`)
* \[ ] 3.7 Create `src/services/externalDbConnectorService.ts` (Knex connector + demo mode)
* \[ ] 3.8 External DB connector endpoints (test, sync, list)

## Phase 4: High-Intelligence Agentic Chat

* \[ ] 4.1 Create `src/services/aiCopilotService.ts` (6 Gemini Function Calling tools)
* \[ ] 4.2 Chat streaming endpoint (`POST /api/chat`)

## Phase 5: React Frontend

* \[ ] 5.1 Setup Vite React + Tailwind CSS + Shadcn/UI configuration
* \[ ] 5.2 Create `src/client/index.html` + `main.tsx`
* \[ ] 5.3 Create `src/client/App.tsx` (Layout: Sidebar, Judge Demo Bar, Copilot Drawer)
* \[ ] 5.4 Create `src/client/components/DashboardView.tsx` (KPI bar, charts, milestone radar)
* \[ ] 5.5 Create `src/client/components/EmployeeDataHub.tsx` (Editable grid, column manager, CSV import)
* \[ ] 5.6 Create `src/client/components/DbConnectorModal.tsx` (4-step Metabase-style wizard)
* \[ ] 5.7 Create `src/client/components/EmailSettingsView.tsx` (Provider tabs, test button)
* \[ ] 5.8 Create `src/client/components/CardStudioModal.tsx` (Live card preview, tone switcher)
* \[ ] 5.9 Create `src/client/components/AiCopilotChat.tsx` (Streaming chat + inline card previews)

## Phase 6: Docker \& Cloud Run Packaging

* \[ ] 6.1 Create `Dockerfile` (Multi-stage build for Cloud Run)
* \[ ] 6.2 Create `docker-compose.yml` (Local PostgreSQL + App)
* \[ ] 6.3 Create `.dockerignore`
* \[ ] 6.4 Create `README.md` (Architecture diagram + 1-click Cloud Run deploy)







ake sure your agent implements these three critical components precisely:



&#x20;   Gemini Function Calling (Tools) in aiCopilotService.ts: Do not let the AI hallucinate employee data. Bind the Gemini model to structured database functions (getEmployeesByMilestone, checkEmailDeliveryStatus, getSystemSettings) so when a judge asks the chat copilot a question, it executes real SQL/Prisma queries securely.



&#x20;   Multi-Language Font Buffering in cardGeneratorService.ts: Since your design spec includes Burmese, Chinese, Vietnamese, and Hindi, ensure your Satori/Puppeteer PNG card generator explicitly loads TTF font files (Noto Sans Myanmar, Noto Sans SC, Be Vietnam Pro, Noto Sans Devanagari). This prevents broken glyphs or tofu boxes (□□□) on generated celebration cards sent via Nodemailer.



&#x20;   Cloud Run Readiness (Dockerfile): Ensure your Dockerfile correctly handles Prisma database migrations on container startup (npx prisma migrate deploy \&\& npm start) so that when deployed to Google Cloud Run, it runs smoothly without manual database setup.

