import React, { useState } from 'react';
import { 
  BookOpen, Download, ExternalLink, FileText, Sparkles, 
  CheckCircle, ArrowRight, Layers 
} from 'lucide-react';
import { Resource, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';

interface CommunityResourcesProps {
  resources: Resource[];
  language: Language;
  theme: ThemeMode;
}

export const CommunityResourcesSection: React.FC<CommunityResourcesProps> = ({
  resources,
  language,
  theme,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Study Circles', 'Junior Youth', 'Children', 'Holy Days'];

  const filteredResources = resources.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  return (
    <section id="resources" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>{t.communityResources}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-extrabold font-display ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {t.communityResources}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
            Curated study guides, children's class materials, youth empowerment curriculum, and Badí' calendar resources.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md'
                  : theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredResources.map((r) => {
            const title = getLocalizedText(r.title, language);
            const desc = getLocalizedText(r.description, language);

            return (
              <div
                key={r.id}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between hover:shadow-xl ${
                  theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {r.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {r.format}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-indigo-950 dark:text-indigo-200 mb-2">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {r.format === 'PDF' ? (
                    <a
                      href={r.downloadUrl || '#'}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4 text-amber-300" />
                      <span>{t.downloadPdf}</span>
                    </a>
                  ) : (
                    <a
                      href={r.externalUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Resource Link</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
