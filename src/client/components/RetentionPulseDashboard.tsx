// RetentionPulseDashboard.tsx — JAPAC Culture & Retention Pulse Analytics
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';

const COLORS = ['#2563EB', '#D97706', '#DC2626', '#E11D48', '#C026D3', '#059669'];

export default function RetentionPulseDashboard() {
  const { locale } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/retention-pulse')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-sm text-slate-500 py-8 text-center">Loading JAPAC Retention Pulse...</div>;
  }

  const langData = Object.entries(data.languageDistribution || {}).map(([name, value]) => ({ name, value }));
  const deptData = Object.entries(data.departmentMoraleScores || {}).map(([name, score]) => ({ name, score }));

  return (
    <div className="space-y-6">
      {/* Top Pulse KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Retention Health</div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">{data.averageRetentionHealthScore}%</div>
          <div className="text-xs text-slate-500 mt-1">AI-calculated via recognition cadence</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Burnout/Attrition Risk</div>
          <div className="text-3xl font-bold text-rose-600 mt-2">{data.highAttritionRiskCount} Employees</div>
          <div className="text-xs text-slate-500 mt-1">Requires manager 1-on-1 pulse</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Predicted Turnover Savings</div>
          <div className="text-3xl font-bold text-indigo-600 mt-2"></div>
          <div className="text-xs text-slate-500 mt-1">Annual JAPAC talent preservation</div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active JAPAC Headcount</div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{data.totalEmployees}</div>
          <div className="text-xs text-slate-500 mt-1">5 Regional cultural hubs</div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Morale Index */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Department Morale & Retention Scores</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Bar dataKey="score" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multilingual Workforce Distribution */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Multilingual JAPAC Workforce Distribution</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={langData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }: any) => name + ' ' + ((percent * 100).toFixed(0)) + '%'}>
                  {langData.map((_, index) => (
                    <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
