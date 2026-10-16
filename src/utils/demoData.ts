import type { Employee } from '../types';

const DEMO_EMPLOYEES_KEY = 'demo_employees';

export function getInitialDemoEmployees(userId: string = 'demo_user_123'): Employee[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');

  const inDays = (offset: number) => {
    const target = new Date(now.getTime() + offset * 86400000);
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  };

  return [
    {
      id: 'demo-1',
      userId,
      employeeId: 'EMP001',
      name: 'Alex Morgan',
      department: 'Engineering',
      email: 'alex@company.com',
      phone: '0912345678',
      dob: '1995-05-12',
      joinedDate: `${y - 4}-${m}-${d}`, // Anniversary TODAY!
      status: 'active',
      createdAt: null as any,
    },
    {
      id: 'demo-2',
      userId,
      employeeId: 'EMP002',
      name: 'Elena Rostova',
      department: 'Product Design',
      email: 'elena@company.com',
      phone: '0923456789',
      dob: `${y - 28}-${m}-${d}`, // Birthday TODAY!
      joinedDate: `${y - 2}-03-15`,
      status: 'active',
      createdAt: null as any,
    },
    {
      id: 'demo-3',
      userId,
      employeeId: 'EMP003',
      name: 'Sophia Chen',
      department: 'Marketing',
      email: 'sophia@company.com',
      phone: '0934567890',
      dob: `1993-${inDays(3).slice(5)}`, // Birthday in 3 days!
      joinedDate: `${y - 3}-08-20`,
      status: 'active',
      createdAt: null as any,
    },
    {
      id: 'demo-4',
      userId,
      employeeId: 'EMP004',
      name: 'Kenji Sato',
      department: 'Engineering',
      email: 'kenji@company.com',
      phone: '0945678901',
      dob: '1990-11-20',
      joinedDate: `${y - 5}-${inDays(6).slice(5)}`, // Anniversary in 6 days!
      status: 'active',
      createdAt: null as any,
    },
    {
      id: 'demo-5',
      userId,
      employeeId: 'EMP005',
      name: 'Liam Zaw',
      department: 'Customer Support',
      email: 'liam@company.com',
      phone: '0956789012',
      dob: `1997-${inDays(12).slice(5)}`, // Birthday in 12 days
      joinedDate: `${y - 1}-01-10`,
      status: 'active',
      createdAt: null as any,
    },
    {
      id: 'demo-6',
      userId,
      employeeId: 'EMP006',
      name: 'Aung Kyaw',
      department: 'People & Culture',
      email: 'aung@company.com',
      phone: '0967890123',
      dob: '1992-07-04',
      joinedDate: `${y - 2}-${inDays(18).slice(5)}`, // Anniversary in 18 days
      status: 'active',
      createdAt: null as any,
    },
  ];
}

export function getDemoEmployees(userId: string = 'demo_user_123'): Employee[] {
  try {
    const raw = localStorage.getItem(DEMO_EMPLOYEES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading demo employees:', e);
  }

  const initial = getInitialDemoEmployees(userId);
  try {
    localStorage.setItem(DEMO_EMPLOYEES_KEY, JSON.stringify(initial));
  } catch (e) {
    console.warn('Error saving initial demo employees:', e);
  }
  return initial;
}

export function saveDemoEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(DEMO_EMPLOYEES_KEY, JSON.stringify(employees));
    window.dispatchEvent(new CustomEvent('demo_employees_updated', { detail: employees }));
  } catch (e) {
    console.error('Failed to save demo employees to localStorage:', e);
  }
}
