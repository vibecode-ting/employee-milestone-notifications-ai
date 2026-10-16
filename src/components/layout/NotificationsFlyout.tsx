import { useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, Megaphone, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import type { SystemBroadcast } from '../../types';

interface NotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  broadcasts: SystemBroadcast[];
  readIds: string[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll?: () => void;
}

export function NotificationsFlyout({
  isOpen,
  onClose,
  broadcasts,
  readIds,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}: NotificationsFlyoutProps) {
  const { t } = useTranslation();
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Dismiss on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = broadcasts.filter((b) => !readIds.includes(b.id)).length;

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  };

  return (
    <div
      ref={flyoutRef}
      className={cn(
        'absolute left-full top-0 ml-3 w-80 sm:w-96 glass-panel shadow-2xl border border-slate-200 dark:border-zinc-800 z-50 rounded-2xl overflow-hidden',
        'animate-in fade-in zoom-in-95 duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-corp-blue/10 dark:bg-gold-500/10 text-corp-blue dark:text-gold-400">
            <Megaphone size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>{t('Admin Announcements')}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-mono font-bold">
                  {unreadCount}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">{t('System broadcasts from administrators')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Action Bar */}
      {broadcasts.length > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-900/30 text-[11px]">
          <span className="text-slate-500 dark:text-zinc-400">
            {broadcasts.length} {broadcasts.length === 1 ? t('message') : t('messages')}
          </span>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-corp-blue dark:text-gold-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>{t('Mark all read')}</span>
              </button>
            )}
            {onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                title={t('Clear history')}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Broadcasts List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
        {broadcasts.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
              <Bell size={18} />
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-zinc-300">
              {t('No announcements yet')}
            </p>
            <p className="text-[11px] text-slate-400">
              {t('When administrators broadcast messages, they will appear here.')}
            </p>
          </div>
        ) : (
          broadcasts.map((b) => {
            const isRead = readIds.includes(b.id);
            return (
              <div
                key={b.id}
                onClick={() => !isRead && onMarkRead(b.id)}
                className={cn(
                  'p-3.5 transition-colors cursor-pointer text-left relative group',
                  isRead
                    ? 'bg-transparent hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 opacity-80'
                    : 'bg-corp-blue/5 dark:bg-gold-500/5 hover:bg-corp-blue/10 dark:hover:bg-gold-500/10'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500">
                    <Clock size={11} />
                    <span>{formatTimestamp(b.createdAt)}</span>
                    {b.createdBy && (
                      <span className="font-mono text-[9px] bg-slate-200 dark:bg-zinc-800 px-1 rounded">
                        {b.createdBy}
                      </span>
                    )}
                  </div>

                  {!isRead ? (
                    <span
                      title={t('Unread')}
                      className="w-2 h-2 rounded-full bg-corp-blue dark:bg-gold-400 shrink-0 mt-1 shadow-xs"
                    />
                  ) : (
                    <span title={t('Read')} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check size={12} />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 dark:text-zinc-200 mt-1.5 leading-relaxed font-medium">
                  {b.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
