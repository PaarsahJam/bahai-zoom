import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Globe, Copy, Check, ExternalLink, 
  User, Lock, Video, Plus, Filter, Sparkles, AlertCircle, ArrowUpDown,
  Play, Radio, ChevronDown, CheckCircle2, Tv, RefreshCw, Layers
} from 'lucide-react';
import { Meeting, Language, ThemeMode, CmsUser } from '../types';
import { translations } from '../data/translations';
import { getLocalizedText } from '../utils/localizedHelper';
import { 
  canUserAccessZoom, 
  getMeetingButtonState 
} from '../utils/authPermissions';
import { 
  calculateMeetingStatus, 
  sortMeetingsByStatus, 
  getVisitorTimeZone,
  formatToLocalTime,
  MeetingStatusInfo 
} from '../utils/meetingStatus';

interface WeeklyScheduleProps {
  meetings: Meeting[];
  language: Language;
  theme: ThemeMode;
  onJoinMeeting: (meeting: Meeting) => void;
  onCopyLink: (meeting: Meeting) => void;
  onExportCalendar?: (meeting: Meeting) => void;
  onOpenAdminEdit?: (meeting: Meeting) => void;
  isAdmin?: boolean;
  currentUser?: CmsUser | null;
  onRequireLogin?: () => void;
}

export const WeeklyScheduleSection: React.FC<WeeklyScheduleProps> = ({
  meetings,
  language,
  theme,
  onJoinMeeting,
  onCopyLink,
  onExportCalendar,
  onOpenAdminEdit,
  isAdmin = false,
  currentUser = null,
  onRequireLogin = () => {},
}) => {
  const t = translations[language] || translations.en;
  
  // Real-time ticker state (updates every second for live countdowns & status transitions)
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayDayIndex = now.getDay(); // 0=Sunday, ... 6=Saturday
  
  // State for Day Filter tab: 'all' (Smart Priority Feed) or day index (0..6)
  const [selectedDayTab, setSelectedDayTab] = useState<number | 'all'>('all');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(getVisitorTimeZone());
  
  // Pagination limit state for future upcoming meetings batch
  const [visibleFutureCount, setVisibleFutureCount] = useState<number>(12);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Modals
  const [activeModalMeeting, setActiveModalMeeting] = useState<Meeting | null>(null);
  const [activeRecordingMeeting, setActiveRecordingMeeting] = useState<Meeting | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const daysList = [
    { index: 'all' as const, nameEn: '⚡ Smart Schedule', nameFa: '⚡ جدول هوشمند', nameAr: '⚡ الجدول الذكي' },
    { index: 6, nameEn: 'Saturday', nameFa: 'شنبه', nameAr: 'السبت' },
    { index: 0, nameEn: 'Sunday', nameFa: 'یکشنبه', nameAr: 'الأحد' },
    { index: 1, nameEn: 'Monday', nameFa: 'دوشنبه', nameAr: 'الإثنين' },
    { index: 2, nameEn: 'Tuesday', nameFa: 'سه‌شنبه', nameAr: 'الثلاثاء' },
    { index: 3, nameEn: 'Wednesday', nameFa: 'چهارشنبه', nameAr: 'الأربعاء' },
    { index: 4, nameEn: 'Thursday', nameFa: 'پنجشنبه', nameAr: 'الخميس' },
    { index: 5, nameEn: 'Friday', nameFa: 'جمعه', nameAr: 'الجمعة' },
  ];

  const timezones = [
    { code: getVisitorTimeZone(), label: `💻 Visitor Local (${getVisitorTimeZone()})` },
    { code: 'UTC', label: '🌐 UTC / Universal Coordinated Time' },
    { code: 'Tehran', label: '🇮🇷 IRT (Tehran / Iran) UTC+3:30' },
    { code: 'EST', label: '🇺🇸 EST (New York / Toronto) UTC-5' },
    { code: 'PST', label: '🇺🇸 PST (Los Angeles / Vancouver) UTC-8' },
    { code: 'CET', label: '🇪🇺 CET (Paris / Berlin / London) UTC+1' },
    { code: 'Dubai', label: '🇦🇪 GST (Dubai / Gulf) UTC+4' },
  ];

  // 1. Filter meetings by day tab, language, category
  const filteredMeetings = meetings.filter((m) => {
    const matchesDay = selectedDayTab === 'all' || m.dayOfWeek === selectedDayTab;
    const matchesLang = selectedLanguageFilter === 'all' || m.language.toLowerCase().includes(selectedLanguageFilter.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || m.category === selectedCategoryFilter;
    return matchesDay && matchesLang && matchesCategory;
  });

  // 2. Classify meetings by status using the visitor's local timezone
  const liveMeetings: Meeting[] = [];
  const startingSoonMeetings: Meeting[] = [];
  const todayRemainingMeetings: Meeting[] = [];
  const tomorrowMeetings: Meeting[] = [];
  const upcomingMeetings: Meeting[] = [];
  const endedMeetings: Meeting[] = [];

  filteredMeetings.forEach((m) => {
    const info = calculateMeetingStatus(m, now, language, selectedTimezone);
    if (info.status === 'LIVE') liveMeetings.push(m);
    else if (info.status === 'STARTING_SOON') startingSoonMeetings.push(m);
    else if (info.status === 'TODAY') todayRemainingMeetings.push(m);
    else if (info.status === 'TOMORROW') tomorrowMeetings.push(m);
    else if (info.status === 'UPCOMING') upcomingMeetings.push(m);
    else if (info.status === 'ENDED') endedMeetings.push(m);
  });

  // Helper sort by meeting start date
  const sortByStartTime = (arr: Meeting[]) => {
    return [...arr].sort((a, b) => {
      const sa = calculateMeetingStatus(a, now, language, selectedTimezone).startDate.getTime();
      const sb = calculateMeetingStatus(b, now, language, selectedTimezone).startDate.getTime();
      return sa - sb;
    });
  };

  const sortedLive = sortByStartTime(liveMeetings);
  const sortedStartingSoon = sortByStartTime(startingSoonMeetings);
  const sortedToday = sortByStartTime(todayRemainingMeetings);
  const sortedTomorrow = sortByStartTime(tomorrowMeetings);
  const sortedUpcoming = sortByStartTime(upcomingMeetings);
  const sortedEnded = [...endedMeetings].sort((a, b) => {
    const sa = calculateMeetingStatus(a, now, language, selectedTimezone).endDate.getTime();
    const sb = calculateMeetingStatus(b, now, language, selectedTimezone).endDate.getTime();
    return sb - sa; // Most recently ended first
  });

  // TODAY'S MANDATORY VISIBILITY GROUP (Live + Starting Soon + Today)
  const todayAllMeetings = [...sortedLive, ...sortedStartingSoon, ...sortedToday];
  const todayCount = todayAllMeetings.length;

  // FUTURE MEETINGS GROUP (Tomorrow + Upcoming)
  const futureAllMeetings = [...sortedTomorrow, ...sortedUpcoming];

  // Dynamic Batch Slicing Logic:
  // Today's meetings are ALWAYS 100% visible regardless of quantity.
  // Fill remaining slots up to ~20 cards (or visibleFutureCount) with future meetings.
  const minimumFutureSlots = Math.max(0, 20 - todayCount);
  const effectiveFutureLimit = Math.max(visibleFutureCount, minimumFutureSlots);
  
  const visibleFutureMeetings = futureAllMeetings.slice(0, effectiveFutureLimit);
  const hasMoreFutureMeetings = futureAllMeetings.length > visibleFutureMeetings.length;
  const remainingFutureCount = futureAllMeetings.length - visibleFutureMeetings.length;

  // Active Feed Meetings
  const activeFeedMeetings = selectedDayTab === 'all'
    ? [...todayAllMeetings, ...visibleFutureMeetings]
    : sortByStartTime(filteredMeetings.filter(m => calculateMeetingStatus(m, now, language, selectedTimezone).status !== 'ENDED'));

  // Recently Ended Meetings (Last 3 ended meetings)
  const recentlyEndedMeetings = sortedEnded.slice(0, 3);

  const handleCopy = (m: Meeting) => {
    onCopyLink(m);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadIcs = (m: Meeting) => {
    const titleStr = getLocalizedText(m.title, language);
    const descStr = getLocalizedText(m.description, language);
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BahaiZoom//Meeting Schedule//EN
BEGIN:VEVENT
SUMMARY:BahaiZoom: ${titleStr}
DESCRIPTION:${descStr}\\nZoom Link: ${m.zoomUrl}\\nPasscode: ${m.passCode}
LOCATION:${m.zoomUrl}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BahaiZoom-${m.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleFutureCount((prev) => prev + 12);
      setIsLoadingMore(false);
    }, 300);
  };

  return (
    <section id="meetings" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title & Timezone Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>
                {language === 'fa' 
                  ? 'برنامه زنده و هوشمند بر اساس منطقه زمانی شما' 
                  : 'Smart Priority Schedule — Local Timezone Aware'}
              </span>
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold font-display ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {language === 'fa' ? 'جدول هوشمند جلسات' : 'Smart Meeting Schedule'}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              {language === 'fa' 
                ? 'محاسبه لحظه‌ای بر اساس منطقه زمانی دستگاه شما. جلسات امروز همیشه به طور کامل نمایش داده می‌شوند.'
                : 'Real-time schedule calculated for your exact local timezone. All today’s meetings remain 100% visible.'}
            </p>
          </div>

          {/* Timezone Picker Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-100/80 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 px-2">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>{t.timeZone}:</span>
            </span>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800 shadow-xs'
              }`}
            >
              {timezones.map((tz) => (
                <option key={tz.code} value={tz.code}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Mode / Days Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {daysList.map((day) => {
            const isToday = day.index === todayDayIndex;
            const isSelected = day.index === selectedDayTab;
            const dayLabel = language === 'fa' ? day.nameFa : language === 'ar' ? day.nameAr : day.nameEn;

            return (
              <button
                key={String(day.index)}
                onClick={() => setSelectedDayTab(day.index)}
                className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-105'
                    : theme === 'dark'
                      ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <span>{dayLabel}</span>
                {isToday && day.index !== 'all' && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold uppercase ${
                    isSelected ? 'bg-amber-300 text-slate-950' : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                  }`}>
                    {language === 'fa' ? 'امروز' : 'TODAY'}
                  </span>
                )}
                {day.index === 'all' && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-extrabold">
                    {todayCount} Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.languageLabel}:</span>
            </div>
            {['all', 'English', 'Persian', 'Bilingual', 'Arabic', 'Spanish'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguageFilter(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedLanguageFilter === lang
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {lang === 'all' ? t.all : lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {language === 'fa' 
                  ? 'ترتیب هوشمند: 🟢 زنده -> 🟡 به زودی -> 🔵 امروز -> 🟣 فردا -> ⚪ آینده' 
                  : 'Auto-ordered: 🟢 Live -> 🟡 Soon -> 🔵 Today -> 🟣 Tomorrow'}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={() => onOpenAdminEdit && onOpenAdminEdit({} as Meeting)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Meeting</span>
              </button>
            )}
          </div>
        </div>

        {/* Priority Legend Header Banner */}
        {selectedDayTab === 'all' && (
          <div className="mb-8 p-4 rounded-2xl bg-indigo-900/10 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-300 flex-wrap">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {language === 'fa' ? 'اولویت‌های نمایش:' : 'Display Priority:'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">🟢 Live Now</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">🟡 Starting Soon</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold">🔵 Today ({todayCount})</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold">🟣 Tomorrow ({sortedTomorrow.length})</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 font-bold">⚪ Future ({sortedUpcoming.length})</span>
            </div>
            
            <span className="text-xs text-indigo-900 dark:text-indigo-300 font-bold">
              {language === 'fa' ? 'تمام جلسات امروز همواره نمایان است' : '100% Today Coverage'}
            </span>
          </div>
        )}

        {/* MAIN FEED: Active & Upcoming Meetings Grid */}
        {activeFeedMeetings.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            theme === 'dark' ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <CalendarIcon className="w-12 h-12 mx-auto text-amber-500/50 mb-3" />
            <p className="text-base font-semibold">
              {language === 'fa' ? 'هیچ جلسه‌ای با فیلترهای انتخابی یافت نشد.' : 'No scheduled active meetings found for this selection.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fa' ? 'لطفاً فیلتر زبان را تغییر دهید یا منطقه زمانی دیگری انتخاب کنید.' : 'Try selecting a different filter or checking recently ended meetings below.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {activeFeedMeetings.map((m) => {
              const statusInfo = calculateMeetingStatus(m, now, language, selectedTimezone);
              const title = getLocalizedText(m.title, language);
              const desc = getLocalizedText(m.description, language);

              return (
                <div
                  key={m.id}
                  className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden hover:shadow-xl ${statusInfo.borderHighlightClass} ${
                    theme === 'dark' ? 'bg-slate-900/90 text-slate-100' : 'bg-white text-slate-800 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Status Badge & Language Pill */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      
                      {/* Priority Status Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${statusInfo.badgeColorClass}`}>
                        <span className={`w-2 h-2 rounded-full ${statusInfo.indicatorColor} ${statusInfo.status === 'LIVE' ? 'animate-ping' : ''}`} />
                        <span>{statusInfo.badgeLabel}</span>
                      </div>

                      {/* Language Pill */}
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {m.language}
                      </span>
                    </div>

                    {/* Time Countdown & Local Time Display Banner */}
                    <div className="mb-4 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs font-semibold flex items-center justify-between border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5 font-mono text-indigo-900 dark:text-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{statusInfo.countdownText}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {statusInfo.formattedLocalTime} ({statusInfo.timeZoneName.split('/')[1] || statusInfo.timeZoneName})
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold font-display text-indigo-950 dark:text-indigo-200 mb-3 leading-snug">
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-6 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  {/* Host, Passcode & Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                    {(() => {
                      const btnState = getMeetingButtonState(currentUser, statusInfo.status === 'LIVE', statusInfo.status === 'ENDED', language);
                      const hasAccess = canUserAccessZoom(currentUser);

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-amber-500" />
                              <span className="truncate max-w-[170px] font-medium">{m.host}</span>
                            </div>
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <Lock className="w-3 h-3 text-slate-400" />
                              {hasAccess ? (
                                <span>{m.passCode}</span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-sans italic text-[10px]">
                                  {language === 'fa' ? 'نیاز به ورود' : 'Login Required'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            {btnState.type === 'LOGIN_REQUIRED' ? (
                              <button
                                onClick={onRequireLogin}
                                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                              >
                                <Video className="w-4 h-4 text-slate-950" />
                                <span>{btnState.label}</span>
                              </button>
                            ) : !btnState.enabled ? (
                              <button
                                disabled
                                className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                              >
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{btnState.label}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onJoinMeeting(m)}
                                disabled={statusInfo.status === 'ENDED'}
                                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                  statusInfo.status === 'LIVE'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400 animate-pulse'
                                    : statusInfo.status === 'STARTING_SOON'
                                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                }`}
                              >
                                <Video className="w-4 h-4 text-amber-300" />
                                <span>
                                  {statusInfo.status === 'LIVE' 
                                    ? (language === 'fa' ? 'ورود به جلسه زنده' : 'Join Live Now') 
                                    : t.joinZoom}
                                </span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (!hasAccess) {
                                  onRequireLogin();
                                } else {
                                  handleCopy(m);
                                }
                              }}
                              className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                                copiedId === m.id
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : theme === 'dark'
                                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{language === 'fa' ? 'کپی شد' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{t.copyLink}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      );
                    })()}

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <button
                        onClick={() => onExportCalendar ? onExportCalendar(m) : handleDownloadIcs(m)}
                        className="hover:text-indigo-600 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <CalendarIcon className="w-3 h-3" />
                        <span>{t.addToCalendar}</span>
                      </button>

                      <button
                        onClick={() => setActiveModalMeeting(m)}
                        className="hover:text-indigo-600 dark:hover:text-amber-300 underline cursor-pointer"
                      >
                        {t.meetingDetails}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Meetings Button */}
        {selectedDayTab === 'all' && hasMoreFutureMeetings && (
          <div className="flex flex-col items-center justify-center my-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95 border ${
                theme === 'dark'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-indigo-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {isLoadingMore ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {language === 'fa' 
                  ? `بارگذاری جلسات بیشتر (${remainingFutureCount} جلسه باقی‌مانده)`
                  : `Load More Meetings (${remainingFutureCount} remaining)`}
              </span>
            </button>
            <p className="text-xs text-slate-400 mt-2">
              {language === 'fa' ? 'جلسات آینده به صورت مرتب‌شده بارگذاری می‌شوند.' : 'Loads upcoming future schedule asynchronously without page reload.'}
            </p>
          </div>
        )}

        {/* SEPARATE SECTION: RECENTLY ENDED MEETINGS */}
        {recentlyEndedMeetings.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'fa' ? 'آرشیو جلسات برگزار شده' : 'Recently Ended Meetings'}</span>
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
                  {language === 'fa' ? 'جلسات اخیراً برگزار شده و ضبط‌ها' : 'Recently Ended & Video Recordings'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'fa' 
                    ? 'جلسات پایان‌یافته جداگانه نگهداری می‌شوند و مانع از دیدن جلسات امروز نمی‌شوند.'
                    : 'Separately presented so past meetings never push today’s active schedule out of view.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentlyEndedMeetings.map((m) => {
                const title = getLocalizedText(m.title, language);
                const desc = getLocalizedText(m.description, language);
                const isAvailable = m.recordingStatus === 'AVAILABLE' || Boolean(m.recordingUrl);

                return (
                  <div
                    key={m.id}
                    className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                      theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-800 text-slate-300'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      {/* Status Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {language === 'fa' ? 'پایان یافته' : 'Ended'}
                        </span>

                        {/* Recording status badge */}
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                          isAvailable
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        }`}>
                          {isAvailable ? (
                            <>
                              <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                              <span>{language === 'fa' ? 'ویدیو موجود است' : 'Recording Available'}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>{language === 'fa' ? 'ویدیو به زودی' : 'Recording Coming Soon'}</span>
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100 mb-2">
                        {title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400 truncate font-medium">
                        {m.host}
                      </span>

                      {isAvailable ? (
                        <button
                          onClick={() => setActiveRecordingMeeting(m)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{language === 'fa' ? 'مشاهده ضبط' : 'Watch Recording'}</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 text-xs font-semibold cursor-not-allowed opacity-70"
                        >
                          {language === 'fa' ? 'در حال پردازش' : 'Processing'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Meeting Detail Modal */}
      {activeModalMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl relative ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setActiveModalMeeting(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer text-slate-400"
            >
              ✕
            </button>

            {(() => {
              const modalStatus = calculateMeetingStatus(activeModalMeeting, now, language, selectedTimezone);
              return (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase ${modalStatus.badgeColorClass}`}>
                      <span>{modalStatus.badgeLabel}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-semibold font-mono">
                      {modalStatus.countdownText}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold font-display mb-3">
                    {getLocalizedText(activeModalMeeting.title, language)}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {getLocalizedText(activeModalMeeting.description, language)}
                  </p>

                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs sm:text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.host}:</span>
                      <span className="font-semibold">{activeModalMeeting.host}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.timeZone}:</span>
                      <span className="font-semibold">{modalStatus.formattedLocalTime} - {modalStatus.formattedLocalEndTime} ({modalStatus.timeZoneName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">UTC Time:</span>
                      <span className="font-mono font-semibold">{modalStatus.formattedUtcTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.languageLabel}:</span>
                      <span className="font-semibold">{activeModalMeeting.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t.passcode}:</span>
                      <span className="font-mono font-bold text-amber-600">{activeModalMeeting.passCode}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        onJoinMeeting(activeModalMeeting);
                        setActiveModalMeeting(null);
                      }}
                      disabled={modalStatus.status === 'ENDED'}
                      className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer ${
                        modalStatus.status === 'ENDED'
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Video className="w-4 h-4 text-amber-300" />
                      <span>{modalStatus.status === 'ENDED' ? 'Meeting Ended' : t.joinZoom}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onExportCalendar) {
                          onExportCalendar(activeModalMeeting);
                          setActiveModalMeeting(null);
                        } else {
                          handleDownloadIcs(activeModalMeeting);
                        }
                      }}
                      className="px-4 py-3 rounded-2xl border font-semibold text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>{t.addToCalendar}</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Video Recording Replay Modal */}
      {activeRecordingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setActiveRecordingMeeting(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer z-10 text-slate-400"
            >
              ✕
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 mb-3">
              <Tv className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'fa' ? 'پخش آنلاین ویدیو جلسه' : 'Meeting Video Recording'}</span>
            </div>

            <h3 className="text-2xl font-bold font-display mb-2">
              {getLocalizedText(activeRecordingMeeting.title, language)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {language === 'fa' ? 'ارائه شده توسط: ' : 'Hosted by: '}{activeRecordingMeeting.host}
            </p>

            {/* Video Player Frame */}
            <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-slate-800 group">
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Meeting Recording"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {getLocalizedText(activeRecordingMeeting.description, language)}
            </p>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeRecordingMeeting.recordingUrl || 'https://youtube.com');
                  alert(language === 'fa' ? 'لینک ضبط با موفقیت کپی شد!' : 'Recording link copied!');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'کپی لینک ویدیو' : 'Copy Recording Link'}</span>
              </button>

              <button
                onClick={() => setActiveRecordingMeeting(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold text-xs hover:opacity-90 cursor-pointer"
              >
                {language === 'fa' ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
