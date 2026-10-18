import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import mm from './locales/mm';
import zh from './locales/zh';
import vn from './locales/vn';
import ko from './locales/ko';
import ja from './locales/ja';
import zhHK from './locales/zh-HK';

const resources = {
  en: { translation: en },
  mm: { translation: mm },
  zh: { translation: zh },
  vn: { translation: vn },
  ko: { translation: ko },
  ja: { translation: ja },
  'zh-HK': { translation: zhHK },
};

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('app_language') : null;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', lng);
  }
});

export const LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'mm', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'zh', name: '繁體中文', flag: '🇹🇼' },
  { code: 'vn', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-HK', name: '繁體中文（港）', flag: '🇭🇰' },
] as const;

export default i18n;
