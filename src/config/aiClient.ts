// @ts-ignore
import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: any = null;
let vertexClient: any = null;
let useVertex = false;

export function initAiClient() {
  const gcpProject = process.env.GOOGLE_CLOUD_PROJECT;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    geminiClient = new GoogleGenerativeAI(geminiApiKey);
    useVertex = false;
    console.log('✨ AI Mode: Google AI Studio (Free Tier — gemini-2.5-flash)');
  } else {
    console.warn('⚠️  No AI credentials found. AI features will use deterministic fallbacks.');
    console.warn('   Set GEMINI_API_KEY (free) or GOOGLE_CLOUD_PROJECT (Vertex AI) in .env');
  }
}

export function getGenerativeModel(modelName = 'gemini-2.5-flash') {
  if (geminiClient) {
    return geminiClient.getGenerativeModel({ model: modelName });
  }
  throw new Error('No AI client initialized. Please set GEMINI_API_KEY in .env');
}

export function isAiAvailable(): boolean {
  return !!(geminiClient || vertexClient);
}

export function getAiMode(): string {
  if (useVertex) return 'vertex_ai';
  if (geminiClient) return 'gemini_free_tier';
  return 'unavailable';
}
