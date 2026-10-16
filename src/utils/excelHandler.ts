import * as XLSX from 'xlsx';
import type { Employee } from '../types';

const HEADERS = ['employeeId', 'name', 'department', 'email', 'phone', 'dob', 'joinedDate', 'status'];

export function parseDateValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '';

  // 1. If already JavaScript Date object (from XLSX cellDates)
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return '';
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. If numeric Excel serial date (e.g. 37103 or '37103')
  const num = typeof v === 'number' ? v : Number(String(v).trim());
  if (!isNaN(num) && num > 1000 && num < 100000) {
    // 25569 is days between 1899-12-30 and 1970-01-01
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(v).trim();
  if (!str) return '';

  // 3. If standard YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) {
    const parts = str.split(/[-/.]/);
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }

  // 4. If DD-MM-YYYY or MM-DD-YYYY
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(str)) {
    const parts = str.split(/[-/.]/);
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const y = parts[2];
    if (p0 > 12) {
      // Must be DD-MM-YYYY
      return `${y}-${String(p1).padStart(2, '0')}-${String(p0).padStart(2, '0')}`;
    }
    // Default to DD-MM-YYYY
    return `${y}-${String(p1).padStart(2, '0')}-${String(p0).padStart(2, '0')}`;
  }

  // 5. Native Date parse fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
}

export function parseExcel(file: File): Promise<Partial<Employee>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

        // Normalize headers: trim + lowercase for matching
        const normalized = raw.map((row) => {
          const out: Partial<Employee> = {};
          for (const [k, v] of Object.entries(row)) {
            const key = k.trim().toLowerCase().replace(/[\s_-]+/g, '');

            if (key === 'employeeid' || key === 'id' || key === 'empid') {
              out.employeeId = String(v).trim();
            } else if (key === 'name' || key === 'fullname' || key === 'employeename') {
              out.name = String(v).trim();
            } else if (key === 'department' || key === 'dept') {
              out.department = String(v).trim();
            } else if (key === 'email' || key === 'mail' || key === 'emailaddress') {
              out.email = String(v).trim();
            } else if (key === 'phone' || key === 'mobile' || key === 'tel' || key === 'contact') {
              out.phone = String(v).trim();
            } else if (key === 'dob' || key === 'birthday' || key === 'dateofbirth') {
              out.dob = parseDateValue(v);
            } else if (
              key === 'joineddate' ||
              key === 'joined' ||
              key === 'joindate' ||
              key === 'hiredate' ||
              key === 'startdate'
            ) {
              out.joinedDate = parseDateValue(v);
            } else if (key === 'status') {
              const s = String(v).trim().toLowerCase();
              out.status = s === 'inactive' ? 'inactive' : 'active';
            }
          }
          return out;
        });

        resolve(normalized.filter((r) => r.name || r.employeeId));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

export function exportToExcel(employees: Employee[]) {
  const data = employees.map((e) => ({
    employeeId: e.employeeId,
    name: e.name,
    department: e.department,
    email: e.email,
    phone: e.phone,
    dob: e.dob,
    joinedDate: e.joinedDate,
    status: e.status,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employees');
  XLSX.writeFile(wb, 'employees.xlsx');
}

export function downloadTemplate() {
  const sample = [
    HEADERS,
    ['EMP001', 'John Doe', 'Engineering', 'john@company.com', '0912345678', '1995-05-12', '2021-10-16', 'active'],
    ['EMP002', 'Jane Smith', 'Marketing', 'jane@company.com', '0923456789', '1992-08-20', '2023-01-10', 'active'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'employee_template.xlsx');
}
