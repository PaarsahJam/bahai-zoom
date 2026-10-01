import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, UserCheck, Sparkles, MapPin } from 'lucide-react';
import { EventItem, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';

interface EventsProps {
  events: EventItem[];
  language: Language;
  theme: ThemeMode;
}

export const EventsSection: React.FC<EventsProps> = ({
  events,
  language,
  theme,
}) => {
  const t = translations[language];
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [activeRegistrationModal, setActiveRegistrationModal] = useState<EventItem | null>(null);

  const handleRegister = (id: string) => {
    if (!registeredIds.includes(id)) {
      setRegisteredIds([...registeredIds, id]);
    }
    setActiveRegistrationModal(null);
  };

  return (
    <section id="events" className="py-16 md:py-24 relative bg-slate-100/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-3">
            <CalendarIcon className="w-4 h-4 text-amber-500" />
            <span>{t.eventsAndHolyDays}</span>
          </div>
          <h2 className={`text-3xl sm:text-5xl font-extrabold font-display ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}>
            {t.holyDays}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
            Join international conferences, spiritual commemorations, and holy day global online gatherings.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {events.map((e) => {
            const title = getLocalizedText(e.title, language);
            const desc = getLocalizedText(e.description, language);
            const isReg = registeredIds.includes(e.id);

            return (
              <div
                key={e.id}
                className={`rounded-3xl p-6 border flex flex-col justify-between shadow-xs ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {e.category}
                    </span>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {e.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-indigo-950 dark:text-indigo-200 mb-2">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {isReg ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.registered}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveRegistrationModal(e)}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{t.register}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Registration Modal */}
      {activeRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl relative ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-xl font-bold font-display mb-2">
              Register for {getLocalizedText(activeRegistrationModal.title, language)}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter your name and email to receive the Zoom access details and reminder calendar invite.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveRegistrationModal(null)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegister(activeRegistrationModal.id)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
