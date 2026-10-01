import React, { useState } from 'react';
import { 
  Users, Search, Youtube, Send, Globe, Calendar, Award, 
  MessageSquare, Sparkles, Filter 
} from 'lucide-react';
import { Speaker, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';

interface FeaturedSpeakersProps {
  speakers: Speaker[];
  language: Language;
  theme: ThemeMode;
  onOpenSpeakerDetail?: (speaker: Speaker) => void;
}

export const FeaturedSpeakersSection: React.FC<FeaturedSpeakersProps> = ({
  speakers,
  language,
  theme,
  onOpenSpeakerDetail,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');

  // Collect all unique topics
  const allTopics = ['All', ...Array.from(new Set(speakers.flatMap((s) => s.topics)))];

  const filteredSpeakers = speakers.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.nameFa.toLowerCase().includes(q) ||
      s.title[language]?.toLowerCase().includes(q) ||
      s.bio[language]?.toLowerCase().includes(q);

    const matchesTopic = selectedTopic === 'All' || s.topics.includes(selectedTopic);

    return matchesSearch && matchesTopic;
  });

  return (
    <section id="speakers" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
            <Users className="w-4 h-4 text-amber-500" />
            <span>{t.featuredSpeakers}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-extrabold font-display ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {t.featuredSpeakers}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
            Distinguished scholars, educators, authors, and thought leaders guiding global discussions and educational programs.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          
          {/* Topic Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-none">
            {allTopics.slice(0, 6).map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${
                  selectedTopic === topic
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                    : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchSpeakers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSpeakers.map((s) => {
            const speakerTitle = getLocalizedText(s.title, language);
            const speakerBio = getLocalizedText(s.bio, language);

            return (
              <div
                key={s.id}
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 hover:shadow-xl group ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-indigo-500/40'
                    : 'bg-white border-slate-200/80 text-slate-800 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative mb-5 text-center">
                    <img
                      src={s.photoUrl}
                      alt={s.name}
                      className="w-24 h-24 rounded-2xl mx-auto object-cover ring-4 ring-amber-400/30 group-hover:scale-105 transition-transform duration-300 shadow-md"
                    />
                    <span className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                      {s.language}
                    </span>
                  </div>

                  {/* Speaker Name & Title */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold font-display text-indigo-950 dark:text-indigo-200">
                      {language === 'fa' ? s.nameFa || s.name : s.name}
                    </h3>
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1 line-clamp-1">
                      {speakerTitle}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                    {speakerBio}
                  </p>

                  {/* Topics Chips */}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {s.topics.map((tp) => (
                      <span
                        key={tp}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {tp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Links & Stats */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  
                  {s.upcomingSession && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{s.upcomingSession}</span>
                    </div>
                  )}

                  {/* Social Channel Icons */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {s.youtubeUrl && (
                      <a
                        href={s.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                        title="YouTube Channel"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                    {s.telegramUrl && (
                      <a
                        href={s.telegramUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 cursor-pointer transition-colors"
                        title="Telegram Channel"
                      >
                        <Send className="w-4 h-4" />
                      </a>
                    )}
                    {s.websiteUrl && (
                      <a
                        href={s.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 cursor-pointer transition-colors"
                        title="Personal Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
