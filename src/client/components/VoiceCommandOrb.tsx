// VoiceCommandOrb.tsx — Floating Multimodal Voice Command Orb
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface VoiceCommandOrbProps {
  onCommandTranscribed: (text: string) => void;
}

const VOICE_LOCALES: Record<string, string> = {
  en: 'en-US',
  my: 'my-MM',
  zh: 'zh-CN',
  vi: 'vi-VN',
  hi: 'hi-IN',
};

const PROMPT_HINTS: Record<string, string> = {
  en: 'Click & speak: "Show retention risks in Engineering" or "Scan upcoming milestones"',
  my: 'ကလစ်နှိပ်ပြီး ပြောပါ - "ဒီလအတွင်း မွေးနေ့ရှိသူများကို စစ်ဆေးပါ"',
  zh: '点击并说话：“检查工程部留任风险” 或 “扫描未来30天纪念日”',
  vi: 'Nhấp & nói: "Hiển thị nguy cơ thôi việc trong phòng Kỹ thuật"',
  hi: 'क्लिक करें और बोलें: "इंजीनियरिंग में प्रतिधारण जोखिम दिखाएं"',
};

export default function VoiceCommandOrb({ onCommandTranscribed }: VoiceCommandOrbProps) {
  const { locale } = useLanguage();
  const [listening, setListening] = useState(false);
  const [statusText, setStatusText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = VOICE_LOCALES[locale] || 'en-US';

      recognition.onstart = () => {
        setListening(true);
        setStatusText(locale === 'my' ? 'နားထောင်နေသည်...' : 'Listening in ' + (VOICE_LOCALES[locale] || 'en-US') + '...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setStatusText(transcript);
        setListening(false);
        onCommandTranscribed(transcript);
      };

      recognition.onerror = () => {
        setListening(false);
        setStatusText('Voice input ready');
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [locale, onCommandTranscribed]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      const mockQuery = locale === 'my'
        ? 'ဒီလအတွင်း မွေးနေ့ရှိတဲ့ ဝန်ထမ်းတွေကို ရှာပေးပါ'
        : 'Analyze retention and burnout risk across Engineering';
      setStatusText(mockQuery);
      onCommandTranscribed(mockQuery);
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.lang = VOICE_LOCALES[locale] || 'en-US';
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  const btnClass = 'relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform hover:scale-105 ' +
    (listening
      ? 'bg-rose-600 ring-4 ring-rose-400/50 animate-pulse'
      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-indigo-500/30');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {statusText && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-lg px-3.5 py-1.5 rounded-full text-xs text-slate-700 dark:text-slate-200 max-w-xs truncate">
          {statusText}
        </div>
      )}
      <button
        onClick={toggleListen}
        title={PROMPT_HINTS[locale] || PROMPT_HINTS.en}
        className={btnClass}
      >
        <span className="text-2xl">{listening ? '🎙️' : '🎙️'}</span>
        {listening && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
          </span>
        )}
      </button>
    </div>
  );
}
