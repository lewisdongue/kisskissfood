import React from 'react';
import { LANGUAGES, type LanguageCode } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LanguageSelectorProps {
    selectedLanguage: LanguageCode;
    onChange: (language: LanguageCode) => void;
    size?: 'default' | 'compact';
    className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    selectedLanguage,
    onChange,
    size = 'default',
    className
}) => {
    const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];
    const displayLabel = size === 'compact'
        ? currentLanguage.code.toUpperCase()
        : currentLanguage.name;

    const triggerClass = size === 'compact'
        ? "h-10 min-w-[88px] px-3 gap-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white text-xs font-bold shadow-sm hover:bg-white/[0.10] hover:border-white/20 transition-all focus:ring-2 focus:ring-violet-400/60"
        : "h-12 min-w-[120px] px-4 gap-2 flex items-center rounded-full bg-white/[0.06] border border-white/10 text-white text-sm font-bold shadow-md hover:bg-white/[0.10] hover:border-white/20 transition-all focus:ring-2 focus:ring-violet-400/60";

    return (
        <Select value={selectedLanguage} onValueChange={onChange}>
            <SelectTrigger className={`${triggerClass} ${className || ''}`}>
                <span className={size === 'compact' ? "text-base" : "text-lg"}>🌍</span>
                <SelectValue className={size === 'compact' ? "text-white font-semibold" : "text-white font-bold"}>
                    {displayLabel}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-xl mt-2 max-h-96">
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="flex items-center gap-2 px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 rounded-lg cursor-pointer">
                        <span className="text-lg">🌍</span> {lang.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
