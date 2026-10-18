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
      <div className="absolute top-5 left-5 z-10 pointer-events-none flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md text-slate-200 text-xs font-medium shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>JAPAC Milestone Intelligence Network</span>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-10 pointer-events-none">
        <div className="text-center px-6 max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            Milestone Intelligence
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm drop-shadow leading-relaxed">
            Real-time workforce recognition & automated celebration delivery across Asia Pacific
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

      {/* Interactive 7 Language Selector Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-5 max-w-md">
        {japacLangs.map((item, idx) => {
          const isSelected = activeLang === idx;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveLang(idx);
                setLangPaused(true);
                i18n.changeLanguage(item.locale);
                onInteract?.();
              }}
              onMouseEnter={() => {
                setActiveLang(idx);
                onInteract?.();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${item.accent} scale-105 shadow-lg font-semibold`
                  : 'bg-slate-900/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <img
                src={`https://flagcdn.com/w40/${item.code}.png`}
                alt={item.name}
                className="w-4 h-3 object-cover rounded-xs shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-mono text-[11px] font-bold">{item.key}</span>
              <span className="text-[11px] font-medium hidden sm:inline">{item.native}</span>
            </button>
          );
        })}
      </div>

      {/* Live AI Personalized Milestone Preview Card */}
      <div
        onMouseEnter={() => {
          setLangPaused(true);
          onInteract?.();
        }}
        className="w-full max-w-sm p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-2xl mb-5 text-left relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={`https://flagcdn.com/w40/${current.code}.png`}
              alt={current.name}
              className="w-4 h-3 object-cover rounded-xs"
            />
            <span className="text-xs font-bold text-white">{current.name}</span>
            <span className="text-[11px] text-purple-400 font-medium">({current.native})</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
            <Sparkles size={10} /> Gemini AI
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans min-h-[58px] flex items-center">
          <p className="line-clamp-2">"{current.greeting}"</p>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Built for JAPAC teams</h2>
      <p className="text-slate-400 text-sm mb-4 max-w-sm leading-relaxed">
        Native internationalization across 7 Asian and global business languages with 100% translation parity.
      </p>

      {onSignIn && (
        <button onClick={onSignIn} className="mt-2 md:hidden btn-primary text-xs py-2 px-5 rounded-lg">
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel w-full max-w-sm p-8 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-corp-blue dark:border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-100">Verifying Magic Link…</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Signing you in securely without a password.</p>
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
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-slate-950 relative selection:bg-corp-blue selection:text-white overflow-x-hidden">
      {/* Left: Slideshow Hero (60% desktop wide landscape, top on mobile/portrait) */}
      <div
        className="w-full md:w-[60%] h-[380px] sm:h-[460px] md:h-screen md:min-h-screen relative overflow-hidden bg-slate-950 shrink-0 block"
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
            className={`absolute inset-0 transition-opacity duration-700 ${slideIndex === i ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {slide}
          </div>
        ))}

        {/* Previous / Next Arrows on Desktop */}
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

        {/* Progress dots & Pause/Play Indicator */}
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-between px-6 z-20 pointer-events-none">
          <div className="w-24 hidden sm:block" />
          <div className="flex items-center gap-2 pointer-events-auto mx-auto sm:mx-0">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSlideIndex(i);
                  markInteracting(15000);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  slideIndex === i ? 'w-6 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
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

      {/* Right: Login panel (40% desktop wide landscape, bottom stack on mobile/portrait) */}
      <div className="w-full md:w-[40%] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 shrink-0 bg-slate-50 dark:bg-zinc-950 md:border-l md:border-slate-200 dark:md:border-zinc-800 shadow-2xl z-10 min-h-screen">
        {/* Language and Theme Switch ABOVE login panel */}
        <div className="glass-panel w-full max-w-sm px-3.5 py-2 mb-3 flex items-center justify-between gap-2.5 shadow-sm">
          {/* Language Selector */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Globe size={15} className="text-slate-400 shrink-0" />
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label={t('Language')}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-corp-blue cursor-pointer truncate"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle Button — showing current condition */}
          <button
            onClick={toggleDark}
            type="button"
            aria-label={dark ? t('Dark Mode') : t('Light Mode')}
            className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-300 shadow-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0 cursor-pointer"
          >
            {dark ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-500" />}
            <span>{dark ? t('Dark Mode') : t('Light Mode')}</span>
          </button>
        </div>

        {/* Main Login Card */}
        <div className="glass-panel w-full max-w-sm p-6 sm:p-8 min-h-[560px] flex flex-col justify-between shadow-lg">
          <div>
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="Milestone" className="w-10 h-10 text-corp-blue" />
              <span className="text-xl font-bold text-corp-blue dark:text-gold-500">Milestone</span>
            </div>

            {/* Tab Mode Toggle */}
            <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-800 p-1 mb-5 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'password'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Lock size={13} />
                {t('Password')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('magic-link');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'magic-link'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Mail size={13} />
                {t('Magic Link')}
              </button>
            </div>

            {/* Auto Sign-Up 5-Second Countdown Warning Box */}
            {newAccountCountdown !== null && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                    {t('New account created')} <span className="font-mono text-sm underline">{newAccountCountdown}s</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 hover:opacity-80 transition-opacity font-bold flex items-center gap-1 cursor-pointer"
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
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
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
                  className="glass-input"
                  placeholder="you@company.com"
                />
              </div>

              {authMode === 'password' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                      {t('Password')}
                    </label>
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      disabled={loading || newAccountCountdown !== null}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => markInteracting(30000)}
                      className="glass-input"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Beta notice for Password TAB */}
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs border border-amber-200/60 dark:border-amber-900/40">
                    <Info size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span className="leading-snug">{t('Beta notice')}</span>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Magic Link Note */}
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs border border-blue-200/60 dark:border-blue-900/40">
                    <Info size={15} className="shrink-0 mt-0.5 text-blue-500" />
                    <span className="leading-snug">{t('Magic Link info')}</span>
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-xs">{error}</p>}

              {successMsg && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || newAccountCountdown !== null}
                className="btn-primary w-full py-2.5 disabled:opacity-60 text-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {authMode === 'magic-link' ? 'Sending Magic Link…' : 'Signing In…'}
                  </span>
                ) : authMode === 'magic-link' ? (
                  t('Send Magic Link')
                ) : (
                  t('Sign In')
                )}
              </button>
            </form>
          </div>

          {/* Bottom Social / Demo section */}
          <div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-900 px-2 text-slate-400">
                  {t('or continue with')}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || newAccountCountdown !== null}
              type="button"
              className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mb-2.5 disabled:opacity-60 cursor-pointer"
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
              {googleLoading ? 'Signing in with Google…' : t('Sign in with Google')}
            </button>

            <button
              onClick={handleDemoLogin}
              disabled={newAccountCountdown !== null}
              type="button"
              className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 bg-gradient-to-r hover:from-purple-500/10 hover:to-indigo-500/10 cursor-pointer"
            >
              <Sparkles size={14} className="text-purple-500" />
              {t('Demo Mode')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
