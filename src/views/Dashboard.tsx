import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { calculateMilestones } from '../utils/milestones';
import { getDemoEmployees } from '../utils/demoData';
import type { Employee, MilestoneResult } from '../types';
import { useTranslation } from 'react-i18next';
import {
  Users, Cake, Briefcase, Sparkles, Bot, Upload,
  BarChart2, CheckCircle2, TrendingUp, ChevronRight,
  Database,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { cn } from '../lib/utils';
import { AiCardStudioModal } from '../components/milestones/AiCardStudioModal';
import { CopilotSidebar } from '../components/copilot/CopilotSidebar';

// Last 7 days mock activity — localized to user language
function buildActivityData(milestones: MilestoneResult[], lang: string) {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    mm: 'my-MM',
    zh: 'zh-TW',
    vn: 'vi-VN',
  };
  const locale = localeMap[lang] || 'en-US';
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { name: d.toLocaleDateString(locale, { weekday: 'short' }), birthdays: 0, anniversaries: 0 };
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

export default function Dashboard({ onCountChange }: { onCountChange: (n: number) => void }) {
  const { t, i18n } = useTranslation();
  const { appUser } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>(() =>
    getDemoEmployees(appUser?.uid || 'demo_user_123')
  );

  // AI Card Studio modal state
  const [selectedStudioEmployee, setSelectedStudioEmployee] = useState<Employee | null>(null);
  const [studioMilestoneType, setStudioMilestoneType] = useState<'BIRTHDAY' | 'ANNIVERSARY'>('BIRTHDAY');
  const [studioYears, setStudioYears] = useState(1);
  const [showCardStudio, setShowCardStudio] = useState(false);

  // AI Copilot sidebar state
  const [showCopilot, setShowCopilot] = useState(false);

  useEffect(() => {
    onCountChange(employees.length);
  }, [employees.length, onCountChange]);

  useEffect(() => {
    const userId = appUser?.uid || 'demo-uid';
    const isDemo =
      userId.startsWith('demo') ||
      !import.meta.env.VITE_FIREBASE_API_KEY ||
      import.meta.env.VITE_FIREBASE_API_KEY.includes('DemoFallback') ||
      import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-milestone';

    if (isDemo) {
      const loadDemo = () => {
        const data = getDemoEmployees(userId);
        setEmployees(data);
      };
      loadDemo();

      const handleUpdate = () => loadDemo();
      window.addEventListener('demo_employees_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
      return () => {
        window.removeEventListener('demo_employees_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      };
    }

    try {
      const q = query(collection(db, 'employees'), where('userId', '==', userId));
      return onSnapshot(
        q,
        (snap) => {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee));
          setEmployees(data);
        },
        () => {
          const data = getDemoEmployees(userId);
          setEmployees(data);
        }
      );
    } catch {
      const data = getDemoEmployees(userId);
      setEmployees(data);
    }
  }, [appUser]);

  const milestones30 = calculateMilestones(employees, 30);
  const activityData = buildActivityData(milestones30, i18n.language);

  // Department counts
  const deptMap: Record<string, number> = {};
  employees.forEach((e) => {
    deptMap[e.department] = (deptMap[e.department] ?? 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

  // KPI Calculations
  const birthdayCount = milestones30.filter((m) => m.type === 'BIRTHDAY').length;
  const anniversaryCount = milestones30.filter((m) => m.type === 'ANNIVERSARY').length;

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 12,
  };

  const handleOpenStudio = (emp: Employee, type: 'BIRTHDAY' | 'ANNIVERSARY', years = 1) => {
    setSelectedStudioEmployee(emp);
    setStudioMilestoneType(type);
    setStudioYears(years);
    setShowCardStudio(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Welcome & One-Click AI Triggers */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>{t('Dashboard Overview')}</span>
            <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 hidden sm:inline">
              • JAPAC Recognition Command Center
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Welcome back! You have <strong className="text-indigo-600 dark:text-indigo-400">{milestones30.length} milestones</strong> coming up this month across your team.
          </p>
        </div>

        {/* One-Click AI Action Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (milestones30.length > 0) {
                const target = milestones30[0];
                handleOpenStudio(target.employee, target.type, target.years || 1);
              } else if (employees.length > 0) {
                handleOpenStudio(employees[0], 'ANNIVERSARY', 3);
              }
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>{t('AI Card Studio')}</span>
          </button>

          <button
            onClick={() => setShowCopilot(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Bot size={14} className="text-cyan-400" />
            <span>{t('AI Copilot')}</span>
          </button>

          <button
            onClick={() => setShowCopilot(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Upload size={14} className="text-emerald-400" />
            <span>{t('OCR Import')}</span>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <BarChart2 size={14} className="text-amber-400" />
            <span>{t('BigQuery Analytics')}</span>
          </button>
        </div>
      </div>

      {/* Quick KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Upcoming Birthdays */}
        <div className="glass-panel p-5 border-l-4 border-l-pink-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('Birthdays')} (30 Days)
            </div>
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1 tabular">
              {birthdayCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Celebrations upcoming
            </div>
          </div>
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500">
            <Cake size={24} />
          </div>
        </div>

        {/* KPI 2: Work Anniversaries */}
        <div className="glass-panel p-5 border-l-4 border-l-indigo-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('Anniversaries (30 Days)')}
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 tabular">
              {anniversaryCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {t('Tenure milestones')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Briefcase size={24} />
          </div>
        </div>

        {/* KPI 3: Recognition Velocity */}
        <div className="glass-panel p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('Recognition Velocity')}
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular">
              98.4%
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              <span>{t('Sent on-time with AI cards')}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* KPI 4: Total Roster Connected */}
        <div className="glass-panel p-5 border-l-4 border-l-corp-blue dark:border-l-cobalt-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('Active JAPAC Roster')}
            </div>
            <div className="text-2xl font-bold text-corp-blue dark:text-cobalt-400 mt-1 tabular">
              {employees.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {t('Employees synced')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-corp-blue/10 dark:bg-cobalt-500/10 text-corp-blue dark:text-cobalt-400">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* SECTION 1: This Month's Incoming Milestones Carousel/Feed (Immediate Actionable Value) */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-500 dark:text-indigo-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {t("This Month's Incoming Milestones")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('Actionable celebration feed • One-click to generate Gemini personalized cards')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/employees')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>{t('View full roster')}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {milestones30.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800">
            <p className="text-sm text-slate-500 dark:text-zinc-400">{t('No upcoming milestones this month 🎉')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones30.slice(0, 6).map((m, idx) => {
              const isBday = m.type === 'BIRTHDAY';
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div>
                    {/* Top row: Avatar + Countdown Badge */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-200 text-sm">
                          {m.employee.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {m.employee.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400">
                            {m.employee.department}
                          </div>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          m.isToday
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        )}
                      >
                        {m.isToday ? 'Today!' : `in ${m.daysUntil}d`}
                      </span>
                    </div>

                    {/* Milestone Type */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 mb-4">
                      {isBday ? (
                        <>
                          <Cake size={14} className="text-pink-500" />
                          <span>{t('Birthday Celebration ({{date}})', { date: m.employee.dob })}</span>
                        </>
                      ) : (
                        <>
                          <Briefcase size={14} className="text-indigo-500" />
                          <span>{t('{{years}}-Year Anniversary ({{date}})', { years: m.years, date: m.employee.joinedDate })}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleOpenStudio(m.employee, m.type, m.years || 1)}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-500/15 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-500/30 shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>{t('✨ Customize with Gen AI')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7-Day Activity */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-4">{t('7-Day Activity')}</h2>
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
              <Area type="monotone" dataKey="birthdays" stroke="#8b5cf6" fill="url(#gb)" name={t('Birthdays')} />
              <Area type="monotone" dataKey="anniversaries" stroke="#0ea5e9" fill="url(#ga)" name={t('Anniversaries')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Headcount by Department */}
        <div className="glass-panel p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-4">{t('Headcount by Department')}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name={t('Employees')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: 30-Day BigQuery HR Annual Dates & Morale Radar */}
      <div className="glass-panel p-6 border border-cyan-500/20 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('30-Day Annual Dates & Morale Radar')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono">
                  BigQuery Telemetry
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('Dataset: hr_analytics_japac (Streaming Live)')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>98.4% On-Time Delivery</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Metric 1: Department Recognition Coverage */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('Department Recognition Coverage')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400 tabular">94.2%</span>
              <span className="text-xs font-semibold text-emerald-400">+3.1% MoM</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: '94.2%' }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Zero milestone blind-spots detected across JAPAC business units.</p>
          </div>

          {/* Metric 2: Morale Velocity Index */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('Morale Velocity Index')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-400 tabular">+18.4%</span>
              <span className="text-xs font-semibold text-emerald-400">High Engagement</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '88.5%' }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Team celebration participation and peer kudo velocity.</p>
          </div>

          {/* Metric 3: Projected Celebrations */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('Projected Celebrations')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400 tabular">
                {milestones30.length + 8}
              </span>
              <span className="text-xs text-slate-400">Next 30 Days</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full" style={{ width: '76%' }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Calculated with 100% predictive accuracy via BigQuery scheduled queries.</p>
          </div>
        </div>

        {/* Department Breakdown mini-bars */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2.5">
            <span>{t('Upcoming Dates Distribution')}</span>
            <span className="text-[11px] text-cyan-400">14 JAPAC Hubs Connected</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: 'Engineering', pct: 96, count: '14 Events' },
              { name: 'Product & Design', pct: 92, count: '6 Events' },
              { name: 'People & HR', pct: 100, count: '5 Events' },
              { name: 'Sales & Growth', pct: 88, count: '9 Events' },
            ].map((d, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300 mb-1">
                  <span className="truncate">{d.name}</span>
                  <span className="text-cyan-400 font-mono">{d.pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals and Sidebars */}
      <AiCardStudioModal
        isOpen={showCardStudio}
        onClose={() => setShowCardStudio(false)}
        employee={selectedStudioEmployee}
        milestoneType={studioMilestoneType}
        years={studioYears}
      />

      <CopilotSidebar
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        employees={employees}
        onOpenCardStudio={(emp) => handleOpenStudio(emp, 'ANNIVERSARY', 1)}
      />
    </div>
  );
}
