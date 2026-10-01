import React, { useState } from 'react';
import { 
  BookOpen, Play, Pause, Bookmark, BookmarkCheck, Share2, Copy, Check, 
  Search, Sun, Moon, Volume2, Type, Heart, Sparkles, Filter 
} from 'lucide-react';
import { Prayer, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';

interface PrayerCenterProps {
  prayers: Prayer[];
  language: Language;
  theme: ThemeMode;
  onToggleFavorite: (prayerId: string) => void;
  favorites: string[];
}

export const PrayerCenterSection: React.FC<PrayerCenterProps> = ({
  prayers,
  language,
  theme,
  onToggleFavorite,
  favorites,
}) => {
  const t = translations[language];

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer>(prayers[0] || {} as Prayer);
  const [readingMode, setReadingMode] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<number>(20); // base px size
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(30);
  const [copiedPrayerId, setCopiedPrayerId] = useState<string | null>(null);

  const categories = [
    'All',
    'Persian Prayers',
    'English Prayers',
    'Arabic Prayers',
    "Children's Prayers",
    'Healing',
  ];

  const filteredPrayers = prayers.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const titleEn = p.title.en.toLowerCase();
    const titleFa = p.title.fa.toLowerCase();
    const titleAr = p.title.ar.toLowerCase();
    const textEn = (p.textEn || '').toLowerCase();
    const textFa = (p.textFa || '').toLowerCase();
    const textAr = (p.textAr || '').toLowerCase();

    const matchesSearch =
      !q ||
      titleEn.includes(q) ||
      titleFa.includes(q) ||
      titleAr.includes(q) ||
      textEn.includes(q) ||
      textFa.includes(q) ||
      textAr.includes(q) ||
      p.author.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const isFav = favorites.includes(selectedPrayer.id);

  const handleCopyText = () => {
    const textToCopy =
      language === 'fa'
        ? selectedPrayer.textFa || selectedPrayer.textEn
        : language === 'ar'
          ? selectedPrayer.textAr || selectedPrayer.textEn
          : selectedPrayer.textEn || selectedPrayer.textFa;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedPrayerId(selectedPrayer.id);
      setTimeout(() => setCopiedPrayerId(null), 2500);
    }
  };

  const getPrayerText = (p: Prayer) => {
    if (language === 'fa') return p.textFa || p.textEn || p.textAr;
    if (language === 'ar') return p.textAr || p.textFa || p.textEn;
    return p.textEn || p.textFa || p.textAr;
  };

  const isRtlLanguage = language === 'fa' || language === 'ar' || selectedPrayer.category === 'Persian Prayers' || selectedPrayer.category === 'Arabic Prayers';

  return (
    <section id="prayers" className="py-16 md:py-24 relative bg-slate-100/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-3">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>{t.prayerCenter}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-extrabold font-display ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {t.prayerCenter}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
            Immerse in sacred prayers, chanted devotions, and spiritual reflections across English, Persian, and Arabic.
          </p>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-bold'
                    : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat === 'Persian Prayers' ? t.persian : cat === 'English Prayers' ? t.english : cat === 'Arabic Prayers' ? t.arabic : cat === "Children's Prayers" ? t.children : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPrayers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Main Prayer Reader Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Prayer List Column (Left side: 4 cols) */}
          <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredPrayers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border rounded-2xl">
                No prayers found matching your criteria.
              </div>
            ) : (
              filteredPrayers.map((p) => {
                const title = getLocalizedText(p.title, language);
                const isSelected = selectedPrayer.id === p.id;
                const isBookmarked = favorites.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPrayer(p)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#2d334a] text-white border-[#2d334a] shadow-md'
                        : theme === 'dark'
                          ? 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700/80'
                          : 'bg-white/80 border-slate-200/80 text-slate-800 hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                        isSelected ? 'text-[#d4af37]' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {p.category}
                      </span>
                      <h4 className="font-bold text-sm line-clamp-1">
                        {title}
                      </h4>
                      <span className={`text-xs block mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        By {p.author}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(p.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer text-slate-400 hover:text-amber-400"
                    >
                      <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-[#d4af37] text-[#d4af37]' : ''}`} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Dedicated Reading Reader Interface (Right side: 8 cols) */}
          <div className="lg:col-span-8">
            {selectedPrayer ? (
              <div className={`rounded-3xl border shadow-xl p-6 sm:p-10 transition-all ${
                readingMode === 'sepia'
                  ? 'bg-[#fbf0d9] text-[#432d1d] border-[#e8d5b7]'
                  : readingMode === 'dark' || theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200/80 text-slate-900'
              }`}>
                
                {/* Reading Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/40 dark:border-slate-800">
                  
                  {/* Category & Author Badge */}
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {selectedPrayer.category}
                    </span>
                    <span className="text-xs font-medium ml-3 opacity-75">
                      Revealed by {selectedPrayer.author}
                    </span>
                  </div>

                  {/* Reading Controls */}
                  <div className="flex items-center gap-3">
                    
                    {/* Font Size Adjuster */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer"
                        title="Decrease Font Size"
                      >
                        <Type className="w-3.5 h-3.5" /> -
                      </button>
                      <span className="px-1 font-mono font-bold">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer"
                        title="Increase Font Size"
                      >
                        <Type className="w-3.5 h-3.5" /> +
                      </button>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setReadingMode('light')}
                        className={`p-1.5 rounded text-xs font-bold cursor-pointer ${readingMode === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'opacity-60'}`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReadingMode('sepia')}
                        className={`p-1.5 rounded text-xs font-bold cursor-pointer ${readingMode === 'sepia' ? 'bg-[#e8d5b7] text-[#432d1d] shadow-xs' : 'opacity-60'}`}
                      >
                        Sepia
                      </button>
                      <button
                        onClick={() => setReadingMode('dark')}
                        className={`p-1.5 rounded text-xs font-bold cursor-pointer ${readingMode === 'dark' ? 'bg-slate-950 text-slate-100 shadow-xs' : 'opacity-60'}`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => onToggleFavorite(selectedPrayer.id)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-amber-500/10 cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Copy Text */}
                    <button
                      onClick={handleCopyText}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Copy Prayer Text"
                    >
                      {copiedPrayerId === selectedPrayer.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Chanted Audio Player Bar if Audio is Available */}
                {selectedPrayer.audioUrl && (
                  <div className="my-6 p-4 rounded-2xl bg-indigo-950/90 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:scale-105 cursor-pointer shadow-md"
                      >
                        {isPlayingAudio ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                      </button>
                      <div>
                        <span className="text-xs text-amber-300 font-semibold block">Chanted Devotion</span>
                        <span className="text-sm font-bold text-slate-100">{selectedPrayer.audioChanter || 'Sacred Audio Ensemble'}</span>
                      </div>
                    </div>

                    {/* Progress slider simulation */}
                    <div className="flex-1 max-w-xs w-full flex items-center gap-3 text-xs text-slate-300">
                      <span>1:12</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-800 relative cursor-pointer overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${audioProgress}%` }} />
                      </div>
                      <span>{selectedPrayer.duration || '3:45'}</span>
                    </div>
                  </div>
                )}

                {/* Prayer Title */}
                <h3 className={`text-2xl sm:text-3xl font-extrabold font-display my-6 ${
                  isRtlLanguage ? 'font-persian text-right' : 'font-english text-left'
                }`}>
                  {selectedPrayer.title[language] || selectedPrayer.title.en}
                </h3>

                {/* Sacred Text Body */}
                <div 
                  className={`leading-relaxed my-8 space-y-6 ${
                    isRtlLanguage ? 'font-persian text-right text-lg sm:text-2xl' : 'font-english text-left'
                  }`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                >
                  <p>{getPrayerText(selectedPrayer)}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200/40 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Themes:</span>
                  {selectedPrayer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>
            ) : null}
          </div>

        </div>

      </div>
    </section>
  );
};
