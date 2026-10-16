import React, { useEffect, useState, useRef } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Employee } from '../types';
import { PLAN_LIMITS } from '../types';
import { parseExcel, exportToExcel, downloadTemplate } from '../utils/excelHandler';
import { getDemoEmployees, saveDemoEmployees } from '../utils/demoData';
import { useTranslation } from 'react-i18next';
import {
  Plus, Upload, Download, Search, Pencil, Trash2, X,
  FileSpreadsheet, Cake, Briefcase, CheckCircle2, ChevronDown, Database,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DatabaseConnectionModal } from '../components/employees/DatabaseConnectionModal';

const EMPTY_FORM: Omit<Employee, 'id' | 'userId' | 'createdAt'> = {
  employeeId: '', name: '', email: '', phone: '',
  department: '', dob: '', joinedDate: '', status: 'active',
};

function EmployeeModal({
  initial, onSave, onClose,
}: {
  initial: typeof EMPTY_FORM;
  onSave: (data: typeof EMPTY_FORM) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 relative bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 shadow-2xl rounded-2xl"
      >
        <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200 dark:border-zinc-800">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{initial.name ? t('Edit Employee') : t('Add Employee')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" title="Close (Esc)"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['employeeId', 'Employee ID', 'text'],
            ['name', 'Full Name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone', 'tel'],
            ['department', 'Department', 'text'],
            ['dob', 'Date of Birth', 'date'],
            ['joinedDate', 'Joined Date', 'date'],
          ] as const).map(([key, label, type]) => (
            <div key={key} className={key === 'name' || key === 'email' ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">{t(label)}</label>
              <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} className="glass-input text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">{t('Status')}</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value as 'active' | 'inactive')} className="glass-input text-sm">
              <option value="active">{t('Active')}</option>
              <option value="inactive">{t('Inactive')}</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer">{t('Cancel')}</button>
          <button onClick={() => onSave(form)} className="btn-primary text-sm font-bold">{t('Save')}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  employee,
  onConfirm,
  onClose,
}: {
  employee: Employee;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const initials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 shadow-2xl rounded-2xl relative"
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center shrink-0">
            <Trash2 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{t('Delete Employee')}</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {t('Are you sure? This action cannot be undone.')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 -mr-1 -mt-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Employee preview card inside confirmation */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-corp-blue dark:bg-gold-500 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shrink-0">
              {initials(employee.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {employee.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 truncate" title={employee.email}>
                {employee.email || t('No email provided')}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/80 dark:border-zinc-700/60 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-slate-200/80 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
              ID: {employee.employeeId}
            </span>
            {employee.department && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/50">
                {employee.department}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50">
              {employee.status === 'inactive' ? t('Inactive') : t('Active')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={15} />
            {t('Delete Employee')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employees({ onCountChange }: { onCountChange: (n: number) => void }) {
  const { t } = useTranslation();
  const { appUser, switchDemoPlan } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [importPreview, setImportPreview] = useState<Partial<Employee>[] | null>(null);
  const [planAlert, setPlanAlert] = useState(false);
  const [excelDropdownOpen, setExcelDropdownOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const excelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (excelDropdownRef.current && !excelDropdownRef.current.contains(e.target as Node)) {
        setExcelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDemo =
    Boolean(localStorage.getItem('demo_session')) ||
    !appUser ||
    appUser.uid.startsWith('demo') ||
    !import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY.includes('DemoFallback') ||
    import.meta.env.VITE_FIREBASE_PROJECT_ID === 'demo-milestone';

  useEffect(() => {
    const userId = appUser?.uid || 'demo-uid';

    if (isDemo) {
      const loadDemo = () => {
        const data = getDemoEmployees(userId);
        setEmployees(data);
        onCountChange(data.length);
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
          onCountChange(data.length);
        },
        () => {
          const data = getDemoEmployees(userId);
          setEmployees(data);
          onCountChange(data.length);
        }
      );
    } catch {
      const data = getDemoEmployees(userId);
      setEmployees(data);
      onCountChange(data.length);
    }
  }, [appUser, onCountChange, isDemo]);

  const limit = (appUser && appUser.role && PLAN_LIMITS[appUser.role] !== undefined)
    ? PLAN_LIMITS[appUser.role]
    : (appUser?.role === 'admin' ? Infinity : 100);

  const filtered = employees.filter((e) => {
    const s = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(s) ||
      e.employeeId.toLowerCase().includes(s) ||
      e.email.toLowerCase().includes(s) ||
      e.department.toLowerCase().includes(s) ||
      e.phone.toLowerCase().includes(s)
    );
  });

  async function handleSave(form: typeof EMPTY_FORM) {
    const userId = appUser?.uid || 'demo-uid';
    if (!editTarget && employees.length >= limit) {
      setPlanAlert(true);
      return;
    }

    const currentEdit = editTarget;
    // Dismiss modal immediately so user never sees it stuck
    setModalOpen(false);
    setEditTarget(null);

    let updated: Employee[];
    if (currentEdit?.id) {
      updated = employees.map((emp) =>
        emp.id === currentEdit.id ? { ...emp, ...form } : emp
      );
    } else {
      const newEmp: Employee = {
        ...form,
        id: `demo-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString() as any,
      };
      updated = [newEmp, ...employees];
    }
    setEmployees(updated);
    saveDemoEmployees(updated);
    onCountChange(updated.length);

    if (isDemo) return;

    try {
      if (currentEdit?.id) {
        await updateDoc(doc(db, 'employees', currentEdit.id), form);
      } else {
        await addDoc(collection(db, 'employees'), {
          ...form,
          userId,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Error saving to Firestore (retained local demo data):', err);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) {
      setDeleteTarget(null);
      return;
    }
    const id = deleteTarget.id;
    // Dismiss delete modal immediately
    setDeleteTarget(null);

    const updated = employees.filter((e) => e.id !== id);
    setEmployees(updated);
    saveDemoEmployees(updated);
    onCountChange(updated.length);

    if (isDemo) return;

    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (err) {
      console.warn('Error deleting in Firestore (retained local demo update):', err);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const rows = await parseExcel(file);
    setImportPreview(rows);
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (!importPreview || importPreview.length === 0) {
      setImportPreview(null);
      return;
    }

    const rowsToImport = [...importPreview];
    // Dismiss import preview modal immediately so user never sees it stuck
    setImportPreview(null);

    const remaining = limit - employees.length;
    if (remaining <= 0 && limit !== Infinity) {
      setPlanAlert(true);
      return;
    }

    const toImport = rowsToImport.slice(0, remaining === Infinity ? undefined : remaining);
    const userId = appUser?.uid || 'demo-uid';

    const newEmployees: Employee[] = toImport.map((row, idx) => ({
      id: `demo-import-${Date.now()}-${idx}`,
      userId,
      employeeId: row.employeeId || `EMP${String(employees.length + idx + 1).padStart(3, '0')}`,
      name: row.name || 'Unnamed Employee',
      email: row.email || '',
      phone: row.phone || '',
      department: row.department || 'General',
      dob: row.dob || '',
      joinedDate: row.joinedDate || '',
      status: (row.status as 'active' | 'inactive') || 'active',
      createdAt: new Date().toISOString() as any,
    }));

    const updated = [...employees, ...newEmployees];
    setEmployees(updated);
    saveDemoEmployees(updated);
    onCountChange(updated.length);

    if (isDemo) return;

    try {
      const batch = writeBatch(db);
      toImport.forEach((row) => {
        const ref = doc(collection(db, 'employees'));
        batch.set(ref, { ...row, userId, createdAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch import in Firestore failed (retained local demo data):', err);
    }
  }

  async function handleDatabaseImport(importedRows: Omit<Employee, 'id' | 'userId' | 'createdAt'>[]) {
    const remaining = limit - employees.length;
    if (remaining <= 0 && limit !== Infinity) {
      setPlanAlert(true);
      return;
    }

    const toImport = importedRows.slice(0, remaining === Infinity ? undefined : remaining);
    const userId = appUser?.uid || 'demo-uid';

    const newEmployees: Employee[] = toImport.map((row, idx) => ({
      id: `db-import-${Date.now()}-${idx}`,
      userId,
      employeeId: row.employeeId || `EMP${String(employees.length + idx + 1).padStart(3, '0')}`,
      name: row.name || 'Unnamed Employee',
      email: row.email || '',
      phone: row.phone || '',
      department: row.department || 'General',
      dob: row.dob || '',
      joinedDate: row.joinedDate || '',
      status: (row.status as 'active' | 'inactive') || 'active',
      createdAt: new Date().toISOString() as any,
    }));

    const updated = [...employees, ...newEmployees];
    setEmployees(updated);
    saveDemoEmployees(updated);
    onCountChange(updated.length);

    if (isDemo) return;

    try {
      const batch = writeBatch(db);
      toImport.forEach((row) => {
        const ref = doc(collection(db, 'employees'));
        batch.set(ref, { ...row, userId, createdAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Batch DB import in Firestore failed (saved locally):', err);
    }
  }

  const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex-1">{t('Employees')}</h1>

        {/* Combined Excel Actions Dropdown */}
        <div className="relative" ref={excelDropdownRef}>
          <button
            type="button"
            onClick={() => setExcelDropdownOpen(!excelDropdownOpen)}
            className="btn-secondary text-sm flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-500" />
            <span>{t('Excel Actions')}</span>
            <ChevronDown size={14} className={cn('transition-transform duration-200', excelDropdownOpen && 'rotate-180')} />
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

          {excelDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 glass-panel shadow-2xl border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setExcelDropdownOpen(false);
                  downloadTemplate();
                }}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-zinc-200 cursor-pointer"
              >
                <Download size={14} className="text-corp-blue dark:text-gold-400 shrink-0" />
                <div>
                  <div className="font-semibold">{t('Download Template')}</div>
                  <div className="text-[10px] text-slate-400">{t('Standard format (.xlsx)')}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExcelDropdownOpen(false);
                  fileRef.current?.click();
                }}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-zinc-200 cursor-pointer"
              >
                <Upload size={14} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold">{t('Import Excel / CSV')}</div>
                  <div className="text-[10px] text-slate-400">{t('Upload spreadsheet data')}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExcelDropdownOpen(false);
                  exportToExcel(employees);
                }}
                className="w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-zinc-200 border-t border-slate-100 dark:border-zinc-800/80 cursor-pointer"
              >
                <Download size={14} className="text-purple-500 shrink-0" />
                <div>
                  <div className="font-semibold">{t('Export to Excel')}</div>
                  <div className="text-[10px] text-slate-400">{t('Download current list ({{count}})', { count: employees.length })}</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Database Connection Button (Same size as Add Employee) */}
        <button
          type="button"
          onClick={() => setDbModalOpen(true)}
          className={cn(
            'text-sm flex items-center gap-2 py-2 px-3.5 rounded-xl font-semibold transition-all cursor-pointer',
            appUser?.role === 'user'
              ? 'btn-secondary text-slate-500 dark:text-zinc-400'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 text-white shadow-md'
          )}
          title={appUser?.role === 'user' ? t('Requires Pro or Ultra plan') : t('Connect external database')}
        >
          <Database size={15} className={appUser?.role === 'user' ? 'text-amber-500' : 'text-indigo-200'} />
          <span>{t('Database Connection')}</span>
        </button>

        {/* Add Employee Button */}
        <button
          onClick={() => { if (employees.length >= limit) { setPlanAlert(true); return; } setEditTarget(null); setModalOpen(true); }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={15} /> {t('Add Employee')}
        </button>
      </div>

      {/* Demo Mode Notice & Quick Plan Switcher */}
      {isDemo && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>{t('Demo Mode: Employees are stored locally only (no database writes).')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-zinc-400 font-semibold">{t('Switch Plan:')}</span>
            {(['user', 'pro', 'pro_plus', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchDemoPlan(r)}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer',
                  appUser?.role === r
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                )}
              >
                {r === 'pro_plus' ? 'Ultra' : r === 'user' ? 'Free (100)' : r === 'pro' ? 'Pro (1k)' : 'Admin'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan alert */}
      {planAlert && (
        <div className="glass-panel p-4 border-l-4 border-amber-400 flex items-center justify-between">
          <span className="text-sm text-amber-700 dark:text-amber-300">
            {t('Plan limit reached ({{limit}} employees).', { limit })}{' '}
            <a href="/pricing" className="underline font-semibold">{t('Upgrade →')}</a>
          </span>
          <button onClick={() => setPlanAlert(false)}><X size={16} className="text-amber-500" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="glass-input pl-9 text-sm"
          placeholder={t('Search by name, ID, email, department…')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {[
                  t('Employee ID'),
                  t('Name'),
                  t('Department'),
                  t('Contact'),
                  t('Dates'),
                  t('Status'),
                  t('Actions'),
                ].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="table-row-hover border-t border-slate-100 dark:border-zinc-800">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-zinc-300 font-bold">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-corp-blue dark:bg-gold-500 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(emp.name)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold">{emp.department}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-zinc-300 text-xs">
                    <div className="font-medium">{emp.email}</div>
                    <div className="text-slate-500 dark:text-zinc-400 font-mono">{emp.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-zinc-300 text-xs font-mono">
                    <div><span className="text-slate-400 font-sans mr-1">{t('Date of Birth')}:</span>{emp.dob}</div>
                    <div><span className="text-slate-400 font-sans mr-1">{t('Joined Date')}:</span>{emp.joinedDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold',
                      emp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400',
                    )}>
                      {emp.status === 'active' ? t('Active') : t('Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditTarget(emp); setModalOpen(true); }}
                        className="p-1 rounded-md text-slate-400 hover:text-corp-blue dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        title={t('Edit Employee')}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title={t('Delete Employee')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 dark:text-zinc-500">{t('No employees found')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <EmployeeModal
          initial={editTarget ? { ...editTarget } : { ...EMPTY_FORM }}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}

      {/* Modern In-App Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          employee={deleteTarget}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Professional Import Preview Modal */}
      {importPreview && (
        <div
          onClick={() => setImportPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[85vh] flex flex-col p-6 animate-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 shadow-2xl rounded-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-corp-blue/10 dark:bg-gold-500/15 text-corp-blue dark:text-gold-500 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {t('Import Preview')}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-corp-blue/10 text-corp-blue dark:bg-gold-500/20 dark:text-gold-400 font-bold">
                      {importPreview.length} {importPreview.length === 1 ? t('Employee') : t('Employees')}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    {t('Review and verify employee details and milestone dates before saving.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportPreview(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto border border-slate-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-zinc-800 sticky top-0 text-slate-800 dark:text-zinc-200 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-700">
                  <tr>
                    <th className="px-3.5 py-3">{t('Employee ID')}</th>
                    <th className="px-3.5 py-3">{t('Employee')}</th>
                    <th className="px-3.5 py-3">{t('Department')}</th>
                    <th className="px-3.5 py-3">{t('Contact')}</th>
                    <th className="px-3.5 py-3">{t('Date of Birth')}</th>
                    <th className="px-3.5 py-3">{t('Joined Date')}</th>
                    <th className="px-3.5 py-3">{t('Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {importPreview.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors">
                      <td className="px-3.5 py-3 font-mono text-xs text-slate-800 dark:text-zinc-200 font-bold">
                        {r.employeeId || `EMP${String(employees.length + i + 1).padStart(3, '0')}`}
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{r.name || '—'}</div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold text-xs border border-slate-200 dark:border-zinc-700">
                          {r.department || 'General'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-800 dark:text-zinc-200">
                        <div className="text-slate-900 dark:text-white font-semibold">{r.email || '—'}</div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400 font-mono mt-0.5">{r.phone || t('No phone')}</div>
                      </td>
                      <td className="px-3.5 py-3">
                        {r.dob ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pink-50 text-pink-900 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-200 dark:border-pink-800 text-xs font-bold font-mono">
                            <Cake size={14} className="text-pink-600 shrink-0" /> {r.dob}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        {r.joinedDate ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800 text-xs font-bold font-mono">
                            <Briefcase size={14} className="text-corp-blue dark:text-gold-400 shrink-0" /> {r.joinedDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className={cn('px-2.5 py-1 rounded-md text-xs font-bold border',
                          (r.status || 'active') === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                        )}>
                          {(r.status || 'active') === 'active' ? t('Active') : t('Inactive')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <span className="text-xs text-slate-700 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                {importPreview.length} {t('ready to import')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImportPreview(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="bg-corp-blue hover:bg-blue-800 dark:bg-gradient-to-r dark:from-gold-600 dark:to-gold-500 dark:text-zinc-950 text-white font-bold text-sm px-5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {t('Confirm Import')} ({importPreview.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Connection Modal */}
      <DatabaseConnectionModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
        userRole={appUser?.role}
        onImportEmployees={handleDatabaseImport}
        currentCount={employees.length}
        limit={limit}
      />
    </div>
  );
}
