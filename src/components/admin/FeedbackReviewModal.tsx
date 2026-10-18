import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, MessageSquare, Bug, Lightbulb, Sparkles,
  ExternalLink, Search, Clock, Laptop,
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { FeedbackItem } from '../../types';
import { GeminiBadge } from '../common/GeminiBadge';

interface FeedbackReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackReviewModal({ isOpen, onClose }: FeedbackReviewModalProps) {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_feedbacks_list') || '[]');
      if (stored.length > 0) return stored;
    } catch {}
    return [
      {
        id: 'fb-demo-1',
        title: 'Need Slack webhook notification integration',
        description: 'Currently we have Teams and Telegram, but our organization uses Slack for all milestone announcements across APAC.',
        category: 'feature',
        userId: 'demo-user-apac',
        userEmail: 'devops-lead@company.com',
        userRole: 'pro_plus',
        isDemo: true,
        telemetry: {
          ip: '203.0.113.195',
          timezone: 'Asia/Singapore',
          locale: 'en-SG',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
          screenSize: '1920x1080',
          windowSize: '1720x960',
          platform: 'Win32',
        },
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        githubDispatched: true,
      },
      {
        id: 'fb-demo-2',
        title: 'Date picker in Employee modal overflows on mobile',
        description: 'When tapping the DOB field on iPhone 14 Pro, the calendar picker overflows the viewport horizontally.',
        category: 'bug',
        userId: 'demo-user-vn',
        userEmail: 'hr.specialist@vietnam-tech.vn',
        userRole: 'pro',
        isDemo: true,
        telemetry: {
          ip: '118.69.182.42',
          timezone: 'Asia/Ho_Chi_Minh',
          locale: 'vi-VN',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
          screenSize: '393x852',
          windowSize: '393x740',
          platform: 'iPhone',
        },
        status: 'reviewed',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        githubDispatched: true,
      },
    ];
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'bug' | 'feature' | 'improvement' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTelemetry, setExpandedTelemetry] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    try {
      const unsub = onSnapshot(collection(db, 'feedback'), (snapshot) => {
        const items: FeedbackItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            title: d.title || 'Untitled Feedback',
            description: d.description || '',
            category: d.category || 'general',
            userId: d.userId || 'anonymous',
            userEmail: d.userEmail || 'unknown',
            userRole: d.userRole || 'user',
            isDemo: Boolean(d.isDemo),
            telemetry: d.telemetry,
            status: d.status || 'pending',
            createdAt: d.createdAt || new Date().toISOString(),
            githubDispatched: d.githubDispatched !== false,
          });
        });

        if (items.length > 0) {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setFeedbacks(items);
        }
      });
      return unsub;
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    function handleUpdate() {
      try {
        const stored = JSON.parse(localStorage.getItem('app_feedbacks_list') || '[]');
        if (stored.length > 0) {
          setFeedbacks(stored);
        }
      } catch {}
    }
    window.addEventListener('feedbacks_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('feedbacks_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    setFeedbacks((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f));
      try {
        localStorage.setItem('app_feedbacks_list', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await updateDoc(doc(db, 'feedback', id), { status: newStatus });
    } catch {}
  };

  const toggleTelemetry = (id: string) => {
    setExpandedTelemetry((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesCategory = activeFilter === 'all' || f.category === activeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <MessageSquare size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  {t('Admin Feedback Review')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono">
                  {t('{{count}} Submissions', { count: feedbacks.length })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {t('Direct triage pipeline • User submissions with diagnostic telemetry')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3.5 sm:px-5 border-b border-slate-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 flex flex-wrap items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: t('All'), count: feedbacks.length },
              { id: 'bug', label: t('Bugs'), count: feedbacks.filter((f) => f.category === 'bug').length },
              { id: 'feature', label: t('Features'), count: feedbacks.filter((f) => f.category === 'feature').length },
              { id: 'improvement', label: t('Improvements'), count: feedbacks.filter((f) => f.category === 'improvement').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-corp-blue text-white shadow-xs dark:bg-gold-500 dark:text-zinc-950'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1 rounded-full font-mono ${activeFilter === tab.id ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200 dark:bg-zinc-800'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search feedback or user...')}
              className="w-full text-xs py-1.5 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-corp-blue"
            />
          </div>
        </div>

        {/* Feedback List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
              <MessageSquare size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">{t('No feedback items match your filter')}</p>
            </div>
          ) : (
            filteredFeedbacks.map((f) => {
              const isBug = f.category === 'bug';
              const isFeature = f.category === 'feature';
              const isImprovement = f.category === 'improvement';

              return (
                <div
                  key={f.id}
                  className="rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-4 transition-all shadow-xs hover:border-slate-300 dark:hover:border-zinc-700"
                >
                  {/* Top Row: Category, Date, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isBug
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : isFeature
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : isImprovement
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {isBug ? <Bug size={11} /> : isFeature ? <Lightbulb size={11} /> : <Sparkles size={11} />}
                        <span>{t(f.category)}</span>
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={11} />
                        {new Date(f.createdAt).toLocaleDateString()} {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Status Pill & Toggle */}
                    <div className="flex items-center gap-1.5">
                      {(['pending', 'reviewed', 'resolved'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(f.id, s)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            f.status === s
                              ? s === 'resolved'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : s === 'reviewed'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 bg-slate-100 dark:bg-zinc-800'
                          }`}
                        >
                          {t(s)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed mb-3">
                    {f.description}
                  </p>

                  {/* Submitter Info & Actions */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">{f.userEmail}</span>
                      {f.userRole && <GeminiBadge role={f.userRole as any} size="sm" />}
                      {f.isDemo && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium">
                          {t('Demo User')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {f.telemetry && (
                        <button
                          type="button"
                          onClick={() => toggleTelemetry(f.id)}
                          className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:text-corp-blue dark:hover:text-gold-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Laptop size={12} />
                          <span>{expandedTelemetry[f.id] ? t('Hide Diagnostics') : t('Client Diagnostics')}</span>
                        </button>
                      )}

                      <a
                        href="https://github.com/vibecode-ting/employee-milestone-notifications-ai/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-corp-blue dark:text-gold-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        <span>GitHub Issues</span>
                      </a>
                    </div>
                  </div>

                  {/* Telemetry diagnostics drawer */}
                  {expandedTelemetry[f.id] && f.telemetry && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-800">
                      <div><span className="text-slate-400">IP:</span> {f.telemetry.ip}</div>
                      <div><span className="text-slate-400">Platform:</span> {f.telemetry.platform}</div>
                      <div><span className="text-slate-400">Resolution:</span> {f.telemetry.screenSize}</div>
                      <div><span className="text-slate-400">Timezone:</span> {f.telemetry.timezone}</div>
                      <div className="sm:col-span-2 truncate"><span className="text-slate-400">UserAgent:</span> {f.telemetry.userAgent}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
