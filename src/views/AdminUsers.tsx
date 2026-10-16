import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { AppUser, Role } from '../types';
import { Shield, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminUsers() {
  const { appUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    if (appUser?.role !== 'admin') return;
    try {
      return onSnapshot(
        collection(db, 'users'),
        (snap) => {
          setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AppUser)));
        },
        () => {
          setUsers([
            { uid: 'demo-uid', email: 'demo@milestone.app', role: 'admin', createdAt: null as any },
            { uid: 'user-002', email: 'hr_lead@company.com', role: 'pro', createdAt: null as any },
            { uid: 'user-003', email: 'guest@company.com', role: 'user', createdAt: null as any },
          ]);
        }
      );
    } catch {
      setUsers([{ uid: 'demo-uid', email: 'demo@milestone.app', role: 'admin', createdAt: null as any }]);
    }
  }, [appUser]);

  if (appUser?.role !== 'admin') {
    return (
      <div className="glass-panel p-8 text-center text-red-500 font-semibold max-w-md mx-auto mt-12">
        Access Denied: Admins Only
      </div>
    );
  }

  async function handleRoleChange(uid: string, newRole: Role) {
    if (uid === appUser?.uid) return;
    await updateDoc(doc(db, 'users', uid), { role: newRole });
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Current Role</th>
              <th className="px-4 py-3 text-left">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.uid === appUser?.uid;
              return (
                <tr key={u.uid} className="table-row-hover border-t border-slate-100 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 dark:text-white">{u.email}</div>
                    <div className="font-mono text-[10px] text-slate-400">{u.uid}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
                      u.role === 'admin' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
                      u.role === 'pro_plus' && 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
                      u.role === 'pro' && 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
                      u.role === 'user' && 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                    )}>
                      {u.role === 'admin' && <Shield size={12} />}
                      {u.role === 'pro_plus' && <Zap size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      disabled={isSelf}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                      className="glass-input text-xs py-1 px-2 disabled:opacity-40"
                    >
                      <option value="user">User (Free)</option>
                      <option value="pro">Pro</option>
                      <option value="pro_plus">Pro Plus</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
