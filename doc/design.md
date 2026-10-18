# Master UI/UX, Layout & 1-Click Multi-Language Design Specification (`design.md`)

> **Project:** `annual_notifications` — Enterprise AI Culture & Milestone Automation OS  
> **Target Competition:** Google Cloud AI Builder Cup 2026 (Track 5: Future of Work & Enterprise Productivity)  
> **Companion Document:** Works alongside `plan.md`  
> **Supported Languages (1-Click Instant Switch):**  
> 1. **English (`en`)** — Global Enterprise Default  
> 2. **Burmese / မြန်မာဘာသာ (`my`)** — Unicode Myanmar Script  
> 3. **Chinese / 简体中文 (`zh`)** — Simplified Chinese  
> 4. **Vietnamese / Tiếng Việt (`vi`)** — Latin with Full Tonemark Diacritics  
> 5. **Indian / हिन्दी (`hi`)** — Devanagari Script (with Indian English HR terminology support)

---

## 1. Design Philosophy & UX Golden Rules (Instructions for AI Coding Agents)

When building the frontend components (`src/client/`), AI coding agents (Cursor, Windsurf, Gemini, Copilot) must strictly enforce these **5 UX Golden Rules**:

1. **The "1-Click Everything" Principle:**
   * Switching between **English, Burmese, Chinese, Vietnamese, and Hindi** must happen in **1 single click** via a visible segmented pill bar in the top navigation bar—**never** hidden inside a dropdown or settings page.
   * Enabling/disabling automatic birthday or work anniversary emails for the whole company or for a specific employee must be a **1-click toggle switch** directly visible in the UI.
2. **Script-Safe Responsive Typography (Zero Clipping):**
   * Burmese (`မြန်မာ`) and Hindi (`हिन्दी`) scripts have tall vertical ascenders and stacked subscript consonants, while Vietnamese (`Tiếng Việt`) has stacked diacritics (`ệ`, `ữ`, `ắ`), and Chinese (`中文`) is compact and dense.
   * **Never** use fixed pixel heights (`h-6 overflow-hidden`) or tight line heights (`leading-none` / `leading-tight`) on text elements. Always use dynamic script-aware line heights (`leading-relaxed` or custom CSS variables per locale) and `min-h-*` with `py-1.5` padding.
3. **Consumer-Grade Simplicity, Enterprise-Grade Power:**
   * Inspired by **Linear** (clean spacing, keyboard shortcuts), **Airtable** (effortless custom columns & inline editing), and **Metabase** (friendly visual database connection cards).
4. **Immediate Visual Feedback:**
   * Every action (toggling an employee's auto-email switch, testing an SMTP connection, mapping a CSV, or asking the AI Copilot) must show instant optimistic UI feedback, clear status badges, and human-friendly toast notifications in the active language.
5. **Multimodal Transparency:**
   * When the AI Copilot queries employee data or generates a celebration card, show sleek visual "Tool Call Pills" (e.g., `🔍 Queried 18 Employees in Yangon Office`) and render the generated celebration card inline.

---

## 2. Visual Identity, Color Palette & Typography System

### 2.1 Color System (Modern Executive Light + High-Contrast Dark Mode)

Use CSS custom properties with Tailwind CSS utilities so the app feels warm, celebratory, and trustworthy:

| Semantic Token | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Background Primary** | `#F8FAFC` (`slate-50`) | `#090D16` (`slate-950`) | Main application canvas |
| **Surface / Card** | `#FFFFFF` (`white`) | `#111827` (`gray-900`) | KPI cards, tables, modals, drawers |
| **Primary Brand (Indigo)** | `#4F46E5` (`indigo-600`) | `#6366F1` (`indigo-500`) | Primary CTAs, active nav, AI Copilot accents |
| **Celebration Accent (Rose/Amber)**| `#F43F5E` -> `#F59E0B` | `#FB7185` -> `#FBBF24` | Birthday badges, anniversary banners, AI Studio |
| **Success (Auto-Email Active)** | `#10B981` (`emerald-500`)| `#34D399` (`emerald-400`)| SMTP verified, Auto-Email ON toggle, DB synced |
| **Warning (Action Needed)** | `#F59E0B` (`amber-500`) | `#FBBF24` (`amber-400`) | Missing birth date, Sandbox email mode |
| **Danger (Delivery Error)** | `#EF4444` (`red-500`) | `#F87171` (`red-400`) | Failed webhook/SMTP log, delete confirmation |
| **Border & Divider** | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | Crisp 1px hairlines for data grids and cards |

### 2.2 Multi-Script Google Fonts & Typography Engine

Include these exact Google Fonts in `src/client/index.html` so all 5 languages render natively with zero fallback ugliness:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Myanmar:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
```

#### Script-Adaptive CSS Rules (`src/client/styles/i18n-typography.css`)

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --line-height-base: 1.5;
  --line-height-heading: 1.25;
  --letter-spacing-ui: -0.01em;
}

/* 1. Burmese (Myanmar Unicode) — Requires taller line-height for stacked vowel/consonant glyphs */
html[data-lang="my"] {
  --font-sans: 'Noto Sans Myanmar', 'Padauk', 'Inter', sans-serif;
  --line-height-base: 1.85;
  --line-height-heading: 1.55;
  --letter-spacing-ui: 0em;
}

/* 2. Chinese (Simplified) — Clean, dense CJK glyph alignment */
html[data-lang="zh"] {
  --font-sans: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Inter', sans-serif;
  --line-height-base: 1.65;
  --line-height-heading: 1.35;
  --letter-spacing-ui: 0.02em;
}

/* 3. Vietnamese — Optimized for stacked Latin tone marks (ệ, ữ, ắ, ồ) */
html[data-lang="vi"] {
  --font-sans: 'Be Vietnam Pro', 'Inter', sans-serif;
  --line-height-base: 1.6;
  --line-height-heading: 1.3;
  --letter-spacing-ui: 0em;
}

/* 4. Indian (Hindi Devanagari) — Accommodates Shirorekha top bar & matras */
html[data-lang="hi"] {
  --font-sans: 'Noto Sans Devanagari', 'Inter', sans-serif;
  --line-height-base: 1.75;
  --line-height-heading: 1.45;
  --letter-spacing-ui: 0em;
}

body {
  font-family: var(--font-sans);
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-ui);
}

h1, h2, h3, h4, .heading-safe {
  line-height: var(--line-height-heading);
}
```

---

## 3. Master Application Layout & Spatial Architecture

The application uses an intuitive **4-Zone Workspace Layout** that keeps navigation, 1-click language switching, live judge demos, and the AI Chat Copilot permanently accessible without clutter.

```
+--------------------------------------------------------------------------------------------------+
| ⚡ [LIVE JUDGE DEMO BAR]  [Seed JAPAC Data] [✉️ Send Live AI Card to My Email]   [GCP Cloud Run] |
+----------------------+---------------------------------------------------------------------------+
|                      | 🏢 Acme JAPAC  | 🔍 Ask AI / Search (Cmd+K) | [🇬🇧 EN|🇲🇲 မြန်မာ|🇨🇳 中文|🇻🇳 VI|🇮🇳 हिन्दी] |
|  🎯 BRAND LOGO       +---------------------------------------------------------------------------+
|  CultureOS AI        |                                                    |                      |
|                      |  MAIN DYNAMIC WORKSPACE (Bento Grid / Data Table)  |  🤖 OMNISCIENT       |
|  📊 Dashboard        |                                                    |     AI COPILOT       |
|  👥 Employee Hub     |  +--------------+ +--------------+ +-------------+ |     DRAWER           |
|     ├─ Manual Grid   |  | 🎂 Today (2) | | ✉️ Auto-Mail | | 🔌 DB Sync  | |                      |
|     ├─ Smart CSV     |  | [Send Now]   | | [ON - Gmail] | | [Postgres]  | |  "Who has a birthday |
|     └─ DB Connectors |  +--------------+ +--------------+ +-------------+ |   this month?"       |
|  🎨 AI Card Studio   |                                                    |                      |
|  ✉️ Auto-Email Setup |  +-----------------------------------------------+ |  [📊 Inline Table]   |
|  🤖 AI Copilot Chat  |  | 🎉 Today & Upcoming Celebrations Radar        | |  [🎨 Live Card]      |
|  📜 Delivery Logs    |  | - Aye Chan (5th Anniv) [Auto-Email: ON] [Send]| |  [✉️ 1-Click Send]   |
|                      |  +-----------------------------------------------+ |                      |
|  +----------------+  |                                                    |  +----------------+  |
|  | Auto-Email: ON |  |  +-----------------------------------------------+ |  | Ask in EN/MY/  |  |
|  | [🟢 Master Sw] |  |  | 📊 Department Milestones & Engagement Charts  | |  | ZH/VI/HI...    |  |
|  +----------------+  |  +-----------------------------------------------+ |  +----------------+  |
+----------------------+----------------------------------------------------+----------------------+
```

### 3.1 Zone 1: Top Sticky Header & The 1-Click 5-Language Bar (`HeaderBar.tsx`)

* **Left:** Current View Title + Breadcrumb + Quick Status Pill (`🟢 Auto-Email Active • Daily 08:30 AM`).
* **Center:** Global Command Bar trigger (`🔍 Search employees or ask AI Copilot... ⌘K`).
* **Right (The Flagship 1-Click Language Switcher):**
  * A sleek, horizontally grouped segmented control with 5 buttons—**always visible, zero dropdown clicks required**:
    * `[ 🇬🇧 EN ]`
    * `[ 🇲🇲 မြန်မာ ]`
    * `[ 🇨🇳 中文 ]`
    * `[ 🇻🇳 Tiếng Việt ]`
    * `[ 🇮🇳 हिन्दी ]`
  * **Visual Behavior:** Clicking any pill highlights it with an Indigo gradient pill indicator, updates `<html data-lang="...">`, switches all UI strings in `<16ms`, and shows a subtle micro-toast:
    * e.g., *"ဘာသာစကားကို မြန်မာဘာသာသို့ ပြောင်းလဲပြီးပါပြီ (Language switched to Burmese)"*.

### 3.2 Zone 2: Left Navigation Sidebar (`SidebarNav.tsx`)

* **Width:** `260px` on desktop (collapsible to `72px` icon rail; slide-over drawer on mobile).
* **6 Primary Navigation Items:**
  1. `📊 Dashboard` (Executive overview, today's celebrations, analytics)
  2. `👥 Employee Data Hub` (Unified Manual Spreadsheet, Smart CSV Upload, & Custom Columns)
  3. `🔌 Database Connectors` (Metabase-style PostgreSQL / MySQL / BigQuery live sync)
  4. `🎨 AI Card Studio` (Interactive Birthday & Work Anniversary graphic card designer)
  5. `✉️ Easy Email & Webhooks` (60-second `Nodemailer` Gmail/SMTP/Sandbox setup + Teams/Telegram)
  6. `📜 Delivery Audit Logs` (History of sent emails, card previews, and retry buttons)
* **Bottom Sidebar Widget — Master Auto-Email Control Card:**
  * Always visible in the bottom-left corner so the user never has to hunt for it:
  * **Toggle Switch:** `Auto-Send Emails` (`🟢 ON` / `⚪ OFF`)
  * **Subtitle:** Shows active provider (`Gmail SMTP` or `Sandbox Preview Mode`) and a `"Configure"` link.

### 3.3 Zone 3: Top `"⚡ Live Judge Demo"` Ribbon (`JudgeDemoBanner.tsx`)

* A collapsible gradient ribbon at the very top of the viewport tailored for **Google Cloud AI Builder Cup 2026 judges**:
  * **Action 1:** `[ 🌱 Seed 20 JAPAC Employees (With Today's Milestones) ]`
  * **Action 2:** `[ ✉️ Quick-Send AI Card to My Email ]` — An inline input `[ Enter your email... ] [ Send Card 🚀 ]` that generates a real multimodal celebration card and emails it to the judge's inbox via `Nodemailer` in 5 seconds!

---

## 4. Screen-by-Screen UI/UX Component Specifications

### 4.1 Screen 1: Executive Dashboard (`DashboardView.tsx`)

1. **Row 1 — 4 Interactive Bento KPI Cards:**
   * **Card 1: Today's Celebrations:** Shows avatars of employees celebrating a Birthday or Work Anniversary *today*, with a pulsing badge and a **`[ 🎂 Preview & Send Email ]`** button.
   * **Card 2: Upcoming (Next 30 Days):** Count of birthdays vs. anniversaries + estimated gift budget (`$250 USD`).
   * **Card 3: Auto-Email Engine Health:** Master toggle switch right inside the card + `100% Delivery Rate` badge + `[ Send Test Email ]` link.
   * **Card 4: Connected Workforce Data:** Total employees broken down by source (`12 Manual • 45 CSV • 120 Postgres DB`).
2. **Row 2 — "Celebration Action Radar" (Left 2/3) & "AI Gift & Culture Concierge" (Right 1/3):**
   * **Celebration Radar:** Filter tabs for `Today`, `This Week`, `This Month`, `By Department`. Each employee row shows:
     * Avatar, Full Name, Role, Department, Custom Attribute Pills (e.g., `☕ Matcha Lover`, `🎸 Guitar`, `🏆 Alpha Launch`), Milestone Badge (`🎉 5th Work Anniversary`), Per-Employee **Auto-Email Toggle Switch**, and `[ 🎨 Open in Card Studio ]`.
   * **AI Gift & Culture Concierge:** Automatically displays 3 personalized gift ideas under budget for the selected employee, plus a 1-click button to generate the greeting message in **English, Burmese, Chinese, Vietnamese, or Hindi**.
3. **Row 3 — Workforce Milestone Analytics (Recharts):**
   * **Chart A:** Monthly Milestone Distribution Bar Chart (Birthdays vs. Work Anniversaries across all 12 months).
   * **Chart B:** Department Tenure & Engagement Donut Chart.

---

### 4.2 Screen 2: 3-Way Employee Data Hub & Dynamic Column Customizer (`EmployeeDataHub.tsx`)

Designed to feel as smooth as **Airtable + Notion**, supporting manual entry, CSV, and custom columns effortlessly:

1. **Top Action Toolbar:**
   * **Sub-Tab Switcher:** `[ 📋 Interactive Employee Grid ]` | `[ 📄 Smart CSV Import ]` | `[ 🔌 External DB Sync ]`
   * **Primary Action Buttons:**
     * **`[ + Add Employee Manually ]`** (Indigo CTA button)
     * **`[ ⚙️ + Customize Columns ]`** (Opens the Dynamic Column Builder)
     * **`[ 📥 Download Simple CSV Template ]`**
2. **Interactive Spreadsheet Grid Features:**
   * **Pinned Left Columns:** Checkbox, Avatar + `Full Name`, `Email`, and a prominent **`Auto-Send Email` Toggle Switch** (`🟢 Enabled` / `⚪ Disabled`) with a tooltip explaining: *"When ON, CultureOS automatically sends a personalized AI card to this employee's email box on their birthday and work anniversary."*
   * **Core Columns:** `Birth Date` (with age/next birthday countdown pill), `Hire Date` (with tenure badge like `3 yrs`), `Department`, `Role`, `Card Language` (`EN`/`MY`/`ZH`/`VI`/`HI`).
   * **Dynamic User-Created Columns (Highlighted with a subtle `✨ AI Context` header icon):**
     * Displays all custom columns defined by the user (e.g., `Nickname`, `Hobbies`, `Recent_Win`, `Favorite_Treat`, `Shirt_Size`, `Office_City`).
     * Clicking any cell allows instant inline editing!
3. **Dynamic Column Customizer Drawer (`ColumnManagerDrawer.tsx`):**
   * Users can add a new column in 3 seconds:
     * **Column Label:** e.g., `Favorite Coffee / Tea`
     * **Data Type:** `Text` | `Tags / Hobbies` | `Select Dropdown` | `Number`
     * **AI Toggle (`useInAiPrompt`):** `[x] Include this column when Gemini writes birthday/anniversary emails & gift ideas`
     * **1-Click Auto-Translate Labels:** Automatically translates the custom column header into Burmese, Chinese, Vietnamese, and Hindi so the table header stays localized when switching languages!
4. **Smart CSV Dropzone & AI Mapper (`CsvSmartImporter.tsx`):**
   * Drag-and-drop zone supporting `.csv` and `.xlsx`.
   * **"Keep CSV Simple" Helper Card:** Shows a 3-line visual example of a basic CSV (`Name, Email, Birthday, Hire Date`) and assures the user: *"Don't worry about exact column names or date formats—Gemini AI automatically maps your columns and turns extra columns into custom fields!"*
   * **Visual Mapping Preview:** Shows each CSV column -> Mapped App Field (with green checkmarks) before the user clicks **`[ Import 50 Employees ]`**.

---

### 4.3 Screen 3: Metabase-Style External Database Connector (`DbConnectorWizard.tsx`)

A clean, non-intimidating 4-step visual wizard inspired by **Metabase**:

* **Step 1 — Pick Your Database Engine:**
  * Visual cards with logos:
    1. **PostgreSQL / Cloud SQL / AlloyDB**
    2. **MySQL / MariaDB**
    3. **Google BigQuery**
    4. **⚡ Connect Built-In Demo Cloud HR Database (1-Click Judge Mode)** — Pre-fills a simulated enterprise HR database so anyone can test the full sync pipeline in 1 click without needing external credentials!
* **Step 2 — Connection Credentials & Live Ping:**
  * Clean form for `Display Name`, `Host`, `Port`, `Database Name`, `Username`, `Password`, and `SSL Toggle` (plus a `"Paste Connection URI"` shortcut).
  * **`[ 🔌 Test Connection ]`** button: Displays an animated spinner followed by a green badge: `✅ Connected to PostgreSQL 16.2 in 38ms (Read-Only Verified)`.
* **Step 3 — Select Table or Custom SQL Query:**
  * Toggle between **`Visual Table Picker`** (dropdown of tables like `public.hr_employees`) and **`Custom SQL Editor`** (`SELECT full_name, work_email, dob, join_date, dept, hobbies FROM employees WHERE active = true`).
  * Includes a **`[ 👀 Preview 5 Rows ]`** table right inside the wizard.
* **Step 4 — Map Columns & Set Auto-Sync Schedule:**
  * Side-by-side mapping dropdowns (`External Column -> CultureOS Field or New Custom Column`).
  * Sync schedule pill selector: `Manual Only` | `Every Hour` | `Daily at 07:00 AM (Before Email Cron)`.

---

### 4.4 Screen 4: Easy 60-Second Auto-Email Setup (`EmailSettingsView.tsx`)

Built specifically so non-technical users can configure Node.js `Nodemailer` without confusion:

1. **Hero Banner — Master Automation Switch:**
   * A prominent card at the top:
     * **Title:** `Automated Milestone Email Dispatch (Nodemailer Engine)`
     * **Description:** `When enabled, CultureOS automatically generates personalized AI cards and emails them to employees with Auto-Email turned ON.`
     * **Giant Toggle Switch:** `[ 🟢 AUTO-SEND EMAILS ENABLED ]`
     * **Schedule Picker:** `Send Daily At: [ 08:30 AM ]` | `Timezone: [ Asia/Yangon (GMT+6:30) ]`
2. **Provider Selection Cards (Pick 1 of 4):**
   * **Option A: 🧪 Zero-Config Sandbox Mode (Active by Default)**
     * *Badge:* `Best for Instant Testing & Hackathon Judges`
     * *How it works:* Uses `Nodemailer` Ethereal Sandbox—requires **zero passwords or API keys**, dispatches real MIME HTML emails with embedded PNG cards, and gives you a **1-Click Live Webmail Preview Link** for every sent email, OR forwards via the Judge Demo relay.
   * **Option B: 📧 Gmail Quick-Connect (2 Fields Only)**
     * *Field 1:* `Your Gmail Address` (`hr@yourcompany.com`)
     * *Field 2:* `16-Character Google App Password` (`xxxx xxxx xxxx xxxx`)
     * *Built-in Visual Tooltip:* A 3-step illustrated mini-guide showing *"1. Open Google Account Security -> 2. Search 'App Passwords' -> 3. Paste the 16-letter code here. (We configure smtp.gmail.com:587 automatically!)"*
   * **Option C: 🚀 Resend / SendGrid Free API**
     * *Fields:* `API Key` + `Verified Sender Email` (Highlights free tier: *3,000 free emails/month*).
   * **Option D: 🏢 Custom Enterprise SMTP**
     * *Fields:* `SMTP Host`, `Port (587/465)`, `TLS/SSL Toggle`, `Username`, `Password`.
3. **Live Verification Box:**
   * Input: `[ Enter any email address to test... ]` + Button: **`[ ✉️ Send Live Test Birthday Card ]`**
   * Displays real-time step-by-step checkmarks:
     1. `✅ Generated Personalized Copy via Gemini 2.5 Flash`
     2. `✅ Rendered 1200x630 HD Celebration Card PNG`
     3. `✅ Dispatched via Nodemailer SMTP (250 OK)`

---

### 4.5 Screen 5: Multimodal AI Celebration Card Studio (`CardStudioModal.tsx`)

A split-screen visual studio where users can preview, customize, and send Birthday & Work Anniversary cards:

* **Left Panel (AI Controls):**
  * **Select Employee & Event:** e.g., `Ma Thazin Oo — 🎂 Birthday` or `Ko Kyaw Swar — 🎉 5th Work Anniversary`.
  * **Card & Email Language (1-Click):**
    * `English Only` | `Burmese (မြန်မာ)` | `Chinese (中文)` | `Vietnamese (Tiếng Việt)` | `Hindi (हिन्दी)` | **`✨ Bilingual (English + Native Language)`**
  * **AI Tone Selector:** `Warm & Appreciative` | `Fun & Witty` | `Executive & Inspiring` | `Poetic`
  * **Visual Theme Selector:** `Aurora Gradient` | `Festive Confetti` | `Minimal Luxury Gold` | `🎨 Vertex AI Imagen 3 Custom Art`
  * **Custom Attributes Used (Checkboxes):** `[x] Hobbies: Photography, Trekking` | `[x] Recent Win: Cloud Migration` | `[x] Favorite Treat: Matcha Latte`
  * **Button:** **`[ ✨ Regenerate AI Card & Message ]`**
* **Right Panel (Live Dual Preview):**
  * **Top Preview:** High-resolution 16:9 graphic card showing the company logo, milestone badge, employee name, custom AI headline in their chosen script, and decorative artwork + `[ ⬇ Download PNG ]`.
  * **Bottom Preview:** Full HTML Email preview showing `Subject`, `To: employee@company.com`, the embedded card image, personalized 2-paragraph message, and **`[ 🚀 Send to Employee's Email Now ]`**.

---

### 4.6 Screen 6: Omniscient High-Intel AI Chat Copilot (`AiCopilotChat.tsx`)

Designed to feel like an elite executive AI assistant (Gemini Canvas style) that knows **every employee row, every custom column, and every app setting**:

* **Quick-Start Prompt Chips (Localized in all 5 languages!):**
  * `🎂 "Who has a birthday or work anniversary in the next 30 days?"`
  * `📊 "Summarize our employees by department, average tenure, and office city."`
  * `⚙️ "Is auto-email turned on? Which employees have auto-email disabled?"`
  * `🎁 "Suggest 3 personalized birthday gifts under $50 for Aye Chan based on her hobbies."`
  * `🎨 "Generate and send a 5th Work Anniversary card for Kyaw Swar in Burmese and English."`
* **Rich Agentic Response Components Inside Chat:**
  * **Tool Execution Badge:** Shows collapsible transparency pills when Gemini invokes backend tools (e.g., `⚡ Executed search_and_filter_employees({ upcomingDays: 30 }) -> Found 4 matches`).
  * **Interactive Mini-Tables:** Renders clean employee tables with inline `Auto-Email` toggles right inside the chat message.
  * **Inline Card Previews & 1-Click Send:** When asked to draft a card, renders the visual card directly inside the chat bubble with a **`[ ✉️ Confirm & Send Email ]`** button.

---

## 5. Complete 1-Click Internationalization (`i18n`) Architecture

### 5.1 How the 1-Click Language System Works (`src/client/i18n/LanguageContext.tsx`)

1. **Instant State & Persistence:**
   * Stores `locale: 'en' | 'my' | 'zh' | 'vi' | 'hi'` in React Context + `localStorage.getItem('cultureos_lang')`.
   * Updates `document.documentElement.setAttribute('data-lang', locale)` and `document.documentElement.lang = locale` immediately on click.
2. **4-Layer Synchronization on Every Click:**
   * **Layer 1 (Static UI Dictionary):** All navigation items, buttons, KPI titles, table headers, and tooltips update immediately via `t('key')`.
   * **Layer 2 (Locale-Aware Date & Currency Formatting):** Uses native `Intl.DateTimeFormat(localeMap[locale])` so dates and tenure counts read naturally in English, Burmese, Chinese, Vietnamese, and Hindi.
   * **Layer 3 (AI Chat Copilot Language Injection):** Passes `userPreferredUiLanguage: locale` in every `/api/copilot/chat` request so the AI Copilot automatically replies in the user's active language unless asked otherwise!
   * **Layer 4 (Card Studio Default Language):** Sets the default card preview language to match the active language (or Bilingual English + Active Language).

### 5.2 Core UI Translation Matrix (`src/client/i18n/translations.ts`)

Use this verified translation dictionary as the foundation for the 5 supported languages:

```typescript
export type SupportedLocale = 'en' | 'my' | 'zh' | 'vi' | 'hi';

export const LOCALE_METADATA: Record<SupportedLocale, {
  code: SupportedLocale;
  nativeLabel: string;
  englishLabel: string;
  flag: string;
  fontFamily: string;
  intlCode: string;
}> = {
  en: {
    code: 'en',
    nativeLabel: 'EN',
    englishLabel: 'English',
    flag: '🇬🇧',
    fontFamily: "'Inter', sans-serif",
    intlCode: 'en-US'
  },
  my: {
    code: 'my',
    nativeLabel: 'မြန်မာ',
    englishLabel: 'Burmese',
    flag: '🇲🇲',
    fontFamily: "'Noto Sans Myanmar', sans-serif",
    intlCode: 'my-MM'
  },
  zh: {
    code: 'zh',
    nativeLabel: '中文',
    englishLabel: 'Chinese',
    flag: '🇨🇳',
    fontFamily: "'Noto Sans SC', sans-serif",
    intlCode: 'zh-CN'
  },
  vi: {
    code: 'vi',
    nativeLabel: 'Tiếng Việt',
    englishLabel: 'Vietnamese',
    flag: '🇻🇳',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    intlCode: 'vi-VN'
  },
  hi: {
    code: 'hi',
    nativeLabel: 'हिन्दी',
    englishLabel: 'Hindi (Indian)',
    flag: '🇮🇳',
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    intlCode: 'hi-IN'
  }
};

export const UI_TRANSLATIONS: Record<SupportedLocale, Record<string, string>> = {
  en: {
    appTitle: "CultureOS AI",
    appSubtitle: "Enterprise Milestone & Recognition Platform",
    navDashboard: "Dashboard",
    navEmployeeHub: "Employee Data Hub",
    navDbConnectors: "DB Connectors (Metabase)",
    navCardStudio: "AI Card Studio",
    navEmailSettings: "Auto-Email Setup",
    navAuditLogs: "Delivery Logs",
    navAiCopilot: "Ask AI Copilot",
    masterAutoEmail: "Auto-Send Emails",
    kpiTodayTitle: "Today's Celebrations",
    kpiUpcomingTitle: "Upcoming (30 Days)",
    kpiEmailStatus: "Auto-Email Engine",
    kpiWorkforceTotal: "Connected Workforce",
    btnAddEmployee: "+ Add Employee",
    btnCustomizeColumns: "+ Customize Columns",
    btnImportCsv: "Smart CSV Import",
    btnConnectDb: "Connect External DB",
    btnPreviewSend: "Preview & Send Card",
    btnSendTestEmail: "Send Test Email",
    colFullName: "Employee Name",
    colEmail: "Email Address",
    colBirthDate: "Birthday",
    colHireDate: "Hire Date (Tenure)",
    colDepartment: "Department",
    colAutoEmailToggle: "Auto-Send to Mailbox",
    copilotPlaceholder: "Ask anything about your employees, milestones, or app settings..."
  },
  my: {
    appTitle: "CultureOS AI",
    appSubtitle: "ဝန်ထမ်းအမှတ်တရနေ့ရက်နှင့် အလိုအလျောက်ဂုဏ်ပြုစနစ်",
    navDashboard: "ပင်မဒက်ရှ်ဘုတ်",
    navEmployeeHub: "ဝန်ထမ်းအချက်အလက်စင်တာ",
    navDbConnectors: "ဒေတာဘေ့စ်ချိတ်ဆက်မှု (Metabase)",
    navCardStudio: "AI ဂုဏ်ပြုကတ်စတူဒီယို",
    navEmailSettings: "အလိုအလျောက်အီးမေးလ်ပြင်ဆင်ရန်",
    navAuditLogs: "ပေးပို့မှုမှတ်တမ်းများ",
    navAiCopilot: "AI လက်ထောက်နှင့်မေးမြန်းရန်",
    masterAutoEmail: "အလိုအလျောက်အီးမေးလ်ပို့စနစ်",
    kpiTodayTitle: "ယနေ့ဂုဏ်ပြုရမည့်ပွဲများ",
    kpiUpcomingTitle: "လာမည့် ရက် (၃၀) အတွင်း",
    kpiEmailStatus: "အီးမေးလ်စက်စနစ်အခြေအနေ",
    kpiWorkforceTotal: "ချိတ်ဆက်ထားသောဝန်ထမ်းပေါင်း",
    btnAddEmployee: "+ ဝန်ထမ်းအသစ်ထည့်ရန်",
    btnCustomizeColumns: "+ ကော်လံများစိတ်ကြိုက်ပြင်ရန်",
    btnImportCsv: "CSV ဖိုင်တင်သွင်းရန်",
    btnConnectDb: "ပြင်ပ Database ချိတ်ရန်",
    btnPreviewSend: "ကတ်ကြည့်ရှုပြီးပေးပို့မည်",
    btnSendTestEmail: "စမ်းသပ်အီးမေးလ်ပို့မည်",
    colFullName: "ဝန်ထမ်းအမည်",
    colEmail: "အီးမေးလ်လိပ်စာ",
    colBirthDate: "မွေးနေ့ရက်စွဲ",
    colHireDate: "အလုပ်ဝင်သည့်ရက် (လုပ်သက်)",
    colDepartment: "ဌာန",
    colAutoEmailToggle: "အီးမေးလ်အလိုအလျောက်ပို့မည်",
    copilotPlaceholder: "ဝန်ထမ်းအချက်အလက်များ၊ မွေးနေ့များ သို့မဟုတ် App အကြောင်း စိတ်ကြိုက်မေးမြန်းပါ..."
  },
  zh: {
    appTitle: "CultureOS AI",
    appSubtitle: "智能员工里程碑与关怀自动化平台",
    navDashboard: "智能仪表盘",
    navEmployeeHub: "员工数据中心",
    navDbConnectors: "数据库连接 (Metabase)",
    navCardStudio: "AI 贺卡设计室",
    navEmailSettings: "自动邮件设置",
    navAuditLogs: "发送日志",
    navAiCopilot: "AI 智能助手",
    masterAutoEmail: "自动发送祝贺邮件",
    kpiTodayTitle: "今日庆典提醒",
    kpiUpcomingTitle: "未来 30 天里程碑",
    kpiEmailStatus: "自动邮件引擎状态",
    kpiWorkforceTotal: "已同步员工总数",
    btnAddEmployee: "+ 手动添加员工",
    btnCustomizeColumns: "+ 自定义数据列",
    btnImportCsv: "AI 智能导入 CSV",
    btnConnectDb: "连接外部数据库",
    btnPreviewSend: "预览并发送贺卡",
    btnSendTestEmail: "发送测试邮件",
    colFullName: "员工姓名",
    colEmail: "电子邮箱",
    colBirthDate: "出生日期",
    colHireDate: "入职日期 (司龄)",
    colDepartment: "所属部门",
    colAutoEmailToggle: "自动发送至员工邮箱",
    copilotPlaceholder: "询问有关员工数据、生日周年庆或系统设置的任何问题..."
  },
  vi: {
    appTitle: "CultureOS AI",
    appSubtitle: "Nền tảng Tự động hóa Kỷ niệm & Gắn kết Nhân sự",
    navDashboard: "Bảng điều khiển",
    navEmployeeHub: "Trung tâm Dữ liệu Nhân sự",
    navDbConnectors: "Kết nối CSDL (Metabase)",
    navCardStudio: "Xưởng Thiệp AI",
    navEmailSettings: "Cài đặt Email Tự động",
    navAuditLogs: "Nhật ký Gửi",
    navAiCopilot: "Trợ lý AI Copilot",
    masterAutoEmail: "Tự động gửi Email",
    kpiTodayTitle: "Kỷ niệm Hôm nay",
    kpiUpcomingTitle: "Sắp tới (30 Ngày)",
    kpiEmailStatus: "Trạng thái Email Tự động",
    kpiWorkforceTotal: "Tổng Nhân sự Kết nối",
    btnAddEmployee: "+ Thêm Nhân viên",
    btnCustomizeColumns: "+ Tùy chỉnh Cột",
    btnImportCsv: "Nhập CSV Thông minh",
    btnConnectDb: "Kết nối CSDL Ngoài",
    btnPreviewSend: "Xem & Gửi Thiệp",
    btnSendTestEmail: "Gửi Email Thử nghiệm",
    colFullName: "Họ và Tên",
    colEmail: "Địa chỉ Email",
    colBirthDate: "Ngày sinh",
    colHireDate: "Ngày vào làm (Thâm niên)",
    colDepartment: "Phòng ban",
    colAutoEmailToggle: "Tự động gửi vào Hộp thư",
    copilotPlaceholder: "Hỏi bất kỳ điều gì về dữ liệu nhân viên, sinh nhật hoặc cài đặt ứng dụng..."
  },
  hi: {
    appTitle: "CultureOS AI",
    appSubtitle: "एआई कर्मचारी उत्सव और स्वचालित शुभकामना मंच",
    navDashboard: "मुख्य डैशबोर्ड",
    navEmployeeHub: "कर्मचारी डेटा केंद्र",
    navDbConnectors: "डेटाबेस कनेक्टर (Metabase)",
    navCardStudio: "AI कार्ड स्टूडियो",
    navEmailSettings: "ऑटो-ईमेल सेटिंग्स",
    navAuditLogs: "डिलीवरी लॉग्स",
    navAiCopilot: "AI कोपायलट चैट",
    masterAutoEmail: "ऑटो-ईमेल भेजें",
    kpiTodayTitle: "आज के उत्सव",
    kpiUpcomingTitle: "आगामी (30 दिन)",
    kpiEmailStatus: "ऑटो-ईमेल इंजन",
    kpiWorkforceTotal: "कुल जुड़े कर्मचारी",
    btnAddEmployee: "+ कर्मचारी जोड़ें",
    btnCustomizeColumns: "+ कस्टम कॉलम बदलें",
    btnImportCsv: "स्मार्ट CSV इम्पोर्ट",
    btnConnectDb: "बाहरी डेटाबेस जोड़ें",
    btnPreviewSend: "कार्ड देखें और भेजें",
    btnSendTestEmail: "टेस्ट ईमेल भेजें",
    colFullName: "कर्मचारी का नाम",
    colEmail: "ईमेल पता",
    colBirthDate: "जन्मतिथि",
    colHireDate: "नियुक्ति तिथि (कार्यकाल)",
    colDepartment: "विभाग",
    colAutoEmailToggle: "इनबॉक्स में ऑटो-ईमेल भेजें",
    copilotPlaceholder: "कर्मचारी डेटा, जन्मदिन, वर्षगांठ या ऐप सेटिंग्स के बारे में कुछ भी पूछें..."
  }
};
```

---

## 6. Cultural & Multilingual AI Prompting Guidelines (For Card & Email Generation)

When generating Birthday and Work Anniversary messages in `aiMessageService.ts`, instruct `gemini-2.5-flash` to respect authentic cultural nuances for each of the 5 languages rather than performing stiff word-for-word translation:

1. **English (`en`):** Warm, modern executive appreciation; weave in specific `customAttributes` (hobbies, recent project wins, favorite treats) naturally.
2. **Burmese (`my`):** Use polite, respectful, and warm Myanmar phrasing (e.g., addressing colleagues warmly with appropriate prefixes like `ကို` / `မ` when appropriate, and closing with auspicious wishes like *"ပျော်ရွှင်စရာ မွေးနေ့လေးဖြစ်ပါစေ"* or *"လုပ်ငန်းခွင်တွင် ဆထက်ထမ်းပိုး အောင်မြင်ပါစေ"*).
3. **Chinese (`zh`):** Use warm, poetic corporate Chinese blessings (e.g., *"生日快乐，愿新的一岁万事顺遂，感谢您在团队中的卓越贡献"*).
4. **Vietnamese (`vi`):** Use warm, respectful Vietnamese pronouns and enthusiastic team celebration phrasing (e.g., *"Chúc mừng sinh nhật rực rỡ! Cảm ơn những đóng góp tuyệt vời của bạn..."*).
5. **Indian / Hindi (`hi`):** Use warm, celebratory Hindi with natural professional phrasing (e.g., *"जन्मदिन की हार्दिक शुभकामनाएँ! आपकी कड़ी मेहनत और समर्पण के लिए धन्यवाद..."*).

---

## 7. Frontend Implementation Checklist for AI Coding Agents

- [ ] **Step 1:** Add Google Fonts (`Inter`, `Noto Sans Myanmar`, `Noto Sans SC`, `Be Vietnam Pro`, `Noto Sans Devanagari`) to `index.html` and configure `i18n-typography.css`.
- [ ] **Step 2:** Create `LanguageContext.tsx` and mount the **1-Click 5-Language Pill Switcher (`🇬🇧 EN | 🇲🇲 မြန်မာ | 🇨🇳 中文 | 🇻🇳 Tiếng Việt | 🇮🇳 हिन्दी`)** in the sticky top header.
- [ ] **Step 3:** Build the **4-Zone Layout** with the top `"⚡ Live Judge Demo"` bar, left sidebar with the permanent **Master Auto-Email Toggle**, main workspace, and slide-over **AI Copilot Chat Drawer**.
- [ ] **Step 4:** Ensure the **AI Card Studio** and **Nodemailer Auto-Email Engine** embed multi-script fonts so generated `.png` birthday and work anniversary cards render Burmese, Chinese, Vietnamese, Hindi, and English text crisply inside employee email inboxes.