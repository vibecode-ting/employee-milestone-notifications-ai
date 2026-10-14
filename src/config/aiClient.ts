import { GoogleGenerativeAI, VertexAI } from '@google/genai';

let geminiClient: GoogleGenerativeAI | null = null;
let vertexClient: VertexAI | null = null;
let useVertex = false;

export function initAiClient() {
  const gcpProject = process.env.GOOGLE_CLOUD_PROJECT;
  const gcpLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (gcpProject) {
    // Mode B: Vertex AI (Hackathon GCP Mode)
    vertexClient = new VertexAI({ project: gcpProject, location: gcpLocation });
    useVertex = true;
    console.log(`🚀 AI Mode: Vertex AI (Project: ${gcpProject}, Location: ${gcpLocation})`);
  } else if (geminiApiKey) {
    // Mode A: Google AI Studio Free Tier
    geminiClient = new GoogleGenerativeAI(geminiApiKey);
    useVertex = false;
    console.log('✨ AI Mode: Google AI Studio (Free Tier — gemini-2.5-flash)');
  } else {
    console.warn('⚠️  No AI credentials found. AI features will be unavailable.');
    console.warn('   Set GEMINI_API_KEY (free) or GOOGLE_CLOUD_PROJECT (Vertex AI) in .env');
  }
}

export function getGenerativeModel(modelName = 'gemini-2.5-flash') {
  if (useVertex && vertexClient) {
    return vertexClient.getGenerativeModel({ model: modelName });
  } else if (geminiClient) {
    return geminiClient.getGenerativeModel({ model: modelName });
  }
  throw new Error('No AI client initialized. Please set GEMINI_API_KEY or GOOGLE_CLOUD_PROJECT in .env');
}

export function isAiAvailable(): boolean {
  return !!(geminiClient || vertexClient);
}

export function getAiMode(): string {
  if (useVertex) return 'vertex_ai';
  if (geminiClient) return 'gemini_free_tier';
  return 'unavailable';
}
