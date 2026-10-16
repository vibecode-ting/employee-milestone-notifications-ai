import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import type { NotificationSettings } from '../types';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

const DEFAULT_SETTINGS: NotificationSettings = {
  userId: '',
  templates: {
    type: 'normal',
    birthday: 'Happy Birthday, {{employee_name}}! 🎂 Wishing you a wonderful day!',
    anniversary: 'Congratulations {{employee_name}} on {{years_of_service}} years with {{department}}! 🏆',
  },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={cn(
        'w-11 h-6 rounded-full transition-colors peer-focus:outline-none',
        'bg-slate-200 dark:bg-zinc-700',
        'peer-checked:bg-corp-blue dark:peer-checked:bg-gold-500',
        'after:content-[""] after:absolute after:top-0.5 after:left-0.5',
        'after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform',
        'peer-checked:after:translate-x-5',
      )} />
    </label>
  );
}

function ChannelSection({
  title, enabled, onToggle, children,
}: {
  title: string; enabled: boolean; onToggle: (v: boolean) => void; children: React.ReactNode;
}) {
  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-slate-700 dark:text-zinc-300">{title}</span>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
      {enabled && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { appUser } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [tab, setTab] = useState<'notifications' | 'templates'>('notifications');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!appUser) return;
    getDoc(doc(db, 'settings', appUser.uid))
      .then((snap) => {
        if (snap.exists()) setSettings(snap.data() as NotificationSettings);
      })
      .catch(() => {});
  }, [appUser]);

  async function handleSave() {
    if (!appUser) return;
    await setDoc(doc(db, 'settings', appUser.uid), { ...settings, userId: appUser.uid });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function setSmtp(k: string, v: unknown) {
    setSettings((s) => ({ ...s, smtp: { ...s.smtp, host: '', port: 587, user: '', enabled: false, ...s.smtp, [k]: v } }));
  }
  function setTeams(k: string, v: unknown) {
    setSettings((s) => ({ ...s, teams: { webhookUrl: '', enabled: false, ...s.teams, [k]: v } }));
  }
  function setTelegram(k: string, v: unknown) {
    setSettings((s) => ({ ...s, telegram: { botToken: '', chatId: '', enabled: false, ...s.telegram, [k]: v } }));
  }
  function setTemplate(k: string, v: unknown) {
    setSettings((s) => ({ ...s, templates: { ...s.templates, [k]: v } }));
  }

  const isPro = appUser?.role === 'pro' || appUser?.role === 'pro_plus' || appUser?.role === 'admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('Settings')}</h1>

      {/* Tabs */}
      <div className="flex gap-1 glass-panel p-1 w-fit">
        {(['notifications', 'templates'] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              tab === tabKey
                ? 'bg-corp-blue text-white dark:bg-gold-500 dark:text-zinc-900'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800',
            )}
          >
            {tabKey === 'notifications' ? t('Notification Settings') : t('Message Templates')}
          </button>
        ))}
      </div>

      {tab === 'notifications' && (
        <div className="space-y-3">
          {/* SMTP */}
          <ChannelSection title={t('Email (SMTP)')} enabled={!!settings.smtp?.enabled} onToggle={(v) => setSmtp('enabled', v)}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">{t('Host')}</label>
                <input className="glass-input text-sm" value={settings.smtp?.host ?? ''} onChange={(e) => setSmtp('host', e.target.value)} placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">{t('Port')}</label>
                <input className="glass-input text-sm" type="number" value={settings.smtp?.port ?? 587} onChange={(e) => setSmtp('port', +e.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-zinc-400">{t('Send Directly to Employees')}</span>
              <Toggle checked={!!settings.smtp?.sendToEmployee} onChange={(v) => setSmtp('sendToEmployee', v)} />
            </div>
          </ChannelSection>

          {/* Teams */}
          <ChannelSection title={t('Microsoft Teams')} enabled={!!settings.teams?.enabled} onToggle={(v) => setTeams('enabled', v)}>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('Incoming Webhook URL')}</label>
              <input className="glass-input text-sm" value={settings.teams?.webhookUrl ?? ''} onChange={(e) => setTeams('webhookUrl', e.target.value)} placeholder="https://outlook.office.com/webhook/…" />
            </div>
          </ChannelSection>

          {/* Telegram */}
          <ChannelSection title={t('Telegram Bot')} enabled={!!settings.telegram?.enabled} onToggle={(v) => setTelegram('enabled', v)}>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('Bot Token')}</label>
              <input className="glass-input text-sm" value={settings.telegram?.botToken ?? ''} onChange={(e) => setTelegram('botToken', e.target.value)} placeholder="123456:ABC-…" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('Chat ID')}</label>
              <input className="glass-input text-sm" value={settings.telegram?.chatId ?? ''} onChange={(e) => setTelegram('chatId', e.target.value)} placeholder="-1001234567890" />
            </div>
          </ChannelSection>
        </div>
      )}

      {tab === 'templates' && (
        <div className="space-y-4">
          {/* Template type */}
          <div className="glass-panel p-4 space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">{t('Template Type')}</label>
            <div className="flex gap-2">
              {(['normal', 'card'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { if (type === 'card' && !isPro) return; setTemplate('type', type); }}
                  className={cn('px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize',
                    settings.templates.type === type
                      ? 'border-corp-blue bg-corp-blue/10 text-corp-blue dark:border-gold-500 dark:bg-gold-500/10 dark:text-gold-400'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-500',
                    type === 'card' && !isPro && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {type === 'normal' ? t('Normal Text') : t('Card Template')}
                </button>
              ))}
            </div>

            {/* Card fields — Pro only */}
            {settings.templates.type === 'card' && (
              <div className={cn('space-y-3 relative', !isPro && 'select-none')}>
                {!isPro && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{t('Pro feature')}</p>
                      <a href="/pricing" className="text-corp-blue dark:text-gold-500 text-xs underline">{t('Upgrade →')}</a>
                    </div>
                  </div>
                )}
                {[
                  ['logoUrl', t('Logo URL')],
                  ['coverImage', t('Cover Image URL')],
                  ['detailsText', t('Footer Text')],
                ].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                    <input className="glass-input text-sm" value={((settings.templates as unknown as Record<string, string>)[k]) ?? ''} onChange={(e) => setTemplate(k, e.target.value)} />
                  </div>
                ))}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={!!settings.templates.includeEmojis} onChange={(e) => setTemplate('includeEmojis', e.target.checked)} className="rounded" />
                    {t('Allow Emoji Reactions')}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={!!settings.templates.allowAttachments} onChange={(e) => setTemplate('allowAttachments', e.target.checked)} className="rounded" />
                    {t('Allow Attachments')}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Birthday message */}
          <div className="glass-panel p-4 space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">{t('Birthday Message')}</label>
            <textarea
              rows={3}
              className="glass-input text-sm resize-none"
              value={settings.templates.birthday}
              onChange={(e) => setTemplate('birthday', e.target.value)}
            />
          </div>

          {/* Anniversary message */}
          <div className="glass-panel p-4 space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">{t('Anniversary Message')}</label>
            <textarea
              rows={3}
              className="glass-input text-sm resize-none"
              value={settings.templates.anniversary}
              onChange={(e) => setTemplate('anniversary', e.target.value)}
            />
          </div>

          {/* Variables */}
          <div className="glass-panel p-3">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
              {t('Available:')} <code>{'{{employee_name}}'}</code> <code>{'{{years_of_service}}'}</code> <code>{'{{department}}'}</code> <code>{'{{job_title}}'}</code>
            </p>
          </div>

          {/* Non-pro upsell */}
          {!isPro && (
            <div className="glass-panel p-3 border-l-4 border-purple-500">
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                {t('Unlock Card Templates and more with Pro.')}{' '}
                <a href="/pricing" className="text-corp-blue dark:text-gold-500 underline font-semibold">
                  {t('View Pricing →')}
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Save */}
      <button onClick={handleSave} className="btn-primary flex items-center gap-2 cursor-pointer">
        {saved ? <><CheckCircle2 size={16} className="text-emerald-400" /> {t('Saved!')}</> : t('Save Settings')}
      </button>
    </div>
  );
}
