import React, { useState } from 'react';
import { 
  Calendar, X, Download, ExternalLink, Clock, Check, Globe, Sparkles
} from 'lucide-react';
import { Meeting, Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';
import { 
  generateGoogleCalendarUrl, 
  generateOutlookWebUrl, 
  generateOutlook365Url, 
  downloadICSFile,
  getMeetingDates
} from '../utils/calendarExport';

interface MeetingCalendarExportModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: ThemeMode;
}

export const MeetingCalendarExportModal: React.FC<MeetingCalendarExportModalProps> = ({
  meeting,
  isOpen,
  onClose,
  language,
  theme,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !meeting) return null;

  const t = translations[language] || translations.en;
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Amsterdam';
  const { start, end } = getMeetingDates(meeting);

  const localStartStr = start.toLocaleTimeString(language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const localEndStr = end.toLocaleTimeString(language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const localDateStr = start.toLocaleDateString(language === 'fa' ? 'fa-IR-u-ca-gregory' : language === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', {
    calendar: 'gregory',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const meetingTitle = getLocalizedText(meeting.title, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-200'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rtl:left-5 rtl:right-auto p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {t.addToCalendar}
            </span>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {meetingTitle}
            </h3>
          </div>
        </div>

        {/* Local Time Zone Conversion Info */}
        <div className="my-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
            <Globe className="w-4 h-4" />
            <span>Automatically Converted to Your Local Timezone ({userTz})</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {localDateStr}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">
            {localStartStr} – {localEndStr} ({meeting.durationMinutes} mins)
          </div>
        </div>

        {/* Calendar Provider Buttons */}
        <div className="space-y-2.5 my-6">
          <a
            href={generateGoogleCalendarUrl(meeting, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📅</span>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {t.googleCalendar}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </a>

          <button
            onClick={() => downloadICSFile(meeting, language)}
            className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 flex items-center justify-between transition-all group cursor-pointer text-left rtl:text-right"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🍏</span>
              <div>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block">
                  {t.appleCalendar}
                </span>
                <span className="text-[11px] text-slate-400">Download .ICS standard file</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </button>

          <a
            href={generateOutlookWebUrl(meeting, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📫</span>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {t.outlookWeb}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
          </a>

          <a
            href={generateOutlook365Url(meeting, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 flex items-center justify-between transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🏢</span>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {t.outlook365}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </a>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Reminder alert will trigger 15 minutes before gathering starts.
        </div>

      </div>
    </div>
  );
};
