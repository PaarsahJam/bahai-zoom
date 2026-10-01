import React, { useState } from 'react';
import { Send, Youtube, Facebook, Instagram, Mail, Check, Shield } from 'lucide-react';
import { Language, ThemeMode, CmsUser } from '../types';
import { translations } from '../data/translations';
import { LANGUAGE_CONFIGS } from '../data/languageConfigs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { canAccessAdmin } from '../utils/authPermissions';

interface FooterProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onSelectSection: (sectionId: string) => void;
  currentUser?: CmsUser | null;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onLanguageChange,
  theme,
  onSelectSection,
  currentUser,
  onOpenAdmin,
}) => {
  const t = translations[language];
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Admin link is ONLY visible to authenticated Administrators
  const showAdminLink = onOpenAdmin && canAccessAdmin(currentUser);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmailInput('');
    }
  };

  return (
    <footer className={`border-t transition-colors ${
      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
    }`}>
      
      {/* Top Newsletter & Quote Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-amber-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-bold text-amber-300 text-xs font-display">
                  BZ
                </div>
              </div>
              <span className="text-xl font-bold font-display text-white">{t.siteTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="md:col-span-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
              Stay Connected & Receive Updates
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1 transition-transform active:scale-95"
              >
                {subscribed ? <Check className="w-4 h-4 text-slate-950" /> : <Mail className="w-4 h-4" />}
                <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Main Footer Nav Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Col 1: Platform Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Platform Navigation
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onSelectSection('hero')} className="hover:text-white cursor-pointer">{t.home}</button></li>
              <li><button onClick={() => onSelectSection('meetings')} className="hover:text-white cursor-pointer">{t.weeklySchedule}</button></li>
              <li><button onClick={() => onSelectSection('prayers')} className="hover:text-white cursor-pointer">{t.prayerCenter}</button></li>
              <li><button onClick={() => onSelectSection('speakers')} className="hover:text-white cursor-pointer">{t.featuredSpeakers}</button></li>
              {showAdminLink && (
                <li>
                  <button onClick={onOpenAdmin} className="hover:text-amber-300 text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t.adminDashboard || 'Admin Dashboard'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 2: Media & Archives */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Media & Resources
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onSelectSection('media')} className="hover:text-white cursor-pointer">{t.mediaLibrary}</button></li>
              <li><button onClick={() => onSelectSection('resources')} className="hover:text-white cursor-pointer">{t.communityResources}</button></li>
              <li><button onClick={() => onSelectSection('events')} className="hover:text-white cursor-pointer">{t.eventsAndHolyDays}</button></li>
              <li><button onClick={() => onSelectSection('faq')} className="hover:text-white cursor-pointer">{t.faq}</button></li>
            </ul>
          </div>

          {/* Col 3: Languages & Global Community */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              {t.selectLanguage}
            </h5>
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {LANGUAGE_CONFIGS.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    language === lang.code
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Channels & Social */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
              Official Channels
            </h5>
            <div className="flex items-center gap-3">
              <a href="https://t.me/BahaiZoomOfficial" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer">
                <Send className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/@BahaiZoomLectures" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 cursor-pointer">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-400 cursor-pointer">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-normal">
              Join thousands of community members receiving daily devotions and meeting reminders on Telegram.
            </p>
          </div>

        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="bg-slate-950 py-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 {t.siteTitle}. {t.footerRights}</span>
          <div className="flex items-center gap-1 text-amber-400 font-display italic">
            <span>{t.peaceText}</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
