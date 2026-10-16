import type { Employee, MilestoneResult } from '../types';

export function calculateMilestones(employees: Employee[], days: number): MilestoneResult[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const results: MilestoneResult[] = [];

  for (const emp of employees) {
    if (emp.status !== 'active') continue;

    // Birthday
    if (emp.dob) {
      const dob = new Date(emp.dob);
      const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const daysUntil = Math.round((next.getTime() - today.getTime()) / 86400000);
      if (daysUntil <= days) {
        results.push({ employee: emp, type: 'BIRTHDAY', daysUntil, isToday: daysUntil === 0 });
      }
    }

    // Anniversary
    if (emp.joinedDate) {
      const joined = new Date(emp.joinedDate);
      const next = new Date(today.getFullYear(), joined.getMonth(), joined.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const daysUntil = Math.round((next.getTime() - today.getTime()) / 86400000);
      const years = today.getFullYear() - joined.getFullYear() + (daysUntil === 0 ? 0 : 1);
      if (daysUntil <= days && years > 0) {
        results.push({ employee: emp, type: 'ANNIVERSARY', daysUntil, isToday: daysUntil === 0, years });
      }
    }
  }

  return results.sort((a, b) => a.daysUntil - b.daysUntil);
}
