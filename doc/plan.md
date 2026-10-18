# Master Architecture & Execution Plan: `annual_notifications` (AI Builder Cup 2026 Edition)

> **Target Competition:** Google Cloud AI Builder Cup 2026 (JAPAC)
> **Primary Track:** Track 5 — Future of Work & Enterprise Productivity
> **Secondary Synergy:** Track 4 — Media, Content & Digital Experiences (Multimodal Card Generation)
> **Goal:** Transform `annual_notifications` from a basic notification utility into an enterprise-grade, **Zero-Config AI Culture & Milestone Automation Platform** deployed on Google Cloud Run, engineered to win a share of the USD 30,000 prize pool and advance to the Singapore Grand Finale.

## 1. Executive Summary & Core Design Philosophy

**Instructions for AI Coding Agents (Cursor / Windsurf / Gemini / GitHub Copilot / Devin):**
You are tasked with upgrading the `annual_notifications` repository into a full-stack, production-ready web application. Every architectural and UI decision must strictly follow **Three Core Pillars**:

1. **Radical Simplicity ("Zero-Headache Setup"):** A non-technical HR manager or startup founder must be able to configure automatic emails, toggle employee opt-ins, add employees manually, upload a messy CSV, or connect an external database (Metabase-style) in under 2 minutes.

2. **High-Impact AI & Agentic Intelligence:** Go far beyond a superficial prompt wrapper. Implement **Gemini Function Calling (Tool Use)** for the chat interface, **AI Schema Mapping** for CSV imports, and **Multimodal Celebration Card Generation** that weaves in custom employee attributes.

3. **Maximum Free-Tier Leverage & Fault Tolerance:** Architect every AI, email, and database integration with built-in free-tier options and zero-cost fallbacks so the prototype runs reliably at \$0 cost during development and live hackathon judging.

## 2. System Architecture & Tech Stack

### 2.1 Core Application Stack (Node.js Ecosystem)

* **Runtime & Backend:** Node.js (v20+ LTS) with **Express.js** + TypeScript (or **Next.js App Router** full-stack).

* **Frontend UI:** React 18+ with **Tailwind CSS**, **Lucide Icons**, **Recharts** (for the Executive Dashboard), and **Shadcn/UI** components.

* **Primary App Database:** PostgreSQL via **Prisma ORM** (compatible with **Google Cloud SQL / AlloyDB**, **Neon/Supabase Free Tiers**, and local **SQLite** zero-config fallback for instant local dev) + optional **Google Cloud Firestore** adapter.

* **External Database Connector Engine (Metabase-style):** `knex` + `pg` (PostgreSQL) + `mysql2` (MySQL/MariaDB) + `@google-cloud/bigquery` to allow users to connect external read-only HR databases dynamically at runtime.

* **Auto-Email Dispatch Engine:** `nodemailer` supporting:

  1. **Gmail Quick-Connect** (Email + 16-char Google App Password).

  2. **Resend / SendGrid API** (Free tier 3,000 emails/month, ideal for cloud environments).

  3. **Custom Enterprise SMTP** (Host, Port, TLS/SSL, Auth).

  4. **Ethereal Email Zero-Config Sandbox** (1-click instant test inbox for users/judges who haven't entered SMTP credentials yet!).

* **Omnichannel Webhooks:** MS Teams (Adaptive Cards with embedded images), Telegram Bot API (`sendPhoto` + caption), Slack Block Kit.

### 2.2 AI & Google Cloud Stack (Maximizing Free Tools & Hackathon Rubric)

* **Unified AI SDK:** `@google/genai` (Official Google Gen AI SDK).

  * **Dual-Mode Auth (Free-Tier + GCP Compliance):**

    * *Mode A (Free Tier):* Uses `GEMINI_API_KEY` from **Google AI Studio** (`gemini-2.5-flash`)—100% free tier for fast development and high-volume testing.

    * *Mode B (Hackathon Vertex AI Mode):* Uses `GOOGLE_CLOUD_PROJECT` + **Vertex AI** (`gemini-2.5-flash`, `gemini-2.5-pro`, and **Vertex AI Agent Engine**) to score maximum technical execution points on the Google Cloud rubric.

* **Celebration Card Visual Engine (Dual-Engine):**

  * *Engine 1 (AI Art):* **Vertex AI Imagen 3** (`imagen-3.0-generate-002`) generates custom background artwork tailored to the employee's hobbies and milestone.

  * *Engine 2 (Always-Free High-Speed Fallback):* **Satori + Resvg (`satori` & `@resvg/resvg-js`)** converts dynamic AI-designed HTML/CSS/SVG templates into high-resolution `.png` celebration cards locally in memory in `<150ms` with **zero API cost**.

* **Google Cloud Infrastructure:**

  * **Google Cloud Run** (Serverless Docker deployment — 2M free requests/month).

  * **Google Cloud Scheduler + Pub/Sub** (Automated daily morning milestone check).

  * **Google Cloud Storage** (Hosting generated celebration card PNGs and CSV snapshots).

## 3. Database Schema & Dynamic Custom Columns

Design the database so users are **never restricted to fixed columns**. Combine fast indexed standard columns with a flexible `customAttributes` JSON store and a user-customizable schema registry.

### 3.1 Prisma Schema (`prisma/schema.prisma`)

```
datasource db {
  provider = "postgresql" // Can be switched to "sqlite" for instant zero-setup local dev
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Global Application & Easy Email Settings
model AppSettings {
  id                      String   @id @default("default_org")
  companyName             String   @default("Acme JAPAC Technologies")
  companyLogoUrl          String?
  timezone                String   @default("Asia/Yangon")
  dailyTriggerTime        String   @default("08:30") // HH:mm daily cron schedule
  
  // Master & Easy Auto-Email Settings
  enableAutoEmail         Boolean  @default(true)   // Master switch: auto-send emails on milestone day
  emailProvider           String   @default("gmail") // "gmail" | "smtp" | "resend" | "ethereal_sandbox"
  smtpHost                String?  @default("smtp.gmail.com")
  smtpPort                Int?     @default(587)
  smtpSecure              Boolean  @default(false)
  smtpUser                String?
  smtpPassEncrypted       String?  // App Password, SMTP Password, or API Key
  senderName              String   @default("People & Culture AI")
  senderEmail             String?
  replyToEmail            String?
  ccManagerOnEmail        Boolean  @default(false)

  // Omnichannel Webhook Settings
  enableTeamsWebhook      Boolean  @default(false)
  teamsWebhookUrl         String?
  enableTelegram          Boolean  @default(false)
  telegramBotToken        String?
  telegramChatId          String?

  // AI Personalization & Card Studio Preferences
  aiTone                  String   @default("warm_professional") // "warm_professional" | "fun_celebratory" | "executive_formal"
  cardVisualStyle         String   @default("modern_gradient")   // "modern_gradient" | "festive_illustrated" | "minimal_luxury"
  useImagenBackground     Boolean  @default(false)               // Toggle between free Satori SVG cards vs Vertex Imagen 3
  defaultGiftBudgetUsd    Int      @default(50)

  // Dynamic Custom Column Registry (User-customizable data columns!)
  // Example: [
  //   {"key": "nickname", "label": "Nickname", "type": "text", "useInAiPrompt": true},
  //   {"key": "hobbies", "label": "Hobbies & Interests", "type": "tags", "useInAiPrompt": true},
  //   {"key": "recent_win", "label": "Recent Key Achievement", "type": "text", "useInAiPrompt": true},
  //   {"key": "favorite_treat", "label": "Favorite Cake/Snack", "type": "text", "useInAiPrompt": true},
  //   {"key": "office_city", "label": "Office Location", "type": "select", "useInAiPrompt": true}
  // ]
  customColumnSchema      Json     @default("[]")

  updatedAt               DateTime @updatedAt
}

// 2. Employee Master Table (Populated via Manual UI, Smart CSV, or External DB Sync)
model Employee {
  id                  String   @id @default(uuid())
  fullName            String
  email               String   @unique
  birthDate           DateTime? // Month & Day evaluated for Birthday
  hireDate            DateTime? // Month, Day & Year evaluated for Work Anniversary
  role                String?
  department          String?
  managerEmail        String?
  avatarUrl           String?
  
  // Per-Employee Easy Notification Controls
  isActive            Boolean  @default(true)
  autoSendEmail       Boolean  @default(true) // Individual toggle: send auto email to this employee's mailbox
  notifyOnBirthday    Boolean  @default(true)
  notifyOnAnniversary Boolean  @default(true)
  preferredLanguage   String   @default("English") // "English" | "Burmese" | "Chinese" | "Japanese" | "Hindi"
  
  // Dynamic User-Defined Columns (JSON key-value store matching customColumnSchema)
  customAttributes    Json     @default("{}")
  
  // Data Lineage Tracking
  dataSource          String   @default("manual") // "manual" | "csv" | "external_db"
  externalConnectionId String?
  externalRecordId    String?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  notificationLogs    NotificationLog[]
}

// 3. Metabase-Style External Database Connections
model ExternalDbConnection {
  id                  String   @id @default(uuid())
  name                String   // e.g., "Core HR PostgreSQL Replica"
  dbType              String   // "postgres" | "mysql" | "bigquery"
  connectionConfig    Json     // Encrypted { host, port, database, user, password, ssl, projectId }
  sourceMode          String   @default("table") // "table" | "custom_sql"
  tableName           String?  // e.g., "public.employees"
  customSqlQuery      String?  // Read-only SELECT query
  columnMapping       Json     // Maps external DB columns -> Employee core fields + customAttributes
  autoSyncSchedule    String   @default("daily") // "manual" | "hourly" | "daily"
  lastSyncedAt        DateTime?
  lastSyncRecordCount Int?     @default(0)
  lastSyncStatus      String?  // "SUCCESS" | "ERROR"
  lastSyncError       String?
  createdAt           DateTime @default(now())
}

// 4. Celebration Audit & Email Delivery Logs
model NotificationLog {
  id                  String   @id @default(uuid())
  employeeId          String
  employee            Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  eventType           String   // "BIRTHDAY" | "WORK_ANNIVERSARY" | "MANUAL_RECOGNITION"
  milestoneYear       Int?     // e.g., 3 (for 3rd Work Anniversary)
  emailSubject        String
  generatedMessage    String
  cardImageDataUrl    String?  // Base64 or Cloud Storage URL of the generated card
  giftSuggestions     Json?    // AI-recommended gift ideas for HR/Manager
  channelsDispatched  Json     // ["email", "teams", "telegram"]
  recipientEmail      String
  deliveryStatus      String   // "SENT" | "FAILED" | "SANDBOX_PREVIEW"
  smtpMessageId       String?
  previewUrl          String?  // Ethereal preview URL if using sandbox mode
  errorMessage        String?
  sentAt              DateTime @default(now())
}

```

## 4. Detailed Feature Specifications (Step-by-Step for AI Agents)

### Feature Module 1: 3-Way Employee Data Hub & Dynamic Column Customizer

Build a unified **"Employee Data Hub"** page featuring 3 clean sub-tabs and a schema customizer:

#### 1.1 Manual Entry & Interactive Spreadsheet Grid

* **Quick "+ Add Employee" Modal:** Clean form for Full Name, Email, Birth Date, Hire Date, Role, Department, Preferred Language (so Gemini can even write bilingual cards!), an **"Auto-Send Email to Employee Mailbox" toggle switch**, and dynamic inputs for all active custom columns.

* **Live Editable Table:**

  * Users can inline-edit any cell or click the **Auto-Email Toggle Switch** directly on any employee row to enable/disable automatic email sending for that specific employee.

  * Bulk actions: `Enable Auto-Email for Selected`, `Send Test Card`, `Export to CSV`, `Delete Selected`.

* **Dynamic Column Manager (`+ Customize Columns` Drawer):**

  * Allows users to add, rename, or toggle custom columns (e.g., `Hobbies`, `Favorite_Cake`, `Recent_Project_Win`, `T_Shirt_Size`, `Nick_Name`).

  * Includes a checkbox on each custom column: **`[x] Feed this column to AI for personalizing cards & emails`**.

#### 1.2 Smart CSV Import (Keeping CSV Simple & Mistake-Proof)

* **1-Click Template:** Provide a `"Download Simple CSV Template"` button (`full_name,email,birth_date,hire_date,department,role,hobbies,recent_win`).

* **AI Smart Column Mapper (`csvSmartMapperService.ts`):**

  * When a user drags and drops *any* CSV (even with messy headers like `Emp Name`, `Mail_Address`, `DOB`, `JoinedDate`, `Fav_Food`), send the header row and 2 sample rows to `gemini-2.5-flash`.

  * Gemini returns a structured JSON mapping connecting standard fields (`Emp Name -> fullName`) and automatically registering unknown columns (`Fav_Food`) as new `customAttributes`!

  * Flexible Date Parser: Automatically normalize `DD/MM/YYYY`, `YYYY-MM-DD`, `MM/DD/YYYY`, and `14-Oct-1995` without throwing cryptic errors.

#### 1.3 Metabase-Style External Database Connector (`DbConnectorWizard.tsx`)

* Build a visual 4-step connection wizard just like Metabase:

  * **Step 1: Choose Database Type:** Cards for **PostgreSQL**, **MySQL / MariaDB**, **Google BigQuery**, plus a **"Connect Sample Cloud HR DB (Demo)"** button.

  * **Step 2: Connection Details & Live Test:** Inputs for Host, Port, Database, Username, Password, SSL toggle (or Connection URI). Clicking **`"Test Connection"`** runs a read-only `SELECT 1` via `knex` with a 5-second timeout and shows latency (`Connected in 42ms`).

  * **Step 3: Pick Table or Write SQL:** Automatically lists tables from `information_schema.tables` in a dropdown, or lets advanced users write a custom read-only `SELECT` query with a 5-row live preview table.

  * **Step 4: Visual Field Mapping & Auto-Sync:** Dropdowns mapping SQL columns to `Employee` fields + custom columns, with a **"Sync Now"** button and daily auto-sync toggle.

### Feature Module 2: Easy Auto-Email Engine (`Nodemailer`) & AI Card Studio

#### 2.1 Frictionless Email Configuration UI (`EmailSettingsPanel.tsx`)

Design the Email Settings screen so any user can set it up in 60 seconds:

* **Master Automation Switch:** Large, clear toggle: **`"Automatically Send Birthday & Work Anniversary Cards to Employee Email Boxes"`** (`enableAutoEmail`).

* **4 Easy Provider Modes:**

  1. **Instant Sandbox Mode (Default out-of-the-box):** Uses `nodemailer.createTestAccount()` (Ethereal). Zero credentials required! Generates a real email and provides a clickable **1-Click Web Preview Link** so judges or new users can test email sending immediately without typing a password.

  2. **Gmail Easy Setup:** Just 2 fields: `Gmail Address` + `16-Digit Google App Password` (with a collapsible visual guide showing where to click in Google Account settings). Automatically configures `smtp.gmail.com:587`.

  3. **Resend / SendGrid Free API:** Just 1 field: `API Key` + `Sender Email`.

  4. **Custom Corporate SMTP:** Host, Port, Secure toggle, User, Password.

* **1-Click Verification:** A **`"✉️ Send Test Birthday Card to My Email"`** button that generates a live AI card, dispatches it via `Nodemailer`, and shows real-time SMTP logs.

#### 2.2 Automated Multimodal Card & Email Pipeline (`celebrationPipelineService.ts`)

Whenever the daily cron runs (or a user clicks `"Send Now"` on an employee):

1. **Eligibility Check:** Verify `AppSettings.enableAutoEmail === true` AND `employee.autoSendEmail === true`.

2. **AI Copywriting (`gemini-2.5-flash`):**

   * Pass the employee's name, milestone type (Birthday or $N$-th Work Anniversary), role, department, preferred language, and all `customAttributes` marked `useInAiPrompt: true`.

   * Generate structured JSON containing:

     * `subject`: Engaging email subject line.

     * `cardHeadline`: Short punchy header for the graphic card.

     * `cardSubtext`: 1-sentence celebratory quote for the graphic card.

     * `emailBodyHtml`: Warm, authentic 2-paragraph message referencing their specific achievements/hobbies naturally.

     * `giftRecommendations`: 3 tailored gift ideas under `defaultGiftBudgetUsd` for the HR manager.

3. **Graphic Card Generation (`cardGeneratorService.ts`):**

   * Render a 1200x630 high-DPI celebration card `.png` containing the company logo, employee name, milestone badge (e.g., `"🎉 5 Years of Impact"` or `"🎂 Happy Birthday"`), custom color theme, and either a Vertex AI Imagen 3 illustration or a rich SVG artistic backdrop via `satori` + `@resvg/resvg-js`.

4. **Auto-Email Dispatch (`emailService.ts` via `Nodemailer`):**

   * Construct a responsive HTML email wrapper.

   * Embed the generated `.png` card inline using `cid:milestone_card_image` (and attach as `celebration-card.png` so the employee can download and share it on LinkedIn!).

   * Send directly to `employee.email` (and optionally CC `employee.managerEmail`).

   * Record the result in `NotificationLog`.

### Feature Module 3: High-Intelligence Agentic Chat Copilot (`AiCopilotDrawer.tsx`)

Build a sleek, always-accessible **AI Copilot** (accessible via a `Cmd+K` shortcut, a floating bottom-right button, and a full-screen tab) that acts like a true high-intelligence LLM with full awareness of **all employee data** and **the application itself**.

#### 3.1 Agentic Architecture with Gemini Function Calling (`@google/genai`)

Configure the Copilot with a comprehensive System Instruction explaining the app's features and register **6 Real Backend Tools**:

1. **`search_and_filter_employees`**:

   * Queries the database by name, department, role, birth month, upcoming milestone window (e.g., next 7/30/90 days), tenure years, `autoSendEmail` status, or any custom attribute inside `customAttributes` (e.g., hobbies, city, favorite snack).

2. **`get_workforce_analytics`**:

   * Computes real-time aggregations: total employees, department distribution, average tenure, upcoming milestone counts by month, and email opt-in percentages.

3. **`get_app_configuration_and_health`**:

   * Inspects `AppSettings`, external DB sync status (`ExternalDbConnection`), and recent `NotificationLog` delivery history.

   * Enables the AI to accurately answer questions about the app itself: *"Is auto-email turned on?"*, *"Which email provider is configured?"*, *"Did any birthday emails fail this week?"*, or *"How do I add a custom column or connect PostgreSQL?"*

4. **`preview_or_send_celebration_card`**:

   * Generates a live AI celebration card + email draft for any named employee directly inside the chat stream, and (if requested by the user) dispatches the email via `Nodemailer` right from chat!

5. **`update_employee_or_setting_via_chat`**:

   * Allows conversational administration: *"Turn on auto-email for all employees in the Engineering department"* or *"Add 'Photography' to Kyaw Swar's hobbies"*.

6. **`generate_gift_and_party_plan`**:

   * Uses an employee's custom attributes and department to propose personalized gifts, cake flavors, and celebration ideas within budget.

### Feature Module 4: Rich Executive Dashboard & Special Hackathon-Winning Features

Design the main **Dashboard (`DashboardView.tsx`)** to impress both HR executives and Google Cloud Hackathon judges immediately upon loading:

1. **Top KPI Command Bar:**

   * **Celebrations Today & Next 30 Days:** Live counter with avatars and 1-click `[Preview & Send]` buttons.

   * **Auto-Email Engine Status:** Shows `Active (Gmail SMTP / Sandbox)` with a quick toggle and delivery rate (`100% Sent`).

   * **Connected Data Sources:** Shows active employees from `Manual`, `CSV`, and `External DB (Postgres/BigQuery)`.

   * **Culture Engagement Score:** Gamified metric based on profile completeness (custom columns filled) and milestone coverage.

2. **Interactive Milestone Radar & Calendar:**

   * Switch between **Timeline View**, **Monthly Calendar Grid**, and **Department Breakdown Chart** (Recharts).

3. **Special Feature 1 — Interactive Card Studio & Live Customizer:**

   * Users can click any employee to open the **AI Card Studio**, switch between tones (*Warm Professional*, *Fun & Witty*, *Poetic*, *Bilingual English + Burmese/Chinese*), regenerate the visual card theme in 1 click, and send it immediately.

4. **Special Feature 2 — AI Gift & Recognition Concierge:**

   * Automatically suggests 3 personalized gift ideas or team celebration activities next to every upcoming birthday or work anniversary based on their custom columns.

5. **Special Feature 3 — `"⚡ 1-Click Live Judge Demo"` Bar:**

   * A highlighted banner at the top of the app specifically for AI Builder Cup judges:

     * **Button 1: `"Seed Rich JAPAC Demo Dataset"`** (Populates 20 realistic employees across Singapore, Yangon, Tokyo, and Bangalore with custom columns like `Hobbies`, `Recent_Win`, `Favorite_Treat`, including 2 milestones happening *today*).

     * **Button 2: `"Send Live AI Celebration Card to My Inbox"`** (Lets the judge type their own email address and receive a real, custom-generated AI celebration card + HTML email in 5 seconds).

## 5. Target Repository Structure

```
annual_notifications/
├── Dockerfile                              # Multi-stage production container for Google Cloud Run
├── docker-compose.yml                      # Local PostgreSQL + App for 1-command startup
├── .env.example                            # Documented env vars (Gemini Free Key, Vertex AI, SMTP)
├── package.json                            # Dependencies: express, prisma, nodemailer, @google/genai, satori, knex
├── prisma/
│   ├── schema.prisma                       # Full hybrid relational + JSON custom column schema
│   └── seed.ts                             # JAPAC sample workforce seeder with today's milestones
├── src/
│   ├── server.ts                           # Express API server + static frontend host
│   ├── config/
│   │   └── aiClient.ts                     # Dual-mode Gemini AI Studio (Free) + Vertex AI initializer
│   ├── services/
│   │   ├── aiMessageService.ts             # Hyper-personalized email & card copy generator
│   │   ├── cardGeneratorService.ts         # Satori SVG/PNG card renderer + Vertex Imagen 3 integration
│   │   ├── emailService.ts                 # Nodemailer engine (Gmail, SMTP, Resend, Ethereal Sandbox)
│   │   ├── webhookService.ts               # MS Teams, Telegram, and Slack rich notification sender
│   │   ├── aiCopilotService.ts             # High-intel LLM chat with 6 Function Calling tools
│   │   ├── csvSmartMapperService.ts        # AI header mapping + flexible date normalizer
│   │   ├── externalDbConnectorService.ts   # Metabase-style Knex connector for Postgres/MySQL/BigQuery
│   │   └── cronSchedulerService.ts         # Node-cron + Cloud Scheduler webhook handler
│   ├── routes/
│   │   ├── api.routes.ts                   # Unified REST endpoints for Employees, Settings, DB Sync, Chat
│   └── client/                             # React + Tailwind CSS Frontend
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx                         # Main layout with Sidebar, Judge Demo Bar, & Copilot Drawer
│       └── components/
│           ├── DashboardView.tsx           # KPI cards, Recharts analytics, Upcoming Milestone Radar
│           ├── EmployeeDataHub.tsx         # Editable Grid, Custom Column Builder, AI CSV Importer
│           ├── DbConnectorModal.tsx        # Metabase-style external DB connection wizard
│           ├── EmailSettingsView.tsx       # Easy auto-email toggle, Gmail/SMTP presets, 1-Click Test
│           ├── CardStudioModal.tsx         # Live multimodal card preview, tone switcher, manual send
│           └── AiCopilotChat.tsx           # Intelligent streaming chat with inline card previews & tables
└── README.md                               # Google Cloud Architecture Diagram + 1-Click Cloud Run Deploy

```

## 6. Step-by-Step Build Execution Plan for AI Coding Agents

> **Agent Execution Directive:** Execute the following phases sequentially. Do not leave placeholder `TODO`s—write complete, working implementations for every service and UI component.

### Phase 1: Database & Backend Core Setup

1. Set up the TypeScript Node.js project with `express`, `cors`, `dotenv`, `prisma`, `@prisma/client`, `nodemailer`, `@google/genai`, `knex`, `papaparse`, and `node-cron`.

2. Initialize Prisma with `schema.prisma` (use SQLite `file:./dev.db` as the default `DATABASE_URL` if `POSTGRES_URL` is not set so the app starts immediately with zero external dependencies, while supporting Cloud SQL PostgreSQL seamlessly in production).

3. Create `prisma/seed.ts` to auto-seed `AppSettings` (with 5 default custom columns: `Nickname`, `Hobbies`, `Recent_Win`, `Favorite_Treat`, `Office_City`) and 15 diverse JAPAC employees—dynamically setting 2 employees' birthDates and hireDates to match `new Date()` (today!) so the dashboard always has live celebrations ready to trigger.

### Phase 2: Easy Auto-Email Engine (`Nodemailer`) & Multimodal Card Studio

1. Build `src/services/cardGeneratorService.ts`:

   * Create 3 high-resolution SVG/HTML card templates (`modern_gradient`, `festive_illustrated`, `minimal_luxury`) that dynamically inject the employee's name, role, milestone badge, AI quote, and company name, converting to a base64 PNG or buffer (with optional Vertex AI Imagen 3 background generation).

2. Build `src/services/emailService.ts`:

   * Implement dynamic `nodemailer.createTransport` based on `AppSettings`.

   * If the user hasn't configured Gmail/SMTP yet, automatically fall back to `nodemailer.createTestAccount()` (Ethereal) and return the live `nodemailer.getTestMessageUrl(info)` link so the user can view the sent email in their browser with zero setup!

   * Support inline `cid:` image embedding of the generated birthday/anniversary card.

3. Build `src/services/aiMessageService.ts`:

   * Use `@google/genai` (`gemini-2.5-flash`) with `responseMimeType: "application/json"` to craft hyper-personalized email copy + gift recommendations using the employee's `customAttributes`.

### Phase 3: 3-Way Data Ingestion (Manual + Smart CSV + Metabase DB Connector)

1. Build CRUD endpoints for `Employee` and `AppSettings.customColumnSchema`.

2. Build `POST /api/employees/csv-analyze` and `POST /api/employees/csv-import`:

   * Use Gemini to map arbitrary CSV headers to standard fields and custom columns automatically.

3. Build `POST /api/connectors/test` and `POST /api/connectors/sync`:

   * Use `knex` to connect to external PostgreSQL/MySQL databases (plus a built-in simulated External Enterprise HR DB mode so judges can test the Metabase sync workflow without needing an external database server).

### Phase 4: High-Intelligence Agentic Chat Interface

1. Build `src/services/aiCopilotService.ts` with `@google/genai` function declarations for the 6 tools (`search_and_filter_employees`, `get_workforce_analytics`, `get_app_configuration_and_health`, `preview_or_send_celebration_card`, `update_employee_or_setting_via_chat`, `generate_gift_and_party_plan`).

2. Implement the tool execution loop so when a user asks a question about employee data or app settings, Gemini invokes the appropriate database/system tool, inspects the real data, and responds with high-precision markdown, tables, or live card previews.

### Phase 5: Rich Frontend Dashboard & Cloud Run Packaging

1. Build the React + Tailwind frontend (`DashboardView`, `EmployeeDataHub`, `DbConnectorModal`, `EmailSettingsView`, `CardStudioModal`, `AiCopilotChat`).

2. Add the **`"⚡ Live Judge Demo"`** quick-action bar at the top of the UI.

3. Create the `Dockerfile` and `.dockerignore` for 1-command deployment to **Google Cloud Run**.

## 7. AI Builder Cup 2026 Winning Tips & Pitch Strategy

To score maximum points with the Google Cloud judging panel, highlight these 4 differentiators in your submission and 3-minute demo video:

1. **Free-Tier Smart & Production Scalable:** Point out how the architecture uses `gemini-2.5-flash` for high-speed, zero-cost structured reasoning and CSV mapping, Satori/Imagen for multimodal card generation, and serverless **Cloud Run** so SMEs can run it for nearly \$0/month.

2. **Solves the "Dirty Data" Problem:** Show how HR teams don't need to reformat spreadsheets or beg IT for help—they can add columns on the fly, drop in any messy CSV, or connect a live database like Metabase in 60 seconds.

3. **True Agentic Copilot (Not Just RAG):** Demonstrate asking the chat assistant a complex multi-step query like: *"Find everyone who has a work anniversary this month, check if their auto-email is enabled, and generate a preview card for our longest-tenured engineer."*

4. **Live Judge Verification:** Invite judges to click the `"Send Test Celebration Card"` button with their own email address so they experience the Nodemailer + Gemini multimodal pipeline firsthand.