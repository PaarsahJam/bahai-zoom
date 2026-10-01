import { Language } from '../types';

export interface PersianDateInfo {
  year: number;
  month: number;
  monthNameFa: string;
  monthNameEn: string;
  day: number;
  dayFormattedFa: string;
  weekdayFa: string;
  weekdayEn: string;
  fullDateFa: string;
  fullDateEn: string;
}

const PERSIAN_MONTHS_FA = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const PERSIAN_MONTHS_EN = [
  'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
  'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
];

const PERSIAN_WEEKDAYS_FA = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

const PERSIAN_WEEKDAYS_EN = [
  'Yakshanbeh (Sunday)', 'Doshanbeh (Monday)', 'Sehshanbeh (Tuesday)', 
  'Chaharshanbeh (Wednesday)', 'Panjshanbeh (Thursday)', 'Jomeh (Friday)', 'Shanbeh (Saturday)'
];

export function toPersianDigits(str: string | number): string {
  const persianNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/\d/g, (d) => persianNums[parseInt(d, 10)]);
}

/**
 * Converts Gregorian date to Persian (Solar Hijri / Jalali) date.
 */
export function getPersianDate(date: Date): PersianDateInfo {
  let year = 1405;
  let month = 5; // Mordad
  let day = 9;
  let weekdayFa = 'جمعه';
  let weekdayEn = 'Jomeh (Friday)';

  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'long',
    });
    
    const parts = formatter.formatToParts(date);
    const pYear = parts.find(p => p.type === 'year')?.value;
    const pMonth = parts.find(p => p.type === 'month')?.value;
    const pDay = parts.find(p => p.type === 'day')?.value;
    const pWeekday = parts.find(p => p.type === 'weekday')?.value;

    if (pYear && pMonth && pDay) {
      // Parse Persian digits to ASCII numbers
      const asciiYear = parseInt(toAsciiDigits(pYear), 10);
      const asciiMonth = parseInt(toAsciiDigits(pMonth), 10);
      const asciiDay = parseInt(toAsciiDigits(pDay), 10);

      if (!isNaN(asciiYear)) year = asciiYear;
      if (!isNaN(asciiMonth)) month = asciiMonth;
      if (!isNaN(asciiDay)) day = asciiDay;
    }
    if (pWeekday) weekdayFa = pWeekday;
  } catch (e) {
    // Math approximation fallback if Intl persian calendar is unsupported in browser
    const gYear = date.getFullYear();
    year = gYear - 621;
  }

  const monthNameFa = PERSIAN_MONTHS_FA[month - 1] || PERSIAN_MONTHS_FA[4];
  const monthNameEn = PERSIAN_MONTHS_EN[month - 1] || PERSIAN_MONTHS_EN[4];
  
  const gDay = date.getDay(); // 0 = Sunday
  weekdayFa = PERSIAN_WEEKDAYS_FA[gDay] || weekdayFa;
  weekdayEn = PERSIAN_WEEKDAYS_EN[gDay] || weekdayEn;

  const dayFormattedFa = toPersianDigits(day);

  return {
    year,
    month,
    monthNameFa,
    monthNameEn,
    day,
    dayFormattedFa,
    weekdayFa,
    weekdayEn,
    fullDateFa: `${weekdayFa}، ${dayFormattedFa} ${monthNameFa} ${toPersianDigits(year)}`,
    fullDateEn: `${day} ${monthNameEn} ${year} SH (${weekdayEn.split(' ')[0]})`,
  };
}

function toAsciiDigits(str: string): string {
  const persianNums = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNums = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(persianNums[i], i.toString()).replace(arabicNums[i], i.toString());
  }
  return res;
}
