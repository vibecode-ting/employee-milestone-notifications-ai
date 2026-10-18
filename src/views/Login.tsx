import { useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n, { LOCALES } from '../lib/i18n';
import {
  Sparkles,
  Mail,
  Lock,
  CheckCircle2,
  Sun,
  Moon,
  Info,
  ArrowRight,
  Globe,
  Cake,
  Trophy,
  Award,
  Gift,
  PartyPopper,
  Star,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

// ---------- Slide components ----------

function Slide0({ iframeRef }: { iframeRef?: React.RefObject<HTMLIFrameElement | null> }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <iframe
        ref={iframeRef}
        src="/earth.html"
        title="JAPAC 3D Earth Network"
        className="w-full h-full absolute inset-0 border-0 pointer-events-auto"
        loading="eager"
      />
      {/* Soft radial vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70 pointer-events-none" />

      {/* Top Left Hub Badge */}
      <div className="absolute top-5 left-5 z-10 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-slate-200 text-xs font-medium shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>JAPAC Milestone Intelligence Network</span>
      </div>

      {/* Cinematic left-panel bottom overlay */}
      <div className="absolute inset-x-0 bottom-16 sm:bottom-20 z-10 pointer-events-none flex flex-col items-center text-center px-6">
        <div className="max-w-lg space-y-2.5">
          {/* Official award sub-tag pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 backdrop-blur-md text-amber-300 text-[11px] font-semibold tracking-wide uppercase shadow-sm">
            <Trophy size={13} className="text-amber-400" />
            <span>A 2026 AI BUILDERS CUP ENTRY • BORN IN JAPAC, BUILT FOR THE WORLD</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-100 to-sky-300">
            Milestone Intelligence
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm drop-shadow leading-relaxed max-w-md mx-auto">
            Real-time workforce recognition & automated celebration delivery across Asia Pacific.
          </p>
        </div>
      </div>
    </div>
  );
}

function Slide1({ onSignIn, onInteract }: { onSignIn?: () => void; onInteract?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-3xl mb-5 shadow-lg shadow-amber-500/10 backdrop-blur-md">
        🎂
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2.5">Never miss a milestone</h2>
      <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-sm leading-relaxed">
        Automated birthday and work anniversary notifications — delivered proactively before the day arrives.
      </p>
      <div className="flex flex-col gap-2 w-full max-w-xs mb-6">
        {[
          { name: 'Sarah Chen', event: 'Birthday', when: 'Tomorrow', icon: Cake, color: 'text-amber-400' },
          { name: 'David Park', event: '5yr Anniversary', when: 'in 3d', icon: Trophy, color: 'text-blue-400' },
          { name: 'Aung Myint', event: 'Birthday', when: 'in 7d', icon: Cake, color: 'text-amber-400' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.name}
              onMouseEnter={() => onInteract?.()}
              onClick={() => onInteract?.()}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs backdrop-blur-md hover:border-slate-700/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className={c.color} />
                <span className="text-white font-medium">{c.name}</span>
              </div>
              <span className="text-slate-400">{c.event}</span>
              <span className="text-amber-400 font-semibold">{c.when}</span>
            </div>
          );
        })}
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <CheckCircle2 size={12} />
        <span>100% On-Time Scheduled Delivery</span>
      </div>
      {onSignIn && (
        <button onClick={onSignIn} className="mt-5 md:hidden btn-primary text-xs py-2 px-5 rounded-lg">
          Sign In
        </button>
      )}
    </div>
  );
}

function Slide2({ onSignIn, onInteract }: { onSignIn?: () => void; onInteract?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center max-w-lg mx-auto">
      <div className="flex gap-4 sm:gap-6 mb-6">
        {[
          { icon: '📧', label: 'Email SMTP', desc: 'Direct Inbox', color: 'from-sky-500/20 to-blue-600/20 border-sky-500/30 text-sky-400' },
          { icon: '💬', label: 'MS Teams', desc: 'Channel Webhooks', color: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30 text-indigo-400' },
          { icon: '✈️', label: 'Telegram', desc: 'Instant Bot', color: 'from-cyan-500/20 to-teal-600/20 border-cyan-500/30 text-cyan-400' },
        ].map((ch) => (
          <div
            key={ch.label}
            onMouseEnter={() => onInteract?.()}
            onClick={() => onInteract?.()}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className={`w-18 h-18 sm:w-20 sm:h-20 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${ch.color} border text-3xl shadow-lg backdrop-blur-md group-hover:scale-105 transition-transform`}>
              {ch.icon}
            </div>
            <span className="text-slate-200 text-xs font-semibold">{ch.label}</span>
            <span className="text-slate-500 text-[10px]">{ch.desc}</span>
          </div>
        ))}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2.5">Notify everywhere</h2>
      <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-sm leading-relaxed">
        Send milestone messages via Email, Microsoft Teams, or Telegram — with automated zero-touch delivery.
      </p>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
        <Sparkles size={12} />
        <span>Omnichannel Enterprise Dispatch</span>
      </div>
      {onSignIn && (
        <button onClick={onSignIn} className="mt-5 md:hidden btn-primary text-xs py-2 px-5 rounded-lg">
          Sign In
        </button>
      )}
    </div>
  );
}

function Slide3({ onSignIn, onInteract }: { onSignIn?: () => void; onInteract?: () => void }) {
  const [activeLang, setActiveLang] = useState(0);
  const [langPaused, setLangPaused] = useState(false);

  const japacLangs = [
    {
      code: 'us',
      locale: 'en',
      key: 'EN',
      name: 'English',
      native: 'English',
      greeting: 'Happy Birthday, Alex! Wishing you an inspiring and successful year ahead! 🎂',
      accent: 'border-blue-500/60 bg-blue-500/15 text-blue-300 shadow-blue-500/20',
    },
    {
      code: 'mm',
      locale: 'mm',
      key: 'MM',
      name: 'Myanmar',
      native: 'မြန်မာ',
      greeting: 'မင်္ဂလာပါ Alex၊ မွေးနေ့မှာ ပျော်ရွှင်ချမ်းမြေ့ပြီး စိတ်ချမ်းသာပါစေကြောင်း ဆုမွန်ကောင်းတောင်းအပ်ပါသည်။ 🎂',
      accent: 'border-amber-500/60 bg-amber-500/15 text-amber-300 shadow-amber-500/20',
    },
    {
      code: 'jp',
      locale: 'ja',
      key: 'JA',
      name: 'Japanese',
      native: '日本語',
      greeting: 'Alexさん、お誕生日おめでとうございます！実り多き素晴らしい一年になりますように！ 🌸',
      accent: 'border-rose-500/60 bg-rose-500/15 text-rose-300 shadow-rose-500/20',
    },
    {
      code: 'kr',
      locale: 'ko',
      key: 'KO',
      name: 'Korean',
      native: '한국어',
      greeting: 'Alex 님, 생일을 진심으로 축하드립니다! 올 한 해도 행복과 성공이 가득하시길 바랍니다! 🎉',
      accent: 'border-indigo-500/60 bg-indigo-500/15 text-indigo-300 shadow-indigo-500/20',
    },
    {
      code: 'tw',
      locale: 'zh',
      key: 'ZH',
      name: 'Traditional',
      native: '繁體中文',
      greeting: '祝 Alex 生日快樂！感謝您的付出與努力，願新的一年萬事順遂、再創佳績！ 🏆',
      accent: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-emerald-500/20',
    },
    {
      code: 'hk',
      locale: 'zh-HK',
      key: 'HK',
      name: 'Hong Kong',
      native: '粵語',
      greeting: '祝 Alex 生日快樂！祝你工作順遂，身體健康，日日都咁開心！ 🎈',
      accent: 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300 shadow-cyan-500/20',
    },
    {
      code: 'vn',
      locale: 'vn',
      key: 'VN',
      name: 'Vietnamese',
      native: 'Tiếng Việt',
      greeting: 'Chúc mừng sinh nhật Alex! Chúc bạn luôn mạnh khỏe, hạnh phúc và gặt hái nhiều thành công! 🌟',
      accent: 'border-red-500/60 bg-red-500/15 text-red-300 shadow-red-500/20',
    },
  ];

  // Auto-cycle through languages for an engaging, dynamic preview
  useEffect(() => {
    if (langPaused) return;
    const timer = setInterval(() => {
      setActiveLang((prev) => (prev + 1) % japacLangs.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [langPaused, japacLangs.length]);

  const current = japacLangs[activeLang];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center max-w-lg mx-auto">
      {/* Top Header Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-4 backdrop-blur-md">
        <Globe size={13} className="text-purple-400" />
        <span>7 JAPAC Locales • 100% Native Parity</span>
      </div>

      {/* Flag / Locale Selector Pills */}
      <div
        className="flex flex-wrap items-center justify-center gap-1.5 mb-5"
        onMouseEnter={() => {
          setLangPaused(true);
          onInteract?.();
        }}
        onMouseLeave={() => setLangPaused(false)}
      >
        {japacLangs.map((lang, idx) => (
          <button
            key={lang.key}
            type="button"
            onClick={() => {
              setActiveLang(idx);
              setLangPaused(true);
              onInteract?.();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              activeLang === idx
                ? 'border-purple-400 bg-purple-500/20 text-white scale-105 shadow-md shadow-purple-500/20'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <img
              src={`https://flagcdn.com/w20/${lang.code}.png`}
              alt={lang.name}
              className="w-3.5 h-2.5 object-cover rounded-xs"
            />
            <span>{lang.key}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Celebration Card Preview */}
      <div
        onMouseEnter={() => {
          setLangPaused(true);
          onInteract?.();
        }}
        onMouseLeave={() => setLangPaused(false)}
        className="w-full max-w-sm p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl mb-5 text-left relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow-md">
              🎂
            </div>
            <div>
              <p className="text-xs font-bold text-white">Alex Wong</p>
              <p className="text-[10px] text-slate-400">Software Engineer • Singapore</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
            Today
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed min-h-[44px] transition-all">
          {current.greeting}
        </p>
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Generated by Google Gemini 2.5 Flash</span>
          <span className="text-purple-400 font-semibold">{current.native}</span>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2.5">
        Culture-aware AI greetings
      </h2>
      <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-sm leading-relaxed">
        Google Gemini AI crafts warm, personalized celebrations in 7 JAPAC languages with native cultural etiquette.
      </p>

      {onSignIn && (
        <button
          onClick={onSignIn}
          className="mt-5 md:hidden btn-primary text-xs py-2 px-5 rounded-lg"
        >
          Sign In
        </button>
      )}
    </div>
  );
}

function Slide4({ onSignIn, onInteract }: { onSignIn?: () => void; onInteract?: () => void }) {
  const weekData = [
    { day: 'Mon', count: 3, height: 56, icon: Cake, label: '3 Birthdays', color: 'from-amber-400 to-amber-500', shadow: 'shadow-amber-500/25', iconColor: 'text-amber-400' },
    { day: 'Tue', count: 5, height: 84, icon: Trophy, label: '5 Anniversaries', color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/25', iconColor: 'text-blue-400' },
    { day: 'Wed', count: 2, height: 44, icon: Gift, label: '2 Rewards', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/25', iconColor: 'text-emerald-400' },
    { day: 'Thu', count: 6, height: 96, icon: PartyPopper, label: '6 Celebrations', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/25', iconColor: 'text-purple-400' },
    { day: 'Fri', count: 4, height: 72, icon: Award, label: '4 Jubilees', color: 'from-blue-400 to-cyan-500', shadow: 'shadow-cyan-500/25', iconColor: 'text-cyan-400' },
    { day: 'Sat', count: 1, height: 28, icon: Star, label: '1 Spotlight', color: 'from-amber-300 to-orange-400', shadow: 'shadow-orange-500/25', iconColor: 'text-orange-400' },
    { day: 'Sun', count: 2, height: 38, icon: Sparkles, label: '2 Kudos', color: 'from-rose-400 to-pink-500', shadow: 'shadow-rose-500/25', iconColor: 'text-rose-400' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center max-w-lg mx-auto">
      {/* Velocity Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-6 backdrop-blur-md">
        <BarChart3 size={13} className="text-blue-400" />
        <span>7-Day Recognition Velocity</span>
      </div>

      {/* 7-Day Visual Activity Chart with Icons & Bars */}
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl mb-6">
        <div className="flex items-end justify-between gap-2 sm:gap-3 h-36 pt-2 pb-1">
          {weekData.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                onMouseEnter={() => onInteract?.()}
                onClick={() => onInteract?.()}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Milestone Icon above bar */}
                <div className="mb-2 p-1.5 rounded-full bg-slate-800/90 border border-slate-700/70 group-hover:scale-115 group-hover:border-amber-400/60 transition-all shadow-sm">
                  <Icon size={14} className={item.iconColor} />
                </div>

                {/* Bar Container with guaranteed pixel height */}
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className={`w-7 sm:w-8 rounded-t-lg bg-gradient-to-t ${item.color} shadow-lg ${item.shadow} transition-all duration-300 group-hover:brightness-125 relative flex flex-col items-center justify-start pt-1`}
                    style={{ height: `${item.height}%`, minHeight: '18px' }}
                  >
                    <span className="text-[10px] font-bold text-white drop-shadow-xs">
                      {item.count}
                    </span>
                  </div>
                </div>

                {/* Day Label with micro-indicator */}
                <div className="mt-2 text-center">
                  <span className="block text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2.5">
        Milestone insights at a glance
      </h2>
      <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-sm leading-relaxed">
        7-day activity, headcount by department, upcoming events — all in one unified dashboard.
      </p>

      {/* Quick stats pill */}
      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          23 Celebrations this week
        </span>
        <span className="text-slate-600">•</span>
        <span>0 missed events</span>
      </div>

      {onSignIn && (
        <button
          onClick={onSignIn}
          className="mt-6 md:hidden btn-primary text-xs py-2 px-5 rounded-lg"
        >
          Sign In
        </button>
      )}
    </div>
  );
}

// ---------- Main component ----------

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginDemo, loginWithGoogle, sendPasswordlessLink } = useAuth();
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifyingLink, setVerifyingLink] = useState(false);

  // Auto sign-up countdown state (5 seconds)
  const [newAccountCountdown, setNewAccountCountdown] = useState<number | null>(null);

  // Dark mode state
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Slideshow state
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const SLIDE_CYCLE = [0, 1, 0, 2, 0, 3, 0, 4];

  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const markInteracting = (holdDurationMs = 15000) => {
    setIsInteracting(true);
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }
    if (holdDurationMs > 0) {
      interactionTimerRef.current = setTimeout(() => {
        setIsInteracting(false);
        // Auto reset to Earth home page after interaction ends
        setSlideIndex(0);
        setCycleIndex(0);
      }, holdDurationMs);
    }
  };

  // Sync theme to 3D Earth iframe on load and theme switch
  useEffect(() => {
    const postTheme = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'SET_THEME', theme: dark ? 'dark' : 'light' },
          '*'
        );
      }
    };
    postTheme();
    const t = setTimeout(postTheme, 500);
    return () => clearTimeout(t);
  }, [dark]);

  // Listen for interaction and country selection events from the 3D globe iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'EARTH_INTERACTION') {
        if (event.data.isInteracting) {
          markInteracting(15000);
        }
      }
      if (event.data && event.data.type === 'SELECT_COUNTRY' && event.data.code) {
        const countryCode = String(event.data.code).toLowerCase();
        const codeToLocale: Record<string, string> = {
          sg: 'en',
          us: 'en',
          mm: 'mm',
          jp: 'ja',
          kr: 'ko',
          tw: 'zh',
          hk: 'zh-HK',
          vn: 'vn',
          th: 'en',
        };
        const targetLocale = codeToLocale[countryCode] || 'en';
        i18n.changeLanguage(targetLocale);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SET_THEME', theme: next ? 'dark' : 'light' },
        '*'
      );
    }
  }

  function handleLanguageChange(code: string) {
    i18n.changeLanguage(code);
  }

  // Dynamic continuous slideshow timer: Earth Home slide (0) stays 15s (3x duration), feature slides stay 5s
  useEffect(() => {
    if (isPaused || isInteracting) return;
    const currentSlide = SLIDE_CYCLE[cycleIndex % SLIDE_CYCLE.length];
    const duration = currentSlide === 0 ? 15000 : 5000;
    const id = setTimeout(() => {
      setCycleIndex((prev) => {
        const next = (prev + 1) % SLIDE_CYCLE.length;
        setSlideIndex(SLIDE_CYCLE[next]);
        return next;
      });
    }, duration);
    return () => clearTimeout(id);
  }, [isPaused, isInteracting, cycleIndex]);

  // Handle countdown timer for new registered account
  useEffect(() => {
    if (newAccountCountdown === null) return;
    if (newAccountCountdown <= 0) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => {
      setNewAccountCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [newAccountCountdown, navigate]);

  // Automatically detect and handle Firebase Passwordless Email Link callback
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setVerifyingLink(true);
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');

      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email to complete sign in') || '';
      }

      if (emailForSignIn) {
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            navigate('/');
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : 'Failed to sign in with email link');
          })
          .finally(() => {
            setVerifyingLink(false);
          });
      } else {
        setVerifyingLink(false);
        setError('Email confirmation required to complete sign in.');
      }
    }
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'magic-link') {
        await sendPasswordlessLink(email);
        setSuccessMsg(t('Magic Link sent'));
      } else {
        // Try standard sign-in first
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/');
        } catch (signInErr: any) {
          const errCode = signInErr?.code || '';
          if (errCode === 'auth/wrong-password') {
            throw new Error('Incorrect password. Please try again.');
          }

          // If first time email or invalid credentials, auto-register
          if (
            errCode === 'auth/invalid-credential' ||
            errCode === 'auth/user-not-found'
          ) {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              // Trigger 5-second countdown redirect
              setNewAccountCountdown(5);
              return;
            } catch (signUpErr: any) {
              const signUpCode = signUpErr?.code || '';
              if (signUpCode === 'auth/email-already-in-use') {
                throw new Error('Incorrect password. Please try again.');
              }
              if (signUpCode === 'auth/weak-password') {
                throw new Error('Password should be at least 6 characters.');
              }
              throw signUpErr;
            }
          }
          throw signInErr;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleDemoLogin() {
    loginDemo('admin');
    navigate('/');
  }

  if (verifyingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="glass-panel w-full max-w-sm p-8 text-center space-y-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-semibold text-white">Verifying Magic Link…</h2>
          <p className="text-xs text-slate-400">Signing you in securely without a password.</p>
        </div>
      </div>
    );
  }

  const slides = [
    <Slide0 key={0} iframeRef={iframeRef} />,
    <Slide1 key={1} onSignIn={() => {}} onInteract={() => markInteracting(15000)} />,
    <Slide2 key={2} onSignIn={() => {}} onInteract={() => markInteracting(15000)} />,
    <Slide3 key={3} onSignIn={() => {}} onInteract={() => markInteracting(15000)} />,
    <Slide4 key={4} onSignIn={() => {}} onInteract={() => markInteracting(15000)} />,
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-slate-950 relative selection:bg-sky-500 selection:text-white overflow-x-hidden">
      {/* =========================================================================
          LEFT PANEL: Cinematic 3D JAPAC Network Globe (WebGL) - Exactly 50%
          ========================================================================= */}
      <div
        className="w-full md:w-1/2 h-[420px] sm:h-[480px] md:h-screen md:min-h-screen relative overflow-hidden bg-slate-950 shrink-0 block"
        onMouseEnter={() => {
          setIsPaused(true);
          markInteracting(12000);
        }}
        onMouseMove={() => {
          setIsPaused(true);
          markInteracting(12000);
        }}
        onMouseLeave={() => {
          setIsPaused(false);
        }}
      >
        {/* Slides */}
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              slideIndex === i ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {slide}
          </div>
        ))}

        {/* Desktop Prev / Next Navigation Floating Side Arrows */}
        <button
          type="button"
          onClick={() => {
            setSlideIndex((prev) => (prev - 1 + 5) % 5);
            markInteracting(15000);
          }}
          aria-label="Previous Slide"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 items-center justify-center backdrop-blur-md transition-all opacity-60 hover:opacity-100 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            setSlideIndex((prev) => (prev + 1) % 5);
            markInteracting(15000);
          }}
          aria-label="Next Slide"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 items-center justify-center backdrop-blur-md transition-all opacity-60 hover:opacity-100 cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>

        {/* Interactive Bottom Control Bar */}
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-between px-5 z-20 pointer-events-none">
          {/* Helper caption */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-medium backdrop-blur-md bg-slate-900/70 px-3 py-1 rounded-full border border-slate-700/50 shadow-sm">
            <span>Drag to rotate • Scroll to zoom</span>
          </div>

          {/* Carousel slider dots with inline prev/next controls */}
          <div className="flex items-center gap-2 pointer-events-auto mx-auto sm:mx-0 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50 shadow-md">
            <button
              type="button"
              onClick={() => {
                setSlideIndex((prev) => (prev - 1 + 5) % 5);
                markInteracting(15000);
              }}
              aria-label="Previous slide"
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1.5 px-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSlideIndex(i);
                    markInteracting(15000);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    slideIndex === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setSlideIndex((prev) => (prev + 1) % 5);
                markInteracting(15000);
              }}
              aria-label="Next slide"
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Play / Pause indicator */}
          <button
            type="button"
            onClick={() => {
              if (isPaused || isInteracting) {
                setIsPaused(false);
                setIsInteracting(false);
                if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
              } else {
                setIsPaused(true);
                markInteracting(99999999);
              }
            }}
            className={`pointer-events-auto hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-md transition-all shadow-md cursor-pointer border ${
              isPaused || isInteracting
                ? 'bg-slate-900/85 border-amber-500/50 text-amber-300 hover:bg-slate-800'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            title={
              isPaused || isInteracting
                ? 'Slideshow paused while interacting. Click to play.'
                : 'Click to pause slideshow'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPaused || isInteracting ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>{isPaused || isInteracting ? 'Paused' : 'Auto-play'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Premium Authentication & Info Card (Tailwind) - Exactly 50%
          ========================================================================= */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-5 sm:p-8 lg:p-10 shrink-0 bg-slate-950/95 text-slate-100 relative min-h-screen border-t md:border-t-0 md:border-l border-white/10">
        {/* Top-Right Utility Row: Language Selector & Orbital Sunrise/Sunset Toggle */}
        <div className="w-full flex items-center justify-end gap-2.5 mb-4 z-20">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 backdrop-blur-md text-xs font-medium text-slate-300 hover:border-white/20 transition-colors">
            <Globe size={13} className="text-slate-400 shrink-0" />
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label={t('Language')}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sunrise / Sunset Toggle Button */}
          <button
            onClick={toggleDark}
            type="button"
            aria-label={dark ? 'Sunrise Daylight Mode' : 'Sunset Night Mode'}
            className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 backdrop-blur-md text-slate-300 hover:text-white hover:border-white/20 hover:bg-slate-800/80 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm"
            title={dark ? 'Toggle Sunrise (Light Mode)' : 'Toggle Sunset (Dark Mode)'}
          >
            {dark ? (
              <>
                <Sun size={14} className="text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Sunrise</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-indigo-400" />
                <span className="hidden sm:inline">Sunset</span>
              </>
            )}
          </button>
        </div>

        {/* Center Single Auth Card */}
        <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-slate-900/40 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Brand Header with Glowing Gold Cake Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Cake size={24} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                Milestone
              </span>
              <p className="text-[11px] text-slate-400 font-medium">JAPAC Recognition Intelligence</p>
            </div>
          </div>

          {/* Dual Tabs: Password vs Magic Link */}
          <div className="flex rounded-xl bg-slate-950/60 border border-white/10 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'password'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock size={13} />
              <span>{t('Password')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('magic-link');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authMode === 'magic-link'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail size={13} />
              <span>{t('Magic Link')}</span>
            </button>
          </div>

          {/* Auto Sign-Up 5-Second Countdown Alert */}
          {newAccountCountdown !== null && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 backdrop-blur-md animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-400" />
                  {t('New account created')} <span className="font-mono text-sm underline">{newAccountCountdown}s</span>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  {t('Skip')} <ArrowRight size={11} />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {t('Redirecting to dashboard')}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {t('Email')}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                disabled={loading || newAccountCountdown !== null}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => markInteracting(30000)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                placeholder="you@company.com"
              />
            </div>

            {authMode === 'password' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    {t('Password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      disabled={loading || newAccountCountdown !== null}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => markInteracting(30000)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950/70 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Informative Blue/Indigo Beta Notice */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs leading-relaxed">
                  <Info size={15} className="shrink-0 mt-0.5 text-sky-400" />
                  <span>Beta notice: Instant activation enabled. No email verification code needed.</span>
                </div>
              </div>
            ) : (
              <div>
                {/* Magic Link Notice */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs leading-relaxed">
                  <Info size={15} className="shrink-0 mt-0.5 text-sky-400" />
                  <span>{t('Magic Link info')}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* High-visibility electric blue Sign In CTA */}
            <button
              type="submit"
              disabled={loading || newAccountCountdown !== null}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{authMode === 'magic-link' ? 'Sending Magic Link…' : 'Signing In…'}</span>
                </span>
              ) : authMode === 'magic-link' ? (
                t('Send Magic Link')
              ) : (
                t('Sign In')
              )}
            </button>
          </form>

          {/* Clean Separator: or continue with */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900/90 px-3 text-slate-400 font-medium rounded-full">
                {t('or continue with')}
              </span>
            </div>
          </div>

          {/* Social & Neon-Bordered Demo Mode */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || newAccountCountdown !== null}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-white/15 bg-slate-950/60 hover:bg-slate-800/80 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Signing in with Google…' : t('Sign in with Google')}</span>
            </button>

            <button
              onClick={handleDemoLogin}
              disabled={newAccountCountdown !== null}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/15 hover:border-purple-400 hover:from-purple-500/25 hover:to-indigo-500/25 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] cursor-pointer"
            >
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              <span>⚡ Demo Mode</span>
            </button>
          </div>
        </div>

        {/* Quotes & High-Value Footer */}
        <div className="w-full max-w-md mx-auto mt-6 pt-5 border-t border-white/10 space-y-3 z-10 text-center sm:text-left">
          {/* Title & Quote */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-400">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
              <Trophy size={13} className="text-amber-400" />
              <span>AI BUILDER CUP 2026</span>
            </div>
            <div className="text-xs italic text-slate-300 font-serif text-center sm:text-right">
              "Build in JAPAC, Build for the World"
            </div>
          </div>

          {/* Base Line Credit Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-1 gap-2">
            <span>Milestone v1.4 | Powered by JAPAC AI | © 2026</span>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-200 transition-colors">
                Privacy
              </a>
              <span>•</span>
              <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-200 transition-colors">
                Terms
              </a>
              <span>•</span>
              <a href="#status" onClick={(e) => e.preventDefault()} className="hover:text-slate-200 transition-colors">
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
