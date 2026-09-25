import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/lib/router-compat';
import { LANGUAGES, type LanguageCode } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * A floating language selector that appears on all pages except Home (which has its own in the Navbar).
 * It reads/writes language directly to i18n and localStorage, so it works independently.
 */
export const FloatingLanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  // Don't show on Home (Navbar already has one) and on Call page (requested hidden UI).
  if (location.pathname === '/' || location.pathname === '/call') return null;

  const currentLang = (i18n.language || 'en') as LanguageCode;
  const currentLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    try {
      window.localStorage.setItem('audioChat_language', lang);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Select value={currentLang} onValueChange={handleChange}>
        <SelectTrigger className="h-11 min-w-[130px] px-4 gap-2 flex items-center rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white font-bold shadow-2xl hover:shadow-3xl transition-all border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl focus:ring-2 focus:ring-blue-400/60">
          <span className="text-lg">🌍</span>
          <SelectValue className="text-gray-900 dark:text-white font-bold">
            {currentLanguage.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl mt-2 max-h-96 border border-gray-200/50 dark:border-gray-700/50">
          {LANGUAGES.map((lang) => (
            <SelectItem
              key={lang.code}
              value={lang.code}
              className="flex items-center gap-2 px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 rounded-lg cursor-pointer"
            >
              <span className="text-lg">🌍</span> {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
