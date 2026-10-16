import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n, { LOCALES } from '../lib/i18n';
import { Sparkles, Mail, Lock, CheckCircle2, Sun, Moon, Info, ArrowRight } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginDemo, loginWithGoogle, sendPasswordlessLink } = useAuth();
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifyingLink, setVerifyingLink] = useState(false);

  // Auto sign-up countdown state (5 seconds)
  const [newAccountCountdown, setNewAccountCountdown] = useState<number | null>(null);

  // Dark mode state
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  function handleLanguageChange(code: string) {
    i18n.changeLanguage(code);
  }

  // Handle countdown timer for new registered account
  useEffect(() => {
    if (newAccountCountdown === null) return;
    if (newAccountCountdown <= 0) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => {
      setNewAccountCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [newAccountCountdown, navigate]);

  // Automatically detect and handle Firebase Passwordless Email Link callback
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setVerifyingLink(true);
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');

      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email to complete sign in') || '';
      }

      if (emailForSignIn) {
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            navigate('/');
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : 'Failed to sign in with email link');
          })
          .finally(() => {
            setVerifyingLink(false);
          });
      } else {
        setVerifyingLink(false);
        setError('Email confirmation required to complete sign in.');
      }
    }
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'magic-link') {
        await sendPasswordlessLink(email);
        setSuccessMsg(`Magic Link sent to ${email}. Check your email to sign in.`);
      } else {
        // Try standard sign-in first
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/');
        } catch (signInErr: any) {
          // If first time email or invalid credentials, auto-register
          const errCode = signInErr?.code || '';
          if (
            errCode === 'auth/invalid-credential' ||
            errCode === 'auth/user-not-found' ||
            errCode === 'auth/wrong-password'
          ) {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              // Trigger 5-second countdown warning box
              setNewAccountCountdown(5);
              return;
            } catch (signUpErr: any) {
              // If account creation also failed (e.g. password too weak), show clear message
              throw signUpErr;
            }
          }
          throw signInErr;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleDemoLogin() {
    loginDemo('admin');
    navigate('/');
  }

  if (verifyingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel w-full max-w-sm p-8 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-corp-blue dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-100">Verifying Magic Link…</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Signing you in securely without a password.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative animate-in fade-in duration-500">
      {/* Top Bar with Language Selector and Theme Toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          aria-label={t('Language')}
          className="text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-corp-blue"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.code.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          onClick={toggleDark}
          aria-label={dark ? t('Light Mode') : t('Dark Mode')}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-300 shadow-sm hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Main Login Card - Fixed uniform min-height to prevent jitter across tabs */}
      <div className="glass-panel w-full max-w-sm p-8 min-h-[580px] flex flex-col justify-between">
        <div>
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.svg" alt="Milestone" className="w-10 h-10 text-corp-blue" />
            <span className="text-xl font-bold text-corp-blue dark:text-gold-500">Milestone</span>
          </div>

          {/* Tab Mode Toggle */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-800 p-1 mb-6 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'password'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Lock size={13} />
              {t('Password')}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('magic-link');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'magic-link'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Mail size={13} />
              {t('Magic Link')}
            </button>
          </div>

          {/* Auto Sign-Up 5-Second Countdown Warning Box */}
          {newAccountCountdown !== null && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs space-y-2 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
                  {t('New account created')} <span className="font-mono text-sm underline">{newAccountCountdown}s</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:opacity-80 transition-opacity font-bold flex items-center gap-1"
                >
                  {t('Skip')} <ArrowRight size={11} />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {t('Beta notice')}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                {t('Email')}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
                placeholder="you@company.com"
              />
            </div>

            {/* Stable Height Space for Password or Magic Link Info */}
            <div className="min-h-[72px]">
              {authMode === 'password' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    {t('Password')}
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input"
                    placeholder="••••••••"
                  />
                </div>
              ) : (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs border border-blue-200/60 dark:border-blue-900/40">
                  <Info size={15} className="shrink-0 mt-0.5 text-blue-500" />
                  <span className="leading-snug">{t('Beta notice')}</span>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            {successMsg && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newAccountCountdown !== null}
              className="btn-primary w-full py-2.5 disabled:opacity-60 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {authMode === 'magic-link' ? 'Sending Magic Link…' : 'Signing In…'}
                </span>
              ) : authMode === 'magic-link' ? (
                t('Send Magic Link')
              ) : (
                t('Sign In')
              )}
            </button>
          </form>
        </div>

        {/* Bottom Social / Demo section */}
        <div>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/90 dark:bg-zinc-900/90 px-2 text-slate-400">
                {t('or continue with')}
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || newAccountCountdown !== null}
            type="button"
            className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mb-2.5 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {googleLoading ? 'Signing in with Google…' : t('Sign in with Google')}
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={newAccountCountdown !== null}
            type="button"
            className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 bg-gradient-to-r hover:from-purple-500/10 hover:to-indigo-500/10"
          >
            <Sparkles size={14} className="text-purple-500" />
            {t('Demo Mode (Offline Admin)')}
          </button>
        </div>
      </div>
    </div>
  );
}
