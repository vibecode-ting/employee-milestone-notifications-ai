// Card Generator Service
// Creates beautiful 1200x630 celebration cards using Satori (SVG -> PNG)
// Optional Vertex AI Imagen 3 background integration

import * as fs from 'fs';
import * as path from 'path';

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
}

export interface GeneratedCard {
  pngBuffer: Buffer;
  dataUrl: string;
}

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
  } = input;

  const colors = GRADIENTS[style];
  const textColor = TEXT_COLORS[style];
  const badge = MILESTONE_BADGES[eventType];

  const milestoneLabel =
    eventType === 'BIRTHDAY'
      ? '🎂 Happy Birthday!'
      : eventType === 'WORK_ANNIVERSARY'
      ? `🏆 ${milestoneYear || ''} Year${milestoneYear !== 1 ? 's' : ''} of Impact`
      : '⭐ Special Recognition';

  // Truncate long names for card
  const displayName = employeeName.length > 22 ? employeeName.substring(0, 22) + '…' : employeeName;
  const displayHeadline = cardHeadline.length > 50 ? cardHeadline.substring(0, 50) + '…' : cardHeadline;
  const displaySubtext = cardSubtext.length > 90 ? cardSubtext.substring(0, 90) + '…' : cardSubtext;

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

  <!-- Company name (top left) -->
  <text x="96" y="90" font-family="'Segoe UI', Arial, sans-serif" font-size="20" fill="${textColor}" opacity="0.7" font-weight="400">${companyName}</text>

  <!-- Milestone badge (top right) -->
  <rect x="940" y="60" width="160" height="44" rx="22" fill="rgba(255,255,255,0.2)"/>
  <text x="1020" y="88" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" font-weight="600">${milestoneLabel.replace(/🎂|🏆|⭐/g, '').trim()}</text>

  <!-- Big emoji badge center-left -->
  <text x="120" y="340" font-size="120">${badge}</text>

  <!-- Employee name -->
  <text x="300" y="260" font-family="'Segoe UI', Arial, sans-serif" font-size="58" font-weight="700" fill="${textColor}" letter-spacing="-1">${displayName}</text>

  <!-- Role -->
  ${role ? `<text x="300" y="310" font-family="'Segoe UI', Arial, sans-serif" font-size="24" fill="${textColor}" opacity="0.75">${role}</text>` : ''}

  <!-- Headline -->
  <text x="300" y="${role ? '375' : '350'}" font-family="'Segoe UI', Arial, sans-serif" font-size="32" font-weight="600" fill="${textColor}">${displayHeadline}</text>

  <!-- Subtext -->
  <foreignObject x="300" y="${role ? '400' : '375'}" width="720" height="80">
    <body xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;">
      <p style="font-family:'Segoe UI',Arial,sans-serif;font-size:20px;color:${textColor};opacity:0.85;margin:0;line-height:1.4;">${displaySubtext}</p>
    </body>
  </foreignObject>

  <!-- Decorative divider -->
  <line x1="300" y1="${role ? '500' : '480'}" x2="900" y2="${role ? '500' : '480'}" stroke="${textColor}" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Footer -->
  <text x="300" y="${role ? '535' : '515'}" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="${textColor}" opacity="0.6">Generated by AI Culture Engine • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</text>
</svg>`;
}

export async function generateCelebrationCard(input: CardGenerationInput): Promise<GeneratedCard> {
  try {
    // Try to use @resvg/resvg-js for SVG -> PNG conversion
    const { Resvg } = await import('@resvg/resvg-js');
    const svg = buildSvgCard(input);
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: { loadSystemFonts: true },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
    return { pngBuffer, dataUrl };
  } catch (err) {
    // Fallback: return SVG as base64 data URL (still displayable in browsers)
    console.warn('Resvg PNG conversion failed, returning SVG fallback:', (err as Error).message);
    const svg = buildSvgCard(input);
    const svgBuffer = Buffer.from(svg, 'utf-8');
    const dataUrl = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`;
    return { pngBuffer: svgBuffer, dataUrl };
  }
}

export function getCardStyles(): CardStyle[] {
  return ['modern_gradient', 'festive_illustrated', 'minimal_luxury'];
}
