import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  Clock,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Role } from '../types';
import { scanPaymentSlip, type SlipOcrResult } from '../lib/slipOcr';

type Step = 'pricing' | 'payment_choice' | 'order_timer' | 'processing';

interface Plan {
  key: string;
  name: string;
  role: Role;
  priceUsd: number;
  period: string;
  desc: string;
  limit: number;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free Forever',
    role: 'user',
    priceUsd: 0,
    period: 'Forever',
    desc: 'Up to 100 employees',
    limit: 100,
    features: ['Up to 100 Employees', 'Email Notifications', 'Standard Templates'],
  },
  {
    key: 'pro_6m',
    name: 'Pro 6 Months',
    role: 'pro',
    priceUsd: 5,
    period: '6 Months',
    desc: 'Up to 1,000 employees',
    limit: 1000,
    features: ['1,000 Employees', 'SMTP & Teams & Telegram', 'Custom AI Templates', 'Excel Import & Export'],
  },
  {
    key: 'pro_12m',
    name: 'Pro 12 Months',
    role: 'pro',
    priceUsd: 9,
    period: '12 Months',
    desc: 'Up to 1,000 employees · Save 10%',
    limit: 1000,
    features: ['1,000 Employees', 'Priority Delivery', 'Multi-channel Bots', 'Dedicated Support'],
  },
  {
    key: 'pro_plus_6m',
    name: 'Ultra 6 Months',
    role: 'pro_plus',
    priceUsd: 15,
    period: '6 Months',
    desc: 'Unlimited employees',
    limit: Infinity,
    features: ['Unlimited Employees', 'Instant AI Dispatch', 'Cloud Database Sync', 'Full Audit Logs'],
  },
  {
    key: 'pro_plus_life',
    name: 'Ultra Lifetime',
    role: 'pro_plus',
    priceUsd: 29,
    period: 'One-time Lifetime',
    desc: 'Unlimited employees forever',
    limit: Infinity,
    popular: true,
    features: ['Unlimited Employees Forever', 'All Pro & Ultra Features', 'Lifetime Updates', 'VIP 24/7 Support'],
  },
];

interface Currency {
  code: string;
  symbol: string;
  label: string;
  rate: number;
  suffix: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', rate: 1, suffix: 'USD' },
  { code: 'MMK', symbol: 'Ks', label: 'MMK (Kyat)', rate: 3600, suffix: 'MMK' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 0.92, suffix: 'EUR' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$)', rate: 1.34, suffix: 'SGD' },
  { code: 'THB', symbol: '฿', label: 'THB (Baht)', rate: 36, suffix: 'THB' },
  { code: 'CRYPTO', symbol: '', label: 'Crypto (USDT)', rate: 1, suffix: 'USDT' },
];

const MMK_WALLETS = [
  { id: 'kbz', name: 'KBZ Pay', account: '09 79 123 4567', holder: 'Milestone App Billing' },
  { id: 'wave', name: 'Wave Pay', account: '09 97 123 4567', holder: 'Milestone App Billing' },
  { id: 'aya', name: 'AYA Pay', account: '09 42 123 4567', holder: 'Milestone App Billing' },
  { id: 'cb', name: 'CB Pay', account: '09 25 123 4567', holder: 'Milestone App Billing' },
];

const CRYPTO_WALLETS = [
  { id: 'usdt_trc20', name: 'USDT (TRC20)', account: 'TYQx7VbN29mNks91Z3Wd8PqL0128', holder: 'Tron Network' },
  { id: 'binance_pay', name: 'Binance Pay ID', account: '492019482', holder: 'Binance User ID' },
  { id: 'usdt_bep20', name: 'USDT (BEP20)', account: '0x3841aB20cF9832B092Fa01889c028F', holder: 'BNB Smart Chain' },
];

export default function Pricing() {
  const { t } = useTranslation();
  const { appUser, switchDemoPlan } = useAuth();

  const [step, setStep] = useState<Step>('pricing');
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[4]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [paymentType, setPaymentType] = useState<'wallet' | 'card' | 'crypto'>('card');
  const [selectedMmkWallet, setSelectedMmkWallet] = useState(MMK_WALLETS[0]);
  const [selectedCryptoWallet, setSelectedCryptoWallet] = useState(CRYPTO_WALLETS[0]);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // 5-min timer
  const [secondsLeft, setSecondsLeft] = useState(300);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Slip Upload & OCR
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<SlipOcrResult | null>(null);

  // Determine current active plan based on user's role
  const isCurrentPlan = (plan: Plan) => {
    if (!appUser) return plan.key === 'free';
    if (appUser.role === 'admin') return plan.role === 'admin';
    if (appUser.role === 'pro_plus') return plan.role === 'pro_plus';
    if (appUser.role === 'pro') return plan.role === 'pro';
    return plan.role === 'user';
  };

  // Timer countdown
  useEffect(() => {
    if (step !== 'order_timer') return;
    setSecondsLeft(300);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setStep('pricing');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Sync payment type when currency changes
  useEffect(() => {
    if (selectedCurrency.code === 'MMK') {
      setPaymentType('wallet');
    } else if (selectedCurrency.code === 'CRYPTO') {
      setPaymentType('crypto');
    } else {
      setPaymentType('card');
    }
  }, [selectedCurrency]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getConvertedPrice = (priceUsd: number, currency: Currency) => {
    if (priceUsd === 0) return 'Free';
    const amount = priceUsd * currency.rate;
    if (currency.code === 'MMK') {
      return `${amount.toLocaleString()} MMK`;
    }
    if (currency.code === 'EUR') {
      return `€${amount.toFixed(2)} EUR`;
    }
    if (currency.code === 'SGD') {
      return `S$${amount.toFixed(2)} SGD`;
    }
    if (currency.code === 'THB') {
      return `${amount.toLocaleString()} THB`;
    }
    if (currency.code === 'CRYPTO') {
      return `${amount.toFixed(2)} USDT`;
    }
    return `$${amount.toFixed(2)} USD`;
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Slip Upload & Run OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
    setOcrLoading(true);
    setOcrResult(null);

    const expectedAccount =
      paymentType === 'wallet'
        ? selectedMmkWallet.account
        : paymentType === 'crypto'
        ? selectedCryptoWallet.account
        : 'Visa/Mastercard';

    const expectedAmount = getConvertedPrice(selectedPlan.priceUsd, selectedCurrency);

    try {
      const result = await scanPaymentSlip(file, expectedAmount, expectedAccount);
      setOcrResult(result);
    } catch {
      setOcrResult({
        valid: false,
        error: 'OCR scanning failed. Please ensure your image is a clear payment screenshot.',
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleCompletePayment = () => {
    if (!ocrResult?.valid) return;

    // Apply plan upgrade
    switchDemoPlan(selectedPlan.role);

    // Save audit log
    try {
      const raw = localStorage.getItem('admin_audit_logs');
      const list = raw ? JSON.parse(raw) : [];
      const entry = {
        id: Date.now().toString(),
        action: `Subscribed to ${selectedPlan.name}`,
        target: `${ocrResult.data?.transactionId || 'Payment Verified'} (${selectedPlan.priceUsd} USD)`,
        time: 'Just now',
        level: 'success',
      };
      localStorage.setItem('admin_audit_logs', JSON.stringify([entry, ...list].slice(0, 30)));
    } catch {}

    setStep('processing');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Sparkles className="text-corp-blue dark:text-gold-500" size={24} />
          {t('Upgrade Plan & Pricing')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          {t('Choose a subscription tier. All prices shown in standard $ USD.')}
        </p>
      </div>

      {/* STEP 1: PRICING PLANS */}
      {step === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {PLANS.map((plan) => {
              const current = isCurrentPlan(plan);
              const isSelected = selectedPlan.key === plan.key;

              return (
                <div
                  key={plan.key}
                  onClick={() => {
                    if (!current) setSelectedPlan(plan);
                  }}
                  className={cn(
                    'glass-panel p-4 flex flex-col justify-between transition-all relative rounded-2xl',
                    current
                      ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40'
                      : isSelected
                      ? 'ring-2 ring-corp-blue dark:ring-gold-500 border-transparent shadow-md'
                      : 'hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer',
                    plan.popular && !current && 'border-purple-500/60 shadow-sm'
                  )}
                >
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    {current ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {t('Current Plan')}
                      </span>
                    ) : plan.popular ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                        {t('Recommended')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">{plan.period}</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-3">
                      {plan.desc}
                    </p>

                    {/* ONLY SHOW $ USD PRICE */}
                    <div className="mb-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                          ${plan.priceUsd}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">USD</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{plan.period}</div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-zinc-400 mb-4">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    {current ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 cursor-default flex items-center justify-center gap-1"
                      >
                        <ShieldCheck size={13} />
                        {t('Current Plan')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={cn(
                          'w-full py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1',
                          isSelected
                            ? 'bg-corp-blue text-white dark:bg-gold-500 dark:text-zinc-950 font-bold shadow-xs'
                            : 'btn-secondary'
                        )}
                      >
                        {isSelected ? (
                          <>
                            <Check size={13} />
                            {t('Selected')}
                          </>
                        ) : (
                          <>
                            <ArrowRight size={13} />
                            {t('Upgrade')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center glass-panel p-4">
            <div className="text-xs">
              <span className="text-slate-500 dark:text-zinc-400">Selected: </span>
              <span className="font-bold text-slate-800 dark:text-white">
                {selectedPlan.name} (${selectedPlan.priceUsd} USD)
              </span>
            </div>
            <button
              onClick={() => setStep('payment_choice')}
              disabled={isCurrentPlan(selectedPlan) || selectedPlan.priceUsd === 0}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{t('Continue to Payment')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CURRENCY CHOICE & PAYMENT METHOD */}
      {step === 'payment_choice' && (
        <div className="glass-panel p-6 max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                {selectedPlan.name}
              </h2>
              <p className="text-xs text-slate-500">Base Price: ${selectedPlan.priceUsd} USD</p>
            </div>
            <button
              onClick={() => setStep('pricing')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              Change Plan
            </button>
          </div>

          {/* 1. CURRENCY CHOICE */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              1. {t('Select Payment Currency')}:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CURRENCIES.map((cur) => {
                const isCur = selectedCurrency.code === cur.code;
                return (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => setSelectedCurrency(cur)}
                    className={cn(
                      'p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                      isCur
                        ? 'border-corp-blue bg-blue-50 dark:border-gold-500 dark:bg-gold-500/10 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-600 dark:text-zinc-400'
                    )}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{cur.code}</div>
                    <div className="text-[10px] text-slate-400">{cur.symbol || '₮'}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOTAL IN SELECTED CURRENCY */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Converted Total ({selectedCurrency.code}):
            </span>
            <span className="text-lg font-black text-corp-blue dark:text-gold-400 font-mono">
              {getConvertedPrice(selectedPlan.priceUsd, selectedCurrency)}
            </span>
          </div>

          {/* 2. PAYMENT METHOD SELECTION */}
          {selectedCurrency.code === 'MMK' ? (
            /* MMK DROPDOWN WALLET CHOOSER */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                2. {t('Select Myanmar Mobile Wallet')}:
              </label>
              <div className="space-y-2">
                <select
                  value={selectedMmkWallet.id}
                  onChange={(e) => {
                    const found = MMK_WALLETS.find((w) => w.id === e.target.value);
                    if (found) setSelectedMmkWallet(found);
                  }}
                  className="glass-input text-xs w-full py-2.5 px-3 cursor-pointer"
                >
                  {MMK_WALLETS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.account} ({w.holder})
                    </option>
                  ))}
                </select>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">{selectedMmkWallet.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Account: {selectedMmkWallet.account}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Instant Transfer
                  </span>
                </div>
              </div>
            </div>
          ) : selectedCurrency.code === 'CRYPTO' ? (
            /* CRYPTO WALLET CHOOSER */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                2. {t('Select Crypto Network')}:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CRYPTO_WALLETS.map((cw) => (
                  <button
                    key={cw.id}
                    type="button"
                    onClick={() => setSelectedCryptoWallet(cw)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left cursor-pointer transition-all',
                      selectedCryptoWallet.id === cw.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20 font-bold'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                    )}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{cw.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{cw.holder}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* USD / EUR / OTHER: CARD OR CRYPTO CHOICES */
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                2. {t('Choose Checkout Method')}:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={cn(
                    'flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all',
                    paymentType === 'card'
                      ? 'border-corp-blue bg-blue-50 dark:border-gold-500 dark:bg-gold-500/10 text-corp-blue dark:text-gold-400'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  )}
                >
                  <CreditCard size={15} />
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('crypto')}
                  className={cn(
                    'flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all',
                    paymentType === 'crypto'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                  )}
                >
                  <Wallet size={15} />
                  Crypto (USDT)
                </button>
              </div>

              {paymentType === 'card' && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="glass-input text-xs py-1.5 px-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="glass-input text-xs py-1.5 px-2.5 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="glass-input text-xs py-1.5 px-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="glass-input text-xs py-1.5 px-2.5 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentType === 'crypto' && (
                <div className="space-y-2">
                  <select
                    value={selectedCryptoWallet.id}
                    onChange={(e) => {
                      const found = CRYPTO_WALLETS.find((w) => w.id === e.target.value);
                      if (found) setSelectedCryptoWallet(found);
                    }}
                    className="glass-input text-xs w-full py-2 px-3 cursor-pointer"
                  >
                    {CRYPTO_WALLETS.map((cw) => (
                      <option key={cw.id} value={cw.id}>
                        {cw.name} — {cw.holder}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* CONFIRM AND ORDER BUTTON */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setStep('pricing')}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('order_timer');
                setOcrResult(null);
                setSlipFile(null);
                setSlipPreview(null);
              }}
              className="btn-primary text-xs py-2 px-4 flex-1 flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <span>{t('Confirm and Order')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ORDER TIMER (5 MIN) + QR CODE + SLIP UPLOAD OCR */}
      {step === 'order_timer' && (
        <div className="glass-panel p-6 max-w-lg mx-auto space-y-5">
          {/* Top Bar with 5 Min Countdown Timer */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">
                {selectedPlan.name} · {getConvertedPrice(selectedPlan.priceUsd, selectedCurrency)}
              </h2>
              <p className="text-[11px] text-slate-400">Order pending payment verification</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-mono font-bold animate-pulse">
              <Clock size={13} />
              <span>{formatTimer(secondsLeft)}</span>
            </div>
          </div>

          {/* QR Code and Account Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-xs border flex items-center justify-center shrink-0">
              <QrCode size={90} className="text-slate-900" />
            </div>

            <div className="text-xs space-y-1.5 text-center sm:text-left flex-1 min-w-0">
              <div className="font-bold text-slate-800 dark:text-white">
                {selectedCurrency.code === 'MMK'
                  ? selectedMmkWallet.name
                  : selectedCurrency.code === 'CRYPTO' || paymentType === 'crypto'
                  ? selectedCryptoWallet.name
                  : 'Card Payment Gateway'}
              </div>

              <div className="text-[11px] text-slate-500">
                Account Name: <strong>Milestone App Billing</strong>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1 font-mono text-xs text-corp-blue dark:text-gold-400 font-semibold truncate">
                <span>
                  {selectedCurrency.code === 'MMK'
                    ? selectedMmkWallet.account
                    : selectedCurrency.code === 'CRYPTO' || paymentType === 'crypto'
                    ? selectedCryptoWallet.account
                    : 'Invoice #MIL-' + Math.floor(Math.random() * 89999 + 10000)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyAccount(
                      selectedCurrency.code === 'MMK'
                        ? selectedMmkWallet.account
                        : selectedCryptoWallet.account
                    )
                  }
                  className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Copy account"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>

              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Amount to transfer: {getConvertedPrice(selectedPlan.priceUsd, selectedCurrency)}
              </div>
            </div>
          </div>

          {/* PAYMENT SLIP UPLOAD & OCR SCAN SECTION */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-white">
                {t('Upload Payment Screenshot / Transfer Slip')}:
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                AI OCR Auto-Scan
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {!slipPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-corp-blue dark:hover:border-gold-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-zinc-900/50"
              >
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {t('Click to upload payment screenshot')}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Required: PNG, JPG, or screenshot with transaction ID & amount
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <img
                    src={slipPreview}
                    alt="Slip preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-zinc-700"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-white truncate">
                      {slipFile?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {Math.round((slipFile?.size || 0) / 1024)} KB · Click change to replace
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-[11px] py-1 px-2.5 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* OCR SCANNING PROGRESS */}
                {ocrLoading && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-corp-blue dark:text-gold-400 text-xs flex items-center gap-2 border border-blue-200 dark:border-blue-900/50">
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Scanning payment slip with OCR for transaction ID & amount...</span>
                  </div>
                )}

                {/* OCR FAILED: INVALID SLIP ALERT */}
                {!ocrLoading && ocrResult && !ocrResult.valid && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle size={15} className="shrink-0 text-red-500" />
                      <span>Invalid Payment Slip</span>
                    </div>
                    <p className="text-[11px] pl-6 text-red-600 dark:text-red-300">
                      {ocrResult.error ||
                        'Not found transaction ID and amount. Please upload a genuine payment transfer screenshot.'}
                    </p>
                  </div>
                )}

                {/* OCR SUCCESS: VALID SLIP DETECTED */}
                {!ocrLoading && ocrResult && ocrResult.valid && ocrResult.data && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span>Payment Slip Verified by OCR</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200 dark:border-emerald-900/60 font-mono">
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400 block font-sans text-[10px]">
                          Transaction ID:
                        </span>
                        <strong className="text-emerald-900 dark:text-emerald-200">
                          {ocrResult.data.transactionId}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400 block font-sans text-[10px]">
                          Verified Amount:
                        </span>
                        <strong className="text-emerald-900 dark:text-emerald-200">
                          {ocrResult.data.amount}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400 block font-sans text-[10px]">
                          Target Account:
                        </span>
                        <span className="text-slate-700 dark:text-zinc-300">
                          {ocrResult.data.accountNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400 block font-sans text-[10px]">
                          OCR Confidence:
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {ocrResult.data.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons: "Completed Paid" is DISABLED if slip is missing or OCR invalid */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setStep('payment_choice')}
              className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!ocrResult?.valid || ocrLoading}
              onClick={handleCompletePayment}
              className={cn(
                'btn-primary text-xs py-2 px-4 flex-1 flex items-center justify-center gap-1.5 font-bold transition-all',
                !ocrResult?.valid
                  ? 'opacity-40 cursor-not-allowed bg-slate-300 dark:bg-zinc-800 text-slate-500'
                  : 'cursor-pointer hover:scale-101'
              )}
            >
              <CheckCircle2 size={14} />
              <span>{t('Completed Paid')}</span>
            </button>
          </div>

          {!ocrResult?.valid && (
            <p className="text-[10px] text-center text-slate-400">
              * "Completed Paid" button will unlock once a verified payment screenshot is scanned by OCR.
            </p>
          )}
        </div>
      )}

      {/* STEP 4: PROCESSING CONFIRMATION */}
      {step === 'processing' && (
        <div className="glass-panel p-8 max-w-md mx-auto text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {t('Payment Slip Verified & Submitted')}
          </h2>

          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('Your payment transfer slip was scanned and verified by OCR. Your account has been upgraded to')}
            {' '}
            <strong className="text-corp-blue dark:text-gold-400">{selectedPlan.name}</strong>.
          </p>

          {ocrResult?.data && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-left font-mono space-y-1">
              <div>Ref: {ocrResult.data.transactionId}</div>
              <div>Amount: {ocrResult.data.amount}</div>
              <div>Plan: {selectedPlan.name}</div>
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 text-xs text-slate-500">
            {t('Need fast-track support?')}
            <div className="mt-1 font-mono text-corp-blue dark:text-gold-400">t.me/milestone_support</div>
          </div>

          <button
            type="button"
            onClick={() => setStep('pricing')}
            className="btn-primary text-xs w-full py-2 cursor-pointer font-bold"
          >
            {t('Back to Plans')}
          </button>
        </div>
      )}
    </div>
  );
}
