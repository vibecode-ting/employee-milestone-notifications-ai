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
import { Sparkles, Mail, Lock, CheckCircle2, Sun, Moon, Info, ArrowRight, Globe } from 'lucide-react';

// ---------- Slide components ----------

function Slide0() {
  return (
    <>
      <iframe
        src="/earth.html"
        title="JAPAC 3D Earth Network"
        className="w-full h-full absolute inset-0 border-0"
        loading="eager"
      />
      <div className="absolute top-5 left-5 z-10 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-slate-200 text-xs font-medium shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>JAPAC Milestone Intelligence Network</span>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 z-10 pointer-events-none">
        <div className="text-center px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">JAPAC Milestone Intelligence Network</h1>
          <p className="mt-3 text-slate-300 text-base drop-shadow">Real-time employee milestone tracking across Asia Pacific</p>
        </div>
      </div>
    </>
  );
}

function Slide1({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="text-8xl mb-6">🎂</div>
      <h2 className="text-3xl font-bold text-white mb-3">Never miss a milestone</h2>
      <p className="text-slate-400 text-base mb-8 max-w-sm">Automated birthday and work anniversary notifications — delivered before the day arrives.</p>
      <div className="flex flex-col gap-2 w-full max-w-xs mb-8">
        {[
          { name: 'Sarah Chen', event: 'Birthday', when: 'Tomorrow' },
          { name: 'David Park', event: '5yr Anniversary', when: 'in 3d' },
          { name: 'Aung Myint', event: 'Birthday', when: 'in 7d' },
        ].map((c) => (
          <div key={c.name} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 text-sm">
            <span className="text-white font-medium">{c.name}</span>
            <span className="text-slate-400">{c.event}</span>
            <span className="text-yellow-400 font-semibold">{c.when}</span>
          </div>
        ))}
      </div>
      <button onClick={onSignIn} className="bg-yellow-500 text-zinc-900 font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">Sign In</button>
    </div>
  );
}

function Slide2({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="flex gap-6 mb-8">
        {[{ icon: '📧', label: 'Email' }, { icon: '💬', label: 'Teams' }, { icon: '✈️', label: 'Telegram' }].map((ch) => (
          <div key={ch.label} className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-slate-800 border border-slate-700/60 text-4xl shadow-lg">{ch.icon}</div>
            <span className="text-slate-300 text-sm font-medium">{ch.label}</span>
          </div>
        ))}
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Notify everywhere</h2>
      <p className="text-slate-400 text-base mb-8 max-w-sm">Send milestone messages via Email, Teams, or Telegram — with one click.</p>
      <button onClick={onSignIn} className="bg-yellow-500 text-zinc-900 font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">Sign In</button>
    </div>
  );
}

function Slide3({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="flex gap-3 mb-8 text-4xl">
        {'🇺🇸 🇲🇲 🇹🇼 🇻🇳 🇰🇷 🇯🇵 🇭🇰'.split(' ').map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Built for JAPAC teams</h2>
      <p className="text-slate-400 text-base mb-8 max-w-sm">Full multilingual support for teams across Asia Pacific.</p>
      <button onClick={onSignIn} className="bg-yellow-500 text-zinc-900 font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">Sign In</button>
    </div>
  );
}

function Slide4({ onSignIn }: { onSignIn: () => void }) {
  const bars = [42, 78, 55, 91, 63, 38, 70];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="flex items-end gap-3 mb-8 h-28">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-8 rounded-t-md"
              style={{ height: `${h}%`, backgroundColor: '#eab308' }}
            />
            <span className="text-slate-400 text-xs">{days[i]}</span>
          </div>
        ))}
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Milestone insights at a glance</h2>
      <p className="text-slate-400 text-base mb-8 max-w-sm">7-day activity, headcount by department, upcoming events — all in one dashboard.</p>
      <button onClick={onSignIn} className="bg-yellow-500 text-zinc-900 font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">Sign In</button>
    </div>
  );
}

// ---------- Main component ----------

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

  // Slideshow state
  const [slideIndex, setSlideIndex] = useState(0);
  const [loginVisible, setLoginVisible] = useState(false);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  function handleLanguageChange(code: string) {
    i18n.changeLanguage(code);
  }

  // Slideshow timer
  useEffect(() => {
    if (loginVisible) return;
    const id = setInterval(() => {
      setSlideIndex(prev => {
        if (prev >= 4) {
          setLoginVisible(true);
          return prev;
        }
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [loginVisible]);

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
        setSuccessMsg(t('Magic Link sent'));
      } else {
        // Try standard sign-in first
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/');
        } catch (signInErr: any) {
          const errCode = signInErr?.code || '';
          if (errCode === 'auth/wrong-password') {
            throw new Error('Incorrect password. Please try again.');
          }

          // If first time email or invalid credentials, auto-register
          if (
            errCode === 'auth/invalid-credential' ||
            errCode === 'auth/user-not-found'
          ) {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              // Trigger 5-second countdown redirect
              setNewAccountCountdown(5);
              return;
            } catch (signUpErr: any) {
              const signUpCode = signUpErr?.code || '';
              if (signUpCode === 'auth/email-already-in-use') {
                throw new Error('Incorrect password. Please try again.');
              }
              if (signUpCode === 'auth/weak-password') {
                throw new Error('Password should be at least 6 characters.');
              }
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

  const slides = [
    <Slide0 key={0} />,
    <Slide1 key={1} onSignIn={() => setLoginVisible(true)} />,
    <Slide2 key={2} onSignIn={() => setLoginVisible(true)} />,
    <Slide3 key={3} onSignIn={() => setLoginVisible(true)} />,
    <Slide4 key={4} onSignIn={() => setLoginVisible(true)} />,
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-slate-950 relative selection:bg-corp-blue selection:text-white overflow-hidden">
      {/* Left: Slideshow Hero (65%) */}
      <div className="w-full md:w-[65%] h-[360px] md:h-auto min-h-[360px] md:min-h-screen relative overflow-hidden bg-slate-950 shrink-0">
        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${slideIndex === i ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {slide}
          </div>
        ))}

        {/* Skip intro */}
        <button
          onClick={() => setLoginVisible(true)}
          className="absolute top-4 right-4 z-20 text-white/60 hover:text-white text-xs transition-colors"
        >
          Skip intro
        </button>

        {/* Progress dots */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${slideIndex === i ? 'bg-yellow-400 scale-125' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Right: Login panel (35%), slides in after intro */}
      <div
        className={`w-full md:w-[35%] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 shrink-0 bg-slate-50 dark:bg-zinc-950 md:border-l md:border-slate-200 dark:md:border-zinc-800 shadow-2xl z-10 min-h-screen transition-transform duration-700 ease-out ${loginVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        {/* Language and Theme Switch ABOVE login panel */}
        <div className="glass-panel w-full max-w-sm px-3.5 py-2 mb-3 flex items-center justify-between gap-2.5 shadow-sm">
          {/* Language Selector */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Globe size={15} className="text-slate-400 shrink-0" />
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label={t('Language')}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-corp-blue cursor-pointer truncate"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDark}
            type="button"
            aria-label={dark ? t('Light Mode') : t('Dark Mode')}
            className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-300 shadow-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0 cursor-pointer"
          >
            {dark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-500" />}
            <span>{dark ? t('Light Mode') : t('Dark Mode')}</span>
          </button>
        </div>

        {/* Main Login Card */}
        <div className="glass-panel w-full max-w-sm p-6 sm:p-8 min-h-[560px] flex flex-col justify-between shadow-lg">
          <div>
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="Milestone" className="w-10 h-10 text-corp-blue" />
              <span className="text-xl font-bold text-corp-blue dark:text-gold-500">Milestone</span>
            </div>

            {/* Tab Mode Toggle */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-800 p-1 mb-5 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'password'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
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
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'magic-link'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Mail size={13} />
                {t('Magic Link')}
              </button>
            </div>

            {/* Auto Sign-Up 5-Second Countdown Warning Box */}
            {newAccountCountdown !== null && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                    {t('New account created')} <span className="font-mono text-sm underline">{newAccountCountdown}s</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 hover:opacity-80 transition-opacity font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {t('Skip')} <ArrowRight size={11} />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {t('Redirecting to dashboard')}
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
                  disabled={loading || newAccountCountdown !== null}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  placeholder="you@company.com"
                />
              </div>

              {authMode === 'password' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Password')}
                    </label>
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      disabled={loading || newAccountCountdown !== null}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Beta notice for Password TAB */}
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs border border-amber-200/60 dark:border-amber-900/40">
                    <Info size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span className="leading-snug">{t('Beta notice')}</span>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Magic Link Note */}
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs border border-blue-200/60 dark:border-blue-900/40">
                    <Info size={15} className="shrink-0 mt-0.5 text-blue-500" />
                    <span className="leading-snug">{t('Magic Link info')}</span>
                  </div>
                </div>
              )}

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
                className="btn-primary w-full py-2.5 disabled:opacity-60 text-sm cursor-pointer"
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
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-900 px-2 text-slate-400">
                  {t('or continue with')}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || newAccountCountdown !== null}
              type="button"
              className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mb-2.5 disabled:opacity-60 cursor-pointer"
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
              className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 bg-gradient-to-r hover:from-purple-500/10 hover:to-indigo-500/10 cursor-pointer"
            >
              <Sparkles size={14} className="text-purple-500" />
              {t('Demo Mode')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
