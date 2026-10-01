import { Language, LanguageConfig } from '../types';

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    locale: 'en-US',
  },
  {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    dir: 'rtl',
    locale: 'fa-IR',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    locale: 'ar-SA',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    locale: 'es-ES',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    locale: 'fr-FR',
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
    locale: 'tr-TR',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
    locale: 'ru-RU',
  },
];

export const LANGUAGE_MAP: Record<Language, LanguageConfig> = LANGUAGE_CONFIGS.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<Language, LanguageConfig>
);

const LOCAL_STORAGE_KEY = 'bahaizoom_language_preference';
const DISMISSED_GEO_KEY = 'bahaizoom_dismissed_geo_suggestion';

/**
 * Automatically detects the initial language based on:
 * 1. Saved localStorage preference
 * 2. Browser navigator.languages / navigator.language
 * 3. Default fallback to 'en'
 */
export function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as Language | null;
    if (saved && LANGUAGE_MAP[saved]) {
      return saved;
    }
  } catch (e) {
    // ignore localstorage errors
  }

  // Parse navigator languages
  const navLangs = window.navigator?.languages
    ? Array.from(window.navigator.languages)
    : [window.navigator?.language || ''];

  for (const rawLang of navLangs) {
    if (!rawLang) continue;
    const code = rawLang.split('-')[0].toLowerCase();
    if (code === 'fa' || code === 'per') return 'fa';
    if (code === 'ar') return 'ar';
    if (code === 'es') return 'es';
    if (code === 'fr') return 'fr';
    if (code === 'tr') return 'tr';
    if (code === 'ru') return 'ru';
    if (code === 'en') return 'en';
  }

  return 'en';
}

export function saveLanguagePreference(lang: Language): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    document.cookie = `bahaizoom_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (e) {
    // ignore
  }
}

/**
 * Checks if a geographical / browser language suggestion should be shown.
 * Returns suggested language code if user might prefer a different language than current, or null.
 */
export function checkGeographicSuggestion(currentLang: Language): Language | null {
  if (typeof window === 'undefined') return null;

  try {
    const isDismissed = localStorage.getItem(DISMISSED_GEO_KEY);
    if (isDismissed) return null;
  } catch (e) {
    return null;
  }

  // Determine potential match from timezone or browser language
  let suggested: Language | null = null;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const navLang = (window.navigator?.language || '').toLowerCase();

  if (timeZone.includes('Tehran') || navLang.startsWith('fa')) {
    suggested = 'fa';
  } else if (
    timeZone.includes('Riyadh') ||
    timeZone.includes('Cairo') ||
    timeZone.includes('Dubai') ||
    navLang.startsWith('ar')
  ) {
    suggested = 'ar';
  } else if (
    timeZone.includes('Madrid') ||
    timeZone.includes('Mexico') ||
    timeZone.includes('Buenos_Aires') ||
    navLang.startsWith('es')
  ) {
    suggested = 'es';
  } else if (
    timeZone.includes('Paris') ||
    timeZone.includes('Brussels') ||
    navLang.startsWith('fr')
  ) {
    suggested = 'fr';
  } else if (timeZone.includes('Istanbul') || navLang.startsWith('tr')) {
    suggested = 'tr';
  } else if (timeZone.includes('Moscow') || navLang.startsWith('ru')) {
    suggested = 'ru';
  }

  if (suggested && suggested !== currentLang) {
    return suggested;
  }

  return null;
}

export function dismissGeographicSuggestion(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISMISSED_GEO_KEY, 'true');
  } catch (e) {
    // ignore
  }
}

/**
 * Format date string into locale date format
 */
export function formatLocalizedDate(dateStr: string, lang: Language): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const locale = LANGUAGE_MAP[lang]?.locale || 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format meeting time string (e.g. 19:00 UTC) into local browser time and format per target language locale
 */
export function formatLocalizedMeetingTime(utcTimeStr: string, lang: Language): string {
  try {
    const locale = LANGUAGE_MAP[lang]?.locale || 'en-US';
    const match = utcTimeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return utcTimeStr;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    const date = new Date();
    date.setUTCHours(hours, minutes, 0, 0);

    const formattedTime = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    // Add timezone abbreviation
    const timeZoneAbbr = new Intl.DateTimeFormat(locale, { timeZoneName: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value || 'Local';

    return `${formattedTime} (${timeZoneAbbr})`;
  } catch (e) {
    return utcTimeStr;
  }
}
