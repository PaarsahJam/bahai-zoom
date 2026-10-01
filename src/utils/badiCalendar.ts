import { Language } from '../types';

export interface BadiMonth {
  number: number;
  nameEn: string;
  nameFa: string;
  nameAr: string;
  meaningEn: string;
  meaningFa: string;
}

export interface BadiWeekday {
  number: number;
  nameEn: string;
  nameFa: string;
  nameAr: string;
  gregorianDay: string;
  meaningEn: string;
}

export interface HolyDay {
  id: string;
  nameEn: string;
  nameFa: string;
  nameAr: string;
  dateDescEn: string;
  badiMonth: number; // 1-19 or 0 for Ayyám-i-Há
  badiDay: number;
  isWorkSuspended: boolean;
  type: 'holy_day' | 'feast' | 'fast' | 'ayyam_i_ha';
}

export interface BadiDateInfo {
  yearBE: number;
  monthNumber: number; // 1-19, or 0 for Ayyám-i-Há
  monthNameEn: string;
  monthNameFa: string;
  monthNameAr: string;
  monthMeaningEn: string;
  dayInMonth: number;
  dayNameEn: string;
  dayNameFa: string;
  dayNameAr: string;
  dayMeaningEn: string;
  weekdayNameEn: string;
  weekdayNameFa: string;
  weekdayNameAr: string;
  gregorianDayName: string;
  isFeastDay: boolean;
  isHolyDay: boolean;
  currentHolyDayName: { en: string; fa: string; ar: string } | null;
  isAyyamIHa: boolean;
  isFastPeriod: boolean;
  beganAtSunset: string;
  nextDayBeginsInSeconds: number;
  nextHolyDay: {
    nameEn: string;
    nameFa: string;
    nameAr: string;
    daysRemaining: number;
    gregorianDateStr: string;
    isWorkSuspended: boolean;
  };
}

export const BADI_MONTHS: BadiMonth[] = [
  { number: 1, nameEn: 'Bahá', nameFa: 'بهاء', nameAr: 'بهاء', meaningEn: 'Splendor', meaningFa: 'شکوه و روشنی' },
  { number: 2, nameEn: 'Jalál', nameFa: 'جلال', nameAr: 'جلال', meaningEn: 'Glory', meaningFa: 'عظمت و جلال' },
  { number: 3, nameEn: 'Jamál', nameFa: 'جمال', nameAr: 'جمال', meaningEn: 'Beauty', meaningFa: 'زیبایی' },
  { number: 4, nameEn: "‘Azamat", nameFa: 'عظمت', nameAr: 'عظمة', meaningEn: 'Grandeur', meaningFa: 'بزرگی' },
  { number: 5, nameEn: 'Núr', nameFa: 'نور', nameAr: 'نور', meaningEn: 'Light', meaningFa: 'روشنایی' },
  { number: 6, nameEn: 'Rahmat', nameFa: 'رحمت', nameAr: 'رحمة', meaningEn: 'Mercy', meaningFa: 'مهربانی' },
  { number: 7, nameEn: 'Kalimát', nameFa: 'کلمات', nameAr: 'كلمات', meaningEn: 'Words', meaningFa: 'سخنان' },
  { number: 8, nameEn: 'Kamál', nameFa: 'کمال', nameAr: 'كمال', meaningEn: 'Perfection', meaningFa: 'کمال' },
  { number: 9, nameEn: "Asmá’", nameFa: 'اسماء', nameAr: 'أسماء', meaningEn: 'Names', meaningFa: 'نام‌ها' },
  { number: 10, nameEn: "‘Izzat", nameFa: 'عزت', nameAr: 'عزة', meaningEn: 'Might', meaningFa: 'سرافرازی' },
  { number: 11, nameEn: 'Mashíyyat', nameFa: 'مشیت', nameAr: 'مشية', meaningEn: 'Will', meaningFa: 'اراده' },
  { number: 12, nameEn: "‘Ilm", nameFa: 'علم', nameAr: 'علم', meaningEn: 'Knowledge', meaningFa: 'دانش' },
  { number: 13, nameEn: 'Qudrat', nameFa: 'قدرت', nameAr: 'قدرة', meaningEn: 'Power', meaningFa: 'توانایی' },
  { number: 14, nameEn: 'Qawl', nameFa: 'قول', nameAr: 'قول', meaningEn: 'Speech', meaningFa: 'گفتار' },
  { number: 15, nameEn: "Masá’il", nameFa: 'مسائل', nameAr: 'مسائل', meaningEn: 'Questions', meaningFa: 'پرسش‌ها' },
  { number: 16, nameEn: 'Sharaf', nameFa: 'شرف', nameAr: 'شرف', meaningEn: 'Honor', meaningFa: 'شرافت' },
  { number: 17, nameEn: 'Sultán', nameFa: 'سلطان', nameAr: 'سلطان', meaningEn: 'Sovereignty', meaningFa: 'پادشاهی' },
  { number: 18, nameEn: 'Mulk', nameFa: 'ملک', nameAr: 'ملك', meaningEn: 'Dominion', meaningFa: 'فرمانروایی' },
  { number: 19, nameEn: "‘Alá’", nameFa: 'علاء', nameAr: 'علاء', meaningEn: 'Loftiness (Month of Fast)', meaningFa: 'والایی (ماه روزه)' },
];

export const BADI_WEEKDAYS: BadiWeekday[] = [
  { number: 1, nameEn: 'Jalál', nameFa: 'جلال', nameAr: 'جلال', gregorianDay: 'Saturday', meaningEn: 'Glory' },
  { number: 2, nameEn: 'Jamál', nameFa: 'جمال', nameAr: 'جمال', gregorianDay: 'Sunday', meaningEn: 'Beauty' },
  { number: 3, nameEn: 'Kamál', nameFa: 'کمال', nameAr: 'كمال', gregorianDay: 'Monday', meaningEn: 'Perfection' },
  { number: 4, nameEn: 'Fadál', nameFa: 'فضال', nameAr: 'فضال', gregorianDay: 'Tuesday', meaningEn: 'Grace' },
  { number: 5, nameEn: "‘Adál", nameFa: 'عدال', nameAr: 'عدال', gregorianDay: 'Wednesday', meaningEn: 'Justice' },
  { number: 6, nameEn: 'Istijlál', nameFa: 'استجلال', nameAr: 'استجلال', gregorianDay: 'Thursday', meaningEn: 'Majesty' },
  { number: 7, nameEn: 'Istiqlál', nameFa: 'استقلال', nameAr: 'استقلال', gregorianDay: 'Friday', meaningEn: 'Independence' },
];

// Major Holy Days
export const HOLY_DAYS: HolyDay[] = [
  { id: 'naw_ruz', nameEn: 'Naw-Rúz (Bahá’í New Year)', nameFa: 'عید نوروز مبارک', nameAr: 'عيد النوروز المبارك', dateDescEn: '1 Bahá (March 20/21)', badiMonth: 1, badiDay: 1, isWorkSuspended: true, type: 'holy_day' },
  { id: 'ridvan_1', nameEn: '1st Day of Ridván', nameFa: 'روز اول عید رضوان', nameAr: 'اليوم الأول من عيد الرضوان', dateDescEn: '13 Jalál (April 20/21)', badiMonth: 2, badiDay: 13, isWorkSuspended: true, type: 'holy_day' },
  { id: 'ridvan_9', nameEn: '9th Day of Ridván', nameFa: 'روز نهم عید رضوان', nameAr: 'اليوم التاسع من عيد الرضوان', dateDescEn: '21 Jalál (April 28/29)', badiMonth: 2, badiDay: 21, isWorkSuspended: true, type: 'holy_day' },
  { id: 'ridvan_12', nameEn: '12th Day of Ridván', nameFa: 'روز دوازدهم عید رضوان', nameAr: 'اليوم الثاني عشر من عيد الرضوان', dateDescEn: '5 Jamál (May 1/2)', badiMonth: 3, badiDay: 5, isWorkSuspended: true, type: 'holy_day' },
  { id: 'declaration_bab', nameEn: 'Declaration of the Báb', nameFa: 'بعثت حضرت باب', nameAr: 'إعلان أمره حضرت الباب', dateDescEn: '8 ‘Azamat (May 22/23)', badiMonth: 4, badiDay: 8, isWorkSuspended: true, type: 'holy_day' },
  { id: 'ascension_bahaullah', nameEn: 'Ascension of Bahá’u’lláh', nameFa: 'صعود حضرت بهاءالله', nameAr: 'صعود حضرت بهاء الله', dateDescEn: '13 ‘Azamat (May 28/29)', badiMonth: 4, badiDay: 13, isWorkSuspended: true, type: 'holy_day' },
  { id: 'martyrdom_bab', nameEn: 'Martyrdom of the Báb', nameFa: 'شهادت حضرت باب', nameAr: 'استشهاد حضرت الباب', dateDescEn: '17 Rahmat (July 8/9)', badiMonth: 6, badiDay: 17, isWorkSuspended: true, type: 'holy_day' },
  { id: 'birth_bab', nameEn: 'Birth of the Báb (Twin Holy Birthdays)', nameFa: 'تولد حضرت باب (اعیاد مقدسه توأمان)', nameAr: 'ولادة حضرت الباب', dateDescEn: 'October / November', badiMonth: 12, badiDay: 5, isWorkSuspended: true, type: 'holy_day' },
  { id: 'birth_bahaullah', nameEn: 'Birth of Bahá’u’lláh (Twin Holy Birthdays)', nameFa: 'تولد حضرت بهاءالله (اعیاد مقدسه توأمان)', nameAr: 'ولادة حضرت بهاء الله', dateDescEn: 'October / November', badiMonth: 12, badiDay: 6, isWorkSuspended: true, type: 'holy_day' },
  { id: 'day_covenant', nameEn: 'Day of the Covenant', nameFa: 'روز عهد و ميثاق', nameAr: 'يوم الميثاق', dateDescEn: '6 Qawl (November 25/26)', badiMonth: 14, badiDay: 6, isWorkSuspended: false, type: 'holy_day' },
  { id: 'ascension_abdulbaha', nameEn: 'Ascension of ‘Abdu’l-Bahá', nameFa: 'صعود حضرت عبدالبهاء', nameAr: 'صعود حضرت عبد البهاء', dateDescEn: '9 Qawl (November 27/28)', badiMonth: 14, badiDay: 9, isWorkSuspended: false, type: 'holy_day' },
];

/**
 * Calculates current Badíʿ date based on solar equinox (March 20/21 Naw-Rúz)
 * and whether local time is currently past sunset.
 */
export function calculateBadiDate(localDate: Date, isPastSunset: boolean, sunsetDisplayTime: string): BadiDateInfo {
  // If it's past sunset today, the Bahá'í day shifted to tomorrow's Gregorian date!
  const effectiveDate = new Date(localDate);
  if (isPastSunset) {
    effectiveDate.setDate(effectiveDate.getDate() + 1);
  }

  const year = effectiveDate.getFullYear();
  const month = effectiveDate.getMonth(); // 0-indexed
  const day = effectiveDate.getDate();

  // Naw-Rúz is March 20 or 21
  const nawRuzYear = (month < 2 || (month === 2 && day < 20)) ? year - 1 : year;
  const yearBE = nawRuzYear - 1844 + 1;

  // Determine Naw-Rúz date for nawRuzYear (March 20 or March 21)
  const nawRuzDate = new Date(nawRuzYear, 2, 20); // March 20 base

  // Calculate day difference from Naw-Rúz
  const diffTime = effectiveDate.getTime() - nawRuzDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let monthNumber = 1;
  let dayInMonth = 1;
  let isAyyamIHa = false;
  let isFastPeriod = false;

  if (diffDays >= 0 && diffDays < 342) {
    // Months 1 to 18 (18 * 19 = 342 days)
    monthNumber = Math.floor(diffDays / 19) + 1;
    dayInMonth = (diffDays % 19) + 1;
  } else if (diffDays >= 342 && diffDays < 346) {
    // Ayyám-i-Há (4 or 5 days)
    monthNumber = 0; // 0 denotes Ayyám-i-Há
    dayInMonth = diffDays - 342 + 1;
    isAyyamIHa = true;
  } else if (diffDays >= 346 && diffDays < 365) {
    // Month 19 ('Alá - Fasting)
    monthNumber = 19;
    dayInMonth = diffDays - 346 + 1;
    isFastPeriod = true;
  } else {
    // Edge case wrap around
    monthNumber = 1;
    dayInMonth = 1;
  }

  // Get month name info
  const monthInfo = monthNumber === 0 
    ? { nameEn: 'Ayyám-i-Há', nameFa: 'ایام هاء', nameAr: 'أيّام الهاء', meaningEn: 'Intercalary Days', meaningFa: 'روزهای بخشش و احسان' }
    : BADI_MONTHS[monthNumber - 1];

  // Get day of month name (Bahá'í day names are identical to month names!)
  const dayNameInfo = BADI_MONTHS[dayInMonth - 1] || monthInfo;

  // Weekday mapping (Saturday = Jalál = 1, Sunday = Jamál = 2, ..., Friday = Istiqlál = 7)
  const gDay = effectiveDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  // 6 (Sat)->1, 0 (Sun)->2, 1 (Mon)->3, 2 (Tue)->4, 3 (Wed)->5, 4 (Thu)->6, 5 (Fri)->7
  const badiWeekdayIndex = (gDay + 1) % 7 === 0 ? 7 : (gDay + 1) % 7;
  const weekdayInfo = BADI_WEEKDAYS[badiWeekdayIndex - 1] || BADI_WEEKDAYS[0];

  const isFeastDay = dayInMonth === 1 && monthNumber >= 1 && monthNumber <= 19;

  // Check Holy Days
  const matchingHolyDay = HOLY_DAYS.find(h => h.badiMonth === monthNumber && h.badiDay === dayInMonth);
  const isHolyDay = !!matchingHolyDay;
  const currentHolyDayName = matchingHolyDay ? {
    en: matchingHolyDay.nameEn,
    fa: matchingHolyDay.nameFa,
    ar: matchingHolyDay.nameAr,
  } : null;

  // Calculate Next Holy Day countdown
  const nextHolyDayInfo = getNextHolyDay(effectiveDate, yearBE);

  // Time until next sunset countdown (seconds)
  const now = localDate.getTime();
  const sunsetToday = new Date(localDate);
  // Example default sunset 19:30 if parsing fails
  const [hh, mm] = parseTimeString(sunsetDisplayTime);
  sunsetToday.setHours(hh, mm, 0, 0);

  let nextSunset = sunsetToday;
  if (now >= sunsetToday.getTime()) {
    nextSunset = new Date(sunsetToday);
    nextSunset.setDate(nextSunset.getDate() + 1);
  }
  const nextDayBeginsInSeconds = Math.max(0, Math.floor((nextSunset.getTime() - now) / 1000));

  return {
    yearBE,
    monthNumber,
    monthNameEn: monthInfo.nameEn,
    monthNameFa: monthInfo.nameFa,
    monthNameAr: monthInfo.nameAr,
    monthMeaningEn: monthInfo.meaningEn,
    dayInMonth,
    dayNameEn: dayNameInfo.nameEn,
    dayNameFa: dayNameInfo.nameFa,
    dayNameAr: dayNameInfo.nameAr,
    dayMeaningEn: dayNameInfo.meaningEn,
    weekdayNameEn: weekdayInfo.nameEn,
    weekdayNameFa: weekdayInfo.nameFa,
    weekdayNameAr: weekdayInfo.nameAr,
    gregorianDayName: weekdayInfo.gregorianDay,
    isFeastDay,
    isHolyDay,
    currentHolyDayName,
    isAyyamIHa,
    isFastPeriod,
    beganAtSunset: sunsetDisplayTime,
    nextDayBeginsInSeconds,
    nextHolyDay: nextHolyDayInfo,
  };
}

function parseTimeString(timeStr: string): [number, number] {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      return [hours, minutes];
    }
  } catch (e) {
    // fallback
  }
  return [19, 30]; // 7:30 PM
}

function getNextHolyDay(currentDate: Date, yearBE: number) {
  // Approximate static table for key upcoming holy day targets in Gregorian terms
  const currentYear = currentDate.getFullYear();
  
  const upcomingTargets = [
    { nameEn: 'Birth of the Báb (Twin Holy Birthdays)', nameFa: 'میلاد حضرت باب (اعیاد مقدسه)', nameAr: 'مولد حضرت الباب', date: new Date(currentYear, 9, 24), isWorkSuspended: true },
    { nameEn: 'Birth of Bahá’u’lláh (Twin Holy Birthdays)', nameFa: 'میلاد حضرت بهاءالله (اعیاد مقدسه)', nameAr: 'مولد حضرت بهاء الله', date: new Date(currentYear, 9, 25), isWorkSuspended: true },
    { nameEn: 'Day of the Covenant', nameFa: 'روز عهد و ميثاق', nameAr: 'يوم الميثاق', date: new Date(currentYear, 10, 25), isWorkSuspended: false },
    { nameEn: 'Ascension of ‘Abdu’l-Bahá', nameFa: 'صعود حضرت عبدالبهاء', nameAr: 'صعود حضرت عبد البهاء', date: new Date(currentYear, 10, 28), isWorkSuspended: false },
    { nameEn: 'Ayyám-i-Há (Intercalary Days)', nameFa: 'ایام هاء (روزهای اهداء و بخشش)', nameAr: 'أيّام الهاء', date: new Date(currentYear, 1, 25), isWorkSuspended: false },
    { nameEn: 'Bahá’í Fast Begins', nameFa: 'آغاز شهر الصیام (ماه روزه)', nameAr: 'بدء شهر الصيام', date: new Date(currentYear, 2, 2), isWorkSuspended: false },
    { nameEn: 'Naw-Rúz (Bahá’í New Year 184 B.E.)', nameFa: 'عید نوروز مبارک (۱۸۴ بدیع)', nameAr: 'عيد النوروز المبارك', date: new Date(currentYear + 1, 2, 20), isWorkSuspended: true },
    { nameEn: '1st Day of Ridván', nameFa: 'روز اول عید رضوان', nameAr: 'اليوم الأول من عيد الرضوان', date: new Date(currentYear, 3, 20), isWorkSuspended: true },
    { nameEn: 'Declaration of the Báb', nameFa: 'بعثت حضرت باب', nameAr: 'إعلان أمره حضرت الباب', date: new Date(currentYear, 4, 23), isWorkSuspended: true },
    { nameEn: 'Ascension of Bahá’u’lláh', nameFa: 'صعود حضرت بهاءالله', nameAr: 'صعود حضرت بهاء الله', date: new Date(currentYear, 4, 29), isWorkSuspended: true },
    { nameEn: 'Martyrdom of the Báb', nameFa: 'شهادت حضرت باب', nameAr: 'استشهاد حضرت الباب', date: new Date(currentYear, 6, 9), isWorkSuspended: true },
  ];

  // Find target after currentDate
  let closest = upcomingTargets.find(t => t.date.getTime() > currentDate.getTime());
  if (!closest) {
    closest = upcomingTargets[0];
  }

  const diffMs = closest.date.getTime() - currentDate.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const gregorianDateStr = closest.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    nameEn: closest.nameEn,
    nameFa: closest.nameFa,
    nameAr: closest.nameAr,
    daysRemaining,
    gregorianDateStr,
    isWorkSuspended: closest.isWorkSuspended,
  };
}
