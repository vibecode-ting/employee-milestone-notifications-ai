# Milestone — Employee Milestone Notifications App

A cloud-native employee milestone tracking and notification platform built with React 19, Vite, Tailwind CSS v4, and Firebase.

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
- **Deployment**: GitHub Pages via GitHub Actions

---

## 📁 Project Structure

```
├── .github/workflows/deploy.yml   # CI/CD deployment to GitHub Pages
├── firestore.rules                # Role-based Firestore security rules
├── functions/                     # Firebase Cloud Functions (cron notifications)
│   ├── src/index.ts
│   ├── package.json
│   └── tsconfig.json
├── public/
│   └── logo.svg                   # Brand mark
├── src/
│   ├── App.tsx                    # Root application router & layout
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Tailwind v4 theme & glassmorphic tokens
│   ├── types.ts                   # Unified TypeScript definitions
│   ├── contexts/
│   │   └── AuthContext.tsx        # Firebase auth & demo session state
│   ├── components/
│   │   ├── auth/AuthRoute.tsx     # Route protection guard
│   │   └── layout/Navbar.tsx      # Responsive collapsible sidebar navigation
│   ├── views/
│   │   ├── Login.tsx              # Email/password authentication & Demo Mode
│   │   ├── Dashboard.tsx          # Stat cards, Grafana-style charts, today's events
│   │   ├── Employees.tsx          # Employee CRUD, Excel import preview/export
│   │   ├── Settings.tsx           # Multi-channel notifications & message templates
│   │   ├── Pricing.tsx            # Multi-tier plans, checkout, and countdown
│   │   └── AdminUsers.tsx         # User role assignment (Admin only)
│   ├── lib/
│   │   ├── firebase.ts            # Firebase SDK initialization with offline fallback
│   │   ├── i18n.ts                # Translations (EN, MM, ZH, VN)
│   │   └── utils.ts               # Utility helpers (cn)
│   └── utils/
│       ├── milestones.ts          # Milestone calculation engine
│       └── excelHandler.ts        # Excel parser and template generator
├── index.html
├── metadata.json
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
1. Verify and terminate any orphaned process on port `5173`.
2. Check and install missing dependencies.
3. Clean stale Vite cache.
4. Start the Vite development server and open your default browser.

### Manual Setup

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment (Optional for Demo Mode)
cp .env.example .env

# 3. Start development server
npm run dev
```

App runs on `http://localhost:5173`.

---

## 🔒 Roles & Plan Limits

| Role | Plan Name | Employee Limit | Highlights |
|---|---|---|---|
| `user` | Free Plan | 100 | Default tier, standard text templates |
| `pro` | Pro Plan | 1,000 | Custom card templates, logos, reactions |
| `pro_plus` | Pro Plus | Unlimited (∞) | Lifetime access, unlimited headcount |
| `admin` | Mod Admin | Unlimited (∞) | Full access, user role management |
