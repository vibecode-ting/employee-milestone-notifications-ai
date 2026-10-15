# 🚀 MASTER REFACTOR BLUEPRINT: `employee-milestone-notifications-ai`
**Target Event:** Google Cloud AI Builder Cup 2026 (JAPAC Region - USD 30,000 Prize Pool & Singapore Grand Finale)  
**Primary Competition Track:** Track 5 — Future of Work & Enterprise Productivity (Cross-Pollinated with Track 4 Multimodal Capabilities)  
**Target Winning Score:** 98% / 100%  

---

## 🤖 SYSTEM INSTRUCTIONS FOR THE AI CODING AGENT
You are an Elite Full-Stack Engineer and Google Cloud AI Architect. Your mission is to refactor this repository (`employee-milestone-notifications-ai`) from a basic milestone notification app into an **Enterprise-Grade, Voice-Enabled, Culturally Adaptive Autonomous HR & Culture Platform** built strictly for the **Google Cloud AI Builder Cup 2026**.

Read the existing codebase first, preserve working SMTP/Nodemailer and database logic, and systematically execute the architectural, AI, and UI/UX upgrades detailed below. **Do NOT leave mock placeholders where functional code or clean fallbacks can be implemented.**

---

## 🎯 1. CORE ARCHITECTURAL UPGRADE (DEEP GOOGLE CLOUD AI INTEGRATION)

To score 35/35 on **Technical Execution & Gen AI Use** and 30/30 on **Innovation**, we must eliminate any perception of a "simple prompt wrapper." Implement the following deep AI workflows:

### 1.1 Autonomous Agentic HR Copilot (Vertex AI Agent Engine / Function Calling)
Upgrade the existing "Omniscient HR Copilot" from a passive Q&A chatbot into an **Action-Taking Autonomous Agent** using Gemini Function Calling (`tools` declaration):
- **Tool 1: `scan_upcoming_milestones(days_ahead, department)`** — Queries employee records to detect upcoming birthdays, work anniversaries, project completions, or onboarding milestones.
- **Tool 2: `analyze_attrition_and_burnout_risk(employee_id)`** — Evaluates time-since-last-recognition, tenure, and department metrics to calculate a **Retention Health Score (0-100%)** and recommends proactive manager interventions.
- **Tool 3: `generate_multimodal_milestone_package(employee_id, language_code, cultural_theme)`** — Automatically generates a culturally tailored greeting message, synthesizes a native-language voice audio greeting (TTS), generates a custom celebratory visual card prompt/image (Imagen 3 / SVG dynamic badge), and prepares the email payload.
- **Tool 4: `dispatch_recognition_email(employee_id, recipient_email, subject, html_body, audio_attachment)`** — Executes real-time email dispatch via Nodemailer and logs the transaction to the database/analytics store.
- **Tool 5: `query_hr_policy_knowledge_base(query, language_code)`** — Uses Grounded RAG (Vertex AI Search / Document context) to answer employee benefit and milestone reward eligibility questions (e.g., "5-year tenure bonus policy") accurately in the user's selected language.

### 1.2 Multimodal Voice-First Architecture (Speech-to-Text & Text-to-Speech)
Make the entire application **100% usable via Voice in all 5 supported languages** (`en-US`, `my-MM`, `zh-CN`, `vi-VN`, `hi-IN`):
- **Backend Endpoints (`/api/voice/stt` & `/api/voice/tts`):**
  - Integrate **Google Cloud Speech-to-Text** and **Google Cloud Text-to-Speech** (with graceful fallback to Gemini Multimodal Audio input & Web Speech API `webkitSpeechRecognition` / `window.speechSynthesis` so the live demo NEVER fails even if a specific GCP quota is reached).
- **Voice Command Bar & Floating Mic Button:**
  - Add a persistent, pulsing **Voice Command Orb** in the UI.
  - Users can speak in Burmese, Chinese, Vietnamese, Hindi, or English (e.g., *"ဒီလအတွက် လုပ်သက်ပြည့်တဲ့ ဝန်ထမ်းတွေကို ရှာပြီး မြန်မာလို ဂုဏ်ပြုမေးလ် ပို့ပေးပါ"* or *"Show me retention risks in Engineering"*).
  - The AI Copilot transcribes the voice in real time, executes the agentic tool calls, displays visual progress cards, and **speaks the response back** in the matching native language.
- **Audio Milestone Greetings:**
  - Every generated employee milestone card must include a **"🔊 Listen to AI Cultural Greeting"** button that plays the greeting aloud in the selected language with natural intonation.

### 1.3 Enterprise Analytics & GCP Cloud Run Readiness
- **BigQuery / Analytics Dashboard Module:** Create an interactive **"JAPAC Culture & Retention Pulse"** dashboard tab showing recognition velocity, language distribution, department morale scores, and predicted attrition savings.
- **Cloud Run Deployment Ready:** Ensure `Dockerfile`, `.dockerignore`, and `cloudbuild.yaml` (or deploy scripts) are clean, binding to `process.env.PORT || 8080`, with a **"1-Click Judge Demo Mode"** button on the landing/login screen so hackathon judges can test all features immediately without setting up credentials.

---

## 🎨 2. JAPAC NATIONAL HERITAGE & CULTURAL THEME ENGINE (UI/UX)

To score 10/10 on **User Experience & Solution Design** and 25/25 on **Problem Alignment (JAPAC Relevance)**, switching the language MUST dynamically transform the application's visual identity to celebrate that nation's cultural heritage.

### 2.1 The 5 National Heritage Themes (Bound to 1-Click Language Switcher)
Implement a reactive Theme & Localization Provider. When a user clicks any of the 5 languages (`EN`, `MY`, `ZH`, `VI`, `HI`), smoothly transition (via CSS custom properties + Framer Motion/CSS transitions) the color palette, typography, subtle background SVG motifs, and cultural greeting etiquette:

| Code | Language & Country | Theme Name | Primary Palette & Gradients | Cultural Motif & Typography | Cultural Greeting Tone |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`MY`** | **Burmese (Myanmar)** 🇲🇲 | **Golden Padauk & Royal Kanote** | Padauk Gold (`#F59E0B`), Royal Mandalay Crimson (`#991B1B`), Jade Emerald (`#059669`), Warm Ivory/Dark Lacquer bg | Subtle Kanote floral filigree border accents, Shwedagon golden glow, `'Padauk', 'Noto Sans Myanmar', sans-serif` | Warm, respectful family-like honorifics (*မင်္ဂလာပါ*, auspicious blessings) |
| **`ZH`** | **Chinese (Simplified/Traditional)** 🇨🇳🇸🇬 | **Imperial Cinnabar & Jade** | Imperial Vermilion (`#DC2626`), Auspicious Gold (`#D97706`), Celadon Jade (`#0D9488`), Silk Parchment/Obsidian bg | Subtle cloud/lattice geometric patterns, lantern glow accents, `'Noto Sans SC', sans-serif` | Harmonious, prosperity-focused, collective achievement appreciation |
| **`VI`** | **Vietnamese (Vietnam)** 🇻🇳 | **Lotus Silk & Bronze Drum** | Dong Son Bronze (`#B45309`), Lotus Pink/Crimson (`#E11D48`), Bamboo Teal (`#0F766E`), Warm Cream/Deep Indigo bg | Subtle Lotus petal & Dong Son sun-ray watermarks, `'Be Vietnam Pro', 'Noto Sans', sans-serif` | Energetic, community-spirited, sincere gratitude |
| **`HI`** | **Hindi (India)** 🇮🇳 | **Marigold Festival & Royal Peacock** | Festive Saffron/Marigold (`#EA580C`), Peacock Indigo/Teal (`#0284C7`), Magenta (`#C026D3`), Sandstone/Midnight bg | Subtle Mandala/Rangoli corner geometry, `'Noto Sans Devanagari', 'Poppins', sans-serif` | Celebratory, vibrant, honoring dedication and wisdom |
| **`EN`** | **English (JAPAC Hub / Singapore)** 🇸🇬🌏 | **Merlion Cyber-Emerald & Orchid** | Google Cloud Blue (`#2563EB`), Gardens Emerald (`#10B981`), Vanda Orchid Purple (`#7C3AED`), Glassmorphism Slate | Clean modern Peranakan tile micro-accents, `'Plus Jakarta Sans', 'Inter', sans-serif` | Executive, inclusive, modern global-enterprise tone |

### 2.2 Required CSS Variables Architecture
Create a dedicated `themes.css` (or Tailwind theme configuration) using CSS variables that update on `<html data-cultural-theme="MY|ZH|VI|HI|EN">`:
```css
:root[data-cultural-theme="MY"] {
  --theme-primary: #D97706; /* Padauk Gold */
  --theme-secondary: #991B1B; /* Royal Lacquer Red */
  --theme-accent: #10B981; /* Imperial Jade */
  --theme-gradient: linear-gradient(135deg, #991B1B 0%, #D97706 50%, #F59E0B 100%);
  --theme-surface-glow: rgba(245, 158, 11, 0.18);
  --theme-font-family: 'Padauk', 'Noto Sans Myanmar', 'Inter', sans-serif;
  --theme-cultural-badge: "🇲🇲 Golden Padauk Heritage Theme (Myanmar)";
}
/* Implement matching variable blocks for ZH, VI, HI, and EN */