import { useEffect, useState, useRef } from 'react';
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Employee } from '../types';
import { PLAN_LIMITS } from '../types';
import { parseExcel, exportToExcel, downloadTemplate } from '../utils/excelHandler';
import { Plus, Upload, Download, Search, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

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
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof EMPTY_FORM, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white">{initial.name ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
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
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} className="glass-input text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value as 'active' | 'inactive')} className="glass-input text-sm">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={() => onSave(form)} className="btn-primary text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Employees({ onCountChange }: { onCountChange: (n: number) => void }) {
  const { appUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [importPreview, setImportPreview] = useState<Partial<Employee>[] | null>(null);
  const [planAlert, setPlanAlert] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const limit = appUser ? PLAN_LIMITS[appUser.role] : 0;

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
    if (!appUser) return;
    if (!editTarget && employees.length >= limit) { setPlanAlert(true); return; }
    if (editTarget?.id) {
      await updateDoc(doc(db, 'employees', editTarget.id), form);
    } else {
      await addDoc(collection(db, 'employees'), {
        ...form, userId: appUser.uid, createdAt: serverTimestamp(),
      });
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this employee?')) return;
    await deleteDoc(doc(db, 'employees', id));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const rows = await parseExcel(file);
    setImportPreview(rows);
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (!appUser || !importPreview) return;
    const remaining = limit - employees.length;
    const toImport = importPreview.slice(0, remaining === Infinity ? undefined : remaining);
    const batch = writeBatch(db);
    toImport.forEach((row) => {
      const ref = doc(collection(db, 'employees'));
      batch.set(ref, { ...row, userId: appUser.uid, createdAt: serverTimestamp() });
    });
    await batch.commit();
    setImportPreview(null);
  }

  const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex-1">Employees</h1>
        <button onClick={downloadTemplate} className="btn-secondary text-sm flex items-center gap-2">
          <Download size={15} /> Template
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm flex items-center gap-2">
          <Upload size={15} /> Import
        </button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
        <button onClick={() => exportToExcel(employees)} className="btn-secondary text-sm flex items-center gap-2">
          <Download size={15} /> Export
        </button>
        <button
          onClick={() => { if (employees.length >= limit) { setPlanAlert(true); return; } setEditTarget(null); setModalOpen(true); }}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Plan alert */}
      {planAlert && (
        <div className="glass-panel p-4 border-l-4 border-amber-400 flex items-center justify-between">
          <span className="text-sm text-amber-700 dark:text-amber-300">
            Plan limit reached ({limit} employees). <a href="/pricing" className="underline font-semibold">Upgrade →</a>
          </span>
          <button onClick={() => setPlanAlert(false)}><X size={16} className="text-amber-500" /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="glass-input pl-9 text-sm"
          placeholder="Search by name, ID, email, department…"
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
                {['Employee ID', 'Name', 'Department', 'Contact', 'Dates', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="table-row-hover border-t border-slate-100 dark:border-zinc-800">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-zinc-400">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-corp-blue dark:bg-gold-500 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials(emp.name)}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-white">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs">{emp.department}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 text-xs">
                    <div>{emp.email}</div>
                    <div>{emp.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 text-xs">
                    <div>DOB: {emp.dob}</div>
                    <div>Joined: {emp.joinedDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                      emp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400',
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditTarget(emp); setModalOpen(true); }} className="text-slate-400 hover:text-corp-blue dark:hover:text-gold-400 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(emp.id!)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400 dark:text-zinc-500">No employees found</td></tr>
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

      {/* Import preview modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-3xl max-h-[80vh] flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">Import Preview — {importPreview.length} Employees</h2>
              <button onClick={() => setImportPreview(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="table-header">
                    {['ID', 'Name', 'Department', 'Email', 'DOB', 'Joined'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-zinc-800 table-row-hover">
                      <td className="px-3 py-2">{r.employeeId}</td>
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2">{r.department}</td>
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">{r.dob}</td>
                      <td className="px-3 py-2">{r.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setImportPreview(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleConfirmImport} className="btn-primary text-sm">Confirm Import ({importPreview.length} Employees)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
