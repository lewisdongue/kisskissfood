import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import yo from './locales/yo.json';
import ig from './locales/ig.json';
import ha from './locales/ha.json';

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'hi', 'yo', 'ig', 'ha'];

/**
 * Languages we don't ship yet, mapped to the closest language the user is
 * most likely to understand, instead of defaulting everyone to English.
 */
const LANGUAGE_FALLBACKS: Record<string, string> = {
  // Romance -> French / Spanish / Portuguese
  it: 'fr', ro: 'fr', ca: 'es', gl: 'es', co: 'fr', ht: 'fr', wo: 'fr', ln: 'fr',
  sw: 'en', am: 'en', so: 'ar', rw: 'fr', sg: 'fr', mg: 'fr', ff: 'fr', bm: 'fr',
  // Germanic / Nordic -> German
  nl: 'de', af: 'de', da: 'de', sv: 'de', nb: 'de', no: 'de', is: 'de', lb: 'de',
  // Slavic & others -> English
  ru: 'en', uk: 'en', pl: 'en', cs: 'en', sk: 'en', bg: 'en', sr: 'en', hr: 'en',
  // Middle East -> Arabic
  fa: 'ar', ur: 'ar', ku: 'ar', ps: 'ar', he: 'ar',
  // South & East Asia
  bn: 'hi', pa: 'hi', gu: 'hi', mr: 'hi', ta: 'hi', te: 'hi', kn: 'hi', ml: 'hi', ne: 'hi', si: 'hi',
  ja: 'zh', ko: 'zh', yue: 'zh',
};

// Read saved language from localStorage to ensure persistence across all pages
const getSavedLanguage = (): string => {
  try {
    const saved = window.localStorage.getItem('audioChat_language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
    // First visit: follow the browser language automatically.
    const candidates = [
      ...(navigator.languages || []),
      navigator.language,
    ].filter(Boolean) as string[];
    for (const tag of candidates) {
      const lower = tag.toLowerCase();
      const base = lower.split('-')[0];
      // Direct match (fr-CA -> fr, pt-BR -> pt, zh-Hans-CN -> zh, ...)
      if (SUPPORTED_LANGUAGES.includes(base)) {
        window.localStorage.setItem('audioChat_language', base);
        return base;
      }
      // Closest-family fallback so nobody lands on English by accident.
      const family = LANGUAGE_FALLBACKS[base];
      if (family) {
        window.localStorage.setItem('audioChat_language', family);
        return family;
      }
    }
  } catch {
    // localStorage / navigator may not be available (SSR)
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      pt: { translation: pt },
      ar: { translation: ar },
      zh: { translation: zh },
      hi: { translation: hi },
      yo: { translation: yo },
      ig: { translation: ig },
      ha: { translation: ha },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

/** Keep <html lang> and text direction in sync with the active language. */
const RTL_LANGUAGES = ['ar'];
const applyDocumentLanguage = (lng: string) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lng;
  document.documentElement.dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr';
};

applyDocumentLanguage(i18n.language || 'en');
i18n.on('languageChanged', applyDocumentLanguage);

export default i18n;
