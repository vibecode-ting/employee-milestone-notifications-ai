// ── i18n/LanguageContext.tsx ──────────────────────────────────────────────────
// 1-Click Language Switcher Context for CultureOS AI
// Stores locale in React state + localStorage, updates <html data-lang="...">
// for CSS variable cascade (see i18n-typography.css)

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SupportedLocale, UI_TRANSLATIONS, LOCALE_METADATA } from './translations';

interface LanguageContextValue {
  locale: SupportedLocale;
  t: (key: string) => string;
  setLocale: (locale: SupportedLocale) => void;
  meta: typeof LOCALE_METADATA[SupportedLocale];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'cultureos_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    return stored && stored in UI_TRANSLATIONS ? stored : 'en';
  });

  // Apply CSS data-lang and lang attributes on mount + on every locale change
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.setAttribute('data-lang', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback((key: string): string => {
    return UI_TRANSLATIONS[locale]?.[key] ?? UI_TRANSLATIONS.en[key] ?? key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, meta: LOCALE_METADATA[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

// ── Language Switcher Pill Bar Component ─────────────────────────────────────
// The flagship "1-Click 5-Language" segmented control for the top header

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  const handleSwitch = (newLocale: SupportedLocale) => {
    if (newLocale === locale) return;
    setLocale(newLocale);
    // Micro-toast feedback (using browser notification as lightweight solution)
    const msg = UI_TRANSLATIONS[newLocale]?.langSwitched ?? `Language: ${newLocale}`;
    console.log(`🌐 ${msg}`);
  };

  return (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-full p-1" role="group" aria-label="Language selector">
      {(Object.keys(LOCALE_METADATA) as SupportedLocale[]).map((code) => {
        const meta = LOCALE_METADATA[code];
        const isActive = locale === code;
        return (
          <button
            key={code}
            onClick={() => handleSwitch(code)}
            title={meta.englishLabel}
            aria-pressed={isActive}
            className={`
              flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150
              script-safe whitespace-nowrap
              ${isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }
            `}
            style={{ fontFamily: meta.fontFamily }}
          >
            <span>{meta.flag}</span>
            <span>{meta.nativeLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
