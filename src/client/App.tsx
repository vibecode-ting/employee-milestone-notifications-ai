// ── App.tsx ───────────────────────────────────────────────────────────────────
// CultureOS AI — 4-Zone Master Layout
// Zone 1: Judge Demo Banner (top sticky)
// Zone 2: Left Navigation Sidebar (260px)
// Zone 3: Main Workspace (dynamic content area)
// Zone 4: AI Copilot Chat Drawer (slide-over right panel)

import React, { useState, useCallback, useEffect } from 'react';
import { LanguageProvider, useLanguage, LanguageSwitcher } from './i18n/LanguageContext';
import DashboardView from './components/DashboardView';
import EmployeeDataHub from './components/EmployeeDataHub';
import EmailSettingsView from './components/EmailSettingsView';
import AiCopilotChat from './components/AiCopilotChat';
import VoiceCommandOrb from './components/VoiceCommandOrb';

export type NavView = 'dashboard' | 'employees' | 'email' | 'copilot' | 'logs';

// ── Judge Demo Banner ─────────────────────────────────────────────────────────
function JudgeDemoBanner() {
  const { t } = useLanguage();
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      alert(`✅ Seeded ${data.count ?? 'JAPAC'} employees successfully!`);
    } catch (e) {
      alert('Seeding failed — check console');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSendCard = async () => {
    if (!testEmail) return;
    setSending(true);
    try {
      const res = await fetch('/api/celebrate/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      setSent(true);
      if (data.previewUrl) {
        window.open(data.previewUrl, '_blank');
      }
    } catch (e) {
      alert('Failed to send card — check SMTP config');
    } finally {
      setSending(false);
    }
  };

  if (collapsed) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 flex items-center justify-between text-xs">
        <span>⚡ {t('judgeBar')}</span>
        <button onClick={() => setCollapsed(false)} className="underline opacity-70">expand</button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-2.5 flex flex-wrap items-center gap-3">
      <span className="font-bold text-sm whitespace-nowrap">{t('judgeBar')}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleSeed}
          disabled={seedLoading}
          className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-60 whitespace-nowrap"
        >
          {seedLoading ? '⏳ Seeding...' : t('seedData')}
        </button>
        <div className="flex items-center gap-1.5">
          <input
            type="email"
            placeholder="your@email.com"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            className="text-gray-900 text-xs px-2.5 py-1.5 rounded-full w-44 outline-none"
          />
          <button
            onClick={handleSendCard}
            disabled={sending || !testEmail}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-60 whitespace-nowrap"
          >
            {sending ? '⏳ Sending...' : sent ? '✅ Sent!' : t('sendTestCard')}
          </button>
        </div>
      </div>
      <button onClick={() => setCollapsed(true)} className="ml-auto text-white/50 hover:text-white/80 text-xs">✕</button>
    </div>
  );
}

// ── Left Sidebar ──────────────────────────────────────────────────────────────
interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  autoEmailOn: boolean;
  onToggleAutoEmail: () => void;
  emailProvider: string;
}

function Sidebar({ activeView, onNavigate, autoEmailOn, onToggleAutoEmail, emailProvider }: SidebarProps) {
  const { t } = useLanguage();

  const navItems: { id: NavView; icon: string; labelKey: string }[] = [
    { id: 'dashboard', icon: '📊', labelKey: 'navDashboard' },
    { id: 'employees', icon: '👥', labelKey: 'navEmployeeHub' },
    { id: 'email', icon: '✉️', labelKey: 'navEmailSettings' },
    { id: 'copilot', icon: '🤖', labelKey: 'navAiCopilot' },
    { id: 'logs', icon: '📜', labelKey: 'navAuditLogs' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">C</div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">{t('appTitle')}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 script-safe" style={{ fontSize: '10px' }}>{t('appSubtitle')}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              script-safe text-left
              ${
                activeView === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }
            `}
          >
            <span>{item.icon}</span>
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>

      {/* Master Auto-Email Toggle */}
      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 script-safe">{t('masterAutoEmail')}</span>
            <button
              onClick={onToggleAutoEmail}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                autoEmailOn ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
              role="switch"
              aria-checked={autoEmailOn}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                autoEmailOn ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {autoEmailOn ? (
              <span className="text-emerald-600 dark:text-emerald-400">🟢 {emailProvider} • Active</span>
            ) : (
              <span className="text-amber-600">⚪ Paused</span>
            )}
          </div>
          <button
            onClick={() => onNavigate('email')}
            className="text-xs text-indigo-600 dark:text-indigo-400 underline mt-1 hover:no-underline"
          >
            Configure →
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Header Bar ────────────────────────────────────────────────────────────────
function HeaderBar({ activeView, onOpenCopilot }: { activeView: NavView; onOpenCopilot: () => void }) {
  const { t } = useLanguage();

  const viewTitles: Record<NavView, string> = {
    dashboard: t('navDashboard'),
    employees: t('navEmployeeHub'),
    email: t('navEmailSettings'),
    copilot: t('navAiCopilot'),
    logs: t('navAuditLogs'),
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-5 gap-4 shrink-0">
      <h1 className="text-base font-semibold text-slate-800 dark:text-white script-safe">{viewTitles[activeView]}</h1>
      <div className="flex-1">
        <button
          onClick={onOpenCopilot}
          className="w-full max-w-md flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <span>🔍</span>
          <span className="script-safe">{t('copilotPlaceholder')}</span>
          <span className="ml-auto text-xs text-slate-400">⌘K</span>
        </button>
      </div>
      <LanguageSwitcher />
    </header>
  );
}

// ── Main App Shell ────────────────────────────────────────────────────────────
function AppShell() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [autoEmailOn, setAutoEmailOn] = useState(true);
  const [emailProvider, setEmailProvider] = useState('Ethereal Sandbox');

  // Load settings from API
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (typeof d.enableAutoEmail === 'boolean') setAutoEmailOn(d.enableAutoEmail);
        if (d.emailProvider) setEmailProvider(d.emailProvider.replace('_', ' '));
      })
      .catch(() => {});
  }, []);

  const handleToggleAutoEmail = useCallback(async () => {
    const newVal = !autoEmailOn;
    setAutoEmailOn(newVal);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enableAutoEmail: newVal }),
      });
    } catch {}
  }, [autoEmailOn]);

  const handleNavigate = useCallback((view: NavView) => {
    setActiveView(view);
    if (view === 'copilot') setCopilotOpen(true);
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} />;
      case 'employees': return <EmployeeDataHub />;
      case 'email': return <EmailSettingsView onSettingsChanged={() => { fetch('/api/settings').then(r=>r.json()).then(d => { if(d.emailProvider) setEmailProvider(d.emailProvider); }); }} />;
      case 'copilot': return <AiCopilotChat isDrawer={false} />;
      case 'logs': return <AuditLogsView />;
      default: return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Zone 1: Judge Demo Banner */}
      <JudgeDemoBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Zone 2: Left Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          autoEmailOn={autoEmailOn}
          onToggleAutoEmail={handleToggleAutoEmail}
          emailProvider={emailProvider}
        />

        {/* Zone 3: Main Workspace */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <HeaderBar activeView={activeView} onOpenCopilot={() => setCopilotOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">
            {renderView()}
          </main>
        </div>

        {/* Zone 4: AI Copilot Drawer (slide-over) */}
        <VoiceCommandOrb onCommandTranscribed={(txt) => { setCopilotOpen(true); }} />

        {copilotOpen && (
          <div className="w-96 bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">🤖 AI Copilot</span>
              <button
                onClick={() => setCopilotOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >✕</button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AiCopilotChat isDrawer={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Audit Logs View (inline, lightweight) ─────────────────────────────────────
function AuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs?limit=50')
      .then(r => r.json())
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading delivery logs...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white">📜 Delivery Audit Logs</h2>
      {logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          No emails sent yet. Send a celebration card to see logs here.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Recipient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{log.recipientEmail}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.eventType === 'BIRTHDAY' ? '🎂 Birthday' : '🏆 Anniversary'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.deliveryStatus === 'sent'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : log.deliveryStatus === 'preview'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.deliveryStatus === 'sent' ? '✅ Sent' : log.deliveryStatus === 'preview' ? '👁 Preview' : '❌ Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(log.sentAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {log.previewUrl && (
                      <a href={log.previewUrl} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 text-xs underline hover:no-underline">
                        View Email →
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Root Export ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}
