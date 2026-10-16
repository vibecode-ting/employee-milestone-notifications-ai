import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function Login() {
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

  // Automatically detect and handle Firebase Passwordless Email Link callback
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setVerifyingLink(true);
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');

      if (!emailForSignIn) {
        // Opened on another browser/device without local storage
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
        setSuccessMsg(`Sign-in link sent to ${email}. Check your email to sign in.`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
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
          <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-100">Verifying Email Link…</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Signing you in securely without a password.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="glass-panel w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.svg" alt="Milestone" className="w-10 h-10 text-corp-blue" />
          <span className="text-xl font-bold text-corp-blue dark:text-gold-500">Milestone</span>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-800 p-1 mb-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'password'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Lock size={13} />
            Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('magic-link'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'magic-link'
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Mail size={13} />
            Email Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Email</label>
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

          {authMode === 'password' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Password</label>
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
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          {successMsg && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60 text-sm">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {authMode === 'magic-link' ? 'Sending link…' : 'Signing in…'}
              </span>
            ) : authMode === 'magic-link' ? (
              'Send Sign-In Link'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 dark:bg-zinc-900/80 px-2 text-slate-400">or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          type="button"
          className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mb-3 disabled:opacity-60"
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
          {googleLoading ? 'Signing in with Google…' : 'Sign in with Google'}
        </button>

        <button
          onClick={handleDemoLogin}
          type="button"
          className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 bg-gradient-to-r hover:from-purple-500/10 hover:to-indigo-500/10"
        >
          <Sparkles size={14} className="text-purple-500" />
          Demo Mode (Offline Admin)
        </button>
      </div>
    </div>
  );
}
