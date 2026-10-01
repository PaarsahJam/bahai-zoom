import React, { useState, useEffect } from 'react';
import { 
  Clock, Globe, Sun, Moon, Calendar as CalendarIcon, Sunrise, Sunset, 
  Sparkles, CheckCircle2, ChevronRight, MapPin, Compass, Bell, ShieldCheck,
  Share2, ArrowUpRight
} from 'lucide-react';
import { Language, ThemeMode } from '../types';
import { translations } from '../data/translations';
import { getApproximateCoordsForTimezone, calculateSunriseSunset, SolarTimes } from '../utils/sunCalculator';
import { calculateBadiDate, BadiDateInfo } from '../utils/badiCalendar';
import { getPersianDate, PersianDateInfo } from '../utils/persianCalendar';
import { getLocalizedText } from '../utils/localizedHelper';

interface WorldClockDashboardProps {
  language: Language;
  theme: ThemeMode;
}

interface WorldCity {
  id: string;
  cityName: { en: string; fa: string; ar: string };
  timezone: string;
  flag: string;
}

const WORLD_CITIES: WorldCity[] = [
  { id: 'ny', cityName: { en: 'New York', fa: 'نیویورک', ar: 'نيويورك' }, timezone: 'America/New_York', flag: '🇺🇸' },
  { id: 'london', cityName: { en: 'London', fa: 'لندن', ar: 'لندن' }, timezone: 'Europe/London', flag: '🇬🇧' },
  { id: 'ams', cityName: { en: 'Amsterdam', fa: 'آمستردام', ar: 'أمستردام' }, timezone: 'Europe/Amsterdam', flag: '🇳🇱' },
  { id: 'tehran', cityName: { en: 'Tehran', fa: 'تهران', ar: 'طهران' }, timezone: 'Asia/Tehran', flag: '🇮🇷' },
  { id: 'delhi', cityName: { en: 'New Delhi', fa: 'دهلی نو', ar: 'نيودلهي' }, timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { id: 'tokyo', cityName: { en: 'Tokyo', fa: 'توکیو', ar: 'طوكيو' }, timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'sydney', cityName: { en: 'Sydney', fa: 'سیدنی', ar: 'سيدني' }, timezone: 'Australia/Sydney', flag: '🇦🇺' },
];

export const WorldClockDashboard: React.FC<WorldClockDashboardProps> = ({ language, theme }) => {
  const t = translations[language] || translations.en;
  
  // Detect browser timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Amsterdam';
  const [selectedTz, setSelectedTz] = useState<string>(userTimezone);

  // Live ticker state
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate local time in selected timezone
  const localTimeString = now.toLocaleTimeString(language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-EG' : 'en-US', {
    timeZone: selectedTz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const localDateFormatted = now.toLocaleDateString(language === 'fa' ? 'fa-IR-u-ca-gregory' : language === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', {
    timeZone: selectedTz,
    calendar: 'gregory',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate UTC offset for selected timezone
  const getTzOffset = (tz: string) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(now);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : '';
    } catch (e) {
      return '';
    }
  };

  const tzOffset = getTzOffset(selectedTz);
  const coords = getApproximateCoordsForTimezone(selectedTz);
  const solarTimes: SolarTimes = calculateSunriseSunset(now, coords.lat, coords.lng);

  // Check if past local sunset
  const localHour = now.getHours();
  const isPastSunset = !solarTimes.isDaytime && localHour >= 17;

  // Calculate Badíʿ date
  const badiInfo: BadiDateInfo = calculateBadiDate(now, isPastSunset, solarTimes.sunsetDisplay);

  // Calculate Persian date
  const persianInfo: PersianDateInfo = getPersianDate(now);

  // Day/Night Visual Atmosphere helper
  const getAtmosphereTheme = () => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) {
      // Morning
      return {
        bannerBg: 'bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-amber-500/20',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40',
        icon: <Sunrise className="w-5 h-5 text-amber-500 animate-pulse" />,
        label: language === 'fa' ? 'بامداد و صبح (طلوع آفتاب)' : 'Morning Sunrise Atmosphere',
      };
    } else if (hour >= 12 && hour < 17) {
      // Afternoon
      return {
        bannerBg: 'bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 border-blue-500/20',
        badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/40',
        icon: <Sun className="w-5 h-5 text-amber-400" />,
        label: language === 'fa' ? 'ظهر و عصر (آفتابی)' : 'Bright Afternoon Atmosphere',
      };
    } else if (hour >= 17 && hour < 21) {
      // Evening twilight
      return {
        bannerBg: 'bg-gradient-to-r from-orange-500/10 via-amber-600/10 to-purple-600/10 border-orange-500/20',
        badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300/40',
        icon: <Sunset className="w-5 h-5 text-orange-500 animate-pulse" />,
        label: language === 'fa' ? 'شامگاه و غروب خورشید' : 'Golden Twilight Atmosphere',
      };
    } else {
      // Night
      return {
        bannerBg: 'bg-gradient-to-r from-slate-900/40 via-indigo-950/40 to-slate-900/40 border-indigo-500/30',
        badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
        icon: <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />,
        label: language === 'fa' ? 'شب و ستاره‌باران' : 'Serene Night Atmosphere',
      };
    }
  };

  const atmosphere = getAtmosphereTheme();

  // Helper to format countdown seconds
  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (language === 'fa') {
      return `${hours} ساعت و ${mins} دقیقه و ${secs} ثانیه`;
    }
    return `${hours}h ${mins}m ${secs}s`;
  };

  return (
    <section className="relative my-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background ambient container */}
      <div className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 ${atmosphere.bannerBg} ${
        theme === 'dark' ? 'bg-slate-900/80 text-slate-100 border-slate-800 shadow-2xl' : 'bg-white/90 text-slate-900 border-slate-200/80 shadow-xl'
      }`}>
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${atmosphere.badgeColor}`}>
                {atmosphere.icon}
                {atmosphere.label}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                {coords.city}, {coords.country}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-7 h-7 text-indigo-500 animate-spin-slow" />
              {t.worldClockTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t.worldClockSubtitle}
            </p>
          </div>

          {/* Timezone Selector & Live Clock Badge */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs">
              <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
              <select
                value={selectedTz}
                onChange={(e) => setSelectedTz(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-2"
              >
                <option value={userTimezone}>Detect Browser ({userTimezone.split('/')[1] || userTimezone})</option>
                {WORLD_CITIES.map(c => (
                  <option key={c.id} value={c.timezone}>
                    {c.flag} {getLocalizedText(c.cityName, language)} ({getTzOffset(c.timezone)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Local Live Clock Display */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-5 my-6 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {t.localTime} ({selectedTz.split('/')[1]?.replace('_', ' ') || selectedTz})
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                  {tzOffset}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white my-0.5">
                {localTimeString}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {localDateFormatted}
              </div>
            </div>
          </div>

          {/* Solar Times (Sunrise / Sunset) */}
          <div className="flex items-center gap-6 divide-x rtl:divide-x-reverse divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 px-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Sunrise className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">{t.sunrise}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{solarTimes.sunriseDisplay}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pl-6 rtl:pr-6">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <Sunset className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">{t.sunset}</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{solarTimes.sunsetDisplay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Three Calendars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          
          {/* Calendar 1: Bahá'í (Badíʿ) Calendar */}
          <div className="relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-b from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-indigo-500/20 hover:border-indigo-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  🪷
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                  {t.badiCalendar}
                </h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-300/30">
                {badiInfo.yearBE} {t.badiEra}
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {badiInfo.dayInMonth} {language === 'fa' ? badiInfo.monthNameFa : language === 'ar' ? badiInfo.monthNameAr : badiInfo.monthNameEn}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>
                  {language === 'fa' ? badiInfo.weekdayNameFa : language === 'ar' ? badiInfo.weekdayNameAr : badiInfo.weekdayNameEn} ({badiInfo.gregorianDayName})
                </span>
                <span className="italic text-indigo-500 dark:text-indigo-300">
                  “{badiInfo.monthMeaningEn}”
                </span>
              </div>
            </div>

            {/* Feast / Holy Day Status */}
            <div className="my-3 py-2 px-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {badiInfo.isHolyDay ? (
                  <Sparkles className="w-4 h-4 text-amber-500" />
                ) : badiInfo.isFeastDay ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                )}
                {badiInfo.isHolyDay ? t.holyDay : badiInfo.isFeastDay ? t.feastDay : t.regularDay}
              </span>
              {badiInfo.currentHolyDayName && (
                <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                  {badiInfo.currentHolyDayName[language === 'fa' ? 'fa' : language === 'ar' ? 'ar' : 'en']}
                </span>
              )}
            </div>

            {/* Sunset-to-sunset indication & countdown */}
            <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>{t.beginningAtSunset}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{solarTimes.sunsetDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.nextDayBeginsIn}:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatCountdown(badiInfo.nextDayBeginsInSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Calendar 2: Gregorian Calendar */}
          <div className="relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-cyan-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                  📅
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                  {t.gregorianCalendar}
                </h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-300/30">
                {now.getFullYear()} AD
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {now.toLocaleDateString(language === 'fa' ? 'fa-IR-u-ca-gregory' : language === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', { calendar: 'gregory', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {now.toLocaleDateString(language === 'fa' ? 'fa-IR-u-ca-gregory' : language === 'ar' ? 'ar-EG-u-ca-gregory' : 'en-US', { calendar: 'gregory', weekday: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="my-3 py-2 px-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">ISO Standard:</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {now.toISOString().split('T')[0]}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
              <span>Selected Locale:</span>
              <span className="font-semibold uppercase text-slate-700 dark:text-slate-300">{language}</span>
            </div>
          </div>

          {/* Calendar 3: Persian (Solar Hijri) Calendar */}
          <div className="relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-b from-amber-500/5 via-orange-500/5 to-rose-500/5 border-amber-500/20 hover:border-amber-500/40 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-600 text-white text-xs font-bold">
                  ☀️
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-display">
                  {t.persianCalendar}
                </h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold border border-amber-300/30">
                {persianInfo.year} SH
              </span>
            </div>

            <div className="my-4">
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {persianInfo.dayFormattedFa} {persianInfo.monthNameFa}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {persianInfo.weekdayFa} ({persianInfo.monthNameEn})
              </div>
            </div>

            <div className="my-3 py-2 px-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">Formatted:</span>
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                {persianInfo.fullDateFa}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center">
              <span>Solar Hijri Year:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{persianInfo.year}</span>
            </div>
          </div>

        </div>

        {/* Next Bahá'í Holy Day Banner / Card */}
        <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-indigo-600/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t.nextHolyDayTitle}
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'fa' ? badiInfo.nextHolyDay.nameFa : language === 'ar' ? badiInfo.nextHolyDay.nameAr : badiInfo.nextHolyDay.nameEn}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {badiInfo.nextHolyDay.gregorianDateStr} • {badiInfo.nextHolyDay.isWorkSuspended ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Work Suspended</span>
                ) : 'Observance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right rtl:text-left px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-amber-200 dark:border-amber-900/40">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {badiInfo.nextHolyDay.daysRemaining}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                {t.daysRemaining}
              </div>
            </div>
          </div>
        </div>

        {/* World Time Comparison Panel */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              {t.worldTimeComparison}
            </h3>
            <span className="text-xs text-slate-400">
              {WORLD_CITIES.length} Major Global Capitals
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {WORLD_CITIES.map(city => {
              const cityTimeStr = now.toLocaleTimeString(language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-EG' : 'en-US', {
                timeZone: city.timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              const isUserTz = city.timezone === selectedTz;

              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedTz(city.timezone)}
                  className={`p-3 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer ${
                    isUserTz 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md scale-105' 
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-base">{city.flag}</span>
                    <span className={`text-[10px] font-mono ${isUserTz ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {getTzOffset(city.timezone)}
                    </span>
                  </div>
                  <div className="font-bold text-xs truncate">
                    {getLocalizedText(city.cityName, language)}
                  </div>
                  <div className={`text-sm font-black font-mono mt-1 ${isUserTz ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {cityTimeStr}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
