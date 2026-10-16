import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  LayoutDashboard, Users, Settings, Shield, Zap, Moon, Sun, LogOut, Pin, PinOff,
  Bell, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n, { LOCALES } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import { PLAN_LIMITS, type Role, type SystemBroadcast } from '../../types';
import { GeminiBadge, GeminiAvatarRing } from '../common/GeminiBadge';
import { FeedbackModal } from './FeedbackModal';
import { NotificationsFlyout } from './NotificationsFlyout';

function cycleLocale() {
  const codes = LOCALES.map((l) => l.code);
  const idx = codes.indexOf(i18n.language as typeof codes[number]);
  i18n.changeLanguage(codes[(idx + 1) % codes.length]);
}

function currentFlag() {
  return LOCALES.find((l) => l.code === i18n.language)?.flag ?? '🇺🇸';
}

export default function Navbar({ employeeCount }: { employeeCount: number }) {
  const { t } = useTranslation();
  const { appUser, signOut, isDemo, switchDemoPlan } = useAuth();
  const navigate = useNavigate();
  const [pinned, setPinned] = useState(() => localStorage.getItem('sidebar_pinned') === 'true');
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  function togglePin(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const next = !pinned;
    setPinned(next);
    if (!next) {
      setHovered(false);
    }
    localStorage.setItem('sidebar_pinned', String(next));
  }

  const [showFeedback, setShowFeedback] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [broadcasts, setBroadcasts] = useState<SystemBroadcast[]>(() => {
    try {
      const list: SystemBroadcast[] = JSON.parse(localStorage.getItem('system_broadcasts_list') || '[]');
      const single = localStorage.getItem('admin_system_broadcast');
      if (single && !list.some((b) => b.message === single)) {
        list.unshift({
          id: 'broadcast-init',
          message: single,
          createdAt: new Date().toISOString(),
          active: true,
        });
      }
      return list;
    } catch {
      return [];
    }
  });

  const [readBroadcastIds, setReadBroadcastIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('read_broadcast_ids') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'system_broadcasts'), (snapshot) => {
        const items: SystemBroadcast[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            message: d.message || '',
            createdAt: d.createdAt || new Date().toISOString(),
            active: d.active !== false,
            createdBy: d.createdBy,
          });
        });
        if (items.length > 0) {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBroadcasts(items);
          localStorage.setItem('system_broadcasts_list', JSON.stringify(items));
        }
      });
      return unsub;
    } catch {}
  }, []);

  useEffect(() => {
    function handleStorage() {
      try {
        const stored = JSON.parse(localStorage.getItem('system_broadcasts_list') || '[]');
        setBroadcasts(stored);
      } catch {}
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleMarkBroadcastRead = (id: string) => {
    setReadBroadcastIds((prev) => {
      const updated = Array.from(new Set([...prev, id]));
      localStorage.setItem('read_broadcast_ids', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllBroadcastsRead = () => {
    const allIds = broadcasts.map((b) => b.id);
    setReadBroadcastIds(allIds);
    localStorage.setItem('read_broadcast_ids', JSON.stringify(allIds));
  };

  const unreadBroadcastsCount = broadcasts.filter((b) => !readBroadcastIds.includes(b.id)).length;

  const navItems = appUser?.role === 'admin'
    ? [
        { to: '/', icon: Shield, label: t('Admin Dashboard') || 'Admin Dashboard' },
        { to: '/admin/users', icon: Users, label: t('User Management') },
        { to: '/settings', icon: Settings, label: t('Settings') },
      ]
    : [
        { to: '/', icon: LayoutDashboard, label: t('Dashboard') },
        { to: '/employees', icon: Users, label: t('Employees') },
        { to: '/settings', icon: Settings, label: t('Settings') },
      ];

  const limit = (appUser && appUser.role && PLAN_LIMITS[appUser.role] !== undefined) ? PLAN_LIMITS[appUser.role] : 100;
  const limitLabel = limit === Infinity ? '∞' : limit;

  return (
    <>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => { if (!pinned) setHovered(true); }}
        onMouseLeave={() => { if (!pinned) setHovered(false); }}
        className={cn(
          'fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300',
          'border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950',
          'shadow-md',
          open ? 'w-72' : 'w-20',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo & Pin Header */}
        <div className="flex items-center justify-between px-4 py-5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.svg" alt="Milestone" className={cn('transition-all duration-300', open ? 'w-10' : 'w-8')} />
            {open && <span className="font-bold text-lg text-corp-blue dark:text-gold-500 whitespace-nowrap">Milestone</span>}
          </div>
          {open && (
            <button
              onClick={togglePin}
              title={pinned ? t('Unpin sidebar (auto-fold on mouse leave)') : t('Pin sidebar (always open)')}
              aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                pinned
                  ? 'bg-corp-blue/10 text-corp-blue dark:bg-gold-500/20 dark:text-gold-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
              )}
            >
              {pinned ? <Pin size={16} className="fill-current" /> : <PinOff size={16} />}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 overflow-visible">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                  isActive
                    ? 'bg-corp-blue/10 text-corp-blue dark:bg-gold-500/15 dark:text-gold-400 font-bold'
                    : 'text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50',
                )
              }
            >
              <Icon size={20} className="shrink-0" />
              {open && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}

          {/* System Notifications */}
          <div className="relative pt-1">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={t('Notifications')}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-sm font-medium cursor-pointer',
                showNotifications
                  ? 'bg-corp-blue/10 text-corp-blue dark:bg-gold-500/15 dark:text-gold-400 font-bold'
                  : 'text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              )}
            >
              <div className="relative shrink-0">
                <Bell size={20} />
                {unreadBroadcastsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                    {unreadBroadcastsCount > 9 ? '9+' : unreadBroadcastsCount}
                  </span>
                )}
              </div>
              {open && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="whitespace-nowrap">{t('Notifications')}</span>
                  {unreadBroadcastsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white font-mono">
                      {unreadBroadcastsCount}
                    </span>
                  )}
                </div>
              )}
            </button>

            <NotificationsFlyout
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              broadcasts={broadcasts}
              readIds={readBroadcastIds}
              onMarkRead={handleMarkBroadcastRead}
              onMarkAllRead={handleMarkAllBroadcastsRead}
            />
          </div>

          {/* Feedback Button */}
          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            aria-label={t('Feedback')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium cursor-pointer"
          >
            <MessageSquare size={20} className="shrink-0 text-amber-500 dark:text-amber-400" />
            {open && <span className="whitespace-nowrap">{t('Feedback')}</span>}
          </button>
        </nav>

        {/* Bottom section */}
        <div className="px-2 pb-4 space-y-2 shrink-0">
          {/* User info */}
          {open ? (
            <div className="glass-panel px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <GeminiAvatarRing role={appUser?.role}>
                  {appUser?.photoURL ? (
                    <img
                      src={appUser.photoURL}
                      alt={appUser.email}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-corp-blue dark:bg-gold-500 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm shrink-0">
                      {appUser?.email?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                </GeminiAvatarRing>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-800 dark:text-white truncate">{appUser?.email}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {appUser && <GeminiBadge role={appUser.role} size="sm" />}
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                      {appUser?.role === 'admin' ? 'Superuser' : `${employeeCount}/${limitLabel}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <GeminiAvatarRing role={appUser?.role}>
                {appUser?.photoURL ? (
                  <img
                    src={appUser.photoURL}
                    alt={appUser.email}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-corp-blue dark:bg-gold-500 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm shrink-0">
                    {appUser?.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </GeminiAvatarRing>
            </div>
          )}

          {/* Demo Plan Switcher */}
          {isDemo && (
            <div className={cn('rounded-xl border p-2 transition-all', 'bg-purple-500/10 border-purple-500/20')}>
              <div className="flex items-center justify-between text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">
                <span>{open ? 'Demo Plan' : 'Demo'}</span>
                {open && <span className="text-[9px] uppercase tracking-wider font-mono bg-purple-500/20 px-1 py-0.5 rounded">1-Click</span>}
              </div>
              {open ? (
                <div className="grid grid-cols-2 gap-1">
                  {(['user', 'pro', 'pro_plus', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchDemoPlan(r)}
                      className={cn(
                        'px-1.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer text-center',
                        appUser?.role === r
                          ? 'bg-purple-600 text-white shadow-xs font-bold'
                          : 'text-purple-700 dark:text-purple-300 hover:bg-purple-500/20'
                      )}
                    >
                      {r === 'pro_plus' ? 'Ultra' : r === 'user' ? 'Free' : r.toUpperCase()}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => {
                    const roles: Role[] = ['user', 'pro', 'pro_plus', 'admin'];
                    const next = roles[(roles.indexOf(appUser?.role || 'user') + 1) % roles.length];
                    switchDemoPlan(next);
                  }}
                  title="Click to cycle Demo plan"
                  className="w-full text-[10px] font-bold py-1 bg-purple-600 text-white rounded text-center cursor-pointer"
                >
                  {appUser?.role === 'pro_plus' ? 'U' : appUser?.role?.[0]?.toUpperCase()}
                </button>
              )}
            </div>
          )}

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            aria-label={dark ? t('Light Mode') : t('Dark Mode')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-sm cursor-pointer"
          >
            {dark ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            {open && <span>{dark ? t('Light Mode') : t('Dark Mode')}</span>}
          </button>

          {/* Language */}
          <button
            onClick={cycleLocale}
            aria-label={t('Language')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-sm cursor-pointer"
          >
            <span className="text-lg shrink-0">{currentFlag()}</span>
            {open && <span>{t('Language')}: <span className="font-semibold text-slate-800 dark:text-zinc-200">{LOCALES.find((l) => l.code === i18n.language)?.name || i18n.language}</span></span>}
          </button>

          {/* Upgrade — free users only */}
          {appUser?.role === 'user' && (
            <button
              onClick={() => navigate('/pricing')}
              aria-label={t('Upgrade to PRO')}
              className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-3"
            >
              <Zap size={20} className="shrink-0" />
              {open && <span>{t('Upgrade to PRO')}</span>}
            </button>
          )}

          {/* Sign out */}
          <button
            onClick={signOut}
            aria-label={t('Sign Out')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut size={20} className="shrink-0" />
            {open && <span>{t('Sign Out')}</span>}
          </button>
        </div>
      </aside>

      {/* Main content offset */}
      <div
        className={cn('transition-all duration-300', open ? 'ml-72' : 'ml-20')}
        onClick={() => {
          if (!pinned) setHovered(false);
        }}
      />

      {/* Feedback Modal */}
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </>
  );
}
