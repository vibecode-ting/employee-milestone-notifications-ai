// DashboardView.tsx — Executive Dashboard
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import type { NavView } from '../App';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  department?: string;
  birthDate?: string;
  hireDate?: string;
  autoSendEmail: boolean;
  customAttributes?: Record<string, any>;
}

interface Props {
  onNavigate: (view: NavView) => void;
}

function getMilestoneToday(employees: Employee[]) {
  const today = new Date();
  const tm = today.getMonth();
  const td = today.getDate();
  return employees.filter(e => {
    const bd = e.birthDate ? new Date(e.birthDate) : null;
    const hd = e.hireDate ? new Date(e.hireDate) : null;
    return (bd && bd.getMonth() === tm && bd.getDate() === td) ||
           (hd && hd.getMonth() === tm && hd.getDate() === td);
  });
}

function getUpcoming(employees: Employee[], days: number) {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + days);
  return employees.filter(e => {
    const check = (d: Date | null) => {
      if (!d) return false;
      const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return next <= cutoff;
    };
    return check(e.birthDate ? new Date(e.birthDate) : null) ||
           check(e.hireDate ? new Date(e.hireDate) : null);
  });
}

function KpiCard({ title, value, subtitle, accent, icon, action }: {
  title: string; value: string | number; subtitle: string;
  accent: string; icon: string; action?: React.ReactNode;
}) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent}`}>{subtitle}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400 script-safe">{title}</div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default function DashboardView({ onNavigate }: Props) {
  const { t, locale } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/employees').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/logs?limit=20').then(r => r.json()),
    ]).then(([emps, setts, logData]) => {
      setEmployees(Array.isArray(emps) ? emps : []);
      setSettings(setts || {});
      setLogs(Array.isArray(logData) ? logData : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const todayMilestone = getMilestoneToday(employees);
  const upcoming30 = getUpcoming(employees, 30);
  const autoEmailEnabled = employees.filter(e => e.autoSendEmail).length;
  const successRate = logs.length > 0 ? Math.round((logs.filter(l => l.deliveryStatus === 'sent').length / logs.length) * 100) : 100;

  // Monthly chart data
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = monthNames.map((name, i) => ({
    name,
    Birthdays: employees.filter(e => e.birthDate && new Date(e.birthDate).getMonth() === i).length,
    Anniversaries: employees.filter(e => e.hireDate && new Date(e.hireDate).getMonth() === i).length,
  }));

  // Department donut
  const deptCounts: Record<string, number> = {};
  employees.forEach(e => { if (e.department) deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1','#f43f5e','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];

  const handleSend = async (emp: Employee) => {
    setSendingId(emp.id);
    try {
      const res = await fetch('/api/celebrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: emp.id, eventType: emp.birthDate && new Date(emp.birthDate).getMonth() === new Date().getMonth() ? 'BIRTHDAY' : 'WORK_ANNIVERSARY', forcePreview: false }),
      });
      const data = await res.json();
      if (data.previewUrl) window.open(data.previewUrl, '_blank');
      alert(data.error ? `Error: ${data.error}` : `✅ Celebration sent! ${data.previewUrl ? 'Check your email.' : ''}`);
    } catch { alert('Failed to send'); }
    finally { setSendingId(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 text-sm">{t('loading')}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon="🎂"
          title={t('kpiTodayTitle')}
          value={todayMilestone.length}
          subtitle={todayMilestone.length > 0 ? '🎉 Celebrate Now!' : 'None today'}
          accent={todayMilestone.length > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-600'}
          action={todayMilestone.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {todayMilestone.slice(0,3).map(e => (
                <button
                  key={e.id}
                  onClick={() => handleSend(e)}
                  disabled={sendingId === e.id}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-full disabled:opacity-60"
                >
                  {sendingId === e.id ? '⏳' : '📨'} {e.fullName.split(' ')[0]}
                </button>
              ))}
            </div>
          ) : undefined}
        />
        <KpiCard
          icon="📅"
          title={t('kpiUpcomingTitle')}
          value={upcoming30.length}
          subtitle={`~$${upcoming30.length * (settings.defaultGiftBudgetUsd || 50)} budget`}
          accent="bg-amber-100 text-amber-700"
        />
        <KpiCard
          icon="✉️"
          title={t('kpiEmailStatus')}
          value={`${successRate}%`}
          subtitle={settings.enableAutoEmail ? '🟢 Active' : '⚪ Paused'}
          accent={settings.enableAutoEmail ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}
          action={
            <span className="text-xs text-slate-500">
              {autoEmailEnabled}/{employees.length} employees opted in
            </span>
          }
        />
        <KpiCard
          icon="👥"
          title={t('kpiWorkforceTotal')}
          value={employees.length}
          subtitle="Connected"
          accent="bg-indigo-100 text-indigo-700"
          action={
            <div className="flex gap-2 text-xs text-slate-500">
              <span>{employees.filter(e => (e as any).dataSource === 'manual').length} manual</span>
              <span>{employees.filter(e => (e as any).dataSource === 'csv').length} csv</span>
              <span>{employees.filter(e => (e as any).dataSource === 'external_db').length} db</span>
            </div>
          }
        />
      </div>

      {/* Row 2: Celebration Radar + Gift Concierge */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">🎉 Upcoming Milestones — Next 30 Days</h3>
            <button onClick={() => onNavigate('employees')} className="text-xs text-indigo-600 underline hover:no-underline">View All →</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
            {upcoming30.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">No upcoming milestones in the next 30 days.</div>
            ) : (
              upcoming30.slice(0, 10).map(emp => {
                const bd = emp.birthDate ? new Date(emp.birthDate) : null;
                const hd = emp.hireDate ? new Date(emp.hireDate) : null;
                const today = new Date();
                const isBd = bd && bd.getMonth() === today.getMonth() && bd.getDate() === today.getDate();
                const tenure = hd ? today.getFullYear() - hd.getFullYear() : 0;
                const attrs = emp.customAttributes || {};
                return (
                  <div key={emp.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {emp.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white truncate script-safe">{emp.fullName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{emp.role} • {emp.department}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {attrs.hobbies && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">{attrs.hobbies.split(',')[0]}</span>}
                        {attrs.recent_win && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">🏆 {attrs.recent_win.substring(0,20)}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        bd ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {bd ? '🎂 Birthday' : `🏆 ${tenure}yr Anniv`}
                      </span>
                      <div className="mt-1">
                        <span className={`text-xs inline-block w-2 h-2 rounded-full mr-1 ${emp.autoSendEmail ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <button
                          onClick={() => handleSend(emp)}
                          className="text-xs text-indigo-600 underline hover:no-underline"
                        >
                          {sendingId === emp.id ? '⏳' : '📨 Send'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Gift Concierge */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">🎁 AI Gift & Culture Concierge</h3>
          {upcoming30.length > 0 ? (
            <GiftConcierge employee={upcoming30[0]} budget={settings.defaultGiftBudgetUsd || 50} />
          ) : (
            <div className="text-sm text-slate-400 text-center py-8">No upcoming celebrations.<br/>Add employees with birthdays or hire dates!</div>
          )}
        </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">📊 Monthly Milestone Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Birthdays" fill="#f43f5e" radius={[3,3,0,0]} />
              <Bar dataKey="Anniversaries" fill="#6366f1" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-4">🏢 Department Distribution</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Add employees with departments to see chart</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Gift Concierge Sub-Component
function GiftConcierge({ employee, budget }: { employee: Employee; budget: number }) {
  const attrs = employee.customAttributes || {};
  const ideas = [
    attrs.hobbies ? `🎯 ${attrs.hobbies.split(',')[0].trim()} gear (~$${Math.round(budget * 0.6)})` : `🎁 Premium gift card (~$${Math.round(budget * 0.6)})`,
    attrs.favorite_treat ? `🍰 Gourmet ${attrs.favorite_treat} box (~$${Math.round(budget * 0.8)})` : `🍽️ Team lunch experience (~$${budget}/person)`,
    `🤝 ${employee.department || 'Team'} celebration outing (~$${budget})`,
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">{employee.fullName.charAt(0)}</div>
        <div>
          <div className="text-sm font-semibold text-slate-800 dark:text-white script-safe">{employee.fullName}</div>
          <div className="text-xs text-slate-500">{employee.role}</div>
        </div>
      </div>
      <div className="space-y-2">
        {ideas.map((idea, i) => (
          <div key={i} className="text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300">{idea}</div>
        ))}
      </div>
      <div className="text-xs text-slate-400">Budget: ${budget} USD • Powered by AI</div>
    </div>
  );
}
