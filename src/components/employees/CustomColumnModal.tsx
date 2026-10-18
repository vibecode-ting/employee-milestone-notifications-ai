import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  X, Lock, Check, Columns,
} from 'lucide-react';
import type { CustomColumnDef, Role } from '../../types';

export const DEFAULT_CUSTOM_COLUMNS: CustomColumnDef[] = [
  {
    key: 't_shirt_size',
    label: 'T-Shirt Size',
    type: 'select',
    options: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    requiredTier: 'pro',
    description: 'Swag & anniversary team gift sizing',
  },
  {
    key: 'dietary_pref',
    label: 'Dietary Preference',
    type: 'select',
    options: ['Halal', 'Vegetarian', 'Vegan', 'Pescatarian', 'No Preference'],
    requiredTier: 'pro',
    description: 'Team milestone celebration catering',
  },
  {
    key: 'gift_budget',
    label: 'Gift Budget ($USD)',
    type: 'number',
    placeholder: 'e.g. 50',
    requiredTier: 'pro_plus',
    description: 'Autonomous anniversary budget allocation',
  },
  {
    key: 'emergency_contact',
    label: 'Emergency Contact',
    type: 'text',
    placeholder: 'Name & Phone',
    requiredTier: 'pro',
    description: 'Employee emergency contact details',
  },
];

interface CustomColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeColumns: string[];
  onToggleColumn: (key: string) => void;
  onOpenUpgradeModal: (requiredTier: Role) => void;
}

export function CustomColumnModal({
  isOpen,
  onClose,
  activeColumns,
  onToggleColumn,
  onOpenUpgradeModal,
}: CustomColumnModalProps) {
  const { t } = useTranslation();
  const { appUser } = useAuth();

  const userRole: Role = appUser?.role || 'user';
  const isFree = userRole === 'user';

  if (!isOpen) return null;

  const canUseTier = (requiredTier: Role) => {
    if (userRole === 'admin' || userRole === 'pro_plus') return true;
    if (userRole === 'pro' && requiredTier === 'pro') return true;
    return false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg p-6 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-400">
              <Columns size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t('Dynamic Custom Columns')}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {t('PLG Gated')}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{t('Customize schema fields for employee milestone tracking')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Tier Notice (Show, Don't Hide) */}
        {isFree && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <Lock size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <div className="font-bold">{t('Pro & Ultra Tier Feature')}</div>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                {t('Free plan users can preview custom column schema. Unlock unlimited custom fields or try the 1-click sandbox demo!')}
              </p>
            </div>
          </div>
        )}

        {/* Columns List */}
        <div className="mt-4 space-y-2.5 max-h-[360px] overflow-y-auto">
          {DEFAULT_CUSTOM_COLUMNS.map((col) => {
            const hasAccess = canUseTier(col.requiredTier);
            const isEnabled = activeColumns.includes(col.key);

            return (
              <div
                key={col.key}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isEnabled
                    ? 'bg-slate-800/90 border-indigo-500/60 shadow-xs'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{t(col.label)}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                        col.requiredTier === 'pro_plus'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {col.requiredTier === 'pro_plus' ? t('Ultra') : t('Pro')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t(col.description)}</p>
                </div>

                {/* Toggle or Upgrade CTA */}
                {hasAccess ? (
                  <button
                    type="button"
                    onClick={() => onToggleColumn(col.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isEnabled
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isEnabled ? <Check size={12} /> : null}
                    <span>{isEnabled ? t('Active') : t('Enable')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenUpgradeModal(col.requiredTier)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Lock size={12} />
                    <span>{t('Unlock')}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {t('{{count}} custom column(s) active', { count: activeColumns.length })}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {t('Done')}
          </button>
        </div>
      </div>
    </div>
  );
}
