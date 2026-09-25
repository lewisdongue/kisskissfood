import { useEffect, useState } from 'react';
import type { LanguageCode } from '../types';
import { LANGUAGES } from '../types';
import i18n from '../i18n';

export const useBrowserPreferences = () => {
  const [browserTheme, setBrowserTheme] = useState<'light' | 'dark'>('dark'); // Default to dark
  const [browserLanguage, setBrowserLanguage] = useState<LanguageCode>('en');

  // Detect browser theme preference
  const detectTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'dark'; // Default to dark mode
    }
    return 'dark'; // Default to dark mode
  };

  const LANGUAGE_STORAGE_KEY = 'audioChat_language';

  // Prefer saved language from localStorage so selection persists across pages; only use browser when nothing is saved
  const getEffectiveLanguage = (): LanguageCode => {
    if (typeof window === 'undefined') return 'en';
    try {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && LANGUAGES.some(lang => lang.code === saved)) {
        return saved as LanguageCode;
      }
    } catch {
      // localStorage may not be available
    }
    const browserLang = navigator.language.split('-')[0];
    const supportedLang = LANGUAGES.find(lang => lang.code === browserLang);
    return supportedLang ? supportedLang.code : 'en';
  };

  // Detect browser language preference (used only when no saved language)
  const detectLanguage = (): LanguageCode => {
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.split('-')[0]; // Get primary language code
      const supportedLang = LANGUAGES.find(lang => lang.code === browserLang);
      return supportedLang ? supportedLang.code : 'en';
    }
    return 'en';
  };

  // Apply theme to document
  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Apply language to i18n
  const applyLanguage = (language: LanguageCode) => {
    i18n.changeLanguage(language);
  };

  // Initialize preferences once on mount — no polling needed
  useEffect(() => {
    const theme = detectTheme();
    const language = getEffectiveLanguage();

    setBrowserTheme(theme);
    setBrowserLanguage(language);

    applyTheme(theme);
    applyLanguage(language);

    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (_e: MediaQueryListEvent) => {
      const newTheme: 'light' | 'dark' = 'dark';
      setBrowserTheme(newTheme);
      applyTheme(newTheme);
    };

    themeMediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      themeMediaQuery.removeEventListener('change', handleThemeChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    browserTheme,
    browserLanguage,
    applyTheme,
    applyLanguage,
  };
};
