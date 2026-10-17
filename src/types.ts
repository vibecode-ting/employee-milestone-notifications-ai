import type { Timestamp } from 'firebase/firestore';

export type Role = 'user' | 'pro' | 'pro_plus' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  role: Role;
  createdAt: Timestamp | null;
  status?: 'active' | 'suspended';
  employeeCount?: number;
  lastActive?: string | null;
  photoURL?: string | null;
}

export interface Employee {
  id?: string;
  userId: string;
  employeeId: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  dob: string;        // YYYY-MM-DD
  joinedDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
}

export interface NotificationSettings {
  userId: string;
  smtp?: { host: string; port: number; user: string; enabled: boolean; sendToEmployee?: boolean };
  teams?: { webhookUrl: string; enabled: boolean };
  telegram?: { botToken: string; chatId: string; enabled: boolean };
  webhook?: { url: string; enabled: boolean };
  templates: {
    type?: 'normal' | 'card';
    logoUrl?: string;
    detailsText?: string;
    coverImage?: string;
    includeEmojis?: boolean;
    allowAttachments?: boolean;
    birthday: string;
    anniversary: string;
  };
}

export interface NotificationLog {
  userId: string;
  employeeId: string;
  milestoneType: 'BIRTHDAY' | 'ANNIVERSARY';
  channel: 'email' | 'teams' | 'telegram' | 'webhook';
  status: 'success' | 'failure';
  error?: string;
  timestamp: Timestamp;
}

export interface MilestoneResult {
  employee: Employee;
  type: 'BIRTHDAY' | 'ANNIVERSARY';
  daysUntil: number;
  isToday: boolean;
  years?: number;
}

export const PLAN_LIMITS: Record<Role, number> = {
  user: 100,
  pro: 1000,
  pro_plus: Infinity,
  admin: Infinity,
};

export const PLAN_NAMES: Record<Role, string> = {
  user: 'Free Plan',
  pro: 'Pro Plan',
  pro_plus: 'Ultra Plan',
  admin: 'Mod Admin',
};

export interface SystemBroadcast {
  id: string;
  message: string;
  createdAt: string;
  active?: boolean;
  createdBy?: string;
}

// AI Card Generator Studio Types
export type CardTone = 'warm' | 'executive' | 'fun' | 'cultural';
export type CardTheme = 'sapphire' | 'emerald' | 'gold' | 'cyber';

export interface GeneratedCard {
  id: string;
  employeeName: string;
  milestoneType: 'BIRTHDAY' | 'ANNIVERSARY';
  years?: number;
  tone: CardTone;
  theme: CardTheme;
  headline: string;
  message: string;
  quote?: string;
  designAssetUrl?: string;
}

// Dynamic Custom Columns with Tier Gating
export interface CustomColumnDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  placeholder?: string;
  options?: string[];
  requiredTier: 'user' | 'pro' | 'pro_plus';
  description: string;
}

// BigQuery HR Analytics Module Types
export interface ForecastDataPoint {
  month: string;
  birthdays: number;
  anniversaries: number;
  estimatedGiftBudgetUsd: number;
  projectedEvents: number;
}

export interface TenureCohort {
  cohort: string;
  count: number;
  retentionRisk: 'low' | 'medium' | 'high';
  avgEngagement: number;
}

export interface LanguageEngagement {
  language: string;
  flag: string;
  count: number;
  percentage: number;
}

// Safe AI Copilot Types (Double-Confirmation Safety UX)
export interface CopilotDiff {
  id: string;
  type: 'modify' | 'delete';
  employeeId?: string;
  employeeName: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  description: string;
  confirmedStep1?: boolean;
  confirmedStep2?: boolean;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  diff?: CopilotDiff;
  source?: 'text' | 'voice' | 'ocr';
}


