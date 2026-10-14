import { PrismaClient } from '@prisma/client';
import { getGenerativeModel, isAiAvailable } from '../config/aiClient';
import * as Papa from 'papaparse';

const prisma = new PrismaClient();

export interface CsvMappingResult {
  mappings: Record<string, string>; // CSV header -> app field or 'customAttribute:key'
  unmappedHeaders: string[];
  newCustomColumns: string[];
  sampleRows: any[];
}

const STANDARD_FIELDS: Record<string, string[]> = {
  fullName: ['full name', 'name', 'employee name', 'emp name', 'staff name', 'person name', 'nombre', 'fullname', 'employee'],
  email: ['email', 'email address', 'mail', 'e-mail', 'mail address', 'work email', 'company email'],
  birthDate: ['birth date', 'birthday', 'dob', 'date of birth', 'bday', 'born', 'birth_date', 'birthdate', 'mgynt', 'ngày sinh'],
  hireDate: ['hire date', 'start date', 'join date', 'joined date', 'employment date', 'work start', 'joineddate', 'hire_date', 'hiredate', 'start_date'],
  role: ['role', 'position', 'job title', 'title', 'designation', 'job role', 'occupation'],
  department: ['department', 'dept', 'team', 'division', 'group', 'unit', 'department name'],
  managerEmail: ['manager email', 'manager', 'supervisor email', 'reporting manager', 'reports to'],
  preferredLanguage: ['language', 'preferred language', 'locale', 'lang', 'ဘာသာ', '语言'],
};

function normalizeDate(value: string): string | null {
  if (!value) return null;
  const cleaned = value.trim();

  // Try common formats
  const formats = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/, // 14 Oct 1995
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/, // October 14, 1995
  ];

  // Direct parse attempt
  const direct = new Date(cleaned);
  if (!isNaN(direct.getTime())) {
    return direct.toISOString().split('T')[0];
  }

  // Try DD/MM/YYYY specifically
  const ddmmyyyy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const parsed = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }

  return null;
}

function fuzzyMatchField(header: string): string | null {
  const normalized = header.toLowerCase().replace(/[_\-\s]+/g, ' ').trim();
  for (const [field, variants] of Object.entries(STANDARD_FIELDS)) {
    if (variants.some(v => normalized.includes(v) || v.includes(normalized))) {
      return field;
    }
  }
  return null;
}

export async function analyzeCsvWithAI(headers: string[], sampleRows: any[]): Promise<CsvMappingResult> {
  const mappings: Record<string, string> = {};
  const unmappedHeaders: string[] = [];
  const newCustomColumns: string[] = [];

  if (isAiAvailable()) {
    // Use Gemini for smart mapping
    const prompt = `You are an intelligent CSV data mapper for an HR system.
Map these CSV column headers to the standard HR fields or identify them as custom attributes.

Standard HR fields: fullName, email, birthDate, hireDate, role, department, managerEmail, preferredLanguage

CSV Headers: ${JSON.stringify(headers)}
Sample Row 1: ${JSON.stringify(sampleRows[0] || {})}
Sample Row 2: ${JSON.stringify(sampleRows[1] || {})}

Instructions:
- Map each CSV header to one standard field if it's a clear match, even with messy naming (e.g., "Emp Name" -> "fullName", "DOB" -> "birthDate", "JoinedDate" -> "hireDate")
- If a header doesn't match any standard field, mark it as "customAttribute:key_name" where key_name is a clean snake_case identifier
- Respond with ONLY valid JSON: { "mappings": { "CSV Header": "standardField or customAttribute:key" }, "unmappedHeaders": [] }`;

    try {
      const model = getGenerativeModel('gemini-2.5-flash');
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      });
      const parsed = JSON.parse(result.response.text());
      Object.assign(mappings, parsed.mappings || {});
    } catch (err) {
      console.warn('AI mapping failed, falling back to fuzzy match:', (err as Error).message);
      headers.forEach(h => {
        const matched = fuzzyMatchField(h);
        if (matched) mappings[h] = matched;
        else { mappings[h] = `customAttribute:${h.toLowerCase().replace(/\s+/g, '_')}`; unmappedHeaders.push(h); }
      });
    }
  } else {
    // Pure fuzzy matching fallback
    headers.forEach(h => {
      const matched = fuzzyMatchField(h);
      if (matched) mappings[h] = matched;
      else { mappings[h] = `customAttribute:${h.toLowerCase().replace(/\s+/g, '_')}`; unmappedHeaders.push(h); }
    });
  }

  // Collect new custom columns
  Object.values(mappings).forEach(v => {
    if (v.startsWith('customAttribute:')) {
      const key = v.replace('customAttribute:', '');
      if (!newCustomColumns.includes(key)) newCustomColumns.push(key);
    }
  });

  return { mappings, unmappedHeaders, newCustomColumns, sampleRows };
}

export async function importCsvData(csvText: string, mappings: Record<string, string>): Promise<{ imported: number; errors: string[] }> {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = result.data as Record<string, string>[];
  let imported = 0;
  const errors: string[] = [];

  // Ensure new custom columns exist in schema
  const settings = await prisma.appSettings.findFirst({ where: { id: 'default_org' } });
  let customColumnSchema: any[] = [];
  try { customColumnSchema = JSON.parse(settings?.customColumnSchema as string || '[]'); } catch {}

  const newCustomKeys = [...new Set(Object.values(mappings).filter(v => v.startsWith('customAttribute:')).map(v => v.replace('customAttribute:', '')))];
  for (const key of newCustomKeys) {
    if (!customColumnSchema.find((c: any) => c.key === key)) {
      customColumnSchema.push({ key, label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), type: 'text', useInAiPrompt: true });
    }
  }
  await prisma.appSettings.update({ where: { id: 'default_org' }, data: { customColumnSchema: JSON.stringify(customColumnSchema) } });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const employeeData: any = { dataSource: 'csv', customAttributes: {} };

    for (const [csvHeader, appField] of Object.entries(mappings)) {
      const value = row[csvHeader]?.trim();
      if (!value) continue;

      if (appField.startsWith('customAttribute:')) {
        const key = appField.replace('customAttribute:', '');
        employeeData.customAttributes[key] = value;
      } else if (appField === 'birthDate' || appField === 'hireDate') {
        const normalized = normalizeDate(value);
        if (normalized) employeeData[appField] = new Date(normalized);
      } else {
        employeeData[appField] = value;
      }
    }

    employeeData.customAttributes = JSON.stringify(employeeData.customAttributes);

    if (!employeeData.email) {
      errors.push(`Row ${i + 1}: Missing email address — skipped`);
      continue;
    }
    if (!employeeData.fullName) {
      errors.push(`Row ${i + 1}: Missing full name — skipped`);
      continue;
    }

    try {
      await prisma.employee.upsert({
        where: { email: employeeData.email },
        update: employeeData,
        create: employeeData,
      });
      imported++;
    } catch (err: any) {
      errors.push(`Row ${i + 1} (${employeeData.email}): ${err.message}`);
    }
  }

  return { imported, errors };
}
