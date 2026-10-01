import { CmsUser } from '../types';

export const DEFAULT_MALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(%23mbg)"/><path d="M22 128C22 92 40 76 64 76C88 76 106 92 106 128Z" fill="%230f172a"/><path d="M52 76L64 96L76 76L68 76L64 84L60 76Z" fill="%23ffffff"/><path d="M62 82L66 82L67 104L64 108L61 104Z" fill="%232563eb"/><path d="M54 60L74 60L74 78L54 78Z" fill="%23f1f5f9"/><circle cx="64" cy="48" r="20" fill="%23f8fafc"/><path d="M44 48C44 32 54 26 64 26C74 26 84 32 84 48C84 40 76 30 64 30C52 30 44 40 44 48Z" fill="%230f172a"/></svg>`;

export const DEFAULT_FEMALE_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="fbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23831843"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(%23fbg)"/><path d="M38 48C38 30 50 22 64 22C78 22 90 30 90 48C90 70 86 88 82 94C78 86 86 64 86 48C86 34 76 28 64 28C52 28 42 34 42 48C42 64 50 86 46 94C42 88 38 70 38 48Z" fill="%231e1b4b"/><path d="M24 128C24 94 40 78 64 78C88 78 104 94 104 128Z" fill="%23312e81"/><path d="M50 78L64 100L78 78Z" fill="%23f8fafc"/><path d="M54 62L74 62L74 82L54 82Z" fill="%23f8fafc"/><circle cx="64" cy="48" r="19" fill="%23f8fafc"/><path d="M45 46C45 32 54 25 64 25C74 25 83 32 83 46C83 40 76 30 64 30C52 30 45 40 45 46Z" fill="%231e1b4b"/></svg>`;

export const DEFAULT_NEUTRAL_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="nbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23312e81"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><circle cx="64" cy="64" r="64" fill="url(%23nbg)"/><circle cx="64" cy="46" r="22" fill="%23e0e7ff"/><path d="M26 128C26 94 42 76 64 76C86 76 102 94 102 128Z" fill="%23c7d2fe"/></svg>`;

export function getUserAvatar(user: Partial<CmsUser> | null | undefined): string {
  if (!user) return DEFAULT_NEUTRAL_AVATAR;

  if (user.avatarType === 'custom_photo' && user.avatarUrl) {
    return user.avatarUrl;
  }

  if (user.avatarType === 'preset_female') {
    return DEFAULT_FEMALE_AVATAR;
  }

  if (user.avatarType === 'preset_male') {
    return DEFAULT_MALE_AVATAR;
  }

  if (user.avatarType === 'preset_neutral') {
    return DEFAULT_NEUTRAL_AVATAR;
  }

  // Fallback to gender field if avatarType is not explicit
  if (user.gender === 'female') {
    return DEFAULT_FEMALE_AVATAR;
  }

  if (user.gender === 'male') {
    return DEFAULT_MALE_AVATAR;
  }

  if (user.avatarUrl && user.avatarUrl.trim() !== '') {
    return user.avatarUrl;
  }

  return DEFAULT_NEUTRAL_AVATAR;
}
