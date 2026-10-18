import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  X, Check, Sparkles, Zap, Shield, Crown, ArrowRight,
} from 'lucide-react';
import type { Role } from '../../types';

interface TierComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightTier?: Role;
}

export function TierComparisonModal({ isOpen, onClose, highlightTier = 'pro' }: TierComparisonModalProps) {
  const { t } = useTranslation();
  const { appUser, switchDemoPlan, isDemo } = useAuth();
  const [, setSelectedPlan] = useState<Role>(highlightTier);

  if (!isOpen) return null;

  const handleSandboxSwitch = (role: Role) => {
    switchDemoPlan(role);
    setSelectedPlan(role);
  };

  const TIERS = [
    {
      role: 'user' as Role,
      name: t('Free Forever'),
      badge: t('Starter'),
      price: '$0',
      period: t('forever'),
      description: t('Ideal for small startups & testing the platform.'),
      limit: t('100 Employees'),
      color: 'slate',
      icon: Shield,
      features: [
        t('Up to 100 Employee Roster'),
        t('Standard Email Notifications'),
        t('Basic Milestone Templates'),
        t('3D JAPAC Network Visualization'),
        t('Standard Search & Filters'),
        t('Community Support'),
      ],
      notIncluded: [
        t('AI Milestone Card Customizer (GenAI)'),
        t('Non-Admin Employee AI Copilot'),
        t('Dynamic Custom Columns (T-Shirt, Budget, etc.)'),
        t('BigQuery HR Analytics & Forecasting'),
        t('Multi-channel Telegram & Teams bots'),
      ],
    },
    {
      role: 'pro' as Role,
      name: t('Pro Tier'),
      badge: t('Most Popular'),
      price: '$5',
      period: t('per 6 mo'),
      description: t('Full GenAI power for growing teams & HR operations.'),
      limit: t('1,000 Employees'),
      color: 'indigo',
      popular: true,
      icon: Zap,
      features: [
        t('Up to 1,000 Employee Roster'),
        t('✨ Gen AI Milestone Card Studio (Gemini)'),
        t('🤖 Non-Admin Employee Copilot (Safe Edits)'),
        t('🎨 Dynamic Custom Columns (Unlimited Fields)'),
        t('Multimodal OCR Roster Import'),
        t('Voice STT & Audio Listen Readouts'),
        t('Teams, Telegram, & SMTP Integrations'),
        t('Priority Slack & Email Support'),
      ],
      notIncluded: [
        t('Enterprise BigQuery HR Analytics Data Warehouse'),
        t('Custom SSO / SAML & SCIM Sync'),
      ],
    },
    {
      role: 'pro_plus' as Role,
      name: t('Ultra Enterprise'),
      badge: t('All Inclusive'),
      price: '$15',
      period: t('per 6 mo'),
      description: t('Enterprise scale, BigQuery analytics, & unlimited roster.'),
      limit: t('Unlimited Employees'),
      color: 'gold',
      icon: Crown,
      features: [
        t('Unlimited Employee Roster'),
        t('Everything in Pro Tier'),
        t('📊 BigQuery HR Analytics & Forecasting'),
        t('Tenure Cohort & Retention Risk Heatmaps'),
        t('Text-Embedding-004 Semantic Search'),
        t('Instant Multi-channel AI Dispatch'),
        t('Direct Cloud DB Sync (Postgres, BigQuery)'),
        t('Dedicated Solution Architect'),
      ],
      notIncluded: [],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 md:p-8 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles size={14} />
            <span>{t('Product-Led Growth (PLG) Architecture')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {t('Choose Your Milestone Intelligence Tier')}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {t("Show, don't hide: Explore how our AI transforms team recognition, or test with 1-click sandbox mode.")}
          </p>

          {/* Sandbox Switcher Banner */}
          {isDemo && (
            <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs">
              <span className="font-semibold">{t('⚡ Active Sandbox Demo:')}</span>
              <span className="text-slate-300">{t('Click any tier below to instantly simulate and unlock that plan without paying!')}</span>
            </div>
          )}
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = appUser?.role === tier.role;

            return (
              <div
                key={tier.role}
                className={`relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-200 border ${
                  tier.popular
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-indigo-500/60 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-indigo-400">
                      <Icon size={22} />
                    </div>
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                        {t('Current Plan')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{tier.description}</p>

                  <div className="mt-4 pb-4 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">{tier.price}</span>
                      <span className="text-xs text-slate-400 font-medium">/ {tier.period}</span>
                    </div>
                    <div className="text-xs font-semibold text-indigo-400 mt-1">
                      {tier.limit}
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-5 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t('Included Features:')}
                    </div>
                    {tier.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                    {tier.notIncluded.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-500 line-through opacity-70">
                        <X size={14} className="text-slate-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-8 pt-4">
                  {isDemo ? (
                    <button
                      onClick={() => handleSandboxSwitch(tier.role)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 cursor-default'
                          : tier.popular
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        t('Active in Demo')
                      ) : (
                        <>
                          <span>⚡ {t('Test {{name}}', { name: tier.name })}</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  ) : (
                    <a
                      href="/pricing"
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        tier.popular
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>{t('Upgrade to {{name}}', { name: tier.name })}</span>
                      <ArrowRight size={13} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>{t('Enterprise custom plans with SSO / SAML available for 5,000+ employees.')} </span>
          <a href="mailto:support@milestone.app" className="text-indigo-400 underline hover:text-indigo-300">
            {t('Contact enterprise sales')}
          </a>
        </div>
      </div>
    </div>
  );
}
