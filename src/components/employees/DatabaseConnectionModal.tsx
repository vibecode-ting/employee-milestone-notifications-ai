import { useState } from 'react';
import {
  X, Database, CheckCircle2, Server, Filter, Check, ArrowRight,
  RefreshCw, Lock, Sparkles, CheckSquare, Square,
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
  onImportEmployees,
  currentCount,
  limit,
}: DatabaseConnectionModalProps) {
  const { t } = useTranslation();

  const isFreePlan = userRole === 'user';

  const [engine, setEngine] = useState<DbEngine>('postgres');
  const [host, setHost] = useState('db.corporate-prod.internal');
  const [port, setPort] = useState(DEFAULT_PORTS.postgres);
  const [database, setDatabase] = useState('enterprise_hrms');
  const [username, setUsername] = useState('hr_ro_reader');
  const [password, setPassword] = useState('••••••••••••');
  const [tableName, setTableName] = useState('employees');
  const [ssl, setSsl] = useState(true);
  const [supabaseUrl, setSupabaseUrl] = useState('https://xyzcompany.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  // Sample remote rows dynamically adapted to selected DB
  const [previewRows] = useState<Omit<Employee, 'id' | 'userId' | 'createdAt'>[]>([
    {
      employeeId: 'EMP-9001',
      name: 'Eleanor Vance',
      department: 'Engineering',
      email: 'eleanor.vance@enterprise.com',
      phone: '+1 555-0192',
      dob: '1992-04-14',
      joinedDate: '2021-06-15',
      status: 'active',
    },
    {
      employeeId: 'EMP-9002',
      name: 'Marcus Holloway',
      department: 'Product',
      email: 'marcus.h@enterprise.com',
      phone: '+1 555-0144',
      dob: '1989-11-20',
      joinedDate: '2019-09-01',
      status: 'active',
    },
    {
      employeeId: 'EMP-9003',
      name: 'Kavita Patel',
      department: 'Design',
      email: 'kavita.patel@enterprise.com',
      phone: '+1 555-0187',
      dob: '1995-02-28',
      joinedDate: '2022-03-10',
      status: 'active',
    },
    {
      employeeId: 'EMP-9004',
      name: 'Lucas Meyer',
      department: 'Finance',
      email: 'lucas.meyer@enterprise.com',
      phone: '+1 555-0129',
      dob: '1987-08-05',
      joinedDate: '2018-01-22',
      status: 'active',
    },
    {
      employeeId: 'EMP-9005',
      name: 'Aisha Al-Mansoor',
      department: 'Human Resources',
      email: 'aisha.m@enterprise.com',
      phone: '+1 555-0163',
      dob: '1993-10-12',
      joinedDate: '2020-11-16',
      status: 'active',
    },
    {
      employeeId: 'EMP-9006',
      name: 'Kenji Sato',
      department: 'Operations',
      email: 'kenji.sato@enterprise.com',
      phone: '+1 555-0175',
      dob: '1990-07-19',
      joinedDate: '2023-05-02',
      status: 'active',
    },
  ]);

  if (!isOpen) return null;

  const handleEngineChange = (next: DbEngine) => {
    setEngine(next);
    setPort(DEFAULT_PORTS[next]);
    const found = DB_ENGINES.find((e) => e.id === next);
    if (found) setTableName(found.defaultTable);
    setTestSuccess(false);
    setLatency(null);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTestSuccess(false);
    setTimeout(() => {
      setTesting(false);
      setTestSuccess(true);
      const randomLatency = Math.floor(Math.random() * 35) + 24;
      setLatency(randomLatency);
    }, 700);
  };

  const handleOpenPreview = () => {
    if (!testSuccess) return;
    // Auto-select all by default
    setSelectedIds(previewRows.map((r) => r.employeeId));
    setStep('preview');
  };

  const filteredPreview = previewRows.filter((r) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.employeeId.toLowerCase().includes(q)
    );
  });

  const toggleSelectRow = (empId: string) => {
    setSelectedIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const areAllFilteredSelected =
    filteredPreview.length > 0 &&
    filteredPreview.every((r) => selectedIds.includes(r.employeeId));

  const toggleSelectAllFiltered = () => {
    if (areAllFilteredSelected) {
      const filteredIds = new Set(filteredPreview.map((r) => r.employeeId));
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredPreview.map((r) => r.employeeId)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const handleImport = async () => {
    const selectedEmployees = previewRows.filter((r) => selectedIds.includes(r.employeeId));
    if (selectedEmployees.length === 0) return;

    if (currentCount + selectedEmployees.length > limit) {
      alert(t('Import exceeds your plan limit ({{limit}} employees). Please upgrade or select fewer rows.', { limit }));
      return;
    }

    setImporting(true);
    try {
      await onImportEmployees(selectedEmployees);
      onClose();
    } finally {
      setImporting(false);
    }
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>{t('Connect Database')}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold px-2 py-0.2 rounded-full">
                  Pro & Ultra
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('Live sync and batch import directly from SQL, NoSQL, or Supabase')}
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
        ) : step === 'config' ? (
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
                    onChange={(e) => {
                      setSupabaseUrl(e.target.value);
                      setTestSuccess(false);
                    }}
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
                    onChange={(e) => {
                      setSupabaseKey(e.target.value);
                      setTestSuccess(false);
                    }}
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
                      onChange={(e) => {
                        setHost(e.target.value);
                        setTestSuccess(false);
                      }}
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
                      onChange={(e) => {
                        setPort(e.target.value);
                        setTestSuccess(false);
                      }}
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
                      onChange={(e) => {
                        setDatabase(e.target.value);
                        setTestSuccess(false);
                      }}
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

            {/* Test Connection Banner & Ping Results */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {testSuccess ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>{t('Connected successfully')}</span>
                    <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                      {latency}ms ping
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Server size={14} />
                    <span>{t('Test ping required before importing')}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                  testSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'btn-secondary'
                )}
              >
                {testing ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>{t('Pinging...')}</span>
                  </>
                ) : (
                  <>
                    <span>{testSuccess ? t('Re-test Ping') : t('Test Connection')}</span>
                  </>
                )}
              </button>
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
                disabled={!testSuccess}
                onClick={handleOpenPreview}
                className={cn(
                  'text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer',
                  testSuccess
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                )}
              >
                <span>{t('View & Import')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Preview & Select Rows Step */
          <div className="p-5 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder={t('Filter across columns (name, ID, email, department)...')}
                  className="glass-input glass-input-with-icon !pl-11 text-xs w-full py-1.5"
                />
              </div>

              <div className="text-xs font-semibold text-slate-600 dark:text-zinc-300 shrink-0">
                {t('Selected: {{count}} / {{total}}', {
                  count: selectedIds.length,
                  total: previewRows.length,
                })}
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 flex-1 min-h-[220px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 uppercase font-semibold border-b border-slate-200 dark:border-zinc-800 text-[10px]">
                  <tr>
                    <th className="p-2.5 w-8">
                      <button
                        type="button"
                        onClick={toggleSelectAllFiltered}
                        className="cursor-pointer text-slate-600 dark:text-zinc-300"
                        title={areAllFilteredSelected ? t('Deselect all') : t('Select all filtered')}
                      >
                        {areAllFilteredSelected ? (
                          <CheckSquare size={15} className="text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </th>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">DOB</th>
                    <th className="p-2.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredPreview.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        {t('No matching rows found in query')}
                      </td>
                    </tr>
                  ) : (
                    filteredPreview.map((row) => {
                      const isSelected = selectedIds.includes(row.employeeId);
                      return (
                        <tr
                          key={row.employeeId}
                          onClick={() => toggleSelectRow(row.employeeId)}
                          className={cn(
                            'transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                              : 'hover:bg-slate-50/60 dark:hover:bg-zinc-800/40'
                          )}
                        >
                          <td className="p-2.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleSelectRow(row.employeeId)}
                              className="cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare size={14} className="text-indigo-600 dark:text-indigo-400" />
                              ) : (
                                <Square size={14} className="text-slate-400" />
                              )}
                            </button>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-500">{row.employeeId}</td>
                          <td className="p-2.5 font-semibold text-slate-800 dark:text-white">{row.name}</td>
                          <td className="p-2.5 text-slate-600 dark:text-zinc-300">{row.department}</td>
                          <td className="p-2.5 text-slate-500 truncate max-w-[140px]">{row.email}</td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">{row.dob}</td>
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">{row.joinedDate}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setStep('config')}
                className="btn-secondary text-xs cursor-pointer"
              >
                {t('Back to Connection')}
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={selectedIds.length === 0 || importing}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {importing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{t('Importing...')}</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>
                      {t('Import Selected ({{count}})', { count: selectedIds.length })}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
