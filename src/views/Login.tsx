import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    loginDemo('admin');
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="glass-panel w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.svg" alt="Milestone" className="w-10 h-10 text-corp-blue" />
          <span className="text-xl font-bold text-corp-blue dark:text-gold-500">Milestone</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60 text-sm">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 dark:bg-zinc-900/80 px-2 text-slate-400">or preview</span>
          </div>
        </div>

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
