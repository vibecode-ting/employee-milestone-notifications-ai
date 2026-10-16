# Refactor-Simple-Plan — Milestone App

Full feature reference for remaking this app identically.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + Vite 6 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Routing | React Router DOM v7 |
| Backend/DB | Firebase v12 (Auth + Firestore + Functions) |
| Icons | lucide-react |
| Charts | Recharts v3 |
| i18n | i18next + react-i18next |
| Excel | xlsx (SheetJS) |
| Fonts | Roboto, Noto Sans Myanmar (via @fontsource) |
| Animation | Tailwind `animate-in` / `fade-in` / `zoom-in-95` (built-in v4) |

---

## Project Structure

```
src/
  App.tsx                        # Root: Router + AuthProvider + layout shell
  main.tsx                       # Entry: renders App, imports CSS + i18n + fonts
  index.css                      # Global styles (Tailwind v4 theme + component classes)
  types.ts                       # All shared TypeScript types
  contexts/
    AuthContext.tsx               # Auth state: Firebase + demo session
  components/
    auth/AuthRoute.tsx            # Route guard (redirects to /login if unauthed)
    layout/Navbar.tsx             # Collapsible sidebar nav
  views/
    Login.tsx                    # Login page
    Dashboard.tsx                # Main dashboard
    Employees.tsx                # Employee CRUD table
    Settings.tsx                 # Notification + template settings
    Pricing.tsx                  # Upgrade/pricing + checkout flow
    AdminUsers.tsx               # Admin-only user role management
  lib/
    firebase.ts                  # Firebase app init (auth, db, isEmulatorMode)
    i18n.ts                      # i18next config + all translations inline
    utils.ts                     # cn() = clsx + tailwind-merge
  utils/
    milestones.ts                # calculateMilestones(employees, days) logic
    excelHandler.ts              # parseExcel, exportToExcel, downloadTemplate
```

---

## Auth

### Provider: Firebase Authentication
- Email/password (implied — no OAuth buttons visible)
- `onAuthStateChanged` listener in `AuthContext`
- On first login, creates `/users/{uid}` doc in Firestore with `role: 'user'`
- If doc exists, loads `AppUser` (uid, email, role, createdAt)

### Demo / Offline Mode
- `localStorage` key `demo_session` stores `{ uid, email, role }`
- If present at startup, skips Firebase entirely — uses fake User object
- Cleared on sign out
- Emulator mode: reads `demo_role_{uid}` from localStorage instead of Firestore

### Route Guard (`AuthRoute`)
- Wraps all protected routes
- Shows spinner while `loading === true`
- Redirects to `/login` if `user === null`

### Sign Out
- Clears demo session from localStorage
- Calls Firebase `signOut(auth)`
- Sets user/appUser to null

---

## Roles & Plan Limits

| Role | Plan Name | Employee Limit | Description |
|---|---|---|---|
| `user` | Free Plan | 100 | Default on signup |
| `pro` | Pro Plan | 1,000 | Paid upgrade |
| `pro_plus` | Pro Plus | Unlimited (∞) | Paid upgrade |
| `admin` | Mod Admin | Unlimited (∞) | Set manually |

- Role stored in Firestore `/users/{uid}.role`
- Admin can change any user's role via `/admin/users`
- Admin cannot change own role

---

## Themes

### Light / Dark toggle
- Implemented via `document.documentElement.classList.add/remove('dark')`
- Persisted in `localStorage.theme`
- Toggle button in Navbar bottom section (Moon/Sun icon)
- Initial state read from `document.documentElement.classList.contains('dark')`

### CSS Design System (`index.css`)

**Tailwind v4 custom theme tokens:**
```css
--color-gold-400: #facc15
--color-gold-500: #eab308
--color-gold-600: #ca8a04
--color-gold-700: #a16207
--color-corp-cyan: #e0f2fe
--color-corp-blue: #1e3a8a
--color-corp-grey: #64748b
```

**Dark variant:** `@custom-variant dark (&:is(.dark, .dark *))`

**Body gradient:**
- Light: `bg-gradient-to-br from-corp-cyan to-white`
- Dark: `dark:from-black dark:to-zinc-950`

**Reusable component classes:**

| Class | Purpose |
|---|---|
| `.glass-panel` | Frosted glass card (white/60 backdrop-blur, dark: zinc-900/40) |
| `.glass-input` | Frosted input field; blue focus light / gold focus dark |
| `.btn-primary` | Corp-blue light / gold gradient dark |
| `.btn-secondary` | White/border light / zinc dark |
| `.text-highlight` | corp-blue light / gold-500 dark, bold |
| `.icon-highlight` | Blue/gold tinted icon container |
| `.table-header` | Uppercase small caps header row |
| `.table-row-hover` | Subtle hover bg for table rows |

**Font stack:** `'Roboto', 'Noto Sans Myanmar', 'Microsoft JhengHei', 'PingFang TC', sans-serif`
**Base font-size:** 105% (slight zoom)

---

## Internationalization (i18n)

Library: `i18next` + `react-i18next`

**Default language:** `en`  
**Fallback:** `en`

**Supported locales:**

| Code | Language | Flag |
|---|---|---|
| `en` | English | 🇺🇸 |
| `mm` | Myanmar (Burmese) | 🇲🇲 |
| `zh` | Traditional Chinese | 🇹🇼 |
| `vn` | Vietnamese | 🇻🇳 |

**Switching:** Cycles through `['en','mm','zh','vn']` on button click (no page reload).  
Flag emoji shown in Navbar toggle button. Current lang code shown when sidebar is open.

**Translated keys (all inline in `src/lib/i18n.ts`):**
`Dashboard`, `Employees`, `Settings`, `Sign Out`, `Upgrade to PRO`, `Total Employees`, `Upcoming Milestones`, `Active Alerts`, `Dashboard Overview`, `Pricing`, `Plan`, `Language`, `Dark Mode`, `Light Mode`, `Happening Today`, `User Management`

---

## Layout

### Navbar (collapsible sidebar)
- **Position:** `fixed left-0 top-0 h-screen` — always on screen
- **Width:** collapsed `w-20`, expanded `w-72`
- **Trigger:** `onMouseEnter` → expand, `onMouseLeave` → collapse
- **Main content offset:** `ml-20` / `ml-72` matching sidebar width (animated with `transition-all duration-300`)
- Clicking main content area collapses sidebar
- **Border:** right border `border-r-purple-500/20` with purple drop shadow
- **Logo:** `/logo.svg` — `w-8`/`w-12` depending on state; `"Milestone"` text appears when open
- **Shadow:** `shadow-[4px_0_24px_-4px_rgba(168,85,247,0.3)]` (purple glow)

**Nav items (with icons from lucide-react):**
| Route | Icon | Visibility |
|---|---|---|
| `/` | `LayoutDashboard` | All users |
| `/employees` | `Users` | All users |
| `/settings` | `Settings` | All users |
| `/admin/users` | `Shield` | `admin` role only |

**Active state:** `bg-corp-blue/10 text-corp-blue dark:bg-gold-500/15 dark:text-gold-400 font-bold`  
**Inactive:** `text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50`

**Bottom section (in order):**
1. User avatar + display name + plan badge + employee count / limit
2. Dark/Light mode toggle button
3. Language cycle button (flag emoji)
4. "Upgrade to PRO" button — purple-to-indigo gradient — shown only for `role === 'user'`
5. Sign Out button (red text, red hover bg)

**Plan badge colors:**
- `pro_plus` → `text-purple-600 dark:text-purple-400` + Zap icon
- `pro` → `text-corp-blue dark:text-gold-500` + Shield icon
- `admin` → `text-emerald-600 dark:text-emerald-400`
- `user` → `text-slate-500 dark:text-zinc-500`

---

## Pages / Views

### `/login` — Login
- Public route (no AuthRoute wrapper)
- Firebase email/password auth

### `/` — Dashboard
**Stat cards (3 columns, clickable → modal):**
1. **Total Employees** — count from Firestore, `from-corp-blue to-blue-600 dark:from-gold-600 dark:to-gold-500`
2. **Upcoming Milestones** — milestones in next 30 days, `from-indigo-500 to-purple-600`
3. **Active Alerts** — active employee count, `from-emerald-500 to-teal-600`

Each card: glass-panel, gradient icon bg, `TrendingUp` trend line, `ChevronRight`, hover `-translate-y-1`.

**Charts (2 columns, Recharts, Grafana-style):**
- `AreaChart` — 7-day activity (Birthdays purple `#8b5cf6`, Anniversaries cyan `#0ea5e9`), gradient fill
- `BarChart` — Headcount by Department (bars `#8b5cf6`, radius top)
- Both: dark tooltip bg `#1e293b`, no axis lines/tick lines, dashed grid

**Milestone lists (2 columns):**
- "Happening Today" — pulsing red dot badge, count badge
- "Upcoming (Next 30 Days)" — link to /employees
- `MilestoneItem`: Cake icon (birthday, pink) / Briefcase icon (anniversary, blue/gold)

**Expanded stat modals:** backdrop blur overlay, `zoom-in-95` animation, X close button, scrollable content

### `/employees` — Employees
**Header actions:**
- Download Template button (`btn-secondary`)
- Import button — file input (`.xlsx,.xls,.csv`) → preview modal
- Add Employee button (`btn-primary`)

**Search bar:** filters name, employeeId, email, department, phone (client-side)

**Table columns:** Employee ID, Name (avatar initials + name), Department (badge), Contact (email+phone), Dates (DOB+Join), Status, Actions (Edit/Delete)

**Status badge:** `active` → emerald, `inactive` → slate

**Add/Edit modal:** glass-panel, `zoom-in-95`, fields: Employee ID, Full Name, Email, Phone, Department, DOB (date), Joined Date (date), Status (select)

**Import preview modal:** full table preview, "Confirm Import (N Employees)" bulk commit via Firestore `writeBatch`

**Export:** `exportToExcel(employees)` — downloads xlsx

**Plan enforcement:** blocks add/import if over limit; shows alert with upgrade prompt

### `/settings` — Settings
**Two tabs:** Notification Settings | Message Templates

**Notification channels (each: toggle switch, expand on enable):**
1. **Email (SMTP)** — host, port, "Send Directly to Employees" toggle
2. **Microsoft Teams** — incoming webhook URL
3. **Telegram Bot** — bot token + chat ID
4. (Webhook defined in types but not shown in UI)

**Templates tab:**
- Template Type selector: Normal Text | Card Template (card locked behind Pro)
- Card Template fields (Pro only, blurred overlay for free users): Logo URL, Cover Image URL, Footer Text, Allow Emoji Reactions checkbox, Allow Attachments checkbox
- Birthday message textarea (`{{employee_name}}` variable)
- Anniversary message textarea (`{{employee_name}}`, `{{years_of_service}}`, `{{department}}`, `{{job_title}}` variables)
- Info box listing available variables

**Non-Pro upsell:** banner linking to `/pricing`

**Save:** `setDoc` to `/settings/{uid}`, success state shows green CheckCircle2 for 3s

### `/pricing` — Pricing

**Three-step flow:** `pricing` → `checkout` → `processing`

**Plans (5 cards):**
| Key | Name | Price (MMK) | USDT |
|---|---|---|---|
| `free` | Free Forever | 0 | 0 |
| `pro_6m` | Pro 6 Months | 5,000 | 1.50 |
| `pro_12m` | Pro 12 Months | 10,000 | 3.00 |
| `pro_plus_6m` | Pro Plus 6 Months | 15,000 | 4.50 |
| `pro_plus_life` | Pro Plus Lifetime | 30,000 | 9.00 |

`pro_plus_life` card: dark purple gradient bg (`from-indigo-900 to-purple-900`), gold badge "Popular & Recommended", scale-105 when selected.

**Payment methods (4 wallets):**
| ID | Name | Account |
|---|---|---|
| `kbz` | KBZ Pay | 09 79 123 4567 |
| `wave` | Wave Pay | 09 97 123 4567 |
| `aya` | AYA Pay | 09 42 123 4567 |
| `crypto` | Crypto (USDT) | Binance Pay TRC20 |

**Checkout step:** QR code placeholder, payment details, 5-minute countdown timer (auto-returns to pricing at 0:00), "Completed Paid" button

**Processing step:** Clock icon, "Admin will approve within 24 hours" message, support links (Email, Telegram, Viber)

### `/admin/users` — User Management
- Accessible only to `role === 'admin'` (shows Access Denied for others)
- Table: User email + UID, Current Role (with icon), Change Role dropdown
- Roles available: user, pro, admin
- Cannot change own role (dropdown disabled)
- Updates `/users/{uid}.role` in Firestore

---

## Data Model (Firestore)

### `/users/{uid}`
```ts
{
  uid: string
  email: string
  role: 'user' | 'pro' | 'pro_plus' | 'admin'
  createdAt: Timestamp
}
```

### `/employees/{id}`
```ts
{
  id?: string
  userId: string          // owner's uid
  employeeId: string      // HR-assigned ID
  name: string
  department: string
  email: string
  phone: string
  dob: string             // YYYY-MM-DD
  joinedDate: string      // YYYY-MM-DD
  status: 'active' | 'inactive'
  metadata?: Record<string, any>  // custom fields (pro)
  createdAt: Timestamp
}
```

### `/settings/{uid}`
```ts
{
  userId: string
  smtp?: { host, port, user, enabled, sendToEmployee? }
  teams?: { webhookUrl, enabled }
  telegram?: { botToken, chatId, enabled }
  webhook?: { url, enabled }
  templates: {
    type?: 'normal' | 'card'
    logoUrl?: string
    detailsText?: string
    coverImage?: string
    includeEmojis?: boolean
    allowAttachments?: boolean
    birthday: string
    anniversary: string
  }
}
```

### `/notificationLogs/{id}` (type exists, UI not shown)
```ts
{
  userId, employeeId, milestoneType: 'BIRTHDAY'|'ANNIVERSARY'
  channel: 'email'|'teams'|'telegram'|'webhook'
  status: 'success'|'failure'
  error?: string
  timestamp: Timestamp
}
```

---

## Milestone Logic (`src/utils/milestones.ts`)

`calculateMilestones(employees, days)`:
- Returns `MilestoneResult[]` for birthdays and work anniversaries within the next N days
- Each result has: `employee`, `type`, `daysUntil`, `isToday`, `years` (for anniversary)
- Dashboard calls with `days = 30`

---

## Excel Import/Export (`src/utils/excelHandler.ts`)

- `parseExcel(file)` → `Partial<Employee>[]` using SheetJS (xlsx)
- `exportToExcel(employees)` → downloads `.xlsx`
- `downloadTemplate()` → downloads blank template with correct column headers

---

## Firebase Functions (`functions/src/index.ts`)

Backend functions (Cloud Functions) for sending notifications:
- Triggered by schedule (daily cron)
- Reads employees + settings per user
- Sends via SMTP (nodemailer), MS Teams webhook, Telegram bot API, generic webhook
- Writes results to `/notificationLogs`

---

## Deployment

- Vite build → `dist/`
- `.github/workflows/deploy.yml` → GitHub Actions
- `dist/.nojekyll` → GitHub Pages deployment
- `firestore.rules` → Firestore security rules
- `metadata.json` → project metadata

---

## Key Visual Patterns

1. **Glass morphism everywhere** — `.glass-panel` on all cards, modals, sidebar
2. **Purple accent** — sidebar shadow, borders, upgrade CTAs (`purple-500/indigo-600`)
3. **Light mode accent:** `corp-blue (#1e3a8a)` for interactive elements
4. **Dark mode accent:** `gold-500 (#eab308)` replaces blue everywhere in dark mode
5. **Gradient stat card icons** — each has a unique gradient `from-X to-Y`
6. **animate-in** on page load for all views (`fade-in duration-500`)
7. **Modals:** `zoom-in-95 duration-200` + `backdrop-blur-md`
8. **Spinner:** `border-t-transparent rounded-full animate-spin` in corp-blue/gold-500
9. **Toggle switches:** pure CSS (peer-checked) in corp-blue light / gold-500 dark
10. **Tables:** no external component — plain `<table>` with `.table-header` + `.table-row-hover`
