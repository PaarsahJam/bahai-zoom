import React from 'react';
import { Globe, X, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGE_MAP, dismissGeographicSuggestion } from '../data/languageConfigs';
import { translations } from '../data/translations';

interface LanguageSuggestionBannerProps {
  currentLanguage: Language;
  suggestedLanguage: Language;
  onAcceptSuggestion: (lang: Language) => void;
  onDismiss: () => void;
}

export const LanguageSuggestionBanner: React.FC<LanguageSuggestionBannerProps> = ({
  currentLanguage,
  suggestedLanguage,
  onAcceptSuggestion,
  onDismiss,
}) => {
  const suggestedConfig = LANGUAGE_MAP[suggestedLanguage];
  const t = translations[currentLanguage];

  if (!suggestedConfig) return null;

  const handleDismiss = () => {
    dismissGeographicSuggestion();
    onDismiss();
  };

  const handleAccept = () => {
    onAcceptSuggestion(suggestedLanguage);
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-700 text-slate-950 py-2 px-4 shadow-md transition-all animate-in slide-in-from-top duration-300 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        
        <div className="flex items-center gap-2.5 text-center sm:text-left rtl:sm:text-right">
          <div className="w-7 h-7 rounded-full bg-slate-950/20 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <p className="text-slate-950 font-medium">
            <span>{t.geoSuggestionPrompt} </span>
            <span className="font-bold underline text-white px-1">
              {suggestedConfig.flag} {suggestedConfig.nativeName} ({suggestedConfig.name})
            </span>
            <span>?</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-900 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <span>{t.switchLanguageBtn} ({suggestedConfig.flag} {suggestedConfig.nativeName})</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
          
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl hover:bg-slate-950/15 text-slate-950 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
