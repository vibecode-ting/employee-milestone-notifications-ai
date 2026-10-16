import { useState, useEffect } from 'react';
import { Clock, QrCode } from 'lucide-react';
import { cn } from '../lib/utils';

type Step = 'pricing' | 'checkout' | 'processing';

const PLANS = [
  { key: 'free', name: 'Free Forever', mmk: '0', usdt: '0', desc: 'Up to 100 employees', limit: 100 },
  { key: 'pro_6m', name: 'Pro 6 Months', mmk: '5,000', usdt: '1.50', desc: 'Up to 1,000 employees', limit: 1000 },
  { key: 'pro_12m', name: 'Pro 12 Months', mmk: '10,000', usdt: '3.00', desc: 'Up to 1,000 employees', limit: 1000 },
  { key: 'pro_plus_6m', name: 'Pro Plus 6 Months', mmk: '15,000', usdt: '4.50', desc: 'Unlimited employees', limit: Infinity },
  { key: 'pro_plus_life', name: 'Pro Plus Lifetime', mmk: '30,000', usdt: '9.00', desc: 'Unlimited employees forever', limit: Infinity, popular: true },
];

const WALLETS = [
  { id: 'kbz', name: 'KBZ Pay', account: '09 79 123 4567' },
  { id: 'wave', name: 'Wave Pay', account: '09 97 123 4567' },
  { id: 'aya', name: 'AYA Pay', account: '09 42 123 4567' },
  { id: 'crypto', name: 'Crypto (USDT)', account: 'Binance Pay TRC20: TXYZ1234567890' },
];

export default function Pricing() {
  const [step, setStep] = useState<Step>('pricing');
  const [selectedPlan, setSelectedPlan] = useState(PLANS[4]);
  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0]);
  const [secondsLeft, setSecondsLeft] = useState(300);

  useEffect(() => {
    if (step !== 'checkout') return;
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

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Upgrade Plan</h1>

      {step === 'pricing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan.key === plan.key;
              return (
                <div
                  key={plan.key}
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    'glass-panel p-4 flex flex-col justify-between cursor-pointer transition-all',
                    isSelected && 'ring-2 ring-purple-500 scale-102',
                    plan.popular && 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white dark:border-purple-500/40'
                  )}
                >
                  <div>
                    {plan.popular && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gold-500 text-zinc-900 mb-2 inline-block">
                        Recommended
                      </span>
                    )}
                    <h3 className={cn("font-bold text-sm mb-1", plan.popular ? "text-white" : "text-slate-800 dark:text-white")}>
                      {plan.name}
                    </h3>
                    <p className={cn("text-xs mb-3", plan.popular ? "text-purple-200" : "text-slate-500 dark:text-zinc-400")}>
                      {plan.desc}
                    </p>
                  </div>
                  <div>
                    <div className="text-lg font-bold mb-0.5">
                      {plan.mmk} <span className="text-xs font-normal">MMK</span>
                    </div>
                    <div className={cn("text-xs mb-3", plan.popular ? "text-purple-200" : "text-slate-400")}>
                      ${plan.usdt} USDT
                    </div>
                    <button
                      className={cn(
                        "w-full py-1.5 rounded-lg text-xs font-semibold transition-all",
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "btn-secondary"
                      )}
                    >
                      {isSelected ? 'Selected' : 'Choose'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep('checkout')}
              disabled={selectedPlan.key === 'free'}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === 'checkout' && (
        <div className="glass-panel p-6 max-w-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white">{selectedPlan.name}</h2>
              <p className="text-xs text-slate-500">{selectedPlan.mmk} MMK / ${selectedPlan.usdt} USDT</p>
            </div>
            <div className="text-xs font-mono bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock size={12} /> {formatTimer(secondsLeft)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-2">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWallet(w)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all',
                    selectedWallet.id === w.id
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-slate-200 dark:border-zinc-800'
                  )}
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-white">{w.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{w.account}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center gap-4">
            <div className="w-20 h-20 bg-white p-1 rounded-lg border flex items-center justify-center shrink-0">
              <QrCode size={48} className="text-slate-800" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-semibold text-slate-700 dark:text-zinc-300">Scan & Transfer</div>
              <div className="text-slate-500">{selectedWallet.name}</div>
              <div className="font-mono text-purple-600 dark:text-purple-400 select-all">{selectedWallet.account}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep('pricing')} className="btn-secondary text-sm flex-1">Back</button>
            <button onClick={() => setStep('processing')} className="btn-primary text-sm flex-1">Completed Paid</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="glass-panel p-8 max-w-md text-center space-y-4">
          <Clock size={48} className="text-amber-500 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Payment Under Review</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Admin will verify your payment and activate your plan within 24 hours.
          </p>
          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 text-xs text-slate-500">
            Need faster activation? Contact support:
            <div className="mt-1 font-mono text-corp-blue dark:text-gold-400">t.me/milestone_support</div>
          </div>
          <button onClick={() => setStep('pricing')} className="btn-secondary text-sm w-full">Back to Plans</button>
        </div>
      )}
    </div>
  );
}
