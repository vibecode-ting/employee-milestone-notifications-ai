import { useState } from 'react';
import {
  X, Database, ArrowRight, Lock, Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import type { Employee, Role } from '../../types';

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: Role;
  onImportEmployees: (imported: Omit<Employee, 'id' | 'userId' | 'createdAt'>[]) => Promise<void>;
  currentCount: number;
  limit: number;
}

type DbEngine = 'postgres' | 'mysql' | 'mongodb' | 'sqlserver' | 'supabase';

const DEFAULT_PORTS: Record<DbEngine, string> = {
  postgres: '5432',
  mysql: '3306',
  mongodb: '27017',
  sqlserver: '1433',
  supabase: '443',
};

const DB_ENGINES: { id: DbEngine; name: string; icon: string; defaultTable: string }[] = [
  { id: 'postgres', name: 'PostgreSQL', icon: '🐘', defaultTable: 'employees' },
  { id: 'mysql', name: 'MySQL', icon: '🐬', defaultTable: 'staff_members' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', defaultTable: 'employees' },
  { id: 'sqlserver', name: 'SQL Server', icon: '🏢', defaultTable: 'tbl_Employees' },
  { id: 'supabase', name: 'Supabase', icon: '⚡', defaultTable: 'profiles' },
];

export function DatabaseConnectionModal({
  isOpen,
  onClose,
  userRole = 'user',
}: DatabaseConnectionModalProps) {
  const { t } = useTranslation();

  const isFreePlan = userRole === 'user';

  const [engine, setEngine] = useState<DbEngine>('postgres');
  const [host, setHost] = useState('db.corporate-prod.internal');
  const [port, setPort] = useState(DEFAULT_PORTS.postgres);
  const [database, setDatabase] = useState('enterprise_hrms');
  const [username, setUsername] = useState('hr_ro_reader');
  const [password, setPassword] = useState('•••••••••••••••');
  const [tableName, setTableName] = useState('employees');
  const [ssl, setSsl] = useState(true);
  const [supabaseUrl, setSupabaseUrl] = useState('https://xyzcompany.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

  if (!isOpen) return null;

  const handleEngineChange = (next: DbEngine) => {
    setEngine(next);
    setPort(DEFAULT_PORTS[next]);
    const found = DB_ENGINES.find((e) => e.id === next);
    if (found) setTableName(found.defaultTable);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {t('Connect Database')}
                <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold px-1.5 py-0.2 rounded-full">
                  {t('Enterprise Feature — Coming Soon')}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('Build in progress — use Excel Import to onboard your roster today.')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan Gate for Free Users */}
        {isFreePlan ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <Lock size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {t('Database Connector is a Paid Feature')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                {t('Direct database sync with PostgreSQL, MySQL, MongoDB, SQL Server, and Supabase is available on Pro and Ultra plans.')}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <a
                href="/pricing"
                className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>{t('Upgrade to Pro / Ultra')}</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Engine Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                {t('Select Database Engine')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DB_ENGINES.map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => handleEngineChange(eng.id)}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1',
                      engine === eng.id
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 font-bold ring-2 ring-indigo-500/20 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    )}
                  >
                    <span className="text-lg">{eng.icon}</span>
                    <span className="text-[11px] truncate w-full">{eng.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Credentials Form */}
            {engine === 'supabase' ? (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="glass-input text-xs w-full py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    API Service / Anon Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="glass-input text-xs w-full py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Table Name
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="glass-input text-xs w-full py-2"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Host / IP Address')}
                    </label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="db.corporate-prod.internal"
                      className="glass-input text-xs w-full py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Port')}
                    </label>
                    <input
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="glass-input text-xs w-full py-2 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Database Name')}
                    </label>
                    <input
                      type="text"
                      value={database}
                      onChange={(e) => setDatabase(e.target.value)}
                      className="glass-input text-xs w-full py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Table / Collection')}
                    </label>
                    <input
                      type="text"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      className="glass-input text-xs w-full py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Username')}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="glass-input text-xs w-full py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Password')}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input text-xs w-full py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-zinc-400">
                    <input
                      type="checkbox"
                      checked={ssl}
                      onChange={(e) => setSsl(e.target.checked)}
                      className="rounded"
                    />
                    <span>{t('Require SSL / TLS Encrypted Connection')}</span>
                  </label>
                </div>
              </div>
            )}

            {/* Coming Soon Notice (replaces fake Test Connection) */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-3">
              <Lock size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {t('Enterprise Feature: Coming Soon')}
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">
                  {t('Live database connectors are under development. For now, use Excel Import to onboard your roster.')}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                disabled
                className="text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-2 bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed"
              >
                <span>{t('View & Import (Coming Soon)')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
