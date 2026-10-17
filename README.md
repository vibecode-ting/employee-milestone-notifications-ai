# Milestone — Employee Milestone Notifications App

A cloud-native employee milestone tracking and notification platform built with React 19, Vite, Tailwind CSS v4, and Firebase.

---

## 🏆 AI Builder Cup & Hackathon Overview

### Problem Statement
Modern distributed and hybrid teams struggle with employee recognition. Critical milestones — such as birthdays and company anniversaries — are often missed or manually tracked across scattered spreadsheets, causing disengagement and administrative overhead for People & HR teams.

### Solution Overview
**Milestone** provides an automated, multi-tenant workforce milestone engine that monitors employee anniversaries and birthdays. It delivers automated celebration messages across preferred enterprise communication channels (Email SMTP, Microsoft Teams, and Telegram), complete with customizable rich card templates, instant Excel/CSV synchronization, database connectors, and native 4-language support.

---

## ⚡ Tech Stack

- **Framework**: React 19 + Vite 6
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite`)
- **Routing**: React Router DOM v7
- **Database & Auth**: Firebase v10 (Firestore + Authentication) with local offline demo fallback
- **Functions**: Firebase Cloud Functions (Node 20, Scheduled Cron Notifications)
- **Charts**: Recharts
- **Internationalization**: i18next + react-i18next (English 🇺🇸, Myanmar 🇲🇲, Traditional Chinese 🇹🇼, Vietnamese 🇻🇳)
- **Spreadsheet Operations**: SheetJS (xlsx) for template downloads, Excel import preview, and exports
- **PWA**: Web App Manifest & Service Worker for installability on mobile and desktop
- **Deployment**: GitHub Pages / Firebase Hosting via GitHub Actions

---

## 📁 Project Structure

```
├── .github/workflows/             # CI/CD workflows (PR check, test, deploy)
├── firestore.rules                # Role-based Firestore security rules
├── functions/                     # Firebase Cloud Functions (cron notifications)
│   ├── src/index.ts
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── logo.svg                   # Brand mark
│   ├── manifest.webmanifest       # PWA Manifest
│   └── sw.js                      # Service Worker
├── src/
│   ├── App.tsx                    # Root application router & layout
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Tailwind v4 theme & glassmorphic tokens
│   ├── types.ts                   # Unified TypeScript definitions
│   ├── contexts/
│   │   └── AuthContext.tsx        # Firebase auth & demo session state
│   ├── components/
│   │   ├── auth/AuthRoute.tsx     # Route protection guard
│   │   ├── common/GeminiBadge.tsx # Dynamic Ultra & Pro badges
│   │   ├── employees/
│   │   │   └── DatabaseConnectionModal.tsx # Multi-DB connector wizard
│   │   └── layout/
│   │       ├── Navbar.tsx         # Responsive collapsible sidebar navigation
│   │       ├── FeedbackModal.tsx  # In-app client feedback & diagnostics
│   │       └── NotificationsFlyout.tsx # Broadcast announcements
│   ├── views/
│   │   ├── Login.tsx              # Split hero login, auto-registration & Demo Mode
│   │   ├── Dashboard.tsx          # Stat cards, 7-day activity charts, upcoming milestones
│   │   ├── AdminDashboard.tsx     # Superuser telemetry, broadcast controls & system health
│   │   ├── Employees.tsx          # Roster CRUD, instant Excel/DB import & delete modals
│   │   ├── Settings.tsx           # Multi-channel notifications (SMTP, Teams, Telegram)
│   │   ├── Pricing.tsx            # Multi-tier plans (Free, Pro, Ultra), checkout, and review
│   │   └── AdminUsers.tsx         # Multi-tenant quotas, suspension & role management
│   ├── lib/
│   │   ├── firebase.ts            # Firebase SDK initialization with offline fallback
│   │   ├── i18n.ts                # 131 translation keys (EN, MM, ZH, VN)
│   │   └── utils.ts               # Utility helpers (cn)
│   └── utils/
│       ├── milestones.ts          # Milestone calculation engine
│       ├── excelHandler.ts        # Excel parser and template generator
│       └── demoData.ts            # Local demo persistence & storage dispatch
├── .npmrc                         # Deterministic npm install configuration
├── index.html
├── package.json
├── start.bat                      # One-click Windows development launcher
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start

### Windows One-Click Launcher

Double click `start.bat` or run:

```cmd
start.bat
```

This will automatically:
1. Verify and terminate any orphaned process on the dev port.
2. Check and install missing dependencies.
3. Clean stale Vite cache.
4. Start the Vite development server and open your default browser.

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (Optional for Demo Mode)
cp .env.example .env

# 3. Start development server
npm run dev
```

App runs on `http://localhost:5180` (or `http://localhost:5173`).

---

## 🔒 Roles & Plan Limits

| Role | Plan Name | Employee Limit | Highlights |
|---|---|---|---|
| `user` | Free Plan | 100 | Default tier, standard text templates, basic milestone tracking |
| `pro` | Pro Plan | 1,000 | Custom card templates, logos, reactions, external DB connectors |
| `pro_plus` | Ultra Plan | Unlimited (∞) | Lifetime access, unlimited headcount, Gemini dynamic theming |
| `admin` | Mod Admin | Unlimited (∞) | Platform superuser, dedicated telemetry dashboard, user quotas & broadcast manager |

---

## 🌐 Internationalization (i18n)

Full 1:1 translation parity across 4 languages with 131 keys:
- 🇺🇸 **English (`en`)**
- 🇲🇲 **Myanmar (`mm`)**
- 🇹🇼 **Traditional Chinese (`zh`)**
- 🇻🇳 **Vietnamese (`vn`)**

---

## 🧪 Testing Demo Mode (No Setup Required)

To evaluate the application instantly without configuring Firebase or cloud credentials:
1. Navigate to the login screen (`/login`).
2. Click **"Demo Mode"** at the bottom of the card.
3. You will be authenticated immediately as an **Admin** with fully populated mock employees, milestone statistics, and operational telemetry.
