# 🌟 Employee Milestone & Culture Platform (AI-Powered)

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run-blue?logo=google-cloud)](https://cloud.google.com/run)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-orange?logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, multi-language employee milestone tracking and automated recognition platform built for the **Google Cloud AI Builder Cup 2026** (**Track 5: Future of Work & Enterprise Productivity**). 

This platform transforms traditional, static HR birthday/anniversary reminders into an autonomous, multimodal culture engine. It features Gemini-driven personalized greetings, automated `Nodemailer` dispatch with dynamic graphic cards, a Metabase-style SQL database connector, an AI Smart CSV Header Mapper, and an omniscient HR Copilot supporting **1-click 5-language localization (English, Burmese, Chinese, Vietnamese, and Hindi)**.

---

## ✨ Key Features

1. **🤖 Gemini-Powered Multilingual Copywriting & Copilot**
   - Automatically drafts warm, role-specific, and context-aware birthday and work anniversary messages using Gemini 2.5 Flash.
   - Built-in **Agentic HR Chat Copilot** with Function Calling tools to query employee databases and system logs in real time.
2. **🌍 1-Click JAPAC 5-Language Localization (i18n)**
   - Instant switching between **English (`en`)**, **Burmese (`my`)**, **Chinese (`zh`)**, **Vietnamese (`vi`)**, and **Hindi (`hi`)** with script-safe typography (zero font clipping or tofu boxes).
3. **🎨 Multimodal Celebration Card Studio**
   - Generates custom graphic celebration cards (.png) on the fly using **Satori** and **Vertex AI Imagen**, attaching them seamlessly to emails via `cid`.
4. **📥 3-Way Universal Data Ingestion**
   - **Manual Grid:** Inline CRUD editing with dynamic JSON custom columns (`Shirt_Size`, `Favorite_Snack`, etc.).
   - **AI Smart CSV:** Upload any messy CSV file; Gemini automatically maps column headers.
   - **Metabase-Style DB Connector:** Securely connect external PostgreSQL, MySQL, or BigQuery databases in read-only mode.
5. **📧 Zero-Config Auto-Email Engine (`Nodemailer`)**
   - Supports Gmail App Passwords, Resend (3,000 free monthly emails), Custom SMTP, and Ethereal Sandbox with a 1-click test card preview.

---

## 🛠️ Google Cloud & Modern Tech Stack

- **Cloud Hosting & Deployment:** Google Cloud Run (Serverless container architecture)
- **AI & ML Engine:** Google AI Studio (`gemini-2.5-flash`), Vertex AI SDK, and Imagen 3
- **Database & State:** PostgreSQL / Prisma ORM with dynamic JSONB attributes
- **Backend Core:** Node.js, Express, TypeScript, Nodemailer, Satori, and Node-Cron
- **Frontend UI:** React 18, Tailwind CSS, Shadcn/UI, and Lucide Icons

---

## 🚀 Quick Start & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/vibecode-ting/employee-milestone-notifications-ai.git
cd employee-milestone-notifications-ai
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```
```env
PORT=8080
DATABASE_URL="postgresql://user:password@localhost:5432/milestones_db"
GEMINI_API_KEY="your_google_ai_studio_gemini_api_key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Install Dependencies & Run Database Migrations
```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## ☁️ Deploying to Google Cloud Run

To deploy this application as a serverless container on Google Cloud Platform:

1. **Build and Submit Container via Cloud Build:**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/employee-milestone-ai
   ```
2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy employee-milestone-ai \
     --image gcr.io/YOUR_PROJECT_ID/employee-milestone-ai \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="your_key",DATABASE_URL="your_cloud_sql_url"
   ```

---

## 🏆 Google Cloud AI Builder Cup 2026 Submission Details
- **Primary Track:** Track 5: Future of Work & Enterprise Productivity
- **Target Audience:** Enterprises and JAPAC SMEs looking to automate culture, retention, and employee recognition with enterprise-grade security and localized flair.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.