# HRChronicle AI — Intelligent HR Annual Date Notifications & Multilingual Workforce Copilot

[![CI Build](https://github.com/vibecode-ting/employee-milestone-notifications-ai/actions/workflows/pr_check.yml/badge.svg)](https://github.com/vibecode-ting/employee-milestone-notifications-ai/actions)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?logo=threedotjs&logoColor=white)](https://threejs.org)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8e75ff?logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Firebase](https://img.shields.io/badge/Firebase-v10-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com)

A cloud-native, multi-tenant employee milestone tracking, recognition intelligence, and autonomous HR operations platform purpose-built for distributed teams across the Asia Pacific region.

---

## 🏆 AI Builder Cup & Hackathon Overview

### Problem Statement
Hybrid and distributed organizations across Asia Pacific face critical operational challenges when recognizing and retaining workforce talent:
- **Scattered & Unstructured Data**: Critical employee milestones (birthdays, work anniversaries) are siloed in paper rosters, badge photos, spreadsheets, and disparate databases.
- **Cultural & Language Friction**: Standard notification software defaults to generic English templates, lacking native tone, regional respect, and localized cultural celebrations across diverse Asian locales.
- **Administrative Overhead & Risk**: HR teams spend countless hours manually crafting cards, managing gift budgets, and dispatching announcements across fragmented communication channels (Email, Teams, Telegram).

### Solution Overview
**Milestone** unifies roster intelligence, multimodal generative AI, and multi-channel delivery into a cohesive, high-performance platform:
1. **Interactive 3D JAPAC Earth**: Visualizes cross-border workforce connectivity across 34 countries and territories with cinematic sunrise shaders and Great-Circle trajectories centered at the Singapore hub.
2. **Universal AI Employee Copilot (`gemini-2.5-flash`)**: Context-aware assistant featuring tool-based function calling, multimodal OCR roster import from photo/PDF badges, Voice STT/TTS readouts, and interactive 2-step database mutation safeguards.
3. **✨ GenAI Celebration Card Studio**: Generates personalized, culture-conscious recognition copy and renders high-resolution 1200x630 PNG celebration cards for zero-touch or instant multi-channel dispatch.
4. **Product-Led Growth (PLG) & Sandbox Demo**: 1-click sandbox tier switching (Free, Pro, Ultra) allowing users to test dynamic custom columns (T-Shirt Size, Gift Budgets, Emergency Contacts) and advanced features without paying upfront.
5. **Multi-Currency OCR Checkout**: Frictionless payment workflows supporting global currencies and Myanmar local mobile wallets (KBZ Pay, Wave Pay, AYA Pay, CB Pay) backed by client-side receipt OCR verification.
6. **Enterprise Admin Control Center**: Superuser monitoring, audit logs, tenant quota management, diagnostic telemetry feedback triage, and real-time announcement banners.
7. **100% Multilingual Parity**: Complete coverage across 7 JAPAC business languages with 486 localized keys per language and 0 untranslated UI leaks.

---

## 🌟 Key Capabilities

### 🌍 3D Interactive JAPAC Earth Network (`public/earth.html`)
- **34 JAPAC Countries & Territories**: Interactive 3D WebGL globe rendered with Three.js r160.
- **Cinematic Sunrise Atmosphere & Orientation**: Custom GLSL vertex and fragment shaders render realistic atmospheric scattering, day/night terminators, and directional sun illumination.
- **Great-Circle SLERP Trajectories**: Elevated 3D flight arcs connecting regional offices to the Singapore hub using spherical linear interpolation (SLERP) with sinusoidal elevation ($1.6 - 4.8$ units above the planet surface) so arcs never clip inside the sphere.
- **Front-Facing Illumination**: Camera-anchored directional lighting (`cameraLight`) ensures Pacific island territories (Kiribati, Samoa, Tonga, Fiji, New Zealand) remain textured and visible without dark void effects.
- **Responsive Navigation**: Click-to-focus camera zooms, smooth orbital controls, and double-click overview reset.

---

### 🤖 Google Gemini AI Milestone Engine & Universal Copilot (`src/components/copilot/`)
- **Multimodal OCR Roster Import**: Drop or capture employee badges, PDF roster tables, or ID cards. The Gemini 2.5 Flash Vision engine parses messy image documents directly into structured JSON (`name`, `department`, `role`, `birthday`, `startDate`) for instant roster onboarding.
- **Autonomous Function Calling**: The Copilot dynamically executes tenant-scoped tools:
  - `searchEmployees`: Search roster by name, department, or location.
  - `getUpcomingMilestones`: Identify impending birthdays and anniversaries within 7–90 days.
  - `getDepartmentHeadcount`: Summarize headcount breakdown across organizational units.
  - `addEmployee` & `deleteEmployee`: Safe roster mutations.
- **2-Step Database Mutation Safeguards**: Any destructive or write action proposed by the Copilot renders an interactive staged confirmation modal. Nothing writes to the database until explicitly confirmed by the user.
- **Voice STT & TTS Audio Readouts**: Integrated Web Speech API enables hands-free voice dictation (`SpeechRecognition`) and multi-lingual audio readouts (`SpeechSynthesis`).
- **Bring-Your-Own Gemini API Key**: Users can supply and persist their own Google Gemini API key securely in client storage with real-time connection verification and fallback gracefully to robust preset templates.

---

### ✨ GenAI Celebration Card Studio (`src/components/milestones/AiCardStudioModal.tsx`)
- **Culture-Aware Copywriting**: Gemini 2.5 Flash crafts warm, tailored celebration copy in the employee's native language based on their tenure and milestones.
- **High-Resolution PNG Canvas Rendering**: Automatically composite themes, employee avatars, congratulatory greetings, and company branding into a 1200x630 social-card graphic available for instant download.
- **Omnichannel Dispatch Engine**: One-click or scheduled automated distribution across:
  - **SMTP Email**: HTML-formatted emails with embedded milestone cards.
  - **Microsoft Teams**: Webhook payload cards delivered to team celebration channels.
  - **Telegram Bot**: Instant message notifications sent to department groups.

---

### 🌐 7 Native JAPAC Locales (`src/lib/locales/`)
100% dictionary parity (486 keys) across 7 regional languages with zero missing keys:
- 🇺🇸 **English (`en`)**
- 🇲🇲 **Myanmar (`mm`)** — မြန်မာ
- 🇨🇳 **Simplified Chinese (`zh`)** — 简体中文
- 🇭🇰 **Traditional Chinese / HK (`zh-HK`)** — 繁體中文（香港）
- 🇯🇵 **Japanese (`ja`)** — 日本語
- 🇰🇷 **Korean (`ko`)** — 한국어
- 🇻🇳 **Vietnamese (`vn`)** — Tiếng Việt

*Every view, modal, form input, badge, error alert, and tooltip is wired through dynamic `t(...)` localization.*

---

### 🎨 Product-Led Growth (PLG) & Dynamic Custom Columns
- **Dynamic Schema Customization**: Tailor roster fields for team operations, including:
  - **T-Shirt Size**: Swag & team anniversary gift sizing.
  - **Dietary Preference**: Team milestone celebration catering.
  - **Gift Budget ($USD)**: Autonomous milestone budget allocation.
  - **Emergency Contact**: Safety and emergency contact records.
- **1-Click Sandbox Demo**: Free tier users can instantly test Pro and Ultra tier features in simulated sandbox mode with a single click.
- **Tier Comparison Matrix**: Side-by-side feature comparison detailing Starter, Pro, and Ultra Enterprise plans.

---

### 📊 BigQuery HR Analytics & Forecasting (`src/views/Analytics.tsx`)
- **JAPAC Node Calibration**: Operational intelligence calibrated across 34 JAPAC nodes.
- **Milestone Projections**: Predictive celebration event timelines for upcoming fiscal quarters.
- **Tenure Cohort & Retention Risk Heatmap**: Evaluates engagement scores, tenure milestones, and turnover risk across employee cohorts (Low, Medium, High).
- **Language Telemetry**: Real-time distribution breakdown of active workforce locales.

---

### 💳 Multi-Currency Pricing & Client-Side OCR Checkout (`src/views/Pricing.tsx`)
- **Regional & Global Currencies**: USD, MMK, EUR, SGD, THB, and Crypto with live conversion rates.
- **Myanmar Local Wallets**: Direct payment workflows for KBZ Pay, Wave Pay, AYA Pay, and CB Pay with dynamic QR codes.
- **Client-Side Payment Slip OCR**: Scans uploaded transaction screenshots to verify Transaction ID, transfer amount, and destination account before unlocking subscription approval.
- **Dynamic 5-Minute Checkout Timer**: Prevents double-booking and holds quota slots.

---

### 🛡️ Admin Operations & Diagnostics (`src/views/AdminDashboard.tsx`, `AdminUsers.tsx`)
- **System Announcement Banners**: Superadmins can broadcast live announcement banners across all active tenant sessions, with full toggle, reactivation, and dismissal tracking.
- **Feedback Review Pipeline**: User feedback triage modal capturing attached diagnostic telemetry (browser user agent, screen resolution, URL path, timestamp).
- **Tenant Quota & Role Management**: Audit tenant employee counts, inspect >80% quota alerts, upgrade user tiers (`Free` $\to$ `Pro` $\to$ `Ultra` $\to$ `Admin`), and suspend/reactivate accounts.
- **Administrative Audit Logs**: Tracks security actions, authentication events, and quota upgrades.

---

### ⚡ Performance & Vendor Code Splitting (`vite.config.ts`)
- **Rollup Vendor Splitting**: Isolates heavy libraries into modular cached vendor chunks (`vendor-firebase`, `vendor-xlsx`, `vendor-recharts`, `vendor-react`, `vendor-lucide`).
- **Route-Level Code Splitting**: `React.lazy` + dynamic `import()` for all views (`Dashboard`, `Employees`, `Settings`, `Pricing`, `Analytics`, `AdminUsers`, `AdminDashboard`).
- **Lightweight Production Bundle**: Main application entry chunk optimized down to **366 kB** (112 kB gzip).

---

## ⚡ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19.0 + TypeScript 5.8 | Reactive component tree with strict compile-time types |
| **Bundler & Tooling** | Vite 6.4 + Rollup manualChunks | Instant HMR, optimized asset splitting, tree-shaking |
| **Styling & Theming** | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first styling, glassmorphic cards, Dark/Light modes |
| **3D Graphics & WebGL** | Three.js r160 | 3D JAPAC Earth globe, Great-Circle arcs, atmospheric shaders |
| **Generative AI** | Google Gemini (`gemini-2.5-flash`) | Multimodal Vision OCR, contextual celebration copy, Copilot |
| **Speech & Audio** | Web Speech API (STT & TTS) | Hands-free voice prompts and automated speech playback |
| **Database & Auth** | Firebase Firestore + Authentication | Multi-tenant persistence, Google OAuth, magic link sign-in |
| **Backend & Scheduler** | Firebase Cloud Functions (Node 20) | Daily 09:00 AM milestone cron trigger & multi-channel dispatcher |
| **Charts & Analytics** | Recharts 2.15 | Headcount distribution, recognition velocity & cohort risk |
| **Spreadsheet Engine** | SheetJS (`xlsx` 0.18.5) | Roster Excel & CSV batch import / export |
| **Receipt OCR** | Client-Side Canvas Edge & Text OCR | Instant payment transfer screenshot verification |
| **Internationalization**| i18next + react-i18next | 7 native JAPAC locales with complete 486-key parity |
| **PWA & Offline** | Web App Manifest + Service Worker | Installable desktop/mobile experience & offline demo mode |

---

## 📁 Project Structure

```
├── .github/workflows/             # GitHub Actions CI/CD (PR checks & typecheck verification)
├── firestore.rules                # Multi-tenant security rules with role-based access control
├── functions/                     # Firebase Cloud Functions (cron milestone dispatch)
│   ├── src/index.ts               # Daily 09:00 cron + Gemini AI notification dispatcher
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── earth.html                 # 3D JAPAC Earth Network (Three.js WebGL application)
│   ├── data/world.geojson         # Geographic vector data for JAPAC landmasses
│   ├── logo.svg                   # Milestone brand mark
│   ├── manifest.webmanifest       # PWA manifest
│   └── sw.js                      # Service Worker for offline support
├── src/
│   ├── App.tsx                    # Root router with route-level lazy loading
│   ├── main.tsx                   # React DOM root entry
│   ├── index.css                  # Tailwind v4 configuration & glassmorphism theme tokens
│   ├── types.ts                   # Unified enterprise TypeScript definitions
│   ├── contexts/
│   │   └── AuthContext.tsx        # Firebase auth, Google OAuth & demo session management
│   ├── components/
│   │   ├── admin/
│   │   │   ├── FeedbackReviewModal.tsx   # User feedback triage & client telemetry
│   │   │   └── SentNotificationsModal.tsx# System announcement banner manager
│   │   ├── auth/
│   │   │   └── AuthRoute.tsx      # Role-based route guard (Free, Pro, Ultra, Admin)
│   │   ├── common/
│   │   │   └── GeminiBadge.tsx    # Localized Gemini tier status badges
│   │   ├── copilot/
│   │   │   └── CopilotSidebar.tsx # Universal AI HR Copilot (STT/TTS, OCR, Tools)
│   │   ├── employees/
│   │   │   ├── CustomColumnModal.tsx     # Dynamic custom column schema manager (PLG)
│   │   │   └── DatabaseConnectionModal.tsx # Postgres, BigQuery & MySQL connectors
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Responsive navigation & language selector
│   │   │   ├── FeedbackModal.tsx  # In-app user diagnostics & feedback collector
│   │   │   └── NotificationsFlyout.tsx   # Tenant notification inbox
│   │   ├── milestones/
│   │   │   └── AiCardStudioModal.tsx     # GenAI card customizer & 1200x630 PNG export
│   │   └── pricing/
│   │       └── TierComparisonModal.tsx   # PLG tier comparison & 1-click sandbox mode
│   ├── views/
│   │   ├── Login.tsx              # Cinematic 50/50 split-screen with 3D Earth sunrise
│   │   ├── Dashboard.tsx          # Recognition velocity metrics, upcoming milestones
│   │   ├── Employees.tsx          # Roster table, multi-select bulk actions, Excel import
│   │   ├── Analytics.tsx          # BigQuery HR analytics & retention risk cohorts
│   │   ├── Settings.tsx           # Delivery integrations (SMTP, Teams, Telegram) & API keys
│   │   ├── Pricing.tsx            # Multi-currency checkout, local wallets & slip OCR
│   │   ├── AdminDashboard.tsx     # Superuser operations, announcement banners, audit logs
│   │   └── AdminUsers.tsx         # Multi-tenant user audit, quotas, and role upgrades
│   ├── lib/
│   │   ├── firebase.ts            # Firebase SDK client with offline fallback
│   │   ├── gemini.ts              # Gemini 2.5 Flash API client, vision OCR & function caller
│   │   ├── i18n.ts                # i18next configuration & language registry
│   │   ├── locales/               # 7 localized translation dictionaries (486 keys each)
│   │   │   ├── en.ts              # English (US)
│   │   │   ├── mm.ts              # Myanmar (မြန်မာ)
│   │   │   ├── zh.ts              # Simplified Chinese (简体中文)
│   │   │   ├── zh-HK.ts           # Traditional Chinese / HK (繁體中文（香港）)
│   │   │   ├── ja.ts              # Japanese (日本語)
│   │   │   ├── ko.ts              # Korean (한국어)
│   │   │   └── vn.ts              # Vietnamese (Tiếng Việt)
│   │   ├── slipOcr.ts             # Client-side payment slip edge & text OCR scanner
│   │   └── utils.ts               # Tailwind class merger utility (`cn`)
│   └── utils/
│       ├── milestones.ts          # Birthday & jubilee anniversary calculation algorithms
│       ├── excelHandler.ts        # SheetJS roster parser & export template builder
│       └── demoData.ts            # Pre-populated local demo dataset
├── .npmrc                         # Deterministic npm package manager configuration
├── index.html                     # HTML5 application shell
├── package.json                   # Project scripts and dependencies
├── start.bat                      # One-click Windows development launcher (Port 5180)
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite configuration with vendor manualChunks
```

---

## 🚀 Quick Start

### Windows One-Click Launcher
Double-click `start.bat` or run in terminal:
```cmd
start.bat
```
This automatically verifies local port availability, flushes stale cache, installs required packages, and boots the development server on `http://localhost:5180`.

### Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/vibecode-ting/employee-milestone-notifications-ai.git
cd employee-milestone-notifications-ai

# 2. Install dependencies
npm install

# 3. Configure environment (Optional - Demo Mode works out of the box)
cp .env.example .env

# 4. Start local development server
npm run dev

# 5. Verify production build & TypeScript validation
npm run build
```

---

## 🔒 Roles & Subscription Limits

| Role | Plan Name | Employee Quota | Key Features |
|---|---|---|---|
| `user` | **Free (Starter)** | 100 | Standard email notifications, basic card templates, 3D JAPAC network, community support |
| `pro` | **Pro (Growth)** | 1,000 | ✨ GenAI Card Studio, 🤖 Non-Admin Copilot, 🎨 Dynamic Custom Columns, Multimodal OCR import, Voice STT/TTS, Teams & Telegram bots |
| `pro_plus` | **Ultra (Enterprise)** | Unlimited ($\infty$) | 📊 BigQuery HR Analytics, Retention Risk Heatmaps, Text-Embedding-004 Semantic Search, Direct DB Sync, Dedicated Architect |
| `admin` | **System Admin** | Unlimited ($\infty$) | Admin Control Center, Tenant Quota Management, Announcement Broadcast Banners, Feedback Telemetry Review |

---

## 🧪 Instant Demo & Sandbox Mode

Evaluate the application instantly without configuring Firebase, cloud keys, or payment gateways:
1. Navigate to the login page (`/login`).
2. Click **"Demo Mode"** on the login card.
3. You will immediately sign in with an **Admin** session with mock employees, upcoming celebrations, and operational telemetry.
4. Open the **Tier Comparison Modal** from the Navbar or Pricing page and click **"⚡ Active Sandbox Demo"** to freely simulate switching between **Free**, **Pro**, and **Ultra** plans with zero credit card required!

---

## 👥 Contributors & AI Collaborators

| Contributor | Role | Profile |
|---|---|---|
| **Htet Aung Hlaing** | Lead Architect & Full-Stack Developer | [@vibecode-ting](https://github.com/vibecode-ting) |
| **Myo Set Paing** | Core Contributor & UI/UX Specialist | [@Mark3172](https://github.com/Mark3172) |
| **Ko Htun** | DevOps & Cloud Infrastructure Lead | [@kohtun386](https://github.com/kohtun386) |
| **Google Gemini** | AI Co-Author, Vision OCR & Copilot Engine | [Gemini AI](https://deepmind.google/technologies/gemini/) |
