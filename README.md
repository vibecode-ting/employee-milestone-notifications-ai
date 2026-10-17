# Milestone — JAPAC Workforce Milestone & Recognition Intelligence

[![CI Build](https://github.com/vibecode-ting/employee-milestone-notifications-ai/actions/workflows/pr_check.yml/badge.svg)](https://github.com/vibecode-ting/employee-milestone-notifications-ai/actions)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?logo=threedotjs&logoColor=white)](https://threejs.org)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8e75ff?logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Firebase](https://img.shields.io/badge/Firebase-v10-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com)

A cloud-native, multi-tenant employee milestone tracking and recognition intelligence platform built for modern distributed teams across the Asia Pacific region.

---

## 🏆 AI Builder Cup & Hackathon Overview

### Problem Statement
Hybrid and distributed organizations across Asia Pacific face severe challenges with timely employee recognition:
- **Scattered Data**: Critical milestones (birthdays, work jubilees) are tracked across fragmented spreadsheets and disparate HR databases.
- **Cultural & Language Friction**: Standard notification tools lack native localized greetings and cultural sensitivity across diverse Asian locales.
- **Administrative Overhead**: HR teams manually craft and dispatch messages across multiple fragmented channels, leading to delayed or forgotten celebrations.

### Solution Overview
**Milestone** automates the entire employee milestone lifecycle with AI-driven personalization and omnichannel delivery:
1. **Real-Time 3D Network**: Visualizes cross-border workforce connectivity across 34 JAPAC countries and territories centered at the Singapore hub.
2. **Google Gemini AI Intelligence**: Automatically generates personalized, culture-aware celebration copy in native languages (`gemini-2.5-flash`).
3. **Omnichannel Delivery**: Dispatches zero-touch scheduled celebration cards via Email SMTP, Microsoft Teams webhooks, and Telegram bots.
4. **Client-Side OCR Checkout**: Enables multi-currency plan upgrades with automated payment slip receipt scanning for local mobile wallets (KBZ Pay, Wave Pay, AYA Pay, CB Pay).
5. **High-Performance Architecture**: Modularized vendor chunking and lazy-loaded views maintain a lightweight entry bundle (366 kB) well below the 500 kB threshold.

---

## 🌟 Key Capabilities

### 🌍 3D Interactive JAPAC Earth Network (`public/earth.html`)
- **34 JAPAC Countries & Territories**: Interactive 3D WebGL globe rendered with Three.js r160.
- **Great-Circle SLERP Trajectories**: Elevated 3D flight arcs connecting regional offices to the Singapore hub using spherical linear interpolation (SLERP) and sinusoidal elevation ($1.6 - 4.8$ units above the planet surface) so arcs never clip inside the sphere.
- **Front-Facing Illumination**: Camera-anchored directional lighting (`cameraLight`) ensures Pacific island territories (Kiribati, Samoa, Tonga, Fiji, NZ) are always visible and textured, preventing dark void effects.
- **Stable Country Anchors**: Pixel-perfect 3D projection without compositor lag or label shaking. Click-to-focus camera zooms and double-click overview reset.

### 🤖 Google Gemini AI Milestone Engine
- **Cloud Functions Scheduled Cron**: Daily cron at 09:00 (`Asia/Rangoon`) detects upcoming birthdays and completed work anniversaries ($\ge 1\text{ year}$).
- **Culture-Aware Copywriting**: `gemini-2.5-flash` creates warm, personalized milestone greetings adapted to each employee's language and years of service.
- **Live Multilingual Translation**: Interactive preview cards allow HR teams to inspect live AI-translated greetings in real time.

### 🌐 7 Native JAPAC Locales (`src/lib/locales/`)
100% translation parity across 7 regional business languages:
- 🇺🇸 **English (`en`)**
- 🇲🇲 **Myanmar (`mm`)** — မြန်မာ
- 🇹🇼 **Traditional Chinese (`zh`)** — 繁體中文
- 🇻🇳 **Vietnamese (`vn`)** — Tiếng Việt
- 🇰🇷 **Korean (`ko`)** — 한국어
- 🇯🇵 **Japanese (`ja`)** — 日本語
- 🇭🇰 **Hong Kong Cantonese (`zh-HK`)** — 繁體中文（港）

### 💳 Multi-Currency Pricing & Client-Side OCR Checkout (`src/lib/slipOcr.ts`)
- **Global & Regional Currencies**: Supports USD, MMK, EUR, SGD, THB, and Crypto.
- **Myanmar Local Wallets**: Direct checkout via KBZ Pay, Wave Pay, AYA Pay, and CB Pay with dynamic QR payment codes.
- **Client-Side Slip OCR Scanner**: Analyzes luminance transitions, text-edge density, and receipt geometry to verify transaction ID and amount before enabling payment confirmation.
- **5-Minute Order Timer**: Dynamic countdown timer for reserving plan quotas.

### ⚡ Performance & Vendor Chunk Splitting (`vite.config.ts`)
- **Rollup Vendor Splitting**: Isolates heavy libraries into separate cached chunks (`vendor-firebase`, `vendor-xlsx`, `vendor-recharts`, `vendor-react`, `vendor-lucide`).
- **Route-Level Code Splitting**: `React.lazy` + dynamic `import()` for all major application views (`Dashboard`, `Employees`, `Settings`, `Pricing`, `AdminUsers`, `AdminDashboard`).
- **Lean Main Chunk**: Main entry chunk minimized from 1,820 kB down to **366 kB** (112 kB gzip).

---

## ⚡ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19.0 + TypeScript 5.8 | Core reactive UI & strict type safety |
| **Bundler & Tooling** | Vite 6.4 + Rollup manualChunks | High-speed HMR & optimized code splitting |
| **Styling & Theming** | Tailwind CSS v4 (`@tailwindcss/vite`) | CSS-first utility styling, dark/light modes |
| **3D Graphics & Math** | Three.js r160 | WebGL 3D Earth, Great-Circle trajectories & starfield |
| **Generative AI** | Google Gemini (`gemini-2.5-flash`) | Contextual, culture-aware celebration messaging |
| **Cloud & Backend** | Firebase Cloud Functions (Node 20) | Daily automated milestone cron & dispatch engine |
| **Database & Auth** | Firebase Firestore + Authentication | Multi-tenant persistence & passwordless magic links |
| **Charts & Analytics** | Recharts 2.15 | 7-day velocity charts & headcount distribution |
| **Spreadsheet Engine** | SheetJS (`xlsx` 0.18.5) | Roster Excel/CSV import preview & export |
| **Receipt OCR** | Custom Canvas Text & Edge OCR | Client-side payment slip validation |
| **Internationalization**| i18next + react-i18next | 7 native JAPAC locales with per-locale modular bundles |
| **PWA & Offline** | Web App Manifest + Service Worker | Desktop/mobile installability & offline demo state |

---

## 📁 Project Structure

```
├── .github/workflows/             # GitHub Actions CI/CD (PR checks & build verification)
├── firestore.rules                # Multi-tenant security rules with role enforcement
├── functions/                     # Firebase Cloud Functions (cron milestone dispatch)
│   ├── src/index.ts               # Daily scheduler + Gemini AI notification engine
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── earth.html                 # 3D JAPAC Earth Network (Three.js WebGL application)
│   ├── data/
│   │   └── world.geojson          # Geographic border vectors for JAPAC landmasses
│   ├── logo.svg                   # Brand mark
│   ├── manifest.webmanifest       # PWA manifest
│   └── sw.js                      # Service Worker
├── src/
│   ├── App.tsx                    # Root router with route-level lazy loading
│   ├── main.tsx                   # React DOM root entry
│   ├── index.css                  # Tailwind v4 theme & glassmorphic tokens
│   ├── types.ts                   # Unified enterprise TypeScript schema
│   ├── contexts/
│   │   └── AuthContext.tsx        # Firebase auth, Google OAuth & demo session store
│   ├── components/
│   │   ├── auth/AuthRoute.tsx     # Role-based route guard
│   │   ├── common/GeminiBadge.tsx # Dynamic Gemini AI tier badges
│   │   ├── employees/
│   │   │   └── DatabaseConnectionModal.tsx # Multi-database connector wizard
│   │   └── layout/
│   │       ├── Navbar.tsx         # Responsive collapsible navigation
│   │       ├── FeedbackModal.tsx  # In-app diagnostics & feedback collector
│   │       └── NotificationsFlyout.tsx # Broadcast notification center
│   ├── views/
│   │   ├── Login.tsx              # 65/35 hero split, 5-slide showcase & auto-advance pause
│   │   ├── Dashboard.tsx          # Recognition velocity charts, upcoming milestones
│   │   ├── Employees.tsx          # Roster CRUD, instant Excel/DB import & delete modals
│   │   ├── Settings.tsx           # Multi-channel delivery config (SMTP, Teams, Telegram)
│   │   ├── Pricing.tsx            # Multi-currency checkout, MMK wallets & OCR verification
│   │   ├── AdminDashboard.tsx     # Superuser telemetry, broadcast controls & system health
│   │   └── AdminUsers.tsx         # Tenant quotas, account suspension & role upgrades
│   ├── lib/
│   │   ├── firebase.ts            # Firebase SDK setup with offline fallback
│   │   ├── i18n.ts                # i18next configuration & language registry
│   │   ├── locales/               # Modular per-locale translation bundles
│   │   │   ├── en.ts              # English (US)
│   │   │   ├── mm.ts              # Myanmar
│   │   │   ├── zh.ts              # Traditional Chinese
│   │   │   ├── vn.ts              # Vietnamese
│   │   │   ├── ko.ts              # Korean
│   │   │   ├── ja.ts              # Japanese
│   │   │   └── zh-HK.ts           # Hong Kong Cantonese
│   │   ├── slipOcr.ts             # Client-side payment slip OCR validator
│   │   └── utils.ts               # Tailwind class merger utility (cn)
│   └── utils/
│       ├── milestones.ts          # Milestone date calculation engine
│       ├── excelHandler.ts        # Excel parser and template generator
│       └── demoData.ts            # Offline local storage mock state
├── .npmrc                         # Deterministic npm install configuration
├── index.html                     # HTML5 shell
├── package.json                   # Dependency definitions
├── start.bat                      # One-click Windows development launcher
├── tsconfig.json                  # TypeScript compiler configuration
└── vite.config.ts                 # Vite bundler config with vendor manualChunks
```

---

## 🚀 Quick Start

### Windows One-Click Launcher
Double-click `start.bat` or run in terminal:
```cmd
start.bat
```
This automatically verifies ports, cleans stale cache, installs dependencies, and launches the development server on `http://localhost:5180`.

### Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (Optional for Demo Mode)
cp .env.example .env

# 3. Start development server
npm run dev

# 4. Production verification build
npm run build
```

---

## 🔒 Roles & Plan Limits

| Role | Plan Name | Employee Limit | Highlights |
|---|---|---|---|
| `user` | Free Plan | 100 | Default tier, standard text templates, basic milestone tracking |
| `pro` | Pro Plan | 1,000 | Custom card templates, logos, reactions, external DB connectors |
| `pro_plus` | Ultra Plan | Unlimited ($\infty$) | Lifetime access, unlimited headcount, Gemini dynamic theming |
| `admin` | Super Admin | Unlimited ($\infty$) | Dedicated telemetry dashboard, user quotas, broadcast manager |

---

## 🧪 Instant Demo Mode (No Setup Required)

To evaluate the application instantly without configuring Firebase or cloud credentials:
1. Navigate to the login screen (`/login`).
2. Click **"Demo Mode"** on the login card.
3. You will be authenticated immediately as an **Admin** with populated mock employees, milestone statistics, and operational telemetry.
