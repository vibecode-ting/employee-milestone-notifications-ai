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
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  Cpu,
  Database,
  Volume2,
  Bot,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
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

      </div>
  );
}

function Slide1({ onSignIn, onInteract }: { onSignIn?: () => void; onInteract?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center max-w-lg mx-auto">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium mb-4 backdrop-blur-md">
        <AlertTriangle size={13} />
        <span>The JAPAC Enterprise Dilemma</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2.5">
        Scattered Dates & Forgotten Milestones
      </h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md leading-relaxed">
        When employee birthdays and work jubilees live in fragmented spreadsheets, critical dates get overlooked and cross-border teams feel detached.
      </p>

      <div className="flex flex-col gap-2.5 w-full max-w-sm mb-6 text-left">
        {[
          {
            icon: FileSpreadsheet,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20',
            title: '42% Milestones Overlooked',
            desc: 'Legacy spreadsheets fail to alert leaders with sufficient lead time.',
          },
          {
            icon: Globe,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
            title: 'Cultural Tone Friction',
            desc: 'Generic English templates lack nuance across 14 distinct JAPAC cultures.',
          },
          {
            icon: Layers,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/20',
            title: '15+ Hours Manual Overhead',
            desc: 'HR teams waste hours drafting repetitive emails and cards manually.',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onMouseEnter={() => onInteract?.()}
              onClick={() => onInteract?.()}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs backdrop-blur-md hover:border-slate-700 transition-colors cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${item.bg} border flex-shrink-0 mt-0.5`}>
                <Icon size={16} className={item.color} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-xs">{item.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 size={13} />
        <span>Solved with Proactive AI Automation</span>
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
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-medium mb-4 backdrop-blur-md">
        <Zap size={13} />
        <span>Zero-Touch Automation Engine</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2.5">
        Proactive Omnichannel Delivery
      </h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md leading-relaxed">
        AI detects upcoming jubilees, drafts personalized cultural copy, and dispatches across all your enterprise communication channels automatically.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6 text-left">
        {[
          {
            icon: '📧',
            name: 'Email SMTP',
            desc: 'Personalized inbox letters with responsive celebration card HTML.',
            color: 'from-sky-500/20 to-blue-600/20 border-sky-500/30',
          },
          {
            icon: '💬',
            name: 'Google Chat',
            desc: 'Instant space webhooks with interactive milestone card embeds.',
            color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30',
          },
          {
            icon: '👥',
            name: 'MS Teams',
            desc: 'Rich adaptive cards delivered directly to team collaboration channels.',
            color: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30',
          },
          {
            icon: '✈️',
            name: 'Telegram Bot',
            desc: 'Instant mobile alerts with milestone badges for field & remote staff.',
            color: 'from-cyan-500/20 to-sky-600/20 border-cyan-500/30',
          },
        ].map((ch, idx) => (
          <div
            key={idx}
            onMouseEnter={() => onInteract?.()}
            onClick={() => onInteract?.()}
            className={`p-3 rounded-xl bg-gradient-to-br ${ch.color} border bg-slate-900/60 backdrop-blur-md hover:scale-[1.02] transition-transform cursor-pointer`}
          >
            <div className="text-xl mb-1.5">{ch.icon}</div>
            <h4 className="text-white font-semibold text-xs">{ch.name}</h4>
            <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5">{ch.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400" />
          T-30d, T-7d, T-1d Lead Alerts
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-sky-400 font-semibold">100% Scheduled Delivery</span>
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
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center max-w-lg mx-auto">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium mb-3 backdrop-blur-md">
        <Sparkles size={13} />
        <span>Google Cloud & Vertex AI Native</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
        Google Cloud & AI Architecture
      </h2>
      <p className="text-slate-400 text-xs sm:text-sm mb-5 max-w-md leading-relaxed">
        Production-grade ecosystem orchestrating Google frontier AI for enterprise productivity.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-md mb-5 text-left">
        {[
          {
            icon: Sparkles,
            name: 'Gemini 2.5 Flash',
            desc: 'Cultural tone reasoning & localized celebration copy across 14 JAPAC locales.',
            color: 'text-amber-400',
            border: 'border-amber-500/20',
          },
          {
            icon: Bot,
            name: 'Vertex AI Agent',
            desc: 'Autonomous HR Copilot with tool-use reasoning and natural language queries.',
            color: 'text-sky-400',
            border: 'border-sky-500/20',
          },
          {
            icon: Volume2,
            name: 'Cloud STT & TTS',
            desc: 'Voice query transcription & neural audio greeting synthesizer in native tongues.',
            color: 'text-purple-400',
            border: 'border-purple-500/20',
          },
          {
            icon: Award,
            name: 'Imagen on Vertex',
            desc: 'Dynamic personalized milestone certificate graphics & badge art generator.',
            color: 'text-rose-400',
            border: 'border-rose-500/20',
          },
          {
            icon: Cpu,
            name: 'Cloud Run & Firestore',
            desc: 'Serverless multi-tenant elastic compute with sub-second real-time state sync.',
            color: 'text-emerald-400',
            border: 'border-emerald-500/20',
          },
          {
            icon: Database,
            name: 'BigQuery Telemetry',
            desc: 'Tenure retention risk cohorts, 12-month budget forecast & morale radar index.',
            color: 'text-cyan-400',
            border: 'border-cyan-500/20',
          },
        ].map((svc, idx) => {
          const Icon = svc.icon;
          return (
            <div
              key={idx}
              onMouseEnter={() => onInteract?.()}
              onClick={() => onInteract?.()}
              className={`p-2.5 rounded-xl bg-slate-900/80 border ${svc.border} backdrop-blur-md hover:border-slate-600 transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={14} className={svc.color} />
                <h4 className="text-white font-semibold text-[11px] truncate">{svc.name}</h4>
              </div>
              <p className="text-slate-400 text-[10px] leading-tight line-clamp-3">{svc.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 text-[11px] font-medium">
        <Cpu size={12} className="text-sky-400" />
        <span>100% Google Cloud Native Infrastructure</span>
      </div>

      {onSignIn && (
        <button onClick={onSignIn} className="mt-4 md:hidden btn-primary text-xs py-2 px-5 rounded-lg">
          Sign In
        </button>
      )}
    </div>
  );
}

function Slide4({ onSignIn, onInteract }: { onSignIn?: () => void; onInteract?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center max-w-lg mx-auto">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4 backdrop-blur-md">
        <ShieldCheck size={13} />
        <span>Enterprise Security & Telemetry</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2.5">
        Governance, Privacy & BigQuery Radar
      </h2>
      <p className="text-slate-400 text-sm mb-6 max-w-md leading-relaxed">
        Bank-grade tenant isolation, granular RBAC, localized payment slip receipt OCR, and deep workforce morale analytics.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6 text-left">
        {[
          {
            title: 'Granular RBAC',
            desc: 'Admin vs Standard User access control with zero cross-tenant data leakage.',
            badge: 'ISO-Grade Security',
            color: 'border-emerald-500/30',
          },
          {
            title: 'Multimodal Receipt OCR',
            desc: 'Gemini 3.6 Flash scans local wallet slips (KBZ, Wave, AYA) with zero data loss.',
            badge: 'Local FinTech',
            color: 'border-sky-500/30',
          },
          {
            title: 'BigQuery Morale Radar',
            desc: 'Continuous tracking of department recognition coverage and celebration velocity.',
            badge: 'Live Analytics',
            color: 'border-amber-500/30',
          },
          {
            title: 'Immutable Audit Trail',
            desc: 'Every milestone dispatch, tone modification, and plan upgrade logged transparently.',
            badge: 'Full Compliance',
            color: 'border-purple-500/30',
          },
        ].map((item, idx) => (
          <div
            key={idx}
            onMouseEnter={() => onInteract?.()}
            onClick={() => onInteract?.()}
            className={`p-3 rounded-xl bg-slate-900/80 border ${item.color} backdrop-blur-md text-xs hover:border-slate-500 transition-colors cursor-pointer`}
          >
            <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">{item.badge}</span>
            <h4 className="text-white font-semibold text-xs mt-0.5">{item.title}</h4>
            <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          100% On-Time Scheduled Delivery
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-emerald-400 font-semibold">Zero Cross-Tenant Leakage</span>
      </div>

      {onSignIn && (
        <button onClick={onSignIn} className="mt-5 md:hidden btn-primary text-xs py-2 px-5 rounded-lg">
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
  

  const [isPaused, setIsPaused] = useState(true);
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
        // reset cycle
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

  // Slideshow timer: 5s interval to rotate only when NOT paused
  useEffect(() => {
    if (isPaused || isInteracting) return;
    const id = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(id);
  }, [isPaused, isInteracting]);

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
          LEFT PANEL: Cinematic 3D JAPAC Network Globe (WebGL) - Exactly 60%
          ========================================================================= */}
      <div
        className="w-full md:w-[60%] lg:w-[60%] h-[420px] sm:h-[480px] md:h-screen md:min-h-screen relative overflow-hidden bg-slate-950 shrink-0 block"
        
        
        
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
            onClick={() => setIsPaused((prev) => !prev)}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-md transition-all shadow-md cursor-pointer border ${
              isPaused
                ? 'bg-slate-900/85 border-amber-500/50 text-amber-300 hover:bg-slate-800'
                : 'bg-slate-900/85 border-emerald-500/50 text-emerald-300 hover:bg-slate-800'
            }`}
            title={isPaused ? 'Slideshow paused. Click to auto-play (5s).' : 'Click to pause'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>{isPaused ? 'Paused' : 'Auto-play'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Premium Authentication & Info Card (Tailwind) - Exactly 40%
          ========================================================================= */}
      <div className={`w-full md:w-[40%] lg:w-[40%] flex flex-col justify-between p-5 sm:p-8 lg:p-10 shrink-0 relative min-h-screen border-t md:border-t-0 md:border-l transition-colors duration-500 ${
        dark
          ? 'bg-slate-950/95 text-slate-100 border-white/10'
          : 'bg-slate-50/95 text-slate-900 border-black md:border-l-2'
      }`}>
        {/* Top-Right Utility Row: Language Selector & Orbital Sunrise/Sunset Toggle */}
        <div className="w-full flex items-center justify-end gap-2.5 mb-4 z-20">
          {/* Language Selector */}
          <div className={`h-9 flex items-center gap-1.5 px-3 rounded-lg border backdrop-blur-md text-xs font-medium transition-colors ${
            dark
              ? 'bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/20'
              : 'bg-white border-2 border-black text-slate-900 shadow-sm'
          }`}>
            <Globe size={14} className={dark ? 'text-slate-400 shrink-0' : 'text-slate-500 shrink-0'} />
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label={t('Language')}
              className={`bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 ${
                dark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code} className={dark ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}>
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
            className={`h-9 px-3 rounded-lg border backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm ${
              dark
                ? 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-slate-800/80'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-300 hover:bg-slate-100 shadow-sm'
            }`}
            title={dark ? 'Toggle Sunrise (Light Mode)' : 'Toggle Sunset (Dark Mode)'}
          >
            {dark ? (
              <>
                <Sun size={14} className="text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Sunrise</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-indigo-600" />
                <span className="hidden sm:inline">Sunset</span>
              </>
            )}
          </button>
        </div>

        {/* Center Single Auth Card */}
        <div className={`w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-2xl backdrop-blur-xl border shadow-2xl relative overflow-hidden transition-colors duration-500 ${
          dark
            ? 'bg-slate-900/40 border-white/10'
            : 'bg-white border-2 border-black shadow-slate-300'
        }`}>
          {/* Brand Header with Mode-Adaptive Cake Icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              dark
                ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/40 text-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-100 border-2 border-slate-900 text-slate-950 shadow-sm'
            }`}>
              <Cake size={24} className={dark ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-950'} />
            </div>
            <div>
              <span className={`text-2xl font-black tracking-tight flex items-center gap-1.5 ${
                dark ? 'text-white' : 'text-slate-900'
              }`}>
                {t('HR Chronicle AI')}
              </span>
              <p className={`text-[11px] font-medium ${
                dark ? 'text-slate-400' : 'text-slate-500'
              }`}>{t('Milestone Intelligence Copilot for Human Beings')}</p>
            </div>
          </div>

          {/* Dual Tabs: Password vs Magic Link */}
          <div className={`flex rounded-xl border p-1 mb-6 text-xs font-semibold ${
            dark ? 'bg-slate-950/60 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
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
                  : dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
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
                  : dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
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
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                dark ? 'text-slate-300' : 'text-slate-700'
              }`}>
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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all ${
                  dark
                    ? 'bg-slate-950/70 border-white/15 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                placeholder="you@company.com"
              />
            </div>

            {authMode === 'password' ? (
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                    dark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
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
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all ${
                        dark
                          ? 'bg-slate-950/70 border-white/15 text-white placeholder-slate-500'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
                        dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Informative Blue/Indigo Beta Notice */}
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
                  dark
                    ? 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <Info size={15} className="shrink-0 mt-0.5 text-sky-500" />
                  <span>Beta notice: Instant activation enabled. No email verification code needed.</span>
                </div>
              </div>
            ) : (
              <div>
                {/* Magic Link Notice */}
                <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
                  dark
                    ? 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <Info size={15} className="shrink-0 mt-0.5 text-sky-500" />
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
              <div className={`w-full border-t ${dark ? 'border-white/10' : 'border-slate-200'}`} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-3 font-medium rounded-full ${
                dark ? 'bg-slate-900/90 text-slate-400' : 'bg-white text-slate-500'
              }`}>
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
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                dark
                  ? 'border-white/15 bg-slate-950/60 hover:bg-slate-800/80 text-white'
                  : 'border-2 border-black bg-white hover:bg-slate-100 text-black font-bold'
              }`}
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
                className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  dark
                    ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-purple-500/15 hover:border-purple-400 hover:from-purple-500/25 hover:to-indigo-500/25 text-purple-200 text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'border-2 border-black bg-slate-200 hover:bg-slate-300 text-black text-xs font-black shadow-sm'
                }`}
              >
                <Zap size={14} className={dark ? 'text-amber-400 fill-amber-400' : 'text-black fill-black'} />
                <span className={dark ? 'text-purple-200 font-bold' : 'text-black font-black tracking-wide'}>
                  ⚡ Demo Mode
                </span>
              </button>
          </div>
        </div>

        {/* Quotes & High-Value Footer */}
        <div className={`w-full max-w-md mx-auto mt-6 pt-5 border-t space-y-3 z-10 text-center sm:text-left ${
          dark ? 'border-white/10' : 'border-slate-200'
        }`}>
          {/* Title & Quote */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-slate-400">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-500/90">
              <Trophy size={13} className="text-amber-500" />
              <span>AI BUILDER CUP 2026</span>
            </div>
            <div className={`text-xs italic font-serif text-center sm:text-right ${
              dark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              "Build in JAPAC, Build for the World"
            </div>
          </div>

          {/* Base Line Credit Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-3 pb-2 gap-3 border-t border-white/5">
            <span className="tracking-wide">HR Chronicle AI &copy; 2026</span>
            <div className={`flex items-center gap-3 sm:gap-4 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              <a href="/privacy" className="hover:text-sky-400 transition-colors px-1 py-0.5">
                Privacy
              </a>
              <span>&bull;</span>
              <a href="/terms" className="hover:text-sky-400 transition-colors px-1 py-0.5">
                Terms
              </a>
              <span>&bull;</span>
              <a href="/status" className="hover:text-sky-400 transition-colors px-1 py-0.5">
                Status
              </a>
              <span>&bull;</span>
              <a
                href="https://github.com/vibecode-ting/hr_chronicle_ai"
                target="_blank"
                rel="noopener noreferrer"
                title="View Source on GitHub"
                aria-label="GitHub Repository"
                className="hover:text-sky-400 transition-colors px-1 py-0.5 inline-flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
