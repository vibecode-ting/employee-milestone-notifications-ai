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
  ArrowUpCircle,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { GeminiAvatarRing, GeminiBadge } from '../components/common/GeminiBadge';

export default function AdminUsers() {
  const { t } = useTranslation();
  const { appUser, switchDemoPlan } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [quotaFilter, setQuotaFilter] = useState<'all' | 'warning' | 'normal'>('all');
  const [upgradingUser, setUpgradingUser] = useState<AppUser | null>(null);
  const [targetRole, setTargetRole] = useState<Role>('pro');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
                const savedRole = localStorage.getItem(`admin_role_override_${d.id}`) as Role | null;
                return {
                  uid: d.id,
                  email: data.email || 'user@company.com',
                  role: (savedRole || data.role || 'user') as Role,
                  status: (data.status || 'active') as 'active' | 'suspended',
                  photoURL: data.photoURL || null,
                  employeeCount: typeof data.employeeCount === 'number' ? data.employeeCount : 0,
                  createdAt: data.createdAt || null,
                  lastActive: data.lastActive || 'Today',
                };
              })
            );
          } else {
            // Real users baseline from current admin
            const baseUser: AppUser = {
              uid: appUser.uid,
              email: appUser.email,
              role: (localStorage.getItem(`admin_role_override_${appUser.uid}`) as Role) || appUser.role,
              status: 'active',
              employeeCount: 0,
              photoURL: appUser.photoURL || null,
              createdAt: null,
              lastActive: 'Active now',
            };
            const sampleUsers: AppUser[] = [
              baseUser,
              {
                uid: 'demo_user_sarah',
                email: 'sarah.jenkins@company.com',
                role: (localStorage.getItem('admin_role_override_demo_user_sarah') as Role) || 'user',
                status: 'active',
                employeeCount: 42,
                photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
                createdAt: null,
                lastActive: '2 hours ago',
              },
              {
                uid: 'demo_user_kenji',
                email: 'kenji.sato@company.com',
                role: (localStorage.getItem('admin_role_override_demo_user_kenji') as Role) || 'pro',
                status: 'active',
                employeeCount: 180,
                photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                createdAt: null,
                lastActive: 'Yesterday',
              },
            ];
            setUsers(sampleUsers);
          }
        },
        () => {
          const baseUser: AppUser = {
            uid: appUser.uid,
            email: appUser.email,
            role: (localStorage.getItem(`admin_role_override_${appUser.uid}`) as Role) || appUser.role,
            status: 'active',
            employeeCount: 0,
            photoURL: appUser.photoURL || null,
            createdAt: null,
            lastActive: 'Active now',
          };
          const sampleUsers: AppUser[] = [
            baseUser,
            {
              uid: 'demo_user_sarah',
              email: 'sarah.jenkins@company.com',
              role: (localStorage.getItem('admin_role_override_demo_user_sarah') as Role) || 'user',
              status: 'active',
              employeeCount: 42,
              photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
              createdAt: null,
              lastActive: '2 hours ago',
            },
            {
              uid: 'demo_user_kenji',
              email: 'kenji.sato@company.com',
              role: (localStorage.getItem('admin_role_override_demo_user_kenji') as Role) || 'pro',
              status: 'active',
              employeeCount: 180,
              photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
              createdAt: null,
              lastActive: 'Yesterday',
            },
          ];
          setUsers(sampleUsers);
        }
      );
      return unsub;
    } catch {
      const baseUser: AppUser = {
        uid: appUser.uid,
        email: appUser.email,
        role: (localStorage.getItem(`admin_role_override_${appUser.uid}`) as Role) || appUser.role,
        status: 'active',
        employeeCount: 0,
        photoURL: appUser.photoURL || null,
        createdAt: null,
        lastActive: 'Active now',
      };
      const sampleUsers: AppUser[] = [
        baseUser,
        {
          uid: 'demo_user_sarah',
          email: 'sarah.jenkins@company.com',
          role: (localStorage.getItem('admin_role_override_demo_user_sarah') as Role) || 'user',
          status: 'active',
          employeeCount: 42,
          photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          createdAt: null,
          lastActive: '2 hours ago',
        },
        {
          uid: 'demo_user_kenji',
          email: 'kenji.sato@company.com',
          role: (localStorage.getItem('admin_role_override_demo_user_kenji') as Role) || 'pro',
          status: 'active',
          employeeCount: 180,
          photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          createdAt: null,
          lastActive: 'Yesterday',
        },
      ];
      setUsers(sampleUsers);
    }
  }, [appUser]);

  if (appUser?.role !== 'admin') {
    return (
      <div className="glass-panel p-8 text-center text-red-500 font-semibold max-w-md mx-auto mt-12">
        {t('Access Denied: Admins Only')}
      </div>
    );
  }

  const recordAudit = (action: string, target: string, level: 'info' | 'warn' | 'success' = 'info') => {
    try {
      const raw = localStorage.getItem('admin_audit_logs');
      const list = raw ? JSON.parse(raw) : [];
      const entry = {
        id: Date.now().toString(),
        action,
        target,
        time: 'Just now',
        level,
      };
      localStorage.setItem('admin_audit_logs', JSON.stringify([entry, ...list].slice(0, 30)));
    } catch {}
  };

  async function handleRoleChange(uid: string, newRole: Role) {
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
    );
    localStorage.setItem(`admin_role_override_${uid}`, newRole);
    if (uid === appUser?.uid) {
      switchDemoPlan(newRole);
    }

    const targetUser = users.find((u) => u.uid === uid);
    recordAudit(`Role Upgraded to ${newRole.toUpperCase()}`, targetUser?.email || uid, 'success');

    setToastMessage(`Updated ${targetUser?.email || 'user'} role to ${newRole.toUpperCase()}`);
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (err) {
      console.warn('Updated role locally:', err);
    }
  }

  function handleConfirmUpgrade() {
    if (!upgradingUser) return;
    handleRoleChange(upgradingUser.uid, targetRole);
    setUpgradingUser(null);
  }

  async function handleToggleStatus(uid: string) {
    if (uid === appUser?.uid) return;

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
    recordAudit(nextStatus === 'suspended' ? 'Account Suspended' : 'Account Reactivated', target?.email || uid, 'warn');

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="text-corp-blue dark:text-gold-500" size={24} />
            {t('User Management & Role Upgrades')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {t('Audit tenant accounts, upgrade user roles, and manage subscription quotas.')}
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">{t('Total Tenants')}</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalTenants}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">{activeTenants} {t('Active')}</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">{t('Tracked Employees')}</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalEmployeesAcrossTenants.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{t('Across all tenants')}</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">{t('Quota Warnings')}</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {quotaAlertsCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">{t('Utilizing >80% limit')}</div>
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">{t('Paid Subscribers')}</div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {users.filter((u) => u.role === 'pro' || u.role === 'pro_plus').length}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">{t('Pro & Ultra tiers')}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('Search tenant email or UID...')}
            className="glass-input glass-input-with-icon !pl-11 text-xs w-full py-2"
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
                  'px-2.5 py-1 rounded-md capitalize font-medium transition-all text-xs cursor-pointer',
                  roleFilter === r
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                )}
              >
                {r === 'all' ? t('All Roles') : r === 'pro_plus' ? t('Ultra') : t(r)}
              </button>
            ))}
          </div>

          {/* Quota Threshold Filter */}
          <select
            value={quotaFilter}
            onChange={(e) => setQuotaFilter(e.target.value as any)}
            className="glass-input text-xs py-1.5 px-2.5 cursor-pointer"
          >
            <option value="all">{t('All Quotas')}</option>
            <option value="warning">{t('Near Limit (>80%)')}</option>
            <option value="normal">{t('Safe (<80%)')}</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">{t('Tenant User')}</th>
                <th className="px-4 py-3 text-left">{t('Plan / Tier')}</th>
                <th className="px-4 py-3 text-left min-w-[200px]">{t('Quota Consumption')}</th>
                <th className="px-4 py-3 text-left">{t('Account Status')}</th>
                <th className="px-4 py-3 text-left">{t('Activity')}</th>
                <th className="px-4 py-3 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    {t('No tenants match the specified criteria.')}
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
                          <GeminiAvatarRing role={u.role}>
                            {u.photoURL ? (
                              <img
                                src={u.photoURL}
                                alt={u.email}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs',
                                  u.role === 'admin'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : u.role === 'pro_plus'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                    : 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200'
                                )}
                              >
                                {u.email[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </GeminiAvatarRing>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 truncate">
                              {u.email}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded font-mono text-slate-600 dark:text-zinc-400">
                                  {t('You')}
                                </span>
                              )}
                              <GeminiBadge role={u.role} size="sm" showIcon={false} />
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
                            <option value="user">{t('Free (100 cap)')}</option>
                            <option value="pro">{t('Pro (1,000 cap)')}</option>
                            <option value="pro_plus">{t('Ultra (Unlimited)')}</option>
                            <option value="admin">{t('System Admin')}</option>
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
                              {isUnlimited ? t('Unlimited') : `${percent}%`}
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
                          {u.status === 'suspended' ? t('Suspended') : t('Active')}
                        </span>
                      </td>

                      {/* Activity */}
                      <td className="px-4 py-3 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-slate-400" />
                          {u.lastActive || t('Today')}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={isSelf}
                            onClick={() => {
                              setUpgradingUser(u);
                              setTargetRole(u.role === 'user' ? 'pro' : u.role === 'pro' ? 'pro_plus' : 'pro_plus');
                            }}
                            className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                            title={t('Upgrade role')}
                          >
                            <ArrowUpCircle size={13} />
                            {t('Upgrade')}
                          </button>
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
                            {u.status === 'suspended' ? t('Reactivate') : t('Suspend')}
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

      {/* Upgrade Role Modal */}
      {upgradingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setUpgradingUser(null)}
        >
          <div
            className="relative max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('Upgrade User Role')}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{upgradingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setUpgradingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {t('Select Target Role & Quota:')}
              </label>

              {([
                { role: 'pro', label: t('Pro (Growth Tier)'), cap: t('1,000 Employees'), color: 'border-corp-blue text-corp-blue dark:text-gold-400' },
                { role: 'pro_plus', label: t('Ultra (Enterprise)'), cap: t('Unlimited Employees'), color: 'border-purple-600 text-purple-600 dark:text-purple-400' },
                { role: 'admin', label: t('System Admin'), cap: t('Full Platform Access'), color: 'border-emerald-600 text-emerald-600 dark:text-emerald-400' },
                { role: 'user', label: t('Free (Starter)'), cap: t('100 Employees'), color: 'border-slate-400 text-slate-600 dark:text-zinc-400' },
              ] as const).map((opt) => (
                <label
                  key={opt.role}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all',
                    targetRole === opt.role
                      ? `${opt.color} bg-slate-50 dark:bg-zinc-800/80 shadow-xs font-semibold`
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 opacity-80'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="targetRole"
                      value={opt.role}
                      checked={targetRole === opt.role}
                      onChange={() => setTargetRole(opt.role)}
                      className="accent-corp-blue dark:accent-gold-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">{opt.cap}</div>
                    </div>
                  </div>
                  <GeminiBadge role={opt.role} size="sm" showIcon={false} />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setUpgradingUser(null)}
                className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgrade}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowUpCircle size={14} />
                {t('Confirm Upgrade')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
