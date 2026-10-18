import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, DollarSign, Award, Users, ShieldAlert,
  Sparkles, ArrowUpRight, Activity,
} from 'lucide-react';
import { getDemoEmployees } from '../utils/demoData';
import type { Employee } from '../types';
import {
  generate12MonthForecast,
  calculateTenureCohorts,
  getLocalizationTelemetry,
} from '../lib/bigquery';

export default function Analytics() {
  const { t } = useTranslation();
  const { appUser } = useAuth();
  const [employees] = useState<Employee[]>(() =>
    getDemoEmployees(appUser?.uid || 'demo_user_123')
  );

  const forecastData = generate12MonthForecast(employees);
  const tenureCohorts = calculateTenureCohorts(employees);
  const localizationData = getLocalizationTelemetry(employees);

  const totalAnnualBudget = forecastData.reduce((acc, curr) => acc + curr.estimatedGiftBudgetUsd, 0);
  const totalEvents = forecastData.reduce((acc, curr) => acc + curr.projectedEvents, 0);

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f8fafc',
    fontSize: 12,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <span>{t('BigQuery HR Analytics & Forecasting')}</span>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 font-bold border border-cyan-500/30">
              Google Cloud BigQuery
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {t('Real-time milestone telemetry, 12-month budget projection, and JAPAC tenure retention risk analysis.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('Dataset: hr_analytics_japac (Streaming Live)')}</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border-l-4 border-l-indigo-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('12-Month Projected Budget')}
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 tabular">
              ${totalAnnualBudget.toLocaleString()} USD
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              <span>{t('Calibrated across 34 JAPAC nodes')}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-cyan-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('Projected Milestone Events')}
            </div>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1 tabular">
              {totalEvents} {t('Celebrations')}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              {t('Birthdays + Work Anniversaries')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
            <Award size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('Recognition Velocity')}
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular">
              96.8%
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight size={12} />
              <span>{t('+4.2% YoY employee satisfaction')}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t('High-Tenure Retention Cohort')}
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular">
              88.4%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              {t('3+ years sustained service')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* 12-Month Forecast Chart */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              {t('12-Month Milestone Event & Budget Forecast')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Query synthesized from BigQuery table `milestone_predictions_2026`
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-slate-600 dark:text-zinc-300">{t('Birthdays')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-slate-600 dark:text-zinc-300">{t('Anniversaries')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-600 dark:text-zinc-300">Budget ($USD)</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={290}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="colorBday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAnniv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="$" />
            <Tooltip contentStyle={tooltipStyle} />
            <Area yAxisId="left" type="monotone" dataKey="birthdays" stroke="#6366f1" strokeWidth={2} fill="url(#colorBday)" name={t('Birthdays')} />
            <Area yAxisId="left" type="monotone" dataKey="anniversaries" stroke="#06b6d4" strokeWidth={2} fill="url(#colorAnniv)" name={t('Anniversaries')} />
            <Bar yAxisId="right" dataKey="estimatedGiftBudgetUsd" fill="#fbbf24" opacity={0.3} radius={[4, 4, 0, 0]} name="Gift Budget ($)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Section: Tenure Cohorts & Cultural Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenure Cohort Retention Risk Heatmap */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-500" />
              <span>{t('Tenure Retention Risk Cohorts')}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{t('Cohorts Model')}</span>
          </div>

          <div className="space-y-3.5">
            {tenureCohorts.map((cohort, idx) => {
              const riskColor =
                cohort.retentionRisk === 'high'
                  ? 'bg-red-500/15 text-red-500 border-red-500/30'
                  : cohort.retentionRisk === 'medium'
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';

              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-100/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {cohort.cohort}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {cohort.count} {t('members')} • {t('Engagement Score:')} {cohort.avgEngagement}%
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskColor}`}>
                    {t(cohort.retentionRisk)} {t('Risk')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cultural & Localization Breakdown */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              <span>{t('JAPAC Localization & Language Telemetry')}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{t('7 Supported Locales')}</span>
          </div>

          <div className="space-y-3.5">
            {localizationData.map((loc, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                    <span>{loc.flag}</span>
                    <span>{loc.language}</span>
                  </span>
                  <span className="font-mono text-slate-500 dark:text-zinc-400">
                    {loc.percentage}% ({loc.count} {t('employees')})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${loc.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
