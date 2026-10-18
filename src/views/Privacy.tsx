import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, Server } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Shield size={13} />
            <span>Privacy Policy • Active</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Last updated: October 18, 2026. HR Chronicle AI is dedicated to protecting the personal milestones and privacy of individuals, families, teams, and organizations worldwide.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-base">
              <Eye size={18} />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              We collect information you provide directly: milestone dates (birthdays, jubilees, anniversaries, special life events), recipient names, contact preferences (email, chat hooks), and optional greeting styles. For enterprise rosters, Excel/CSV files are processed safely with strict tenant isolation.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-base">
              <Lock size={18} />
              <h2>2. How We Use Milestone Data</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your data is solely utilized to calculate upcoming anniversaries and birthdays, schedule notifications with chosen lead times (T-30d, T-7d, T-1d, Day of), and synthesize thoughtful greetings via Google Gemini AI. We never sell, rent, or monetize your dates or contact information.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <Database size={18} />
              <h2>3. Data Isolation & Security</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              All account information is stored securely in Firebase Firestore guarded by granular Security Rules tied to your verified user ID. Payment slips uploaded for wallet subscriptions are scanned on-device using client-side HTML5 Canvas computer vision, ensuring sensitive financial images never leave your browser.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
              <Server size={18} />
              <h2>4. AI Processing Transparency</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Celebration greeting synthesis runs on Google Gemini models. Prompts pass only the necessary contextual details (name, milestone type, cultural language preference). Prompts and outputs are never stored for third-party model training.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-base">
              <FileText size={18} />
              <h2>5. User Rights & Account Deletion</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              You retain total control over your data. You may add, edit, export, or permanently delete milestone entries, contact channels, or your full account at any time directly through the Settings panel.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          HR Chronicle AI • Milestone Intelligence Copilot for Human Beings • 2026
        </div>
      </div>
    </div>
  );
}

