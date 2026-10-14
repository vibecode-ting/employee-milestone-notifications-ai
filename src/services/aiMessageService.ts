import { getGenerativeModel, isAiAvailable } from '../config/aiClient';

export interface AiGeneratedContent {
  subject: string;
  cardHeadline: string;
  cardSubtext: string;
  emailBodyHtml: string;
  giftRecommendations: string[];
}

export interface EmployeeContext {
  fullName: string;
  role?: string;
  department?: string;
  preferredLanguage?: string;
  eventType: 'BIRTHDAY' | 'WORK_ANNIVERSARY' | 'MANUAL_RECOGNITION';
  milestoneYear?: number;
  companyName?: string;
  customAttributes?: Record<string, string>;
  aiTone?: string;
  giftBudgetUsd?: number;
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  warm_professional: 'Write in a warm, heartfelt, and professional tone. Be genuine and personal.',
  fun_celebratory: 'Write in a fun, energetic, and celebratory tone with emojis. Be witty and joyful.',
  executive_formal: 'Write in an executive, formal, and respectful tone. Be concise and impactful.',
  poetic: 'Write in a poetic and inspirational tone with metaphors and beautiful imagery.',
};

export async function generateCelebrationContent(context: EmployeeContext): Promise<AiGeneratedContent> {
  // Return high-quality fallback if AI is not configured
  if (!isAiAvailable()) {
    return generateFallbackContent(context);
  }

  const {
    fullName,
    role,
    department,
    preferredLanguage = 'English',
    eventType,
    milestoneYear,
    companyName = 'Acme JAPAC Technologies',
    customAttributes = {},
    aiTone = 'warm_professional',
    giftBudgetUsd = 50,
  } = context;

  const toneInstruction = TONE_INSTRUCTIONS[aiTone] || TONE_INSTRUCTIONS.warm_professional;

  const customAttrText = Object.entries(customAttributes)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}`)
    .join('\n');

  const milestoneDescription =
    eventType === 'BIRTHDAY'
      ? 'Birthday celebration'
      : eventType === 'WORK_ANNIVERSARY'
      ? `${milestoneYear || ''} Year Work Anniversary`
      : 'Special Recognition';

  const prompt = `You are the AI Culture & People Experience engine for ${companyName}.
Generate a highly personalized celebration message for an employee milestone.

Employee Details:
- Name: ${fullName}
- Role: ${role || 'Team Member'}
- Department: ${department || 'Company'}
- Preferred Language: ${preferredLanguage}
- Milestone: ${milestoneDescription}
${customAttrText ? `\nPersonal Details (use naturally in the message):\n${customAttrText}` : ''}

Writing Instructions:
- ${toneInstruction}
- If preferredLanguage is NOT English, write the emailBodyHtml with a bilingual greeting (English + ${preferredLanguage}) and keep the rest in English.
- Reference their specific hobbies, achievements, and personal details naturally (don't list them mechanically).
- The cardHeadline should be SHORT (max 8 words), punchy, and celebratory.
- The cardSubtext should be ONE sentence that captures the spirit of the celebration.
- The emailBodyHtml should be warm, 2 paragraphs, with HTML formatting (use <p>, <strong>, <em> tags).
- Suggest 3 personalized gifts related to their hobbies/interests, each under $${giftBudgetUsd} USD.

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "subject": "Engaging email subject line with emoji",
  "cardHeadline": "Short punchy celebration headline",
  "cardSubtext": "One beautiful celebratory sentence",
  "emailBodyHtml": "<p>Full warm HTML email body...</p><p>Second paragraph...</p>",
  "giftRecommendations": ["Gift idea 1 (~$X)", "Gift idea 2 (~$X)", "Gift idea 3 (~$X)"]
}`;

  try {
    const model = getGenerativeModel('gemini-2.5-flash');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.85,
        maxOutputTokens: 1024,
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text) as AiGeneratedContent;
    return parsed;
  } catch (error) {
    console.error('AI message generation error, using fallback:', error);
    return generateFallbackContent(context);
  }
}

function generateFallbackContent(context: EmployeeContext): AiGeneratedContent {
  const { fullName, eventType, milestoneYear, companyName = 'Acme JAPAC Technologies' } = context;
  const firstName = fullName.split(' ')[0];

  if (eventType === 'BIRTHDAY') {
    return {
      subject: `🎂 Happy Birthday, ${firstName}! Wishing You a Wonderful Day`,
      cardHeadline: `Happy Birthday, ${firstName}! 🎂`,
      cardSubtext: `Wishing you a day as brilliant and joyful as you are.`,
      emailBodyHtml: `<p>Dear <strong>${fullName}</strong>,</p><p>On behalf of everyone at <strong>${companyName}</strong>, we want to wish you the most wonderful birthday! Your energy, dedication, and positive spirit make our team truly special. Today is YOUR day — we hope it's filled with joy, laughter, and everything that makes you smile.</p><p>Here's to another amazing year ahead. 🎉🎂</p>`,
      giftRecommendations: [
        'Premium gift card (~$30)',
        'Team lunch voucher (~$50)',
        'Bookstore gift card (~$40)',
      ],
    };
  } else if (eventType === 'WORK_ANNIVERSARY') {
    const yearText = milestoneYear === 1 ? '1 remarkable year' : `${milestoneYear} incredible years`;
    return {
      subject: `🏆 ${milestoneYear} Year${milestoneYear !== 1 ? 's' : ''} of Impact, ${firstName}! Thank You`,
      cardHeadline: `${milestoneYear} Year${milestoneYear !== 1 ? 's' : ''} of Excellence! 🏆`,
      cardSubtext: `${yearText} of making a difference — your impact is immeasurable.`,
      emailBodyHtml: `<p>Dear <strong>${fullName}</strong>,</p><p>Today marks <strong>${yearText}</strong> since you joined the <strong>${companyName}</strong> family, and what a journey it has been! Your dedication, expertise, and commitment to excellence have made a tremendous difference to our team and our mission.</p><p>We are incredibly grateful to have you with us. Here's to many more years of growth, achievement, and shared success! 🥂</p>`,
      giftRecommendations: [
        'Experience voucher or spa day (~$50)',
        'Premium tech accessory (~$45)',
        'Personalized company milestone plaque (~$40)',
      ],
    };
  }

  return {
    subject: `🌟 Special Recognition for ${firstName}`,
    cardHeadline: `You're Amazing, ${firstName}! 🌟`,
    cardSubtext: 'Your contributions make our team extraordinary.',
    emailBodyHtml: `<p>Dear <strong>${fullName}</strong>,</p><p>We wanted to take a moment to recognize your outstanding contributions to <strong>${companyName}</strong>. Your work, dedication, and positive impact inspire everyone around you.</p><p>Thank you for being such a valued member of our team! 🌟</p>`,
    giftRecommendations: ['Gift card (~$50)', 'Team celebration lunch (~$50)', 'Premium branded merchandise (~$40)'],
  };
}
