import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Terms() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-medium">
            <Scale size={13} />
            <span>Terms of Service • v2026.1</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Welcome to HR Chronicle AI. By creating an account, connecting delivery channels, or importing milestone rosters, you agree to these Terms.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-base">
              <CheckCircle2 size={18} />
              <h2>1. Scope of Service</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              HR Chronicle AI provides automated milestone tracking, anniversary calculation, and AI-assisted greeting generation for individuals, families, friend circles, teams, and enterprise workforces. You may use the service for personal or commercial organizational needs in accordance with your plan limits.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-base">
              <ShieldCheck size={18} />
              <h2>2. Account Responsibilities</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              You are responsible for keeping your credentials and webhook URLs secure. You represent that you have appropriate consent from individuals (colleagues, friends, or family) before storing their milestone dates and dispatching messages to their email or messaging handles.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
              <AlertTriangle size={18} />
              <h2>3. Acceptable Use & AI Safety</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              You agree not to use the automated notification service for unsolicited spam, harassment, hate speech, or deceptive communications. Our Google Gemini generative pipeline contains safety filters to prevent abusive or harmful text generation.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <HelpCircle size={18} />
              <h2>4. Subscription Plans & Payments</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Free plans include core milestone tracking up to standard capacity. Pro and Enterprise tiers offer expanded capacity, advanced AI copilots, and multi-channel webhooks. Regional wallet payments are verified via client-side slip OCR and granted immediately upon verification.
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

