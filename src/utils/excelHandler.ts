import * as XLSX from 'xlsx';
import type { Employee } from '../types';

const HEADERS = ['employeeId', 'name', 'department', 'email', 'phone', 'dob', 'joinedDate', 'status'];

export function parseExcel(file: File): Promise<Partial<Employee>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
        // Normalize headers: trim + lowercase for matching
        const normalized = raw.map((row) => {
          const out: Partial<Employee> = {};
          for (const [k, v] of Object.entries(row)) {
            const key = k.trim().toLowerCase().replace(/\s+/g, '');
            if (key === 'employeeid') out.employeeId = String(v);
            else if (key === 'name') out.name = String(v);
            else if (key === 'department') out.department = String(v);
            else if (key === 'email') out.email = String(v);
            else if (key === 'phone') out.phone = String(v);
            else if (key === 'dob') out.dob = String(v);
            else if (key === 'joineddate') out.joinedDate = String(v);
            else if (key === 'status') out.status = (String(v) as 'active' | 'inactive') || 'active';
          }
          return out;
        });
        resolve(normalized.filter((r) => r.name));
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
  const ws = XLSX.utils.aoa_to_sheet([HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'employee_template.xlsx');
}
