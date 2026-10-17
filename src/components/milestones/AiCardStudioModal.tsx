import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, Sparkles, Send, Copy, Download, Calendar, RefreshCw,
  Heart, Briefcase, Smile, Globe, Check,
} from 'lucide-react';
import type { Employee, CardTone, CardTheme, GeneratedCard } from '../../types';
import { generatePersonalizedCard } from '../../lib/gemini';

interface AiCardStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  milestoneType?: 'BIRTHDAY' | 'ANNIVERSARY';
  years?: number;
}

export function AiCardStudioModal({
  isOpen,
  onClose,
  employee,
  milestoneType = 'BIRTHDAY',
  years = 1,
}: AiCardStudioModalProps) {
  const { i18n } = useTranslation();
  const [tone, setTone] = useState<CardTone>('warm');
  const [theme, setTheme] = useState<CardTheme>('sapphire');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      handleGenerate();
    }
  }, [isOpen, employee, tone, theme]);

  if (!isOpen || !employee) return null;

  async function handleGenerate() {
    if (!employee) return;
    setIsGenerating(true);
    setCopied(false);
    setScheduled(false);
    setDispatched(false);
    try {
      const result = await generatePersonalizedCard({
        employee,
        milestoneType,
        years,
        tone,
        theme,
        customNotes,
        language: i18n.language,
      });
      setCard(result);
    } catch (err) {
      console.error('Card generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!card) return;
    const text = `${card.headline}\n\n${card.message}\n\n${card.quote || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDispatch() {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 3000);
  }

  function handleSchedule() {
    setScheduled(true);
    setTimeout(() => setScheduled(false), 3000);
  }

  const TONES: Array<{ id: CardTone; label: string; icon: typeof Heart; desc: string }> = [
    { id: 'warm', label: 'Warm & Heartfelt', icon: Heart, desc: 'Empathetic, personal, team gratitude' },
    { id: 'executive', label: 'Executive Leadership', icon: Briefcase, desc: 'Professional, strategic praise' },
    { id: 'fun', label: 'Fun & Energetic', icon: Smile, desc: 'High-energy, emojis, celebratory' },
    { id: 'cultural', label: 'Culturally Localized', icon: Globe, desc: 'Respectful, traditional regional wishes' },
  ];

  const THEMES: Array<{ id: CardTheme; label: string; bgClass: string; borderClass: string; textClass: string }> = [
    { id: 'sapphire', label: 'Sapphire Indigo', bgClass: 'from-blue-900 via-indigo-900 to-slate-950', borderClass: 'border-cyan-400/40', textClass: 'text-cyan-400' },
    { id: 'emerald', label: 'Emerald Forest', bgClass: 'from-emerald-900 via-teal-950 to-slate-950', borderClass: 'border-emerald-400/40', textClass: 'text-emerald-400' },
    { id: 'gold', label: 'Radiant Gold', bgClass: 'from-amber-900 via-yellow-950 to-slate-950', borderClass: 'border-amber-400/40', textClass: 'text-amber-400' },
    { id: 'cyber', label: 'Cyber Violet', bgClass: 'from-purple-900 via-fuchsia-950 to-slate-950', borderClass: 'border-fuchsia-400/40', textClass: 'text-fuchsia-400' },
  ];

  const activeThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gen AI Milestone Card Studio</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                  Gemini 1.5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Personalized for {employee.name} • {employee.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Split View (Controls on Left, Live Preview on Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Controls (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Recognition Tone
              </label>
              <div className="grid grid-cols-1 gap-2">
                {TONES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={16} className={`shrink-0 mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Theme Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Visual Aesthetic
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-all cursor-pointer ${
                      theme === th.id
                        ? 'bg-slate-800 border-indigo-400 text-white font-bold ring-1 ring-indigo-400/40'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{th.label}</span>
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${th.bgClass}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Context / Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Add Custom Memory or Goal
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Led the Q3 Cloud Migration, great ping-pong player..."
                className="w-full h-16 p-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Regenerate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Gemini is composing…' : 'Regenerate Message'}</span>
            </button>
          </div>

          {/* Right Column: Live Card Canvas Preview (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Card Canvas Preview
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Format: 1200 x 630px Card
                </span>
              </div>

              {/* The Visual Card Container */}
              <div
                className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${activeThemeObj.bgClass} border ${activeThemeObj.borderClass} shadow-2xl min-h-[330px] flex flex-col justify-between transition-all`}
              >
                {/* Decorative background glow rings */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top of Card: Employee Avatar + Badges */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/40 shadow-md bg-slate-800 flex items-center justify-center text-white font-bold text-base">
                      {employee.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{employee.name}</h3>
                      <p className="text-xs text-slate-300 opacity-90">{employee.department} • JAPAC</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase">
                      {milestoneType === 'BIRTHDAY' ? '🎂 Birthday' : `🏆 ${years}yr Milestone`}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {milestoneType === 'BIRTHDAY' ? employee.dob : employee.joinedDate}
                    </span>
                  </div>
                </div>

                {/* Middle of Card: Generated Content */}
                <div className="relative z-10 my-4 space-y-2.5">
                  <h4 className={`text-lg sm:text-xl font-extrabold ${activeThemeObj.textClass} tracking-tight`}>
                    {card ? card.headline : 'Composing thoughtful wishes…'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {card ? card.message : 'Generating personalized message using Gemini 1.5 Flash…'}
                  </p>
                </div>

                {/* Bottom of Card: Quote & Branding */}
                <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="italic opacity-80 truncate max-w-[70%]">
                    {card?.quote || '“Dedicated to human recognition at scale.”'}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-90 shrink-0 font-medium text-[10px]">
                    <Sparkles size={11} className={activeThemeObj.textClass} />
                    <span>Milestone AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDispatch}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Send size={14} />
                <span>{dispatched ? 'Sent! 🚀' : 'Send Now'}</span>
              </button>

              <button
                onClick={handleSchedule}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <Calendar size={14} />
                <span>{scheduled ? 'Scheduled! ⏰' : 'Schedule'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
