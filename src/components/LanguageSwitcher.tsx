import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { LANGUAGE_CONFIGS, LANGUAGE_MAP } from '../data/languageConfigs';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  theme?: ThemeMode;
  variant?: 'compact' | 'full' | 'dropdown' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  theme = 'light',
  variant = 'dropdown',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeConfig = LANGUAGE_MAP[currentLanguage] || LANGUAGE_CONFIGS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'full') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 ${className}`}>
        {LANGUAGE_CONFIGS.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                  : theme === 'dark'
                  ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg leading-none">{lang.flag}</span>
              <div className="text-left rtl:text-right flex-1 min-w-0">
                <span className="block truncate text-xs font-semibold">{lang.nativeName}</span>
                <span className="block truncate text-[10px] text-slate-400">{lang.name}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>Language / زبان</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {LANGUAGE_CONFIGS.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onLanguageChange(lang.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer shadow-xs ${
          theme === 'dark'
            ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
            : 'bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-50'
        }`}
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <span className="text-base leading-none">{activeConfig.flag}</span>
        <span className="font-bold">{activeConfig.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-52 rounded-2xl shadow-xl border py-2 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            theme === 'dark'
              ? 'bg-slate-900/95 border-slate-700 text-slate-200 shadow-slate-950/50'
              : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50'
          }`}
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 mb-1">
            <Globe className="w-3 h-3 text-amber-500" />
            <span>Supported Languages</span>
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5 px-1">
            {LANGUAGE_CONFIGS.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
