// EmployeeDataHub.tsx — 3-Way Employee Data Hub (Screen 2)
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  department?: string;
  birthDate?: string;
  hireDate?: string;
  autoSendEmail: boolean;
  dataSource: string;
  customAttributes?: Record<string, any>;
}

type Tab = 'grid' | 'csv' | 'db';

export default function EmployeeDataHub() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('grid');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadEmployees = () => {
    setLoading(true);
    fetch(`/api/employees${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then(r => r.json())
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEmployees(); }, [search]);

  const toggleAutoEmail = async (emp: Employee) => {
    const updated = { ...emp, autoSendEmail: !emp.autoSendEmail };
    setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e));
    await fetch(`/api/employees/${emp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoSendEmail: updated.autoSendEmail }),
    });
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const tenure = (hireDate?: string) => {
    if (!hireDate) return null;
    const years = Math.floor((Date.now() - new Date(hireDate).getTime()) / (365.25 * 24 * 3600 * 1000));
    return years;
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'grid', label: '📋 Employee Grid', icon: '📋' },
    { id: 'csv', label: '📄 Smart CSV Import', icon: '📄' },
    { id: 'db', label: '🔌 External DB Sync', icon: '🔌' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar + Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
          {tabs.map(tb => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === tb.id ? 'bg-white dark:bg-gray-900 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >{tb.label}</button>
          ))}
        </div>
        {tab === 'grid' && (
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="🔍 Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 w-48"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >{t('btnAddEmployee')}</button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {tab === 'grid' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400">{t('loading')}</div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
              <span className="text-4xl">👥</span>
              <div className="text-sm">No employees found. Add your first employee or import a CSV!</div>
              <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg">{t('btnAddEmployee')}</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-8">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('colFullName')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('colEmail')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('colBirthDate')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('colHireDate')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('colDepartment')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase min-w-32">{t('colAutoEmailToggle')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Source</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.map((emp, idx) => {
                    const t2 = tenure(emp.hireDate);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 text-slate-400 text-xs">{idx+1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{emp.fullName.charAt(0)}</div>
                            <div>
                              <div className="font-medium text-slate-800 dark:text-white script-safe">{emp.fullName}</div>
                              <div className="text-xs text-slate-500">{emp.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{emp.email}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                          {emp.birthDate ? new Date(emp.birthDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                          {emp.hireDate ? (
                            <span>{new Date(emp.hireDate).toLocaleDateString()}
                              {t2 !== null && <span className="ml-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 rounded-full">{t2}yr</span>}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{emp.department || '—'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleAutoEmail(emp)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              emp.autoSendEmail ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                            role="switch" aria-checked={emp.autoSendEmail}
                            title={emp.autoSendEmail ? 'Auto-email ON — click to disable' : 'Auto-email OFF — click to enable'}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              emp.autoSendEmail ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            emp.dataSource === 'manual' ? 'bg-slate-100 text-slate-600' :
                            emp.dataSource === 'csv' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>{emp.dataSource}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteEmployee(emp.id)} className="text-red-400 hover:text-red-600 text-xs">🗑</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'csv' && <CsvImporter onImported={loadEmployees} t={t} />}
      {tab === 'db' && <ExternalDbTab />}

      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onSaved={loadEmployees} />}
    </div>
  );
}

// CSV Importer Component
function CsvImporter({ onImported, t }: { onImported: () => void; t: (k: string) => string }) {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setAnalysis(null); setResult(null); };

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    const fd = new FormData();
    fd.append('csv', file);
    try {
      const res = await fetch('/api/employees/csv-analyze', { method: 'POST', body: fd });
      const data = await res.json();
      setAnalysis(data);
    } catch { alert('Analysis failed'); }
    finally { setAnalyzing(false); }
  };

  const doImport = async () => {
    if (!file) return;
    setImporting(true);
    const fd = new FormData();
    fd.append('csv', file);
    if (analysis?.mapping) fd.append('mapping', JSON.stringify(analysis.mapping));
    try {
      const res = await fetch('/api/employees/csv-import', { method: 'POST', body: fd });
      const data = await res.json();
      setResult(`✅ Imported ${data.imported} employees successfully!`);
      onImported();
    } catch { alert('Import failed'); }
    finally { setImporting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-1">💡 Keep Your CSV Simple</h4>
        <p className="text-xs text-indigo-700 dark:text-indigo-400">
          Don't worry about exact column names — Gemini AI automatically maps your columns and turns extra columns into custom attributes!<br />
          <strong>Minimum:</strong> <code>Name, Email, Birthday, Hire Date</code>
        </p>
      </div>

      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center cursor-pointer hover:border-indigo-400 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        <div className="text-4xl mb-3">📄</div>
        {file ? (
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-white">{file.name}</div>
            <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drag & drop your CSV file here</div>
            <div className="text-xs text-slate-500 mt-1">or click to browse — .csv or .xlsx supported</div>
          </div>
        )}
      </div>

      {file && !analysis && (
        <button onClick={analyze} disabled={analyzing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60">
          {analyzing ? '🤖 Analyzing with Gemini AI...' : '🔍 Analyze & Map Columns with AI'}
        </button>
      )}

      {analysis && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">✅ AI Column Mapping Preview</h4>
          <div className="space-y-2">
            {Object.entries(analysis.mapping || {}).map(([from, to]: [string, any]) => (
              <div key={from} className="flex items-center gap-2 text-xs">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">{from}</span>
                <span className="text-slate-400">→</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded font-semibold">{to}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-3">{analysis.rowCount} rows detected</div>
          <button onClick={doImport} disabled={importing} className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60">
            {importing ? '⏳ Importing...' : `📥 Import ${analysis.rowCount} Employees`}
          </button>
        </div>
      )}

      {result && <div className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold text-center py-2">{result}</div>}
    </div>
  );
}

// External DB Tab (placeholder pointing to connector)
function ExternalDbTab() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
      <div className="text-5xl">🔌</div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Metabase-Style DB Connector</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">Connect PostgreSQL, MySQL, or BigQuery databases to automatically sync your HR employee data. Use the 4-step visual wizard below.</p>
      <DbConnectorWizard />
    </div>
  );
}

// 4-Step DB Connector Wizard
function DbConnectorWizard() {
  const [step, setStep] = useState(1);
  const [dbType, setDbType] = useState('');
  const [connForm, setConnForm] = useState({ name: '', host: '', port: '5432', database: '', username: '', password: '', ssl: false });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ok:boolean,msg:string}|null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [syncing, setSyncing] = useState(false);

  const dbTypes = [
    { id: 'postgresql', label: 'PostgreSQL / Cloud SQL', icon: '🐘' },
    { id: 'mysql', label: 'MySQL / MariaDB', icon: '🐬' },
    { id: 'bigquery', label: 'Google BigQuery', icon: '📊' },
    { id: 'demo', label: '⚡ Demo Cloud HR DB (1-Click Judge Mode)', icon: '⚡' },
  ];

  const testConn = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch('/api/db-connectors/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbType, connectionConfig: connForm }),
      });
      const data = await res.json();
      setTestResult({ ok: !data.error, msg: data.error || `✅ Connected to ${dbType} in ${data.latencyMs}ms` });
      if (!data.error && data.tables) setTables(data.tables);
    } catch { setTestResult({ ok: false, msg: 'Connection failed' }); }
    finally { setTesting(false); }
  };

  const doSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/db-connectors/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbType, connectionConfig: connForm, tableName: selectedTable, name: connForm.name }),
      });
      const data = await res.json();
      alert(data.error ? `Error: ${data.error}` : `✅ Synced ${data.synced} employees!`);
    } catch { alert('Sync failed'); }
    finally { setSyncing(false); }
  };

  if (step === 1) return (
    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mt-4">
      {dbTypes.map(dt => (
        <button key={dt.id} onClick={() => { setDbType(dt.id); if (dt.id === 'demo') { setConnForm(f => ({...f, name:'Demo HR DB'})); } setStep(2); }}
          className="flex flex-col items-center gap-2 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 transition-colors text-sm font-medium">
          <span className="text-3xl">{dt.icon}</span>
          <span>{dt.label}</span>
        </button>
      ))}
    </div>
  );

  if (step === 2) return (
    <div className="max-w-md mx-auto mt-4 space-y-3 text-left">
      <h4 className="font-semibold text-sm">Step 2: Connection Credentials</h4>
      {(['name','host','port','database','username','password'] as const).map(field => (
        <input key={field} type={field === 'password' ? 'password' : 'text'} placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
          value={connForm[field] as string} onChange={e => setConnForm(f => ({...f,[field]:e.target.value}))}
          className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" />
      ))}
      <button onClick={testConn} disabled={testing} className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60">
        {testing ? '⏳ Testing...' : '🔌 Test Connection'}
      </button>
      {testResult && <div className={`text-sm font-medium ${testResult.ok ? 'text-emerald-600' : 'text-red-600'}`}>{testResult.msg}</div>}
      {testResult?.ok && <button onClick={() => setStep(3)} className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl">Next: Select Table →</button>}
      <button onClick={() => setStep(1)} className="w-full text-slate-500 text-sm underline">← Back</button>
    </div>
  );

  if (step === 3) return (
    <div className="max-w-md mx-auto mt-4 space-y-3 text-left">
      <h4 className="font-semibold text-sm">Step 3: Select Table</h4>
      <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 outline-none">
        <option value="">-- Select a table --</option>
        {tables.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button onClick={doSync} disabled={syncing || !selectedTable} className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-60">
        {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
      </button>
      <button onClick={() => setStep(2)} className="w-full text-slate-500 text-sm underline">← Back</button>
    </div>
  );

  return null;
}

// Add Employee Modal
function AddEmployeeModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ fullName:'', email:'', birthDate:'', hireDate:'', role:'', department:'', autoSendEmail: true });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.fullName || !form.email) { alert('Name and email are required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      onSaved(); onClose();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('btnAddEmployee')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        <div className="p-6 space-y-3">
          {([
            { field: 'fullName', label: t('colFullName'), type: 'text', required: true },
            { field: 'email', label: t('colEmail'), type: 'email', required: true },
            { field: 'role', label: 'Role', type: 'text' },
            { field: 'department', label: t('colDepartment'), type: 'text' },
            { field: 'birthDate', label: t('colBirthDate'), type: 'date' },
            { field: 'hireDate', label: t('colHireDate'), type: 'date' },
          ] as const).map(({ field, label, type }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
              <input type={type} value={(form as any)[field]} onChange={e => setForm(f => ({...f,[field]:e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('colAutoEmailToggle')}</label>
            <button onClick={() => setForm(f => ({...f, autoSendEmail: !f.autoSendEmail}))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.autoSendEmail ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.autoSendEmail ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
            {saving ? '⏳ Saving...' : 'Save Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
