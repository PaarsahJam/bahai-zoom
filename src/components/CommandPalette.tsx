import React, { useState, useEffect } from 'react';
import { 
  Search, Video, BookOpen, Users, Calendar, ArrowRight, X, Sparkles, FileText, Shield
} from 'lucide-react';
import { Meeting, Prayer, Speaker, MediaItem, Resource, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
  meetings: Meeting[];
  prayers: Prayer[];
  speakers: Speaker[];
  media: MediaItem[];
  resources: Resource[];
  onSelectMeeting: (m: Meeting) => void;
  onSelectPrayer: (p: Prayer) => void;
  onSelectSpeaker: (s: Speaker) => void;
  onSelectSection: (sectionId: string) => void;
  onOpenAdmin?: (tab?: string) => void;
  isAdmin?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  language,
  theme,
  meetings,
  prayers,
  speakers,
  media,
  resources,
  onSelectMeeting,
  onSelectPrayer,
  onSelectSpeaker,
  onSelectSection,
  onOpenAdmin,
  isAdmin = false,
}) => {
  const t = translations[language];
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter items
  const filteredMeetings = meetings.filter((m) =>
    !q || getLocalizedText(m.title, language).toLowerCase().includes(q) || m.host.toLowerCase().includes(q)
  ).slice(0, 3);

  const filteredPrayers = prayers.filter((p) =>
    !q || getLocalizedText(p.title, language).toLowerCase().includes(q) || p.author.toLowerCase().includes(q)
  ).slice(0, 3);

  const filteredSpeakers = speakers.filter((s) =>
    !q || s.name.toLowerCase().includes(q) || s.nameFa.toLowerCase().includes(q) || getLocalizedText(s.title, language).toLowerCase().includes(q)
  ).slice(0, 3);

  const filteredMedia = media.filter((m) =>
    !q || getLocalizedText(m.title, language).toLowerCase().includes(q) || m.speakerName.toLowerCase().includes(q)
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-md">
      <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Search Header */}
        <div className="relative border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-500" />
          <input
            type="text"
            autoFocus
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base sm:text-lg focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          
          {/* Admin Dashboard Quick Access (Administrators ONLY) */}
          {isAdmin && onOpenAdmin && (!q || 'admin cms dashboard management portal'.includes(q)) && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin('overview');
                }}
                className="w-full flex items-center justify-between group cursor-pointer text-left rtl:text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-amber-500">
                      {t.adminDashboard || 'Open Admin CMS Dashboard'}
                    </h5>
                    <p className="text-[11px] text-slate-400">Manage meetings, speakers, prayers, users & site settings</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
              </button>
            </div>
          )}

          {/* Meetings Section */}
          {filteredMeetings.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Zoom Meetings</span>
              </div>
              <div className="space-y-1.5">
                {filteredMeetings.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMeeting(m);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl text-left rtl:text-right hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm">{getLocalizedText(m.title, language)}</h5>
                      <p className="text-[11px] text-slate-400">{m.time} • Host: {m.host}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prayers Section */}
          {filteredPrayers.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Prayers & Devotions</span>
              </div>
              <div className="space-y-1.5">
                {filteredPrayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPrayer(p);
                      onSelectSection('prayers');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl text-left rtl:text-right hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm">{getLocalizedText(p.title, language)}</h5>
                      <p className="text-[11px] text-slate-400">{p.category} • By {p.author}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Speakers Section */}
          {filteredSpeakers.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Speakers</span>
              </div>
              <div className="space-y-1.5">
                {filteredSpeakers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSpeaker(s);
                      onSelectSection('speakers');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl text-left rtl:text-right hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={s.photoUrl} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm">{s.name}</h5>
                        <p className="text-[11px] text-slate-400">{getLocalizedText(s.title, language)}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Media Recordings */}
          {filteredMedia.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Media & Recorded Lectures</span>
              </div>
              <div className="space-y-1.5">
                {filteredMedia.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectSection('media');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl text-left rtl:text-right hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm">{getLocalizedText(m.title, language)}</h5>
                      <p className="text-[11px] text-slate-400">{m.category} • {m.speakerName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Use <strong>Ctrl + K</strong> anytime to trigger search</span>
          <span>Press <strong>ESC</strong> to close</span>
        </div>

      </div>
    </div>
  );
};
