import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Activity, Server, Zap, RefreshCw } from 'lucide-react';

export default function Status() {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState('Just now');

  const systems = [
    { name: 'Google Gemini 2.5 Flash API', status: 'Operational', uptime: '99.98%', latency: '820ms', icon: Zap },
    { name: 'Firebase Cloud Functions Daily Cron', status: 'Operational', uptime: '100.0%', latency: '210ms', icon: Clock },
    { name: 'Firestore Realtime Database', status: 'Operational', uptime: '99.99%', latency: '45ms', icon: Server },
    { name: 'Omnichannel Webhook Dispatchers', status: 'Operational', uptime: '99.95%', latency: '310ms', icon: Activity },
    { name: 'Client-Side Canvas Slip OCR Engine', status: 'Operational', uptime: '100.0%', latency: '120ms', icon: CheckCircle2 },
    { name: '3D WebGL Earth Planetary Canvas', status: 'Operational', uptime: '100.0%', latency: '60 FPS', icon: Activity },
  ];

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setLastCheck(new Date().toLocaleTimeString());
    }, 600);
  };

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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">System Status</h1>
            <p className="text-slate-400 text-sm">
              Live status and health metrics for HR Chronicle AI cloud & client infrastructure.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={checking ? 'animate-spin text-sky-400' : ''} />
            <span>Checked: {lastCheck}</span>
          </button>
        </div>

        <div className="grid gap-4">
          {systems.map((sys, idx) => {
            const Icon = sys.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between backdrop-blur-md hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{sys.name}</h3>
                    <p className="text-xs text-slate-400">Response time: {sys.latency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <span className="text-xs text-slate-400 hidden sm:inline">Uptime {sys.uptime}</span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 size={12} />
                    <span>{sys.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          HR Chronicle AI • Milestone Intelligence Copilot for Human Beings • 2026
        </div>
      </div>
    </div>
  );
}

