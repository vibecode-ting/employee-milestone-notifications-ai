import { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Bug, Lightbulb, Sparkles, CheckCircle2, Laptop, ShieldAlert, ExternalLink, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeviceTelemetry {
  ip: string;
  timezone: string;
  locale: string;
  userAgent: string;
  screenSize: string;
  windowSize: string;
  platform: string;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useTranslation();
  const { appUser, isDemo } = useAuth();

  const [category, setCategory] = useState<'bug' | 'feature' | 'improvement' | 'general'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    ip: 'Fetching...',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    locale: navigator.language || 'en-US',
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    platform: navigator.platform || 'Unknown',
  });
  const [loadingIp, setLoadingIp] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch IPv4 for telemetry (especially for demo accounts)
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    setLoadingIp(true);
    fetch('https://api.ipify.org?format=json', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.ip) {
          setTelemetry((prev) => ({ ...prev, ip: data.ip }));
        }
      })
      .catch(() => {
        if (active) {
          setTelemetry((prev) => ({ ...prev, ip: 'Unavailable (local/offline)' }));
        }
      })
      .finally(() => {
        if (active) {
          clearTimeout(timeoutId);
          setLoadingIp(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveUserId = isDemo ? telemetry.ip : (appUser?.uid || 'anonymous');
  const effectiveEmail = appUser?.email || (isDemo ? 'demo-user@milestone.app' : 'unknown');

  const categories = [
    { id: 'bug', label: t('Bug Report'), icon: Bug, color: 'text-red-500' },
    { id: 'feature', label: t('Feature Request'), icon: Lightbulb, color: 'text-amber-500' },
    { id: 'improvement', label: t('Improvement'), icon: Sparkles, color: 'text-purple-500' },
    { id: 'general', label: t('General Feedback'), icon: MessageSquare, color: 'text-corp-blue dark:text-gold-400' },
  ] as const;

  const generateIssueMarkdown = () => {
    return `### Feedback Details
**Category:** ${category.toUpperCase()}
**Title:** ${title}

### User Description
${description || 'No description provided.'}

---

### Client Diagnostics & Telemetry
| Property | Value |
| :--- | :--- |
| **Account Type** | ${isDemo ? '⚠️ DEMO Account' : 'Authenticated Tenant'} |
| **User Email** | \`${effectiveEmail}\` |
| **User ID** | \`${effectiveUserId}\` |
| **User Role** | \`${appUser?.role || 'user'}\` |
| **IPv4 Address** | \`${telemetry.ip}\` |
| **Timezone / Locale** | \`${telemetry.timezone} (${telemetry.locale})\` |
| **Screen Resolution** | \`${telemetry.screenSize}\` (Viewport: \`${telemetry.windowSize}\`) |
| **User Agent** | \`${telemetry.userAgent}\` |
| **Timestamp** | \`${new Date().toISOString()}\` |

_Submitted via In-App Feedback Pipeline_`;
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generateIssueMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const body = generateIssueMarkdown();
    const issueTitle = `[Feedback] [${category.toUpperCase()}]: ${title}`;
    const labels = `feedback,${category}${isDemo ? ',demo-user' : ''}`;
    const repoUrl = 'https://github.com/vibecode-ting/employee-milestone-notifications-ai/issues/new';
    const finalUrl = `${repoUrl}?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(labels)}`;

    // Open GitHub issue in new tab
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-corp-blue/10 dark:bg-gold-500/10 text-corp-blue dark:text-gold-400 flex items-center justify-center font-bold">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                {t('Submit App Feedback')}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {t('Direct pipeline to developer triage on GitHub')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {t('GitHub Issue Dispatched!')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {t('A new issue tab has been opened with your diagnostic telemetry and feedback. The engineering team will review it.')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copied ? t('Copied Markdown') : t('Copy Report')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setDescription('');
                  onClose();
                }}
                className="btn-primary text-xs cursor-pointer"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                {t('Feedback Type')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer',
                        isSelected
                          ? 'border-corp-blue bg-corp-blue/5 text-corp-blue dark:border-gold-500 dark:bg-gold-500/10 dark:text-gold-400 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      )}
                    >
                      <Icon size={16} className={c.color} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {t('Subject / Summary')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={category === 'bug' ? t('e.g. Milestone count incorrect on mobile') : t('e.g. Add Slack integration')}
                className="glass-input text-xs w-full py-2"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {t('Details & Reproduction Steps')}
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('Describe what happened, what you expected, or your suggestions...')}
                className="glass-input text-xs w-full py-2 resize-none"
              />
            </div>

            {/* Telemetry Information Box */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 p-3 space-y-2">
              <div
                className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
              >
                <div className="flex items-center gap-1.5">
                  <Laptop size={13} className="text-slate-400" />
                  <span>{t('Diagnostics & Telemetry Auto-Attached')}</span>
                  {isDemo && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                      <ShieldAlert size={10} /> Demo IP Tracking
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-corp-blue dark:text-gold-400 hover:underline">
                  {showDiagnostics ? t('Hide') : t('Show Details')}
                </span>
              </div>

              {showDiagnostics && (
                <div className="text-[11px] font-mono space-y-1 pt-2 border-t border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">User Email:</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">{effectiveEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isDemo ? 'User ID (IPv4):' : 'User ID:'}</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate max-w-[200px]">
                      {effectiveUserId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IPv4 Address:</span>
                    <span>{loadingIp ? 'Fetching...' : telemetry.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location / Zone:</span>
                    <span>{telemetry.timezone} ({telemetry.locale})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Screen Resolution:</span>
                    <span>{telemetry.screenSize}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? t('Copied!') : t('Copy Report')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs py-2 px-3 cursor-pointer"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} />
                  <span>{t('Dispatch to GitHub')}</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
