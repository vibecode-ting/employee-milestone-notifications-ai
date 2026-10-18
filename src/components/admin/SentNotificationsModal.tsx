import { useState, useEffect } from 'react';
import { X, Send, Bell, Trash2, Clock, Radio } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { SystemBroadcast } from '../../types';

interface SentNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SentNotificationsModal({ isOpen, onClose }: SentNotificationsModalProps) {
  const { appUser } = useAuth();
  const [draftMessage, setDraftMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const [broadcasts, setBroadcasts] = useState<SystemBroadcast[]>(() => {
    try {
      const list: SystemBroadcast[] = JSON.parse(localStorage.getItem('system_broadcasts_list') || '[]');
      const single = localStorage.getItem('admin_system_broadcast');
      if (single && !list.some((b) => b.message === single)) {
        list.unshift({
          id: 'init-broadcast',
          message: single,
          createdAt: new Date().toISOString(),
          active: true,
          createdBy: 'admin',
        });
      }
      return list;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!isOpen) return;

    try {
      const unsub = onSnapshot(collection(db, 'system_broadcasts'), (snapshot) => {
        const items: SystemBroadcast[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            message: d.message || '',
            createdAt: d.createdAt || new Date().toISOString(),
            active: d.active !== false,
            createdBy: d.createdBy || 'admin',
          });
        });

        if (items.length > 0) {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBroadcasts(items);
          localStorage.setItem('system_broadcasts_list', JSON.stringify(items));
        }
      });
      return unsub;
    } catch {}
  }, [isOpen]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftMessage.trim();
    if (!trimmed || publishing) return;

    setPublishing(true);

    const newBroadcast: SystemBroadcast = {
      id: `sb-${Date.now()}`,
      message: trimmed,
      createdAt: new Date().toISOString(),
      active: true,
      createdBy: appUser?.email || 'admin',
    };

    // Update local storage
    try {
      const stored: SystemBroadcast[] = JSON.parse(localStorage.getItem('system_broadcasts_list') || '[]');
      const updated = [newBroadcast, ...stored.filter((b) => b.message !== trimmed)].slice(0, 30);
      localStorage.setItem('system_broadcasts_list', JSON.stringify(updated));
      localStorage.setItem('admin_system_broadcast', trimmed);
      setBroadcasts(updated);
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Save to Firestore
    try {
      await addDoc(collection(db, 'system_broadcasts'), {
        message: newBroadcast.message,
        createdAt: newBroadcast.createdAt,
        active: true,
        createdBy: newBroadcast.createdBy,
      });
    } catch (err) {
      console.warn('Firestore write fallback:', err);
    }

    setDraftMessage('');
    setPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 2500);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const next = !currentActive;
    setBroadcasts((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, active: next } : b));
      try {
        localStorage.setItem('system_broadcasts_list', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return updated;
    });

    try {
      await updateDoc(doc(db, 'system_broadcasts', id), { active: next });
    } catch {}
  };

  const handleDelete = async (id: string) => {
    setBroadcasts((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('system_broadcasts_list', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return updated;
    });

    try {
      await deleteDoc(doc(db, 'system_broadcasts', id));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-corp-blue/10 dark:bg-gold-500/10 text-corp-blue dark:text-gold-400 flex items-center justify-center shadow-xs">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Sent Notifications
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-corp-blue/15 text-corp-blue dark:bg-gold-500/15 dark:text-gold-400 font-mono">
                  System Announcement Banners
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Direct platform controls and tools • Broadcast live banners across all tenant sessions
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

        {/* Publish New Announcement Banner Form */}
        <form onSubmit={handlePublish} className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            Dispatch New System Announcement
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="e.g. Scheduled platform maintenance Sunday at 02:00 UTC / New Gemini 2.0 Card themes live!"
              className="flex-1 text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-corp-blue"
            />
            <button
              type="submit"
              disabled={!draftMessage.trim() || publishing}
              className="px-4 py-2 rounded-xl bg-corp-blue text-white dark:bg-gold-500 dark:text-zinc-950 font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Send size={14} />
              <span>{publishSuccess ? 'Dispatched!' : 'Dispatch Banner'}</span>
            </button>
          </div>
        </form>

        {/* Sent Broadcasts History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Sent Announcement Log ({broadcasts.length})</span>
            <span className="text-[10px] lowercase font-normal">Active banners appear on all tenant dashboards</span>
          </h3>

          {broadcasts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
              <Bell size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No system notifications dispatched yet</p>
            </div>
          ) : (
            broadcasts.map((b) => (
              <div
                key={b.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  b.active !== false
                    ? 'border-corp-blue/30 bg-corp-blue/5 dark:border-gold-500/30 dark:bg-gold-500/5'
                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          b.active !== false
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                        }`}
                      >
                        {b.active !== false ? 'Live Active' : 'Inactive'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={11} />
                        {new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-white leading-relaxed">
                      {b.message}
                    </p>
                    {b.createdBy && (
                      <p className="text-[10px] text-slate-400 mt-1">Dispatched by: {b.createdBy}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(b.id, b.active !== false)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        b.active !== false
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                      }`}
                    >
                      {b.active !== false ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
