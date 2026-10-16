import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { AppUser, Role } from '../types';
import { PLAN_LIMITS } from '../types';
import {
  Shield,
  Search,
  Clock,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export default function AdminUsers() {
  const { t } = useTranslation();
  const { appUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [quotaFilter, setQuotaFilter] = useState<'all' | 'warning' | 'normal'>('all');
  const [selectedPhotoUser, setSelectedPhotoUser] = useState<AppUser | null>(null);

  const defaultMockUsers: AppUser[] = [
    {
      uid: 'demo-uid',
      email: 'demo@milestone.app',
      role: 'admin',
      status: 'active',
      employeeCount: 6,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      createdAt: null,
      lastActive: 'Just now',
    },
    {
      uid: 'usr_enterprise_01',
      email: 'hr_operations@acmecorp.com',
      role: 'pro_plus',
      status: 'active',
      employeeCount: 1420,
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      createdAt: null,
      lastActive: '12m ago',
    },
    {
      uid: 'usr_growth_02',
      email: 'talent_lead@techstart.io',
      role: 'pro',
      status: 'active',
      employeeCount: 885, // 88.5% of 1000 - Warning!
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      createdAt: null,
      lastActive: '1h ago',
    },
    {
      uid: 'usr_starter_03',
      email: 'founder@boutique.co',
      role: 'user',
      status: 'active',
      employeeCount: 94, // 94% of 100 - Warning!
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      createdAt: null,
      lastActive: '3h ago',
    },
    {
      uid: 'usr_starter_04',
      email: 'manager@localshop.mm',
      role: 'user',
      status: 'active',
      employeeCount: 18,
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
      createdAt: null,
      lastActive: '2d ago',
    },
    {
      uid: 'usr_suspended_05',
      email: 'inactive_org@testdomain.com',
      role: 'user',
      status: 'suspended',
      employeeCount: 0,
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      createdAt: null,
      lastActive: '30d ago',
    },
  ];

  useEffect(() => {
    if (appUser?.role !== 'admin') return;

    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          if (!snap.empty) {
            setUsers(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  uid: d.id,
                  email: data.email || 'unknown@user.com',
                  role: (data.role || 'user') as Role,
                  status: (data.status || 'active') as 'active' | 'suspended',
                  employeeCount: typeof data.employeeCount === 'number' ? data.employeeCount : 6,
                  createdAt: data.createdAt || null,
                  lastActive: data.lastActive || 'Today',
                };
              })
            );
          } else {
            setUsers(defaultMockUsers);
          }
        },
        () => {
          // If Firestore is offline or unauthorized, use rich mock tenants
          setUsers(defaultMockUsers);
        }
      );
      return unsub;
    } catch {
      setUsers(defaultMockUsers);
    }
  }, [appUser]);

  if (appUser?.role !== 'admin') {
    return (
      <div className="glass-panel p-8 text-center text-red-500 font-semibold max-w-md mx-auto mt-12">
        {t('Access Denied: Admins Only')}
      </div>
    );
  }

  async function handleRoleChange(uid: string, newRole: Role) {
    // Update local state immediately for snappy response
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
    );

    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (err) {
      console.warn('Updated role locally (Firestore offline/mock):', err);
    }
  }

  async function handleToggleStatus(uid: string) {
    if (uid === appUser?.uid) return; // Prevent self-suspension

    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid === uid) {
          const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );

    const target = users.find((u) => u.uid === uid);
    const nextStatus = target?.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(doc(db, 'users', uid), { status: nextStatus });
    } catch (err) {
      console.warn('Updated status locally:', err);
    }
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    // Search match
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    // Quota filter
    const limit = PLAN_LIMITS[u.role] || 100;
    const count = u.employeeCount || 0;
    const percent = limit === Infinity ? 0 : (count / limit) * 100;
    const isWarning = percent >= 80;

    let matchesQuota = true;
    if (quotaFilter === 'warning') matchesQuota = isWarning;
    else if (quotaFilter === 'normal') matchesQuota = !isWarning;

    return matchesSearch && matchesRole && matchesQuota;
  });

  const totalTenants = users.length;
  const activeTenants = users.filter((u) => u.status !== 'suspended').length;
  const quotaAlertsCount = users.filter((u) => {
    const limit = PLAN_LIMITS[u.role] || 100;
    const count = u.employeeCount || 0;
    return limit !== Infinity && (count / limit) >= 0.8;
  }).length;
  const totalEmployeesAcrossTenants = users.reduce((acc, u) => acc + (u.employeeCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="text-corp-blue dark:text-gold-500" size={24} />
            User Management & Quota Oversight
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Audit multi-tenant account limits, monitor employee consumption, and configure roles.
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Total Tenants</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalTenants}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">{activeTenants} Active</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Tracked Employees</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalEmployeesAcrossTenants.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all tenants</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Quota Warnings</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {quotaAlertsCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Utilizing &gt;80% limit</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Paid Subscribers</div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {users.filter((u) => u.role === 'pro' || u.role === 'pro_plus').length}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">Pro & Pro Plus tiers</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tenant email or UID..."
            className="glass-input pl-9 text-xs w-full py-2"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-zinc-800 p-1 text-xs">
            {(['all', 'user', 'pro', 'pro_plus', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  'px-2.5 py-1 rounded-md capitalize font-medium transition-all text-xs',
                  roleFilter === r
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                )}
              >
                {r === 'all' ? 'All Roles' : r === 'pro_plus' ? 'Pro Plus' : r}
              </button>
            ))}
          </div>

          {/* Quota Threshold Filter */}
          <select
            value={quotaFilter}
            onChange={(e) => setQuotaFilter(e.target.value as any)}
            className="glass-input text-xs py-1.5 px-2.5"
          >
            <option value="all">All Quotas</option>
            <option value="warning">Near Limit (&gt;80%)</option>
            <option value="normal">Safe (&lt;80%)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">Tenant User</th>
                <th className="px-4 py-3 text-left">Plan / Tier</th>
                <th className="px-4 py-3 text-left min-w-[200px]">Quota Consumption</th>
                <th className="px-4 py-3 text-left">Account Status</th>
                <th className="px-4 py-3 text-left">Activity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No tenants match the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.uid === appUser?.uid;
                  const limit = PLAN_LIMITS[u.role] ?? 100;
                  const count = u.employeeCount ?? 0;
                  const isUnlimited = limit === Infinity;
                  const percent = isUnlimited ? 0 : Math.min(Math.round((count / limit) * 100), 100);
                  const isNearLimit = !isUnlimited && percent >= 80;

                  return (
                    <tr key={u.uid} className="table-row-hover">
                      {/* Tenant User Identity */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPhotoUser(u)}
                            title={t('Click to view full photo')}
                            className="relative group rounded-full shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-corp-blue"
                          >
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.email}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700 group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform',
                                  u.role === 'admin'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : u.role === 'pro_plus'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                    : 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200'
                                )}
                              >
                                {u.email[0].toUpperCase()}
                              </div>
                            )}
                          </button>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate">
                              {u.email}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded font-mono text-slate-600 dark:text-zinc-400">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 truncate">{u.uid}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plan / Role Dropdown */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isSelf}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                            className={cn(
                              'glass-input text-xs py-1 px-2 font-medium disabled:opacity-60 cursor-pointer',
                              u.role === 'admin' && 'text-emerald-600 dark:text-emerald-400 font-bold',
                              u.role === 'pro_plus' && 'text-purple-600 dark:text-purple-400 font-bold',
                              u.role === 'pro' && 'text-corp-blue dark:text-gold-500 font-bold'
                            )}
                          >
                            <option value="user">Free (100 cap)</option>
                            <option value="pro">Pro (1,000 cap)</option>
                            <option value="pro_plus">Pro Plus (Unlimited)</option>
                            <option value="admin">System Admin</option>
                          </select>
                        </div>
                      </td>

                      {/* Quota Progress Bar */}
                      <td className="px-4 py-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">
                              {count.toLocaleString()}{' '}
                              <span className="text-slate-400 font-normal">/ {isUnlimited ? '∞' : limit}</span>
                            </span>
                            <span
                              className={cn(
                                'font-mono text-[10px] font-bold px-1.5 py-0.2 rounded',
                                isUnlimited
                                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                                  : isNearLimit
                                  ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
                                  : 'text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800'
                              )}
                            >
                              {isUnlimited ? 'Unlimited' : `${percent}%`}
                            </span>
                          </div>

                          {/* Progress Line */}
                          {!isUnlimited && (
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  percent >= 90
                                    ? 'bg-red-500'
                                    : percent >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                            u.status === 'suspended'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              u.status === 'suspended' ? 'bg-red-500' : 'bg-emerald-500'
                            )}
                          />
                          {u.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-slate-400" />
                          {u.lastActive || 'Today'}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(u.uid)}
                            className={cn(
                              'px-2 py-1 rounded text-[11px] font-semibold transition-colors disabled:opacity-40 cursor-pointer',
                              u.status === 'suspended'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100'
                            )}
                          >
                            {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedPhotoUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhotoUser(null)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhotoUser(null)}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {selectedPhotoUser.photoURL ? (
              <img
                src={selectedPhotoUser.photoURL}
                alt={selectedPhotoUser.email}
                className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl object-cover shadow-lg border border-slate-200 dark:border-zinc-700"
              />
            ) : (
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-gradient-to-tr from-corp-blue to-indigo-600 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-white text-6xl font-black shadow-lg">
                {selectedPhotoUser.email[0].toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedPhotoUser.email}
              </h3>
              <p className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                UID: {selectedPhotoUser.uid}
              </p>
              <div className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                Plan: {selectedPhotoUser.role.toUpperCase()} • Status: {selectedPhotoUser.status || 'active'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
