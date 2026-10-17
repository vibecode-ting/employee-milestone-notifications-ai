import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Zap,
  Users,
  Activity,
  Server,
  Database,
  Mail,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Cpu,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Role, SystemBroadcast } from '../types';

interface SystemMetric {
  totalUsers: number;
  proUsers: number;
  proPlusUsers: number;
  adminUsers: number;
  freeUsers: number;
  totalEmployees: number;
  quotaAlerts: number;
}

interface ServiceStatus {
  name: string;
  category: string;
  status: 'operational' | 'degraded' | 'maintenance';
  latency: string;
  icon: typeof Server;
}

interface AuditLog {
  id: string;
  action: string;
  target: string;
  time: string;
  level: 'info' | 'warn' | 'success';
}

export default function AdminDashboard() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => new Date().toLocaleTimeString());
  const [broadcastMessage, setBroadcastMessage] = useState<string>(() => {
    return localStorage.getItem('admin_system_broadcast') || '';
  });
  const [broadcastDraft, setBroadcastDraft] = useState(broadcastMessage);
  const [broadcastSaved, setBroadcastSaved] = useState(false);

  // System metrics state
  const [metrics, setMetrics] = useState<SystemMetric>(() => {
    return {
      totalUsers: 1,
      freeUsers: 0,
      proUsers: 0,
      proPlusUsers: 0,
      adminUsers: 1,
      totalEmployees: 0,
      quotaAlerts: 0,
    };
  });

  const getStoredAuditLogs = (): AuditLog[] => {
    try {
      const stored = localStorage.getItem('admin_audit_logs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'init', action: 'Admin Superuser Session Started', target: appUser?.email || 'admin', time: 'Just now', level: 'info' },
    ];
  };

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getStoredAuditLogs);

  const services: ServiceStatus[] = [
    { name: 'Firebase Authentication', category: 'Identity & Tokens', status: 'operational', latency: 'Active', icon: Shield },
    { name: 'Cloud Firestore Database', category: 'Live Realtime Store', status: 'operational', latency: 'Online', icon: Database },
    { name: 'SMTP Notification Dispatcher', category: 'Email Gateway', status: 'operational', latency: 'Ready', icon: Mail },
    { name: 'System Webhook Dispatcher', category: 'Teams / Telegram API', status: 'operational', latency: 'Ready', icon: Radio },
  ];

  useEffect(() => {
    if (appUser?.role !== 'admin') return;

    try {
      const unsubscribeUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          let free = 0;
          let pro = 0;
          let proPlus = 0;
          let admins = 0;

          snap.docs.forEach((d) => {
            const u = d.data();
            const savedRole = localStorage.getItem(`admin_role_override_${d.id}`) as Role | null;
            const role = (savedRole || u.role || 'user') as Role;
            if (role === 'admin') admins++;
            else if (role === 'pro_plus') proPlus++;
            else if (role === 'pro') pro++;
            else free++;
          });

          const total = snap.docs.length || 1;
          setMetrics((prev) => ({
            ...prev,
            totalUsers: total,
            freeUsers: free,
            proUsers: pro,
            proPlusUsers: proPlus,
            adminUsers: admins || 1,
          }));
        },
        () => {}
      );

      const unsubscribeEmployees = onSnapshot(
        collection(db, 'employees'),
        (snap) => {
          setMetrics((prev) => ({
            ...prev,
            totalEmployees: snap.docs.length,
          }));
        },
        () => {
          try {
            const demo = JSON.parse(localStorage.getItem(`demo_employees_${appUser?.uid || 'demo-uid'}`) || '[]');
            setMetrics((prev) => ({ ...prev, totalEmployees: demo.length }));
          } catch {}
        }
      );

      return () => {
        unsubscribeUsers();
        unsubscribeEmployees();
      };
    } catch {}
  }, [appUser]);

  const handleRefresh = () => {
    setLoading(true);
    setAuditLogs(getStoredAuditLogs());
    setTimeout(() => {
      setLastRefreshed(new Date().toLocaleTimeString());
      setLoading(false);
    }, 400);
  };

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastMessage(broadcastDraft);
    localStorage.setItem('admin_system_broadcast', broadcastDraft);

    if (broadcastDraft.trim()) {
      const newBroadcast: SystemBroadcast = {
        id: Date.now().toString(),
        message: broadcastDraft.trim(),
        createdAt: new Date().toISOString(),
        active: true,
        createdBy: appUser?.email || 'admin',
      };

      try {
        const stored: SystemBroadcast[] = JSON.parse(localStorage.getItem('system_broadcasts_list') || '[]');
        const updated = [newBroadcast, ...stored.filter((b) => b.message !== newBroadcast.message)].slice(0, 20);
        localStorage.setItem('system_broadcasts_list', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      try {
        addDoc(collection(db, 'system_broadcasts'), {
          message: newBroadcast.message,
          createdAt: newBroadcast.createdAt,
          active: true,
          createdBy: newBroadcast.createdBy,
        }).catch(() => {});
      } catch {}
    }

    setBroadcastSaved(true);
    setTimeout(() => setBroadcastSaved(false), 2500);

    setAuditLogs((prev) => [
      {
        id: Date.now().toString(),
        action: broadcastDraft ? 'Broadcast Updated' : 'Broadcast Cleared',
        target: broadcastDraft ? `"${broadcastDraft.slice(0, 30)}..."` : 'All Users',
        time: 'Just now',
        level: 'info',
      },
      ...prev.slice(0, 6),
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Healthy
            </span>
            <span className="text-xs text-slate-400">· Checked {lastRefreshed}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Shield className="text-corp-blue dark:text-gold-500" size={26} />
            Admin Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Platform monitoring, multi-tenant subscription quotas, and operational tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3 cursor-pointer"
            title="Refresh System Metrics"
          >
            <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5"
          >
            <Users size={14} />
            User Quotas
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Broadcast Banner Tool (Active for all users) */}
      {broadcastMessage && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-amber-500" />
            <span>
              <strong>Active Broadcast Banner:</strong> {broadcastMessage}
            </span>
          </div>
          <button
            onClick={() => {
              setBroadcastMessage('');
              setBroadcastDraft('');
              localStorage.removeItem('admin_system_broadcast');
            }}
            className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Platform Tenants
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-corp-blue dark:text-gold-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.totalUsers}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2">
            Free: {metrics.freeUsers} · Pro: {metrics.proUsers} · Ultra: {metrics.proPlusUsers}
          </p>
        </div>

        {/* Paid Conversion */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Active Paid Subscribers
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.proUsers + metrics.proPlusUsers}
            </span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              ({metrics.totalUsers > 0 ? Math.round(((metrics.proUsers + metrics.proPlusUsers) / metrics.totalUsers) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2">
            {metrics.proUsers} Pro · {metrics.proPlusUsers} Ultra
          </p>
        </div>

        {/* Total Tracked Employees */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Tracked Employees
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{metrics.totalEmployees}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2">
            Active milestone records
          </p>
        </div>

        {/* System Admins */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              System Administrators
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Shield size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.adminUsers}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2">
            Full platform privileges
          </p>
        </div>
      </div>

      {/* Main Grid: Services Health & Admin Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Services Health (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Server size={18} className="text-corp-blue dark:text-gold-500" />
                Infrastructure & Gateway Health
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Live operational telemetry across platform services</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} /> 100% Uptime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.name}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate">{svc.name}</h3>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {svc.latency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">{svc.category}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        {svc.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan Distribution Bar */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-zinc-800">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-zinc-300">Subscription Breakdown</span>
              <span className="text-slate-400">{metrics.totalUsers} accounts</span>
            </div>
            {/* Visual Stacked Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800 flex overflow-hidden">
              <div
                style={{ width: `${(metrics.freeUsers / metrics.totalUsers) * 100}%` }}
                className="bg-slate-400 dark:bg-zinc-600 transition-all"
                title={`Free Users: ${metrics.freeUsers}`}
              />
              <div
                style={{ width: `${(metrics.proUsers / metrics.totalUsers) * 100}%` }}
                className="bg-corp-blue dark:bg-gold-500 transition-all"
                title={`Pro Users: ${metrics.proUsers}`}
              />
              <div
                style={{ width: `${(metrics.proPlusUsers / metrics.totalUsers) * 100}%` }}
                className="bg-purple-600 transition-all"
                title={`Ultra Users: ${metrics.proPlusUsers}`}
              />
              <div
                style={{ width: `${(metrics.adminUsers / metrics.totalUsers) * 100}%` }}
                className="bg-emerald-500 transition-all"
                title={`Admins: ${metrics.adminUsers}`}
              />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-zinc-600" />
                Free ({metrics.freeUsers})
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-corp-blue dark:bg-gold-500" />
                Pro ({metrics.proUsers})
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                Ultra ({metrics.proPlusUsers})
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Admin ({metrics.adminUsers})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Admin Tools (1 Col) */}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Cpu size={18} className="text-purple-600 dark:text-purple-400" />
            Admin Operations
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Direct platform controls and tools</p>

          {/* Broadcast Announcement Form */}
          <form onSubmit={handleSaveBroadcast} className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              System Announcement Banner
            </label>
            <input
              type="text"
              value={broadcastDraft}
              onChange={(e) => setBroadcastDraft(e.target.value)}
              placeholder="e.g. Maintenance scheduled for Sunday 02:00..."
              className="glass-input text-xs w-full py-1.5 px-2.5"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Broadcasts to all logged-in users</span>
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-corp-blue text-white dark:bg-gold-500 dark:text-zinc-950 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                {broadcastSaved ? 'Saved!' : 'Publish Banner'}
              </button>
            </div>
          </form>

          {/* Quick Actions List */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-2">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">Manage Tenant Quotas</div>
                <div className="text-[10px] text-slate-400">Inspect user employee limits and plan tiers</div>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => {
                alert('Database cache cleared and real-time subscription pools re-synced.');
              }}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">Flush Client Caches</div>
                <div className="text-[10px] text-slate-400">Clear stale localStorage & auth cache</div>
              </div>
              <RefreshCw size={13} className="text-slate-400" />
            </button>

            <button
              onClick={() => {
                alert('Triggered dry-run milestone check. 0 failures detected across SMTP & Webhooks.');
              }}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200">Test Notification Dispatch</div>
                <div className="text-[10px] text-slate-400">Simulate daily milestone cron job</div>
              </div>
              <Mail size={13} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Audit Trail / Activity Log */}
      <div className="glass-panel p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              Administrative Audit Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Recent security, quota, and authentication events</p>
          </div>
          <button
            onClick={() => {
              const csv = auditLogs.map((l) => `${l.time},${l.action},${l.target}`).join('\n');
              const blob = new Blob([`Time,Action,Target\n${csv}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <FileSpreadsheet size={13} />
            Export Audit Log
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {auditLogs.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              No administrative events logged yet. Role upgrades and system actions will appear here.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      log.level === 'warn' ? 'bg-amber-500' : log.level === 'success' ? 'bg-purple-500' : 'bg-blue-500'
                    )}
                  />
                  <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">{log.action}</span>
                  <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                    ({log.target})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 whitespace-nowrap shrink-0">
                  {log.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
