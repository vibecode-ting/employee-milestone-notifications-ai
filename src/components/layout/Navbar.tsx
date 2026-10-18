import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  LayoutDashboard, Users, Settings, Shield, Zap, Moon, Sun, LogOut, Pin, PinOff,
  Bell, MessageSquare, BarChart2, Bot, Radio, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n, { LOCALES } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import { PLAN_LIMITS, type Role, type SystemBroadcast } from '../../types';
import { GeminiBadge, GeminiAvatarRing } from '../common/GeminiBadge';
import { FeedbackModal } from './FeedbackModal';
import { NotificationsFlyout } from './NotificationsFlyout';
import { FeedbackReviewModal } from '../admin/FeedbackReviewModal';
import { SentNotificationsModal } from '../admin/SentNotificationsModal';

function cycleLocale() {
  const codes = LOCALES.map((l) => l.code);
  const idx = codes.indexOf(i18n.language as typeof codes[number]);
  i18n.changeLanguage(codes[(idx + 1) % codes.length]);
}

function currentFlag() {
  return LOCALES.find((l) => l.code === i18n.language)?.flag ?? '🇺🇸';
}

export default function Navbar({
  employeeCount,
  onOpenCopilot,
}: {
  employeeCount: number;
  onOpenCopilot?: () => void;
}) {
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
  const [showFeedbackReview, setShowFeedbackReview] = useState(false);
  const [showSentNotifications, setShowSentNotifications] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);

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
    if (appUser?.role !== 'admin') return;
    try {
      const unsub = onSnapshot(collection(db, 'feedback'), (snapshot) => {
        setFeedbackCount(snapshot.docs.length);
      }, () => {
        try {
          const list = JSON.parse(localStorage.getItem('app_feedbacks_list') || '[]');
          setFeedbackCount(list.length);
        } catch {}
      });
      return unsub;
    } catch {}
  }, [appUser?.role]);

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
        { to: '/analytics', icon: BarChart2, label: t('BigQuery Analytics') },
        { to: '/settings', icon: Settings, label: t('Settings') },
      ]
    : [
        { to: '/', icon: LayoutDashboard, label: t('Dashboard') },
        { to: '/employees', icon: Users, label: t('Employees') },
        { to: '/analytics', icon: BarChart2, label: t('Analytics') },
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
            <img src="/logo.svg" alt="HRChronicle AI" className={cn('transition-all duration-300', open ? 'w-10' : 'w-8')} />
            {open && <span className="font-bold text-lg text-corp-blue dark:text-cobalt-400 whitespace-nowrap">HRChronicle AI</span>}
          </div>
          {open && (
            <button
              onClick={togglePin}
              title={pinned ? t('Unpin sidebar (auto-fold on mouse leave)') : t('Pin sidebar (always open)')}
              aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                pinned
                  ? 'bg-corp-blue/10 text-corp-blue dark:bg-cobalt-500/20 dark:text-cobalt-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
              )}
            >
              {pinned ? <Pin size={16} className="fill-current" /> : <PinOff size={16} />}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1.5 overflow-visible">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'rounded-xl transition-all text-sm font-medium flex items-center',
                  open
                    ? 'gap-3 px-3 py-2.5 w-full'
                    : 'w-10 h-10 justify-center p-0 mx-auto',
                  isActive
                    ? 'bg-corp-blue/10 text-corp-blue dark:bg-cobalt-500/15 dark:text-cobalt-400 font-bold'
                    : 'text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50',
                )
              }
            >
              <Icon size={20} className="shrink-0" />
              {open && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}

          {/* Universal HR Copilot (All Roles: user, pro, pro_plus, admin) */}
          <button
            type="button"
            onClick={onOpenCopilot}
            title={t('HR Copilot')}
            aria-label={t('HR Copilot')}
            className={cn(
              'rounded-xl text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium cursor-pointer flex items-center group',
              open
                ? 'gap-3 w-full px-3 py-2.5'
                : 'w-10 h-10 justify-center p-0 mx-auto'
            )}
          >
            <div className="p-1 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
              <Bot size={18} />
            </div>
            {open && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-zinc-200">{t('HR Copilot')}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 uppercase">
                  AI OCR
                </span>
              </div>
            )}
          </button>

          {/* RBAC Modules: Admin vs Non-Admin */}
          {appUser?.role === 'admin' ? (
            <>
              {/* Admin: Sent Notifications (System Announcement Banner) */}
              <button
                type="button"
                onClick={() => setShowSentNotifications(true)}
                title={t('Sent Notifications')}
                aria-label={t('Sent Notifications')}
                className={cn(
                  'rounded-xl text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium cursor-pointer flex items-center',
                  open
                    ? 'gap-3 w-full px-3 py-2.5'
                    : 'w-10 h-10 justify-center p-0 mx-auto'
                )}
              >
                <Radio size={20} className="shrink-0 text-corp-blue dark:text-gold-400" />
                {open && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="whitespace-nowrap">{t('Sent Notifications')}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-corp-blue/15 text-corp-blue dark:bg-gold-500/15 dark:text-gold-400 font-mono">
                      {broadcasts.filter((b) => b.active !== false).length}
                    </span>
                  </div>
                )}
              </button>

              {/* Admin: Feedback Review */}
              <button
                type="button"
                onClick={() => setShowFeedbackReview(true)}
                title={t('Feedback Review')}
                aria-label={t('Feedback Review')}
                className={cn(
                  'rounded-xl text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium cursor-pointer flex items-center',
                  open
                    ? 'gap-3 w-full px-3 py-2.5'
                    : 'w-10 h-10 justify-center p-0 mx-auto'
                )}
              >
                <MessageSquare size={20} className="shrink-0 text-purple-500 dark:text-purple-400" />
                {open && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="whitespace-nowrap">{t('Feedback Review')}</span>
                    {feedbackCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono">
                        {feedbackCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Non-Admin: System Notifications */}
              <div className="relative pt-1">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title={t('Notifications')}
                  aria-label={t('Notifications')}
                  className={cn(
                    'rounded-xl transition-all text-sm font-medium cursor-pointer flex items-center',
                    open
                      ? 'gap-3 w-full px-3 py-2.5'
                      : 'w-10 h-10 justify-center p-0 mx-auto',
                    showNotifications
                      ? 'bg-corp-blue/10 text-corp-blue dark:bg-cobalt-500/15 dark:text-cobalt-400 font-bold'
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

              {/* Non-Admin: Feedback Button */}
              <button
                type="button"
                onClick={() => setShowFeedback(true)}
                title={t('Feedback')}
                aria-label={t('Feedback')}
                className={cn(
                  'rounded-xl text-slate-600 hover:bg-slate-500/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50 transition-all text-sm font-medium cursor-pointer flex items-center',
                  open
                    ? 'gap-3 w-full px-3 py-2.5'
                    : 'w-10 h-10 justify-center p-0 mx-auto'
                )}
              >
                <MessageSquare size={20} className="shrink-0 text-amber-500 dark:text-amber-400" />
                {open && <span className="whitespace-nowrap">{t('Feedback')}</span>}
              </button>
            </>
          )}
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
                    <div className="w-8 h-8 rounded-full bg-corp-blue dark:bg-cobalt-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
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
                  <div className="w-8 h-8 rounded-full bg-corp-blue dark:bg-cobalt-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {appUser?.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </GeminiAvatarRing>
            </div>
          )}

          {/* Demo Plan Switcher */}
          {isDemo && (
            open ? (
              <div className="rounded-xl border p-2.5 bg-purple-500/10 border-purple-500/25 transition-all">
                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>Demo Sandbox</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-mono bg-purple-500/20 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-bold">
                    Switch Tier
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['user', 'pro', 'pro_plus', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchDemoPlan(r)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer text-center',
                        appUser?.role === r
                          ? 'bg-purple-600 text-white shadow-xs font-bold'
                          : 'bg-white/60 dark:bg-zinc-800/60 text-purple-800 dark:text-purple-300 hover:bg-purple-500/20'
                      )}
                    >
                      {r === 'pro_plus' ? 'Ultra' : r === 'user' ? 'Free' : r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-0.5">
                <button
                  onClick={() => {
                    const roles: Role[] = ['user', 'pro', 'pro_plus', 'admin'];
                    const next = roles[(roles.indexOf(appUser?.role || 'user') + 1) % roles.length];
                    switchDemoPlan(next);
                  }}
                  title={`Current Demo Tier: ${appUser?.role === 'pro_plus' ? 'Ultra (Pro+)' : appUser?.role?.toUpperCase()} — Click to cycle tier`}
                  className="w-10 h-10 rounded-xl flex flex-col items-center justify-center bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-600 dark:text-purple-300 transition-all cursor-pointer shadow-xs group"
                >
                  <span className="text-[8px] font-mono font-bold uppercase tracking-tighter text-purple-500 dark:text-purple-400 leading-none">
                    DEMO
                  </span>
                  <span className="text-[10px] font-extrabold text-purple-700 dark:text-white mt-0.5 leading-none group-hover:scale-110 transition-transform">
                    {appUser?.role === 'pro_plus' ? 'PRO+' : appUser?.role === 'user' ? 'FREE' : appUser?.role?.toUpperCase()}
                  </span>
                </button>
              </div>
            )
          )}

          {/* Dark mode — showing current condition */}
          <button
            onClick={toggleDark}
            title={dark ? t('Dark Mode') : t('Light Mode')}
            aria-label={dark ? t('Dark Mode') : t('Light Mode')}
            className={cn(
              'rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-sm cursor-pointer flex items-center',
              open
                ? 'w-full px-3 py-2 gap-3'
                : 'w-10 h-10 justify-center p-0 mx-auto'
            )}
          >
            {dark ? <Moon size={20} className="shrink-0 text-indigo-400" /> : <Sun size={20} className="shrink-0 text-amber-500" />}
            {open && <span>{dark ? t('Dark Mode') : t('Light Mode')}</span>}
          </button>

          {/* Language */}
          <button
            onClick={cycleLocale}
            title={`${t('Language')}: ${LOCALES.find((l) => l.code === i18n.language)?.name || i18n.language}`}
            aria-label={t('Language')}
            className={cn(
              'rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-sm cursor-pointer flex items-center',
              open
                ? 'w-full px-3 py-2 gap-3'
                : 'w-10 h-10 justify-center p-0 mx-auto'
            )}
          >
            <span className="text-base shrink-0 leading-none">{currentFlag()}</span>
            {open && (
              <span className="truncate">
                {t('Language')}: <span className="font-semibold text-slate-800 dark:text-zinc-200">{LOCALES.find((l) => l.code === i18n.language)?.name || i18n.language}</span>
              </span>
            )}
          </button>

          {/* Upgrade — free users only */}
          {appUser?.role === 'user' && (
            <div className={open ? 'w-full' : 'flex justify-center'}>
              <button
                onClick={() => navigate('/pricing')}
                title={t('Upgrade to PRO')}
                aria-label={t('Upgrade to PRO')}
                className={cn(
                  'rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all shadow-md shadow-purple-500/20 cursor-pointer flex items-center',
                  open
                    ? 'w-full px-3.5 py-2.5 gap-2.5 text-xs justify-between'
                    : 'w-10 h-10 justify-center p-0'
                )}
              >
                <div className="flex items-center gap-2">
                  <Zap size={18} className="shrink-0 fill-current text-amber-300" />
                  {open && <span>{t('Upgrade to PRO')}</span>}
                </div>
                {open && (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    PRO
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={signOut}
            title={t('Sign Out')}
            aria-label={t('Sign Out')}
            className={cn(
              'rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-sm cursor-pointer flex items-center',
              open
                ? 'w-full px-3 py-2 gap-3'
                : 'w-10 h-10 justify-center p-0 mx-auto'
            )}
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

      {/* Feedback Modal (Non-admin) */}
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* Admin Operations Modals */}
      <FeedbackReviewModal
        isOpen={showFeedbackReview}
        onClose={() => setShowFeedbackReview(false)}
      />
      <SentNotificationsModal
        isOpen={showSentNotifications}
        onClose={() => setShowSentNotifications(false)}
      />
    </>
  );
}
