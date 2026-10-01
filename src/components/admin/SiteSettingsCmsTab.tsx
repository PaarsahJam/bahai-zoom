import React, { useState } from 'react';
import { Settings, Layout, Globe, Sliders, Check, Save } from 'lucide-react';
import { HomepageContent, SiteSettings, Language, ThemeMode } from '../../types';

interface SiteSettingsCmsTabProps {
  homepage: HomepageContent;
  settings: SiteSettings;
  onSaveHomepage: (h: HomepageContent) => void;
  onSaveSettings: (s: SiteSettings) => void;
  language: Language;
  theme: ThemeMode;
}

export const SiteSettingsCmsTab: React.FC<SiteSettingsCmsTabProps> = ({
  homepage,
  settings,
  onSaveHomepage,
  onSaveSettings,
  language,
  theme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'homepage' | 'general'>('homepage');
  const [hpState, setHpState] = useState<HomepageContent>({ ...homepage });
  const [stState, setStState] = useState<SiteSettings>({ ...settings });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveHp = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveHomepage(hpState);
    showToast('Homepage hero & banners updated instantly!');
  };

  const handleSaveSt = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(stState);
    showToast('Global site settings updated!');
  };

  return (
    <div className="space-y-6 text-xs">
      
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('homepage')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
            activeSubTab === 'homepage' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          Homepage Content Editor
        </button>
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
            activeSubTab === 'general' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          Global Site Settings & Branding
        </button>
      </div>

      {/* HOMEPAGE EDITOR */}
      {activeSubTab === 'homepage' && (
        <form onSubmit={handleSaveHp} className="space-y-4 text-slate-800 dark:text-slate-200">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Hero Headlines & Subtitles (Multilingual)</h4>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hero Title (English)</label>
              <input
                type="text"
                value={hpState.heroTitle?.en || ''}
                onChange={(e) => setHpState({ ...hpState, heroTitle: { ...hpState.heroTitle, en: e.target.value } })}
                className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hero Title (Persian - تیتر اصلی به فارسی)</label>
              <input
                type="text"
                value={hpState.heroTitle?.fa || ''}
                onChange={(e) => setHpState({ ...hpState, heroTitle: { ...hpState.heroTitle, fa: e.target.value } })}
                className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hero Subtitle (Persian - زیرتیتر به فارسی)</label>
              <textarea
                rows={3}
                value={hpState.heroSubtitle?.fa || ''}
                onChange={(e) => setHpState({ ...hpState, heroSubtitle: { ...hpState.heroSubtitle, fa: e.target.value } })}
                className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian leading-relaxed"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hero Background Image URL</label>
              <input
                type="url"
                value={hpState.heroBgUrl || ''}
                onChange={(e) => setHpState({ ...hpState, heroBgUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Announcement Broadcast Banner</h4>
            <label className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200">
              <input
                type="checkbox"
                checked={hpState.announcementActive}
                onChange={(e) => setHpState({ ...hpState, announcementActive: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <span className="font-bold">Show Broadcast Banner on top of homepage</span>
            </label>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Banner Announcement Text (Persian)</label>
              <input
                type="text"
                value={hpState.announcementText?.fa || ''}
                onChange={(e) => setHpState({ ...hpState, announcementText: { ...(hpState.announcementText || { en: '', fa: '', ar: '' }), fa: e.target.value } })}
                className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-persian"
              />
            </div>
          </div>

          <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save & Update Homepage</span>
          </button>
        </form>
      )}

      {/* SITE SETTINGS */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleSaveSt} className="space-y-4 text-slate-800 dark:text-slate-200">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">General Branding & Contact Info</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Website Title</label>
                <input
                  type="text"
                  value={stState.siteTitle}
                  onChange={(e) => setStState({ ...stState, siteTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={stState.contactEmail}
                  onChange={(e) => setStState({ ...stState, contactEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Telegram Channel</label>
                <input
                  type="url"
                  value={stState.telegramUrl}
                  onChange={(e) => setStState({ ...stState, telegramUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">YouTube Channel</label>
                <input
                  type="url"
                  value={stState.youtubeUrl}
                  onChange={(e) => setStState({ ...stState, youtubeUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold cursor-pointer flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Site Settings</span>
          </button>
        </form>
      )}

    </div>
  );
};
