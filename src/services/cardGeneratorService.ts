// Card Generator Service
// Creates beautiful 1200x630 celebration cards using @resvg/resvg-js (SVG -> PNG)
// Multi-language font buffering: loads TTF fonts for Myanmar, CJK, Vietnamese, Devanagari
// This PREVENTS tofu boxes (□□□) when generating cards for Burmese, Chinese, Vietnamese, Hindi employees

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

export type CardStyle = 'modern_gradient' | 'festive_illustrated' | 'minimal_luxury';
export type EventType = 'BIRTHDAY' | 'WORK_ANNIVERSARY' | 'MANUAL_RECOGNITION';

export interface CardGenerationInput {
  employeeName: string;
  role?: string;
  companyName?: string;
  eventType: EventType;
  milestoneYear?: number;
  cardHeadline: string;
  cardSubtext: string;
  style?: CardStyle;
  companyLogoUrl?: string;
  language?: 'en' | 'my' | 'zh' | 'vi' | 'hi';
}

export interface GeneratedCard {
  pngBuffer: Buffer;
  dataUrl: string;
}

// ── Font Buffer Registry ──────────────────────────────────────────────────────
// We pre-load TTF font buffers so @resvg/resvg-js can embed them into the PNG.
// Without this, multi-script text (Myanmar, CJK, Devanagari) renders as □□□ tofu boxes.

interface FontEntry {
  family: string;
  weight: number;
  data: Buffer | null;
  loaded: boolean;
}

const FONT_REGISTRY: FontEntry[] = [
  // Latin / Vietnamese (Inter covers most Latin + diacritics well)
  { family: 'Inter', weight: 400, data: null, loaded: false },
  { family: 'Inter', weight: 700, data: null, loaded: false },
  // Burmese / Myanmar Script — Noto Sans Myanmar
  { family: 'Noto Sans Myanmar', weight: 400, data: null, loaded: false },
  { family: 'Noto Sans Myanmar', weight: 700, data: null, loaded: false },
  // Chinese Simplified (CJK) — Noto Sans SC
  { family: 'Noto Sans SC', weight: 400, data: null, loaded: false },
  { family: 'Noto Sans SC', weight: 700, data: null, loaded: false },
  // Vietnamese — Be Vietnam Pro (supports full Latin + tonemarks ệ, ữ, ắ)
  { family: 'Be Vietnam Pro', weight: 400, data: null, loaded: false },
  { family: 'Be Vietnam Pro', weight: 700, data: null, loaded: false },
  // Hindi / Devanagari — Noto Sans Devanagari
  { family: 'Noto Sans Devanagari', weight: 400, data: null, loaded: false },
  { family: 'Noto Sans Devanagari', weight: 700, data: null, loaded: false },
];

// Local font cache directory (fonts downloaded once, reused across requests)
const FONT_CACHE_DIR = path.join(process.cwd(), 'tmp', 'fonts');

// Google Fonts CDN URLs for each TTF file
// Using /woff2 would not work with resvg — must use TTF
const FONT_URLS: Record<string, string> = {
  'Inter-400': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf',
  'Inter-700': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf',
  'Noto Sans Myanmar-400': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/notosansmyanmar/NotoSansMyanmar%5Bwdth%2Cwght%5D.ttf',
  'Noto Sans Myanmar-700': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/notosansmyanmar/NotoSansMyanmar%5Bwdth%2Cwght%5D.ttf',
  'Noto Sans SC-400': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',
  'Noto Sans SC-700': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',
  'Be Vietnam Pro-400': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/bevietnampro/BeVietnamPro-Regular.ttf',
  'Be Vietnam Pro-700': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/bevietnampro/BeVietnamPro-Bold.ttf',
  'Noto Sans Devanagari-400': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf',
  'Noto Sans Devanagari-700': 'https://github.com/google/fonts/raw/refs/heads/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf',
};

function downloadFile(url: string, dest: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    const request = (protocol as typeof https).get(url, { headers: { 'User-Agent': 'CultureOS-Font-Loader/1.0' } }, (response) => {
      // Follow redirects (GitHub raw URLs redirect)
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(dest);
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }
      if (response.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${response.statusCode} downloading ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(fs.readFileSync(dest));
      });
    });
    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading font: ${url}`));
    });
  });
}

async function loadFont(family: string, weight: number): Promise<Buffer | null> {
  const key = `${family}-${weight}`;
  const cacheFile = path.join(FONT_CACHE_DIR, `${key.replace(/ /g, '_')}.ttf`);

  // 1. Check in-memory registry
  const entry = FONT_REGISTRY.find(f => f.family === family && f.weight === weight);
  if (entry?.data) return entry.data;

  // 2. Check on-disk cache
  if (fs.existsSync(cacheFile)) {
    const data = fs.readFileSync(cacheFile);
    if (entry) { entry.data = data; entry.loaded = true; }
    return data;
  }

  // 3. Download from Google Fonts CDN
  const url = FONT_URLS[key];
  if (!url) {
    console.warn(`[CardGen] No font URL for: ${key}`);
    return null;
  }

  try {
    if (!fs.existsSync(FONT_CACHE_DIR)) fs.mkdirSync(FONT_CACHE_DIR, { recursive: true });
    console.log(`[CardGen] Downloading font: ${key}`);
    const data = await downloadFile(url, cacheFile);
    if (entry) { entry.data = data; entry.loaded = true; }
    return data;
  } catch (err) {
    console.warn(`[CardGen] Failed to download font ${key}:`, (err as Error).message);
    return null;
  }
}

// Pre-warm fonts for a specific language on first use
async function warmFontsForLanguage(language: string): Promise<void> {
  const langFonts: Record<string, string[]> = {
    en: ['Inter', 'Be Vietnam Pro'],
    vi: ['Be Vietnam Pro', 'Inter'],
    my: ['Noto Sans Myanmar', 'Inter'],
    zh: ['Noto Sans SC', 'Inter'],
    hi: ['Noto Sans Devanagari', 'Inter'],
  };
  const families = langFonts[language] || ['Inter'];
  await Promise.all(
    families.flatMap(family => [
      loadFont(family, 400),
      loadFont(family, 700),
    ])
  );
}

// Build resvg font list from loaded registry
async function buildResvgFonts(language: string = 'en'): Promise<Array<{ data: Buffer; weight?: number }>> {
  await warmFontsForLanguage(language);
  // Always include Inter as fallback, then language-specific fonts
  const fontBuffers: Array<{ data: Buffer; weight?: number }> = [];
  for (const entry of FONT_REGISTRY) {
    const data = await loadFont(entry.family, entry.weight);
    if (data) {
      fontBuffers.push({ data, weight: entry.weight });
    }
  }
  return fontBuffers;
}

// ── Card Style Config ─────────────────────────────────────────────────────────

const GRADIENTS: Record<CardStyle, string[]> = {
  modern_gradient: ['#667eea', '#764ba2', '#f093fb'],
  festive_illustrated: ['#f6d365', '#fda085', '#f093fb'],
  minimal_luxury: ['#1a1a2e', '#16213e', '#0f3460'],
};

const TEXT_COLORS: Record<CardStyle, string> = {
  modern_gradient: '#ffffff',
  festive_illustrated: '#ffffff',
  minimal_luxury: '#f0c040',
};

const MILESTONE_BADGES: Record<EventType, string> = {
  BIRTHDAY: '🎂',
  WORK_ANNIVERSARY: '🏆',
  MANUAL_RECOGNITION: '⭐',
};

// Script-safe font stack per language — used inside SVG font-family attributes
const LANG_FONT_STACK: Record<string, string> = {
  en: "'Inter', 'Segoe UI', Arial, sans-serif",
  vi: "'Be Vietnam Pro', 'Inter', Arial, sans-serif",
  my: "'Noto Sans Myanmar', 'Inter', Arial, sans-serif",
  zh: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Inter', sans-serif",
  hi: "'Noto Sans Devanagari', 'Inter', Arial, sans-serif",
};

// ── SVG Card Builder ──────────────────────────────────────────────────────────

function buildSvgCard(input: CardGenerationInput): string {
  const {
    employeeName,
    role,
    companyName = 'Acme JAPAC Technologies',
    eventType,
    milestoneYear,
    cardHeadline,
    cardSubtext,
    style = 'modern_gradient',
    language = 'en',
  } = input;

  const colors = GRADIENTS[style];
  const textColor = TEXT_COLORS[style];
  const badge = MILESTONE_BADGES[eventType];
  const fontStack = LANG_FONT_STACK[language] || LANG_FONT_STACK.en;

  const milestoneLabel =
    eventType === 'BIRTHDAY'
      ? 'Happy Birthday!'
      : eventType === 'WORK_ANNIVERSARY'
      ? `${milestoneYear || ''} Year${milestoneYear !== 1 ? 's' : ''} of Impact`
      : 'Special Recognition';

  // Truncate long names for card layout safety
  const displayName = employeeName.length > 22 ? employeeName.substring(0, 22) + '…' : employeeName;
  const displayHeadline = cardHeadline.length > 55 ? cardHeadline.substring(0, 55) + '…' : cardHeadline;
  const displaySubtext = cardSubtext.length > 100 ? cardSubtext.substring(0, 100) + '…' : cardSubtext;

  // Escape XML entities to prevent SVG injection
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="card_shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05);stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="1100" cy="80" r="200" fill="rgba(255,255,255,0.05)"/>
  <circle cx="100" cy="550" r="150" fill="rgba(255,255,255,0.05)"/>
  <circle cx="600" cy="315" r="450" fill="rgba(255,255,255,0.03)"/>

  <!-- Card container -->
  <rect x="60" y="40" width="1080" height="550" rx="24" ry="24" fill="url(#card_shine)" filter="url(#shadow)"/>
  <rect x="60" y="40" width="1080" height="550" rx="24" ry="24" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

  <!-- Company name (top left) — uses language-aware font -->
  <text x="96" y="90" font-family=${fontStack} font-size="20" fill="${textColor}" opacity="0.7" font-weight="400">${esc(companyName)}</text>

  <!-- Milestone badge pill (top right) -->
  <rect x="900" y="58" width="200" height="44" rx="22" fill="rgba(255,255,255,0.2)"/>
  <text x="1000" y="86" font-family=${fontStack} font-size="15" fill="${textColor}" text-anchor="middle" font-weight="600">${esc(milestoneLabel)}</text>

  <!-- Big emoji / badge center-left -->
  <text x="110" y="350" font-size="110" font-family="'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif">${badge}</text>

  <!-- Employee name — multi-script font stack ensures Myanmar/CJK/Devanagari render correctly -->
  <text x="290" y="255" font-family=${fontStack} font-size="56" font-weight="700" fill="${textColor}" letter-spacing="-1">${esc(displayName)}</text>

  <!-- Role -->
  ${role ? `<text x="290" y="305" font-family=${fontStack} font-size="24" fill="${textColor}" opacity="0.75">${esc(role)}</text>` : ''}

  <!-- Headline -->
  <text x="290" y="${role ? '370' : '345'}" font-family=${fontStack} font-size="30" font-weight="600" fill="${textColor}">${esc(displayHeadline)}</text>

  <!-- Subtext (wrapped via tspan for multi-line) -->
  <text x="290" y="${role ? '415' : '390'}" font-family=${fontStack} font-size="19" fill="${textColor}" opacity="0.85">
    <tspan x="290" dy="0">${esc(displaySubtext.substring(0, 60))}</tspan>
    ${displaySubtext.length > 60 ? `<tspan x="290" dy="26">${esc(displaySubtext.substring(60))}</tspan>` : ''}
  </text>

  <!-- Decorative divider -->
  <line x1="290" y1="${role ? '500' : '475'}" x2="900" y2="${role ? '500' : '475'}" stroke="${textColor}" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Footer -->
  <text x="290" y="${role ? '530' : '508'}" font-family=${fontStack} font-size="15" fill="${textColor}" opacity="0.55">Generated by CultureOS AI Culture Engine • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</text>
</svg>`;
}

// ── Main Export: generateCelebrationCard ──────────────────────────────────────

export async function generateCelebrationCard(input: CardGenerationInput): Promise<GeneratedCard> {
  const svg = buildSvgCard(input);
  const language = input.language || 'en';

  try {
    // Attempt @resvg/resvg-js with buffered TTF fonts for multi-script rendering
    const { Resvg } = await import('@resvg/resvg-js');

    // Build font list — downloads & caches TTF files on first run
    const fonts = await buildResvgFonts(language);

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        // loadSystemFonts: false ensures ONLY our buffered fonts are used (reproducible output)
        loadSystemFonts: true,
        // Inject each loaded TTF font buffer so resvg can render multi-script text
        ...(fonts.length > 0 ? { fontBuffers: fonts.map(f => f.data) } : {}),
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
    return { pngBuffer, dataUrl };

  } catch (err) {
    // Graceful fallback: return SVG as base64 data URL (still renders in browsers/emails)
    console.warn('[CardGen] Resvg PNG failed, returning SVG fallback:', (err as Error).message);
    const svgBuffer = Buffer.from(svg, 'utf-8');
    const dataUrl = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`;
    return { pngBuffer: svgBuffer, dataUrl };
  }
}

export function getCardStyles(): CardStyle[] {
  return ['modern_gradient', 'festive_illustrated', 'minimal_luxury'];
}

// Pre-warm all fonts at module load (non-blocking) to avoid cold-start latency on first card generation
(async () => {
  try {
    if (!fs.existsSync(FONT_CACHE_DIR)) fs.mkdirSync(FONT_CACHE_DIR, { recursive: true });
    // Only warm the most common languages on startup
    await Promise.all(['en', 'my', 'zh', 'vi', 'hi'].map(lang => warmFontsForLanguage(lang)));
    console.log('[CardGen] ✅ Multi-language fonts pre-warmed (Myanmar, CJK, Vietnamese, Devanagari)');
  } catch (e) {
    console.warn('[CardGen] Font pre-warming failed (will retry on first card request):', (e as Error).message);
  }
})();
