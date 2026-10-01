import React, { useState } from 'react';
import { 
  Video, Play, Music, Eye, Bookmark, Search, X, Shield, FileText, 
  Podcast, Radio, ExternalLink, Share2, Check, Sparkles
} from 'lucide-react';
import { MediaItem, Language, ThemeMode, MediaType } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';
import { getProviderInfo, extractEmbedUrl, detectMediaProvider } from '../utils/mediaUtils';

interface MediaLibraryProps {
  media: MediaItem[];
  language: Language;
  theme: ThemeMode;
}

export const MediaLibrarySection: React.FC<MediaLibraryProps> = ({
  media,
  language,
  theme,
}) => {
  const t = translations[language];
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeMediaType, setActiveMediaType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(null);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Talks',
    'Music & Chants',
    'Education',
    'History',
    'Children',
  ];

  const mediaTypes = [
    { id: 'All', label: 'All Media' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Audio Chants' },
    { id: 'document', label: 'Documents & Guides' },
    { id: 'podcast', label: 'Podcasts' },
  ];

  const filteredMedia = media.filter((m) => {
    const matchesCat = activeCategory === 'All' || m.category === activeCategory;
    const itemType = m.mediaType || (m.type as any) || 'video';
    const matchesType = activeMediaType === 'All' || itemType === activeMediaType;
    
    const q = searchQuery.toLowerCase();
    const titleStr = getLocalizedText(m.title, language).toLowerCase();
    const speakerStr = (m.speakerName || '').toLowerCase();
    const tagsStr = (m.tags || []).join(' ').toLowerCase();

    const matchesSearch = !q || titleStr.includes(q) || speakerStr.includes(q) || tagsStr.includes(q);
    return matchesCat && matchesType && matchesSearch;
  });

  const toggleSave = (id: string) => {
    if (savedItems.includes(id)) {
      setSavedItems(savedItems.filter((i) => i !== id));
    } else {
      setSavedItems([...savedItems, id]);
    }
  };

  const handleCopyLink = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="media" className="py-16 md:py-24 relative bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
              <Video className="w-4 h-4 text-amber-400" />
              <span>{t.mediaLibrary}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
              {t.mediaLibrary}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Explore recorded lectures, musical chant albums, documentary history, and educational series hosted on low-cost open media networks.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchMedia}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Media Type & Category Filter Controls */}
        <div className="space-y-4 mb-8">
          
          {/* Media Types Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {mediaTypes.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setActiveMediaType(mt.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeMediaType === mt.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {mt.id === 'video' && <Video className="w-3.5 h-3.5 text-amber-400" />}
                {mt.id === 'audio' && <Music className="w-3.5 h-3.5 text-emerald-400" />}
                {mt.id === 'document' && <FileText className="w-3.5 h-3.5 text-indigo-400" />}
                {mt.id === 'podcast' && <Podcast className="w-3.5 h-3.5 text-purple-400" />}
                <span>{mt.label}</span>
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMedia.map((m) => {
            const title = getLocalizedText(m.title, language);
            const isSaved = savedItems.includes(m.id);
            const prov = m.provider || detectMediaProvider(m.externalUrl || m.embedUrl);
            const providerInfo = getProviderInfo(prov);
            const mediaType = m.mediaType || (m.type as any) || 'video';

            return (
              <div
                key={m.id}
                onClick={() => setActiveMediaItem(m)}
                className="group relative rounded-3xl overflow-hidden bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-lg cursor-pointer"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    <img
                      src={m.thumbnailUrl}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {/* Provider Badge on Thumbnail */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
                      <span>{providerInfo.icon}</span>
                      <span>{providerInfo.name}</span>
                    </div>

                    {/* Play Overlay Button */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        {mediaType === 'audio' ? (
                          <Music className="w-6 h-6 fill-slate-950" />
                        ) : mediaType === 'document' ? (
                          <FileText className="w-6 h-6 text-slate-950" />
                        ) : (
                          <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950/80 text-amber-300 backdrop-blur-xs">
                      {m.duration}
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
                      <span>{m.category}</span>
                      <span>{m.language}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-100 line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors">
                      {title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                      By {m.speakerName}
                    </p>

                    {/* Tags */}
                    {m.tags && m.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {m.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-900 text-slate-400 border border-slate-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/50">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{(m.views || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopyLink(m.externalUrl || m.embedUrl, m.id, e)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 cursor-pointer text-slate-300"
                      title="Copy Direct Link"
                    >
                      {copiedId === m.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(m.id); }}
                      className="p-1.5 rounded-lg hover:bg-slate-700 cursor-pointer text-slate-300"
                      title="Bookmark Media"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* DEFERRED MEDIA PLAYER MODAL (Mounts iframe or audio player only on visitor explicit click) */}
      {activeMediaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setActiveMediaItem(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Player Embed Area */}
            <div className="relative aspect-video bg-black">
              {(activeMediaItem.mediaType === 'audio' || activeMediaItem.type === 'audio') ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-center">
                  <Music className="w-16 h-16 text-amber-400 animate-pulse mb-4" />
                  <h4 className="text-2xl font-bold font-display text-white mb-2">
                    {getLocalizedText(activeMediaItem.title, language)}
                  </h4>
                  <p className="text-sm text-slate-300 mb-6">{activeMediaItem.speakerName}</p>
                  <audio controls src={activeMediaItem.externalUrl || activeMediaItem.embedUrl} className="w-full max-w-md" autoPlay />
                </div>
              ) : (activeMediaItem.mediaType === 'document' || activeMediaItem.type === 'document') ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-center">
                  <FileText className="w-16 h-16 text-indigo-400 mb-4" />
                  <h4 className="text-2xl font-bold text-white mb-2">
                    {getLocalizedText(activeMediaItem.title, language)}
                  </h4>
                  <p className="text-sm text-slate-300 mb-6">PDF Document & Reference Guide</p>
                  <a
                    href={activeMediaItem.externalUrl || activeMediaItem.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-xl cursor-pointer"
                  >
                    <span>Download / View Document</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <iframe
                  src={extractEmbedUrl(activeMediaItem.externalUrl || activeMediaItem.embedUrl, activeMediaItem.provider)}
                  title={getLocalizedText(activeMediaItem.title, language)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Modal Info Footer */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {getProviderInfo(activeMediaItem.provider || detectMediaProvider(activeMediaItem.externalUrl || activeMediaItem.embedUrl)).name} Stream
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeMediaItem.duration}
                </span>
              </div>

              <h3 className="text-2xl font-bold font-display text-white mb-2">
                {getLocalizedText(activeMediaItem.title, language)}
              </h3>

              <p className="text-sm text-slate-300 mb-4">
                {typeof activeMediaItem.description === 'string' ? activeMediaItem.description : getLocalizedText(activeMediaItem.description as any, language)}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span>Presenter: <strong>{activeMediaItem.speakerName}</strong></span>
                <span>Category: <strong>{activeMediaItem.category}</strong></span>
                <a
                  href={activeMediaItem.externalUrl || activeMediaItem.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Open External Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
