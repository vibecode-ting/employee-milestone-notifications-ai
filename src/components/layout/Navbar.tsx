import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Settings, Shield, Zap, Moon, Sun, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n, { LOCALES } from '../../lib/i18n';
import { cn } from '../../lib/utils';
import { PLAN_NAMES, PLAN_LIMITS } from '../../types';

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
  const { appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

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

  const planName = (appUser && appUser.role && PLAN_NAMES[appUser.role]) ? PLAN_NAMES[appUser.role] : 'Free Plan';
  const limit = (appUser && appUser.role && PLAN_LIMITS[appUser.role] !== undefined) ? PLAN_LIMITS[appUser.role] : 100;
  const limitLabel = limit === Infinity ? '∞' : limit;

  return (
    <>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={cn(
          'fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300',
          'border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950',
          'shadow-md',
          open ? 'w-72' : 'w-20',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 shrink-0">
          <img src="/logo.svg" alt="Milestone" className={cn('transition-all duration-300', open ? 'w-12' : 'w-8')} />
          {open && <span className="font-bold text-lg text-corp-blue dark:text-gold-500 whitespace-nowrap">Milestone</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 overflow-hidden">
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
        </nav>

        {/* Bottom section */}
        <div className="px-2 pb-4 space-y-2 shrink-0">
          {/* User info */}
          <div className={cn('glass-panel px-3 py-2', open ? 'block' : 'hidden')}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-corp-blue dark:bg-gold-500 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-sm shrink-0">
                {appUser?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-white truncate">{appUser?.email}</div>
                <div className={cn('text-xs',
                  appUser?.role === 'pro_plus' ? 'text-purple-600 dark:text-purple-400' :
                  appUser?.role === 'pro' ? 'text-corp-blue dark:text-gold-500' :
                  appUser?.role === 'admin' ? 'text-emerald-600 dark:text-emerald-400' :
                  'text-slate-500 dark:text-zinc-500',
                )}>
                  {t(planName)}
                  {appUser?.role === 'pro_plus' && <Zap size={10} className="inline ml-1" />}
                  {appUser?.role === 'pro' && <Shield size={10} className="inline ml-1" />}
                </div>
                <div className="text-xs text-slate-400 dark:text-zinc-500">
                  {appUser?.role === 'admin' ? 'Platform Superuser' : `${employeeCount} / ${limitLabel}`}
                </div>
              </div>
            </div>
          </div>

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
        onClick={() => setOpen(false)}
      />
    </>
  );
}
