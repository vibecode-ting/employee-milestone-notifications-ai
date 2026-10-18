# Build Checklist: annual\_notifications (AI Builder Cup 2026)

> **Source Docs:** [plan.md](file:///D:/employee-milestone-notifications-ai.git/plan.md) + [design.md](file:///D:/employee-milestone-notifications-ai.git/design.md) — both must be followed together.
> Design spec adds: 5-language i18n, script-safe typography, 4-Zone layout, Metabase wizard, Judge Demo bar.

## Phase 1: Database & Backend Core Setup ✅ COMPLETE

* [x] 1.1 Initialize Node.js + TypeScript project (`package.json`, `tsconfig.json`)
* [x] 1.2 Install all dependencies (express, cors, dotenv, prisma, nodemailer, @google/genai, knex, papaparse, node-cron, satori, @resvg/resvg-js, etc.)
* [x] 1.3 Create `.env.example` with documented env vars
* [x] 1.4 Create `prisma/schema.prisma` (AppSettings, Employee, ExternalDbConnection, NotificationLog)
* [x] 1.5 Create `prisma/seed.ts` (15 JAPAC employees + AppSettings, 2 employees with today's milestone)
* [x] 1.6 Create `src/server.ts` (Express server + static host + routes)
* [x] 1.7 Create `src/config/aiClient.ts` (Dual-mode Gemini AI Studio + Vertex AI)
* [x] 1.8 Create `src/routes/api.routes.ts` (Unified REST endpoints)

## Phase 2: Easy Auto-Email Engine & Multimodal Card Studio ✅ COMPLETE (w/ critical fix)

* [x] 2.1 Create `src/services/cardGeneratorService.ts` (3 SVG card templates + Satori PNG renderer)
  * **[FIXED]** Multi-language font buffering: TTF font loading for Noto Sans Myanmar, Noto Sans SC, Be Vietnam Pro, Noto Sans Devanagari — prevents tofu boxes (□□□) on generated cards
* [x] 2.2 Create `src/services/emailService.ts` (Nodemailer: Gmail, SMTP, Resend, Ethereal Sandbox)
* [x] 2.3 Create `src/services/aiMessageService.ts` (Gemini 2.5 Flash JSON structured copywriter)
* [x] 2.4 Create `src/services/celebrationPipelineService.ts` (Orchestrates card + email pipeline)
* [x] 2.5 Create `src/services/webhookService.ts` (MS Teams, Telegram, Slack)
* [x] 2.6 Create `src/services/cronSchedulerService.ts` (node-cron + Cloud Scheduler handler)

## Phase 3: 3-Way Data Ingestion ✅ COMPLETE

* [x] 3.1 Employee CRUD API endpoints (GET, POST, PUT, DELETE)
* [x] 3.2 AppSettings CRUD endpoints (GET, PUT)
* [x] 3.3 Custom Column Schema API endpoints
* [x] 3.4 Create `src/services/csvSmartMapperService.ts` (Gemini AI header mapper + date normalizer)
* [x] 3.5 CSV analyze endpoint (`POST /api/employees/csv-analyze`)
* [x] 3.6 CSV import endpoint (`POST /api/employees/csv-import`)
* [x] 3.7 Create `src/services/externalDbConnectorService.ts` (Knex connector + demo mode)
* [x] 3.8 External DB connector endpoints (test, sync, list)

## Phase 4: High-Intelligence Agentic Chat ✅ COMPLETE (w/ critical fix)

* [x] 4.1 Create `src/services/aiCopilotService.ts` (6 Gemini Function Calling tools)
  * **[VERIFIED]** Gemini Function Calling bound to real Prisma queries (getEmployeesByMilestone, checkEmailDeliveryStatus, getSystemSettings) — no hallucination
* [x] 4.2 Chat streaming endpoint (`POST /api/chat`)

## Phase 5: React Frontend 🔨 IN PROGRESS

* [x] 5.1 Setup Vite React + Tailwind CSS + Shadcn/UI configuration
* [x] 5.2 Create `src/client/index.html` + multi-script Google Fonts
* [ ] 5.2b Create `src/client/main.tsx` + `src/client/styles/i18n-typography.css`
* [ ] 5.3 Create `src/client/App.tsx` (Layout: Sidebar, Judge Demo Bar, Copilot Drawer)
* [ ] 5.4 Create `src/client/components/DashboardView.tsx` (KPI bar, charts, milestone radar)
* [ ] 5.5 Create `src/client/components/EmployeeDataHub.tsx` (Editable grid, column manager, CSV import)
* [ ] 5.6 Create `src/client/components/DbConnectorModal.tsx` (4-step Metabase-style wizard)
* [ ] 5.7 Create `src/client/components/EmailSettingsView.tsx` (Provider tabs, test button)
* [ ] 5.8 Create `src/client/components/CardStudioModal.tsx` (Live card preview, tone switcher)
* [ ] 5.9 Create `src/client/components/AiCopilotChat.tsx` (Streaming chat + inline card previews)

## Phase 6: Docker & Cloud Run Packaging 🔨 IN PROGRESS

* [ ] 6.1 Create `Dockerfile` (Multi-stage build for Cloud Run + `npx prisma migrate deploy && npm start`)
  * **[CRITICAL]** Must run `npx prisma migrate deploy` on container startup for Cloud Run compatibility
* [ ] 6.2 Create `docker-compose.yml` (Local PostgreSQL + App)
* [ ] 6.3 Create `.dockerignore`
* [x] 6.4 `README.md` already exists (will enhance with architecture diagram + Cloud Run deploy)

## Critical Component Fixes Required

| # | Component | File | Issue | Status |
|---|-----------|------|-------|--------|
| 1 | Gemini Function Calling | `aiCopilotService.ts` | ✅ Already implements 6 real Prisma-bound tools | **DONE** |
| 2 | Multi-Language Font Buffering | `cardGeneratorService.ts` | ❌ Missing TTF font loading for Myanmar/CJK/Devanagari/Vietnamese | **FIXING** |
| 3 | Cloud Run Dockerfile | `Dockerfile` | ❌ Does not exist yet | **BUILDING** |
