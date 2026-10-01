import { Language } from '../types';

export function getLocalizedText(
  obj: Record<string, string> | string | undefined | null,
  lang: Language
): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj[lang] && obj[lang].trim().length > 0) {
    return obj[lang];
  }
  if (obj.en && obj.en.trim().length > 0) {
    return obj.en;
  }
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (obj[k] && obj[k].trim().length > 0) {
      return obj[k];
    }
  }
  return '';
}
