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
  const [isExporting, setIsExporting] = useState(false);
  const [card, setCard] = useState<GeneratedCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
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
    setExported(false);
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
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleExportPng() {
    if (!employee) return;
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      const themeCfg = {
        sapphire: {
          bgStart: '#0f172a',
          bgMid: '#1e1b4b',
          bgEnd: '#020617',
          accent: '#38bdf8',
          glow1: 'rgba(99, 102, 241, 0.35)',
          glow2: 'rgba(56, 189, 248, 0.25)',
          border: 'rgba(56, 189, 248, 0.45)',
        },
        emerald: {
          bgStart: '#064e3b',
          bgMid: '#022c22',
          bgEnd: '#021a14',
          accent: '#34d399',
          glow1: 'rgba(52, 211, 153, 0.35)',
          glow2: 'rgba(45, 212, 191, 0.25)',
          border: 'rgba(52, 211, 153, 0.45)',
        },
        gold: {
          bgStart: '#451a03',
          bgMid: '#291003',
          bgEnd: '#0c0a09',
          accent: '#fbbf24',
          glow1: 'rgba(251, 191, 36, 0.35)',
          glow2: 'rgba(245, 158, 11, 0.25)',
          border: 'rgba(251, 191, 36, 0.45)',
        },
        cyber: {
          bgStart: '#4a044e',
          bgMid: '#2e1065',
          bgEnd: '#090514',
          accent: '#e879f9',
          glow1: 'rgba(232, 121, 249, 0.35)',
          glow2: 'rgba(168, 85, 247, 0.25)',
          border: 'rgba(232, 121, 249, 0.45)',
        },
      }[theme] || {
        bgStart: '#0f172a',
        bgMid: '#1e1b4b',
        bgEnd: '#020617',
        accent: '#38bdf8',
        glow1: 'rgba(99, 102, 241, 0.35)',
        glow2: 'rgba(56, 189, 248, 0.25)',
        border: 'rgba(56, 189, 248, 0.45)',
      };

      // 1. Draw rich gradient backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGrad.addColorStop(0, themeCfg.bgStart);
      bgGrad.addColorStop(0.5, themeCfg.bgMid);
      bgGrad.addColorStop(1, themeCfg.bgEnd);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // 2. Draw ambient radial glow highlights
      const glow1 = ctx.createRadialGradient(1060, 110, 10, 1060, 110, 400);
      glow1.addColorStop(0, themeCfg.glow1);
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1200, 630);

      const glow2 = ctx.createRadialGradient(140, 520, 10, 140, 520, 320);
      glow2.addColorStop(0, themeCfg.glow2);
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1200, 630);

      // 3. Rounded outer border frame
      ctx.strokeStyle = themeCfg.border;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(24, 24, 1152, 582, 24);
      ctx.stroke();

      // 4. Employee Avatar Circle
      const avX = 100;
      const avY = 105;
      const avR = 40;
      ctx.beginPath();
      ctx.arc(avX, avY, avR, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = themeCfg.accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((employee.name || 'E')[0].toUpperCase(), avX, avY);

      // 5. Employee Name & Department
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      ctx.fillText(employee.name, 165, 100);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '18px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      ctx.fillText(`${employee.department || 'Workforce'} • JAPAC Region`, 165, 130);

      // 6. Top Right Milestone Badge
      const badgeText = milestoneType === 'BIRTHDAY' ? '🎂 Birthday' : `🏆 ${years}yr Milestone`;
      const badgeDate = milestoneType === 'BIRTHDAY' ? (employee.dob || '') : (employee.joinedDate || '');

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(930, 75, 210, 42, 21);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 17px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 1035, 96);

      if (badgeDate) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(badgeDate, 1035, 134);
      }

      // 7. Card Headline
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = themeCfg.accent;
      ctx.font = 'bold 38px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      const headline = card?.headline || (milestoneType === 'BIRTHDAY' ? `Happy Birthday, ${employee.name}! 🎂` : `Celebrating ${years} Years! 🎉`);
      ctx.fillText(headline, 80, 195);

      // 8. Word-wrapped Message Body
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '23px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      const maxW = 1040;
      const lineH = 38;
      let currY = 265;
      const messageBody = card?.message || '';

      const words = messageBody.split(' ');
      let line = '';
      let linesCount = 0;
      for (let n = 0; n < words.length; n++) {
        const testLine = line ? `${line} ${words[n]}` : words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && line) {
          ctx.fillText(line, 80, currY);
          line = words[n];
          currY += lineH;
          linesCount++;
          if (linesCount >= 5) {
            line = words.slice(n).join(' ');
            while (ctx.measureText(line + '…').width > maxW && line.length > 0) {
              line = line.slice(0, -1);
            }
            line = line + '…';
            break;
          }
        } else {
          line = testLine;
        }
      }
      if (line) {
        ctx.fillText(line, 80, currY);
      }

      // 9. Bottom Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 520);
      ctx.lineTo(1120, 520);
      ctx.stroke();

      // 10. Quote on Left
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 18px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const quoteText = card?.quote || '“Dedicated to human recognition at scale.”';
      ctx.fillText(quoteText, 80, 555);

      // 11. Branding on Right
      ctx.fillStyle = themeCfg.accent;
      ctx.font = 'bold 16px "Roboto", "Noto Sans Myanmar", "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('✨ Milestone AI • JAPAC Workforce Network', 1120, 555);

      // 12. Trigger Instant Download
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `milestone-card-${employee.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExported(true);
        setIsExporting(false);
        setTimeout(() => setExported(false), 3000);
      }, 'image/png');
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  }

  function handleDispatch() {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 3000);
  }

  function handleSchedule() {
    setScheduled(true);
    setTimeout(() => setScheduled(false), 3000);
  }

  const TONES: Array<{ id: CardTone; label: string; icon: typeof Heart; desc: string; badge: string }> = [
    { id: 'warm', label: 'Warm & Heartfelt', icon: Heart, desc: 'Empathetic, personal, team gratitude', badge: 'Popular' },
    { id: 'executive', label: 'Executive Leadership', icon: Briefcase, desc: 'Professional, strategic praise', badge: 'Formal' },
    { id: 'fun', label: 'Fun & Energetic', icon: Smile, desc: 'High-energy, celebratory emojis', badge: 'Vibrant' },
    { id: 'cultural', label: 'Culturally Localized', icon: Globe, desc: 'Respectful, traditional regional wishes', badge: 'JAPAC' },
  ];

  const THEMES: Array<{
    id: CardTheme;
    label: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    accentHex: string;
    previewBg: string;
  }> = [
    {
      id: 'sapphire',
      label: 'Sapphire Indigo',
      bgClass: 'from-blue-900 via-indigo-900 to-slate-950',
      borderClass: 'border-cyan-400/50',
      textClass: 'text-cyan-300',
      accentHex: '#38bdf8',
      previewBg: 'from-blue-600 via-indigo-700 to-slate-900',
    },
    {
      id: 'emerald',
      label: 'Emerald Forest',
      bgClass: 'from-emerald-900 via-teal-950 to-slate-950',
      borderClass: 'border-emerald-400/50',
      textClass: 'text-emerald-300',
      accentHex: '#34d399',
      previewBg: 'from-emerald-600 via-teal-700 to-slate-900',
    },
    {
      id: 'gold',
      label: 'Radiant Gold',
      bgClass: 'from-amber-900 via-yellow-950 to-slate-950',
      borderClass: 'border-amber-400/50',
      textClass: 'text-amber-300',
      accentHex: '#fbbf24',
      previewBg: 'from-amber-500 via-yellow-600 to-stone-900',
    },
    {
      id: 'cyber',
      label: 'Cyber Violet',
      bgClass: 'from-purple-900 via-fuchsia-950 to-slate-950',
      borderClass: 'border-fuchsia-400/50',
      textClass: 'text-fuchsia-300',
      accentHex: '#e879f9',
      previewBg: 'from-purple-600 via-fuchsia-700 to-slate-900',
    },
  ];

  const activeThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-2xl relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                <span>Gen AI Milestone Card Studio</span>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold tracking-wider shadow-xs">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Personalized for <span className="text-white font-semibold">{employee.name}</span> • {employee.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
            title="Close Studio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Split View (Controls on Left, Live Preview on Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900">
          {/* Left Column: Controls (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            {/* Tone Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                  Recognition Tone
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Select Tone</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {TONES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/50'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750 text-slate-100 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-indigo-500 text-white shadow-sm'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white tracking-wide">{t.label}</span>
                            <span
                              className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-indigo-400/30 text-indigo-200 border border-indigo-400/40'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {t.badge}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-300'}`}>
                            {t.desc}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 ml-2 shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Theme Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                  Visual Aesthetic
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Palette</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {THEMES.map((th) => {
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`px-3 py-2.5 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-400 text-white font-bold ring-2 ring-cyan-400/40 shadow-md'
                          : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750 text-slate-100 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full bg-gradient-to-br ${th.previewBg} shrink-0 border border-white/50 shadow-xs ${
                            isSelected ? 'ring-2 ring-white/80' : ''
                          }`}
                        />
                        <span className="text-xs truncate">{th.label}</span>
                      </div>
                      {isSelected && (
                        <Check size={14} className="text-cyan-400 shrink-0 ml-1" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Context / Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                  Add Custom Memory or Goal
                </label>
                <span className="text-[10px] text-slate-400">Optional</span>
              </div>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Led the Q3 Cloud Migration, great ping-pong player, always mentors newcomers..."
                className="w-full h-18 p-3 text-xs rounded-xl bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none transition-all shadow-inner"
              />
            </div>

            {/* Regenerate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/40 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Gemini is composing thoughtful wishes…' : 'Regenerate Message'}</span>
            </button>
          </div>

          {/* Right Column: Live Card Canvas Preview (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-indigo-400" />
                  <span>Live Card Canvas Preview</span>
                </span>
                <span className="text-[11px] text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Format: 1200 × 630px Card
                </span>
              </div>

              {/* The Visual Card Container */}
              <div
                className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${activeThemeObj.bgClass} border-2 ${activeThemeObj.borderClass} shadow-2xl min-h-[340px] flex flex-col justify-between transition-all`}
              >
                {/* Decorative background glow rings */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Top of Card: Employee Avatar + Badges */}
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-md bg-slate-800 flex items-center justify-center text-white font-bold text-base">
                      {employee.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{employee.name}</h3>
                      <p className="text-xs text-slate-300 opacity-95">{employee.department} • JAPAC</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                      {milestoneType === 'BIRTHDAY' ? '🎂 Birthday' : `🏆 ${years}yr Milestone`}
                    </span>
                    <span className="text-[9px] text-slate-300 font-mono">
                      {milestoneType === 'BIRTHDAY' ? employee.dob : employee.joinedDate}
                    </span>
                  </div>
                </div>

                {/* Middle of Card: Generated Content */}
                <div className="relative z-10 my-4 space-y-2.5">
                  <h4 className={`text-lg sm:text-xl font-extrabold ${activeThemeObj.textClass} tracking-tight drop-shadow-sm`}>
                    {card ? card.headline : 'Composing thoughtful wishes…'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
                    {card ? card.message : 'Generating personalized message using Gemini 2.5 Flash…'}
                  </p>
                </div>

                {/* Bottom of Card: Quote & Branding */}
                <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-slate-200">
                  <span className="italic opacity-90 truncate max-w-[70%]">
                    {card?.quote || '“Dedicated to human recognition at scale.”'}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-95 shrink-0 font-medium text-[10px] text-white">
                    <Sparkles size={12} className={activeThemeObj.textClass} />
                    <span>Milestone AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row: Clearly Differentiated High-Visibility Buttons */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {/* 1. Copy Message Text */}
              <button
                onClick={handleCopy}
                className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  copied
                    ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-slate-400 text-white'
                }`}
                title="Copy greeting and quote text to clipboard"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span>{copied ? 'Copied Text! ✓' : 'Copy Text'}</span>
              </button>

              {/* 2. Export Card as PNG Image (Real Canvas Graphic Download) */}
              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  exported
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-blue-400/50 shadow-indigo-600/30'
                }`}
                title="Render and download high-resolution 1200x630 PNG celebration graphic"
              >
                {exported ? (
                  <Check size={15} />
                ) : (
                  <Download size={15} className={isExporting ? 'animate-bounce' : ''} />
                )}
                <span>{exported ? 'Downloaded PNG! 🎨' : isExporting ? 'Rendering…' : 'Export PNG Card'}</span>
              </button>

              {/* 3. Schedule Delivery */}
              <button
                onClick={handleSchedule}
                className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  scheduled
                    ? 'bg-amber-950/90 border-amber-400 text-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-slate-400 text-white'
                }`}
                title="Schedule celebration card for automatic dispatch"
              >
                {scheduled ? <Check size={15} className="text-amber-400" /> : <Calendar size={15} />}
                <span>{scheduled ? 'Scheduled! ⏰' : 'Schedule'}</span>
              </button>

              {/* 4. Send Now */}
              <button
                onClick={handleDispatch}
                className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  dispatched
                    ? 'bg-emerald-500 border-emerald-300 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50 shadow-emerald-600/30'
                }`}
                title="Dispatch celebration card immediately across employee channels"
              >
                {dispatched ? <Check size={15} /> : <Send size={15} />}
                <span>{dispatched ? 'Dispatched! 🚀' : 'Send Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
