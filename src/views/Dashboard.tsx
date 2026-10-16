import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { calculateMilestones } from '../utils/milestones';
import type { Employee, MilestoneResult } from '../types';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ChevronRight, Users, Bell, Calendar, Cake, Briefcase } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { cn } from '../lib/utils';

// Last 7 days mock activity — replace with real aggregation if needed
function buildActivityData(milestones: MilestoneResult[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { name: d.toLocaleDateString('en', { weekday: 'short' }), birthdays: 0, anniversaries: 0 };
  });
  milestones.filter((m) => m.daysUntil <= 6).forEach((m) => {
    const idx = 6 - m.daysUntil;
    if (idx >= 0) {
      if (m.type === 'BIRTHDAY') days[idx].birthdays += 1;
      else days[idx].anniversaries += 1;
    }
  });
  return days;
}

function MilestoneItem({ m }: { m: MilestoneResult }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-zinc-800 last:border-0">
      {m.type === 'BIRTHDAY'
        ? <Cake size={16} className="text-pink-500 shrink-0" />
        : <Briefcase size={16} className="text-corp-blue dark:text-gold-400 shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 dark:text-white truncate">{m.employee.name}</div>
        <div className="text-xs text-slate-500 dark:text-zinc-400">
          {m.type === 'BIRTHDAY' ? 'Birthday' : `${m.years}yr Anniversary`}
          {' · '}
          {m.isToday ? <span className="text-red-500 font-semibold">Today!</span> : `in ${m.daysUntil}d`}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onCountChange }: { onCountChange: (n: number) => void }) {
  const { t } = useTranslation();
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!appUser) return;
    try {
      const q = query(collection(db, 'employees'), where('userId', '==', appUser.uid));
      return onSnapshot(
        q,
        (snap) => {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee));
          setEmployees(data);
          onCountChange(data.length);
        },
        () => {
          // Fallback to local demo data if offline/unconfigured
          const local = localStorage.getItem('demo_employees');
          const data: Employee[] = local ? JSON.parse(local) : [
            { id: '1', userId: appUser.uid, employeeId: 'EMP001', name: 'Alex Morgan', department: 'Engineering', email: 'alex@company.com', phone: '0912345678', dob: '1995-10-16', joinedDate: '2021-10-16', status: 'active', createdAt: null as any },
            { id: '2', userId: appUser.uid, employeeId: 'EMP002', name: 'Sophia Chen', department: 'Marketing', email: 'sophia@company.com', phone: '0923456789', dob: '1992-10-20', joinedDate: '2022-04-01', status: 'active', createdAt: null as any },
            { id: '3', userId: appUser.uid, employeeId: 'EMP003', name: 'Liam Zaw', department: 'Design', email: 'liam@company.com', phone: '0934567890', dob: '1998-11-05', joinedDate: '2023-10-16', status: 'active', createdAt: null as any },
          ];
          setEmployees(data);
          onCountChange(data.length);
        }
      );
    } catch {
      onCountChange(0);
    }
  }, [appUser, onCountChange]);

  const milestones30 = calculateMilestones(employees, 30);
  const today = milestones30.filter((m) => m.isToday);
  const active = employees.filter((e) => e.status === 'active');
  const activityData = buildActivityData(milestones30);

  // Dept bar data
  const deptMap: Record<string, number> = {};
  employees.forEach((e) => { deptMap[e.department] = (deptMap[e.department] ?? 0) + 1; });
  const deptData = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

  const tooltipStyle = { backgroundColor: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 };

  const statCards = [
    {
      key: 'total' as const,
      label: t('Total Employees'),
      value: employees.length,
      gradient: 'from-corp-blue to-blue-600 dark:from-gold-600 dark:to-gold-500',
      icon: Users,
      path: '/employees',
    },
    {
      key: 'upcoming' as const,
      label: t('Upcoming Milestones'),
      value: milestones30.length,
      gradient: 'from-indigo-500 to-purple-600',
      icon: Calendar,
      path: '/employees',
    },
    {
      key: 'alerts' as const,
      label: t('Active Alerts'),
      value: active.length,
      gradient: 'from-emerald-500 to-teal-600',
      icon: Bell,
      path: '/settings',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('Dashboard Overview')}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map(({ key, label, value, gradient, icon: Icon, path }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className="glass-panel p-5 flex items-center gap-4 hover:-translate-y-1 transition-all text-left group cursor-pointer"
            title={`View ${label}`}
          >
            <div className={cn('p-3 rounded-xl bg-gradient-to-br text-white shrink-0', gradient)}>
              <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
              <div className="text-sm text-slate-500 dark:text-zinc-400">{label}</div>
              <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                <TrendingUp size={12} /> <span>Live · Click to view</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-4">7-Day Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="birthdays" stroke="#8b5cf6" fill="url(#gb)" name="Birthdays" />
              <Area type="monotone" dataKey="anniversaries" stroke="#0ea5e9" fill="url(#ga)" name="Anniversaries" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-4">Headcount by Department</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{t('Happening Today')}</h2>
            <span className="ml-auto text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">{today.length}</span>
          </div>
          {today.length === 0
            ? <p className="text-sm text-slate-400 dark:text-zinc-500">Nothing today 🎉</p>
            : today.map((m, i) => <MilestoneItem key={i} m={m} />)}
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Upcoming (Next 30 Days)</h2>
            <button onClick={() => navigate('/employees')} className="text-xs text-corp-blue dark:text-gold-500 hover:underline">View all →</button>
          </div>
          {milestones30.slice(0, 8).map((m, i) => <MilestoneItem key={i} m={m} />)}
          {milestones30.length === 0 && <p className="text-sm text-slate-400 dark:text-zinc-500">No milestones in next 30 days</p>}
        </div>
      </div>
    </div>
  );
}
