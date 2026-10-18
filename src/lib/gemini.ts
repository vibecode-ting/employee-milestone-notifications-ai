import type { CardTone, CardTheme, GeneratedCard, Employee, CopilotDiff, OcrCandidate } from '../types';

export function getGeminiApiKey(): string {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('VITE_GEMINI_API_KEY') || localStorage.getItem('GEMINI_API_KEY') || '' : '')
  );
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  if (clean) {
    localStorage.setItem('GEMINI_API_KEY', clean);
    localStorage.setItem('VITE_GEMINI_API_KEY', clean);
  } else {
    localStorage.removeItem('GEMINI_API_KEY');
    localStorage.removeItem('VITE_GEMINI_API_KEY');
  }
}

// ---------------------------------------------------------------------------
// DYNAMIC MODEL DISCOVERY & COMPATIBILITY LAYER
// ---------------------------------------------------------------------------

let cachedDiscoveredModels: string[] | null = null;
let cachedKeyForDiscovery: string = '';

export const PREFERRED_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
];

export async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  if (!apiKey) return PREFERRED_GEMINI_MODELS;
  if (cachedDiscoveredModels && cachedKeyForDiscovery === apiKey && cachedDiscoveredModels.length > 0) {
    return cachedDiscoveredModels;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter(
            (m: any) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes('generateContent')
          )
          .map((m: any) => String(m.name || '').replace(/^models\//, ''))
          .filter((name: string) => Boolean(name));

        if (supported.length > 0) {
          const sorted = supported.sort((a: string, b: string) => {
            const indexA = PREFERRED_GEMINI_MODELS.findIndex((p) => a === p || a.startsWith(p));
            const indexB = PREFERRED_GEMINI_MODELS.findIndex((p) => b === p || b.startsWith(p));
            const scoreA = indexA >= 0 ? indexA : 999;
            const scoreB = indexB >= 0 ? indexB : 999;
            return scoreA - scoreB;
          });
          cachedDiscoveredModels = sorted;
          cachedKeyForDiscovery = apiKey;
          return sorted;
        }
      }
    }
  } catch (err) {
    console.warn('Dynamic Gemini model discovery encountered issue, using priority list:', err);
  }

  return PREFERRED_GEMINI_MODELS;
}

interface GenerateCardParams {
  employee: Employee;
  milestoneType: 'BIRTHDAY' | 'ANNIVERSARY';
  years?: number;
  tone: CardTone;
  theme?: CardTheme;
  customNotes?: string;
  language?: string;
}

// ---------------------------------------------------------------------------
// 1. TONE-BASED PROMPT ENGINE & LOCAL FALLBACK TEMPLATES
// ---------------------------------------------------------------------------

const LOCAL_FALLBACKS: Record<CardTone, (e: Employee, type: string, years?: number, lang?: string) => { headline: string; message: string; quote: string }> = {
  warm: (e, type, years, lang) => {
    if (lang === 'mm') {
      return {
        headline: type === 'BIRTHDAY' ? `ပျော်ရွှင်ဖွယ် မွေးနေ့ဖြစ်ပါစေ ${e.name}! 🎂` : `${years} နှစ်ပြည့် အလုပ်နှစ်ပတ်လည် ဂုဏ်ပြုပါသည်! 🌟`,
        message: type === 'BIRTHDAY'
          ? `အဖွဲ့သားအားလုံးမှ ${e.name} အား နွေးထွေးစွာ ဂုဏ်ပြုဆုမွန်ကောင်းတောင်းအပ်ပါသည်။ သင်၏ကြိုးစားအားထုတ်မှုနှင့် ဖော်ရွေမှုသည် ${e.department} အတွက် အဖိုးမဖြတ်နိုင်သော အင်အားဖြစ်ပါသည်။`
          : `${years} နှစ်တာ ကာလအတွင်း သင်၏ ခိုင်မာသော သစ္စာရှိမှုနှင့် စွမ်းဆောင်ရည်မြင့်မားမှုအတွက် အထူးပင် ကျေးဇူးတင်ရှိပါသည်။ သင်နှင့်အတူ ဆက်လက်လက်တွဲခွင့်ရသည့်အတွက် ဂုဏ်ယူမိပါသည်။`,
        quote: '“လူတိုင်း၏ တန်ဖိုးရှိသော ခြေလှမ်းတိုင်းသည် အဖွဲ့အစည်းတစ်ခုလုံး၏ အောင်မြင်မှုဖြစ်ပါသည်။”',
      };
    }
    if (lang === 'zh' || lang === 'zh-HK') {
      return {
        headline: type === 'BIRTHDAY' ? `祝 ${e.name} 生日快乐！🎂` : `热烈祝贺 ${e.name} 入职 ${years} 周年！🎉`,
        message: type === 'BIRTHDAY'
          ? `愿新的一岁带给你无尽的快乐与充实！感谢你在 ${e.department} 团队中始终如一的温暖付出与卓越贡献。`
          : `感谢你在过去 ${years} 年间与我们携手并肩！你的专业素养与热忱为团队创造了非凡价值，期待与你共创更多辉煌里程碑。`,
        quote: '“心怀热忱，并肩前行，每一个坚实的脚印都铸就非凡。”',
      };
    }
    if (lang === 'vn') {
      return {
        headline: type === 'BIRTHDAY' ? `Chúc Mừng Sinh Nhật ${e.name}! 🎂` : `Chúc Mừng Kỷ Niệm ${years} Năm Đồng Hành! 🎉`,
        message: type === 'BIRTHDAY'
          ? `Toàn thể đội ngũ xin gửi lời chúc ấm áp nhất tới bạn! Cảm ơn năng lượng tích cực và sự tận tâm của bạn tại ${e.department}.`
          : `Trân trọng cảm ơn ${years} năm gắn bó đầy cống hiến của bạn. Sự kiên định và tài năng của bạn là niềm tự hào lớn của tập thể!`,
        quote: '“Mỗi bước chân đồng hành đều làm nên sức mạnh vĩ đại.”',
      };
    }
    // Default English
    return {
      headline: type === 'BIRTHDAY' ? `Happy Birthday, ${e.name}! 🎂` : `Celebrating ${years} Years of Excellence! 🎉`,
      message: type === 'BIRTHDAY'
        ? `Wishing you a day filled with joy, laughter, and celebration! Thank you for bringing warmth, kindness, and relentless dedication to the ${e.department} family every single day.`
        : `Happy ${years}-year work anniversary! Your steadfast dedication, mentorship, and creative drive continue to inspire everyone across ${e.department}. We are truly lucky to have you on our team.`,
      quote: '“True culture is built by the people who show up with heart every single day.”',
    };
  },

  executive: (e, type, years) => ({
    headline: type === 'BIRTHDAY' ? `Honoring ${e.name} on Their Special Day` : `Executive Commendation: ${years}-Year Milestone`,
    message: type === 'BIRTHDAY'
      ? `On behalf of leadership and the ${e.department} division, we extend our sincerest congratulations to ${e.name}. Your strategic contributions and consistent operational rigor drive continuous innovation across our organization.`
      : `Leadership proudly recognizes ${e.name} for achieving ${years} years of impactful service. Your dedication to mission objectives and high-performing delivery sets a benchmark for organizational excellence across Asia Pacific.`,
    quote: '“Leadership and sustained commitment are the foundational pillars of enterprise achievement.”',
  }),

  fun: (e, type, years) => ({
    headline: type === 'BIRTHDAY' ? `Level Up! It's ${e.name}'s Birthday! 🚀` : `Boom! ${years} Epic Years with ${e.name}! ⚡`,
    message: type === 'BIRTHDAY'
      ? `Hold the meetings, pause the Slack pings, and bring out the cake! 🍰 Sending massive high-fives to ${e.name} today. May your code deploy smoothly and your coffee stay strong!`
      : `Whoop whoop! ${years} years of awesome ideas, emergency debugging, and heroic team saves in ${e.department}! Thanks for keeping our spirits high and goals crushed!`,
    quote: '“Work hard, celebrate harder, and never skip the anniversary cake!”',
  }),

  cultural: (e, type, years, lang) => {
    if (lang === 'mm') {
      return {
        headline: type === 'BIRTHDAY' ? `မင်္ဂလာရှိသော မွေးနေ့ဆုတောင်း ${e.name} 🙏` : `မင်္ဂလာအပေါင်းနှင့်ပြည့်စုံသော ${years} နှစ်မြောက် နှစ်ပတ်လည် 🌸`,
        message: `မြန်မာ့ရိုးရာ မင်္ဂလာတရားတော်များနှင့်အညီ ကျန်းမာချမ်းသာပြီး မင်္ဂလာအပေါင်းခညောင်းပါစေကြောင်း ${e.department} မိသားစုမှ မေတ္တာပို့သ ဂုဏ်ပြုအပ်ပါသည်။`,
        quote: '“စိတ်ချမ်းသာ ကိုယ်ကျန်းမာစွာဖြင့် အောင်မြင်မှုသရဖူ ဆွတ်ခူးနိုင်ပါစေ။”',
      };
    }
    return {
      headline: type === 'BIRTHDAY' ? `Warm Regional Wishes for ${e.name} 🌏` : `Honoring ${years} Years Across JAPAC 🌏`,
      message: `In celebration of our rich cross-cultural heritage across the Asia-Pacific community, we celebrate ${e.name}'s special milestone with gratitude, unity, and shared cultural pride.`,
      quote: '“Diverse perspectives unite to create harmonious achievements.”',
    };
  },
};

// ---------------------------------------------------------------------------
// 2. GEMINI AI CARD GENERATOR
// ---------------------------------------------------------------------------

export async function generatePersonalizedCard({
  employee,
  milestoneType,
  years = 1,
  tone,
  theme = 'sapphire',
  customNotes = '',
  language = 'en',
}: GenerateCardParams): Promise<GeneratedCard> {
  const fallback = LOCAL_FALLBACKS[tone](employee, milestoneType, years, language);
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Return high quality offline fallback
    return {
      id: `gen-card-${Date.now()}`,
      employeeName: employee.name,
      milestoneType,
      years,
      tone,
      theme,
      headline: fallback.headline,
      message: customNotes ? `${fallback.message}\n\nP.S. ${customNotes}` : fallback.message,
      quote: fallback.quote,
    };
  }

  try {
    const prompt = `
You are an expert enterprise HR Generative AI specializing in milestone recognition cards.
Generate a personalized celebration card with the following details:
- Employee Name: ${employee.name}
- Department: ${employee.department}
- Milestone: ${milestoneType === 'BIRTHDAY' ? 'Birthday' : `${years}-Year Work Anniversary`}
- Desired Tone: ${tone} (warm, executive, fun, or culturally localized)
- Language Locale: ${language}
- Additional Context / Custom Notes: ${customNotes || 'None'}

Return ONLY a valid JSON object matching this schema (no markdown, no backticks):
{
  "headline": "concise headline string",
  "message": "2-3 sentences of heartwarming, personalized milestone text",
  "quote": "short inspirational one-liner quote"
}
`;

    const models = await getAvailableGeminiModels(apiKey);
    const candidateModels = models.slice(0, 3);

    for (const activeModel of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 350,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            id: `gen-card-${Date.now()}`,
            employeeName: employee.name,
            milestoneType,
            years,
            tone,
            theme,
            headline: parsed.headline || fallback.headline,
            message: parsed.message || fallback.message,
            quote: parsed.quote || fallback.quote,
          };
        }
      } catch (e) {
        console.warn(`Card generation attempt with ${activeModel} failed, trying next model...`);
      }
    }
  } catch (err) {
    console.warn('Gemini live call failed, using tone-aware local fallback:', err);
  }

  return {
    id: `gen-card-${Date.now()}`,
    employeeName: employee.name,
    milestoneType,
    years,
    tone,
    theme,
    headline: fallback.headline,
    message: customNotes ? `${fallback.message}\n\nP.S. ${customNotes}` : fallback.message,
    quote: fallback.quote,
  };
}

// ---------------------------------------------------------------------------
// 3. NON-ADMIN AI COPILOT WITH SAFE DOUBLE-CONFIRMATION MUTATIONS
// ---------------------------------------------------------------------------

export interface CopilotQueryParams {
  query: string;
  employees: Employee[];
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userName?: string;
}

export interface CopilotResponse {
  reply: string;
  actionDiff?: CopilotDiff;
  matchedEmployees?: Employee[];
}

export async function askEmployeeCopilot({
  query,
  employees,
  userName = 'Team Member',
}: CopilotQueryParams): Promise<CopilotResponse> {
  const normalized = query.toLowerCase().trim();

  // 1. Detect Delete Intent (e.g. "delete John Doe", "remove Sarah from roster")
  const deleteMatch = normalized.match(/(?:delete|remove|terminate)\s+([a-zA-Z\s]+)/i);
  if (deleteMatch) {
    const targetName = deleteMatch[1].trim();
    const emp = employees.find((e) => e.name.toLowerCase().includes(targetName.toLowerCase()));

    if (emp) {
      return {
        reply: `⚠️ I noticed you requested to remove **${emp.name}** from the employee roster. Because modifying employee records impacts notification dispatches, I've prepared a safety confirmation diff for you:`,
        actionDiff: {
          id: `diff-${Date.now()}`,
          type: 'delete',
          employeeId: emp.id || emp.employeeId,
          employeeName: emp.name,
          changes: {
            status: { before: emp.status, after: 'inactive/deleted' },
            department: { before: emp.department, after: '—' },
          },
          description: `Permanently unenroll ${emp.name} (${emp.employeeId}) from ${emp.department}.`,
          confirmedStep1: false,
          confirmedStep2: false,
        },
      };
    }
  }

  // 2. Detect Modify Intent (e.g. "update Sarah department to Cloud Engineering", "change Aung phone to 09123456")
  const updateMatch = normalized.match(/(?:update|change|set|modify)\s+([a-zA-Z\s]+?)(?:'s|\s+)(department|phone|email|role|status)\s+(?:to\s+)?(.+)/i);
  if (updateMatch) {
    const targetName = updateMatch[1].trim();
    const fieldKey = updateMatch[2].toLowerCase();
    const newValue = updateMatch[3].trim().replace(/^to\s+/i, '');

    const emp = employees.find((e) => e.name.toLowerCase().includes(targetName.toLowerCase()));
    if (emp) {
      const fieldMap: Record<string, keyof Employee> = {
        department: 'department',
        phone: 'phone',
        email: 'email',
        status: 'status',
      };
      const actualField = fieldMap[fieldKey] || 'department';
      const beforeVal = emp[actualField];

      return {
        reply: `📝 I've drafted the requested update for **${emp.name}**. Please review the exact diff below and double-confirm before saving to Firestore:`,
        actionDiff: {
          id: `diff-${Date.now()}`,
          type: 'modify',
          employeeId: emp.id || emp.employeeId,
          employeeName: emp.name,
          changes: {
            [actualField]: { before: beforeVal, after: newValue },
          },
          description: `Update ${actualField} from "${beforeVal}" to "${newValue}".`,
          confirmedStep1: false,
          confirmedStep2: false,
        },
      };
    }
  }

  // 3. Natural Language Milestone Queries
  if (normalized.includes('birthday') || normalized.includes('anniversary') || normalized.includes('milestone')) {
    const today = new Date();
    const thisMonth = today.getMonth() + 1;

    const matched = employees.filter((e) => {
      const dobMonth = parseInt(e.dob.split('-')[1], 10);
      const joinMonth = parseInt(e.joinedDate.split('-')[1], 10);
      return dobMonth === thisMonth || joinMonth === thisMonth;
    });

    if (matched.length > 0) {
      const listStr = matched
        .slice(0, 5)
        .map((e) => `• **${e.name}** (${e.department}) - Joined: ${e.joinedDate}`)
        .join('\n');

      return {
        reply: `🎉 Found **${matched.length} employee(s)** with milestone celebrations this month:\n\n${listStr}\n\nWould you like me to customize an AI celebration card for any of them?`,
        matchedEmployees: matched,
      };
    }
  }

  // 4. Department Roster Search
  const deptKeywords = ['engineering', 'sre', 'devops', 'product', 'design', 'sales', 'hr', 'marketing', 'finance'];
  const matchedDept = deptKeywords.find((d) => normalized.includes(d));
  if (matchedDept) {
    const filtered = employees.filter((e) => e.department.toLowerCase().includes(matchedDept));
    return {
      reply: `🏢 Found **${filtered.length} member(s)** in **${matchedDept.toUpperCase()}**:\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...and ${filtered.length - 5} more.` : ''),
      matchedEmployees: filtered,
    };
  }

  // 5. General Copilot Overview
  return {
    reply: `👋 Hello ${userName}! I am your **Employee Milestone & Roster Copilot**.\n\nYou can ask me:\n• *"Who has an upcoming birthday or work anniversary this month?"*\n• *"Show all engineers in Singapore"* \n• *"Change Sarah's department to SRE"* (triggers safe 2-step confirmation diff)\n• *"Upload a photo of roster or ID card to import via OCR"*`,
  };
}

// ---------------------------------------------------------------------------
// 4. SEMANTIC EMBEDDING SEARCH SIMULATION (text-embedding-004)
// ---------------------------------------------------------------------------

export function semanticEmployeeSearch(query: string, employees: Employee[]): Employee[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return employees;

  return employees
    .map((emp) => {
      let score = 0;
      const haystack = `${emp.name} ${emp.department} ${emp.email} ${emp.phone} ${emp.dob} ${emp.joinedDate} ${JSON.stringify(emp.metadata || {})}`.toLowerCase();

      terms.forEach((term) => {
        if (haystack.includes(term)) score += 2;
        if (emp.name.toLowerCase().includes(term)) score += 3;
        if (emp.department.toLowerCase().includes(term)) score += 2.5;
      });

      return { emp, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.emp);
}

// ---------------------------------------------------------------------------
// 5. REAL GEMINI 2.5 FLASH MULTIMODAL VISION OCR DOCUMENT PARSER
// ---------------------------------------------------------------------------

export interface OcrExtractionResult {
  candidates: OcrCandidate[];
  model: string;
  isLiveApi: boolean;
  message?: string;
}

export async function extractEmployeesFromDocument({
  fileBase64,
  mimeType,
  fileName,
}: {
  fileBase64: string;
  mimeType: string;
  fileName: string;
}): Promise<OcrExtractionResult> {
  const apiKey = getGeminiApiKey();

  // If no client-side Gemini API key is configured, first attempt to call the secure
  // backend Cloud Function `extractDocumentOcr` (which uses backend GEMINI_API_KEY).
  // If backend is unavailable (e.g. offline demo mode), provide realistic sample fallback.
  if (!apiKey) {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const { fns } = await import('./firebase');
      if (fns) {
        const extractFn = httpsCallable<{ fileBase64: string; mimeType: string }, OcrExtractionResult>(
          fns,
          'extractDocumentOcr'
        );
        const res = await extractFn({ fileBase64, mimeType });
        if (res.data && Array.isArray(res.data.candidates) && res.data.candidates.length > 0) {
          return res.data;
        }
      }
    } catch (backendErr) {
      console.warn('Backend Cloud Function OCR not reachable, falling back to sample preview:', backendErr);
    }
    return {
      candidates: [
        {
          name: 'Zaw Min Tun',
          department: 'Cloud Infrastructure',
          role: 'DevOps Architect',
          email: 'zaw.min@company.com',
          phone: '+95 9 789 123 456',
          dob: '1992-06-14',
          joinedDate: '2021-04-10',
          location: 'Yangon',
          confidence: 0.94,
        },
        {
          name: 'Mei Ling Zhou',
          department: 'Product Design',
          role: 'Lead UX Researcher',
          email: 'meiling.zhou@company.com',
          phone: '+886 912 345 678',
          dob: '1994-11-28',
          joinedDate: '2022-08-15',
          location: 'Taipei',
          confidence: 0.96,
        },
        {
          name: 'Nguyen Van Hai',
          department: 'Engineering',
          role: 'Full Stack Engineer',
          email: 'hai.nguyen@company.com',
          phone: '+84 90 123 4567',
          dob: '1995-03-22',
          joinedDate: '2023-01-09',
          location: 'Ho Chi Minh City',
          confidence: 0.92,
        },
      ],
      model: 'Sample Document Heuristic (No Gemini API Key)',
      isLiveApi: false,
      message: 'Parsed sample candidate records. Configure your Gemini API key in Copilot or set VITE_GEMINI_API_KEY in .env for live Multimodal Vision.',
    };
  }

  const prompt = `You are an expert HR Document AI parser for enterprise workforce systems.
Analyze this uploaded document/image (which could be an employee badge, roster spreadsheet, ID card, business card, onboarding slip, or team roster).
Extract all individual employee records present in the document.

For each employee found, return a JSON object with:
- "name": Full name (required)
- "department": Department or functional division (e.g., Engineering, People & Culture, Cloud DevOps, Product Design, Marketing, Finance). If not explicitly visible, infer from job title.
- "role": Job title (e.g. Senior Software Engineer, HR Business Partner)
- "email": Work email address (if not found in document, infer from name and standard company domain @company.com)
- "phone": Phone number if visible (or empty string)
- "dob": Date of birth in YYYY-MM-DD or MM-DD format if visible (or estimate e.g. "1994-06-15")
- "joinedDate": Hire date or work anniversary in YYYY-MM-DD format if visible (or current year estimate e.g. "2023-05-01")
- "location": City or country if visible
- "confidence": Estimated parsing confidence between 0.0 and 1.0

Return ONLY a valid JSON array of employee objects matching this schema (no markdown formatting, no backticks, no explanatory text):
[
  {
    "name": "Alex Morgan",
    "department": "Engineering",
    "role": "Cloud Architect",
    "email": "alex.m@company.com",
    "phone": "+65 9123 4567",
    "dob": "1991-04-12",
    "joinedDate": "2021-03-01",
    "location": "Singapore",
    "confidence": 0.97
  }
]
If the image does not contain any employee data, return an empty array [].`;

  const candidateModels = await getAvailableGeminiModels(apiKey);
  // Test top candidate models (prioritizing operational flash models)
  const modelsToTry = candidateModels.slice(0, 6);
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Try v1beta first, then fallback to v1 if needed
    const apiVersions = ['v1beta', 'v1'];
    for (const apiVersion of apiVersions) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: mimeType || 'image/jpeg',
                        data: fileBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          const rawErr = await response.text();
          let parsedMsg = rawErr;
          try {
            const errObj = JSON.parse(rawErr);
            parsedMsg = errObj?.error?.message || rawErr;
          } catch {}

          // If 404 (model retired/unsupported), 503 (high demand spike), or 429 (tier quota limit), try next candidate model
          if (response.status === 404 || response.status === 503 || response.status === 429) {
            lastError = new Error(`Model ${model} (${apiVersion}): ${parsedMsg}`);
            continue;
          }

          // If API key is invalid (400), stop early with clear diagnostic error
          throw new Error(`Gemini Vision API error (${response.status}): ${parsedMsg}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          let parsed: any;
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('Gemini response could not be parsed into a JSON employee array.');
            }
          }

          const candidates: OcrCandidate[] = (Array.isArray(parsed) ? parsed : [parsed]).filter(
            (c) => c && typeof c.name === 'string' && c.name.trim().length > 0
          );

          return {
            candidates,
            model: `Gemini Multimodal (${model})`,
            isLiveApi: true,
          };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with ${model} on ${apiVersion} failed:`, err?.message || err);
        // If it's an explicit API key invalid error, surface it directly
        if (err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('400')) {
          throw err;
        }
      }
    }
  }

  throw lastError || new Error(`Failed to extract employee records from ${fileName}.`);
}

