import { 
  Meeting, Host, Speaker, Prayer, MediaItem, Resource, EventItem, 
  CmsUser, HomepageContent, SiteSettings, AuditLogEntry, MediaLibraryFile, MemberInvitation 
} from '../types';
import { INITIAL_MEETINGS, INITIAL_PRAYERS, INITIAL_SPEAKERS, INITIAL_MEDIA, INITIAL_RESOURCES, INITIAL_EVENTS } from '../data/mockData';

// Initial CMS Users
export const INITIAL_CMS_USERS: CmsUser[] = [
  {
    id: 'usr-1',
    username: 'admin',
    name: 'Primary Administrator',
    firstName: 'Primary',
    lastName: 'Administrator',
    email: 'admin@bahaizoom.org',
    role: 'Administrator',
    adminRole: 'Super Admin',
    status: 'Approved',
    emailVerified: true,
    isActive: true,
    mustChangePassword: true, // Forces password change on first login as requested!
    gender: 'female',
    avatarType: 'preset_female',
    createdAt: '2026-01-01T00:00:00Z',
    registeredAt: '2026-01-01T00:00:00Z',
    country: 'United States',
    preferredLanguage: 'en',
    activityHistory: [
      { id: 'act-1', action: 'LOGIN', timestamp: '2026-08-01T00:10:00Z', details: 'Administrator session active' },
      { id: 'act-2', action: 'UPDATE_MEETING', timestamp: '2026-07-31T18:00:00Z', details: 'Updated Zoom credentials for weekly schedule' }
    ]
  },
  {
    id: 'usr-2',
    username: 'editor_fa',
    name: 'Persian Content Editor',
    firstName: 'Persian',
    lastName: 'Editor',
    email: 'editor.fa@bahaizoom.org',
    role: 'Administrator',
    adminRole: 'Editor',
    status: 'Approved',
    emailVerified: true,
    isActive: true,
    mustChangePassword: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-10T00:00:00Z',
    registeredAt: '2026-02-10T00:00:00Z',
    country: 'Canada',
    preferredLanguage: 'fa'
  },
  {
    id: 'usr-3',
    username: 'arash.navidi',
    name: 'Dr. Arash Navidi',
    firstName: 'Arash',
    lastName: 'Navidi',
    email: 'arash.navidi@example.com',
    role: 'Member',
    status: 'Pending',
    emailVerified: true,
    isActive: true,
    createdAt: '2026-07-31T20:15:00Z',
    registeredAt: '2026-07-31T20:15:00Z',
    country: 'United States',
    preferredLanguage: 'fa',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    activityHistory: [
      { id: 'act-3', action: 'REGISTER', timestamp: '2026-07-31T20:15:00Z', details: 'Registered account, email verified' }
    ]
  },
  {
    id: 'usr-4',
    username: 'tahereh.p',
    name: 'Tahereh Parsa',
    firstName: 'Tahereh',
    lastName: 'Parsa',
    email: 'tahereh.p@example.com',
    role: 'Member',
    status: 'Approved',
    emailVerified: true,
    isActive: true,
    createdAt: '2026-07-28T14:20:00Z',
    registeredAt: '2026-07-28T14:20:00Z',
    country: 'Canada',
    preferredLanguage: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    activityHistory: [
      { id: 'act-4', action: 'JOIN_MEETING', timestamp: '2026-07-30T18:00:00Z', details: 'Joined Zoom: Global Devotional Gathering' }
    ]
  },
  {
    id: 'usr-5',
    username: 'kaveh.s',
    name: 'Kaveh Soltani',
    firstName: 'Kaveh',
    lastName: 'Soltani',
    email: 'kaveh.s@example.com',
    role: 'Member',
    status: 'Rejected',
    emailVerified: true,
    isActive: true,
    createdAt: '2026-07-25T11:00:00Z',
    registeredAt: '2026-07-25T11:00:00Z',
    country: 'Germany',
    preferredLanguage: 'fa',
    rejectionReason: 'Registration details incomplete.'
  },
  {
    id: 'usr-6',
    username: 'soroush.vance',
    name: 'Soroush Vance',
    firstName: 'Soroush',
    lastName: 'Vance',
    email: 'soroush.vance@example.com',
    role: 'Member',
    status: 'Suspended',
    emailVerified: true,
    isActive: false,
    createdAt: '2026-07-20T09:30:00Z',
    registeredAt: '2026-07-20T09:30:00Z',
    country: 'United Kingdom',
    preferredLanguage: 'en'
  }
];

export const INITIAL_INVITATIONS: MemberInvitation[] = [
  {
    id: 'inv-1',
    code: 'BAHAI-ZOOM-2026-UNITY',
    inviteeEmail: 'guest.community@example.com',
    inviteeName: 'Invited Community Guest',
    createdByName: 'Primary Administrator',
    createdByEmail: 'admin@bahaizoom.org',
    createdAt: '2026-07-29T10:00:00Z',
    expiresAt: '2026-08-29T10:00:00Z',
    used: false
  }
];

// Initial Hosts
export const INITIAL_HOSTS: Host[] = [
  {
    id: 'h-1',
    name: 'Dr. Nader Saiedi',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    bio: {
      en: 'Bahá\'í Scholar, Professor of Sociology and Author.',
      fa: 'پژوهشگر بهائی، استاد جامعه‌شناسی و نویسنده کتب معتبر.',
      ar: 'باحث بهائي وأستاذ علم الاجتماع ومؤلف.'
    },
    languages: ['English', 'Persian'],
    country: 'United States',
    email: 'saiedi@bahaizoom.org',
    websiteUrl: 'https://nadersaiedi.com',
    telegramUrl: 'https://t.me/nader_saiedi',
    youtubeUrl: 'https://youtube.com/@nadersaiedi',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    topics: ['History', 'Sociology', 'Spiritual Writings'],
    isActive: true,
  },
  {
    id: 'h-2',
    name: 'Dr. Fariba Parsa',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    bio: {
      en: 'Sociologist, Gender Studies Scholar and Public Speaker.',
      fa: 'جامعه‌شناس، پژوهشگر مطالعات زنان و سخنران عمومی.',
      ar: 'باحثة في علم الاجتماع ومحاضرة عالمية.'
    },
    languages: ['English', 'Persian'],
    country: 'United States',
    email: 'parsa@bahaizoom.org',
    websiteUrl: 'https://faribaparsa.com',
    telegramUrl: '',
    youtubeUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    topics: ['Social Cohesion', 'Gender Equality', 'Youth Empowerment'],
    isActive: true,
  }
];

// Initial Media Library Files
export const INITIAL_MEDIA_FILES: MediaLibraryFile[] = [
  {
    id: 'file-1',
    name: 'hero_background_twilight.jpg',
    category: 'Images',
    fileType: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    sizeMb: 2.4,
    uploadDate: '2026-07-15',
    dimensions: '1920x1080',
  },
  {
    id: 'file-2',
    name: 'hidden_words_chant.mp3',
    category: 'Audio',
    fileType: 'audio/mpeg',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    sizeMb: 5.1,
    uploadDate: '2026-07-18',
  },
  {
    id: 'file-3',
    name: 'badi_calendar_guide_2026.pdf',
    category: 'Documents',
    fileType: 'application/pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sizeMb: 1.8,
    uploadDate: '2026-07-20',
  }
];

// Initial Homepage Settings
export const INITIAL_HOMEPAGE_CONTENT: HomepageContent = {
  heroTitle: {
    en: 'Global Online Fellowship, Prayers & Educational Webinars',
    fa: 'همایش جهانی آنلاین، مناجات و کارگاه‌های آموزشی بهائی',
    ar: 'الملتقى العالمي عبر الإنترنت والأدعية والندوات',
  },
  heroSubtitle: {
    en: 'Connecting hearts across the globe through daily devotions, deep talks, and inspiring children & youth workshops in English, Persian, and Arabic.',
    fa: 'ارتباط و همدلی دلهای سراسر جهان از طریق مناجات، برنامه‌های آموزشی و گفتگوی صمیمانه به زبان‌های مختلف.',
    ar: 'ربط القلوب عبر العالم من خلال الأدعية اليومية والمحاضرات القيمة.',
  },
  heroBgUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
  primaryBtnText: {
    en: 'Join Today’s Live Gathering',
    fa: 'ورود به جلسه زنده امروز',
    ar: 'الانضمام للاجتماع المباشر',
  },
  secondaryBtnText: {
    en: 'Explore Prayer Reader',
    fa: 'کتابخانه مناجات‌ها',
    ar: 'مكتبة المناجاة',
  },
  announcementText: {
    en: '✨ Live Broadcast: Dr. Nader Saiedi on the Philosophy of Badíʿ Calendar starting soon on Zoom!',
    fa: '✨ پخش زنده: گفتگوی دکتر نادر سعیدی درباره فلسفه تقویم بدیع به‌زودی در زوم!',
    ar: '✨ بث مباشر: الدكتور نادر سعيدي عن فلسفة التقويم البديع قريباً عبر زوم!',
  },
  announcementActive: true,
  showWorldClockSection: true,
  showFeaturedSpeakersSection: true,
  showPrayerCenterSection: true,
};

// Initial Site Settings
export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'BahaiZoom — Global Fellowship',
  logoUrl: '🪷',
  faviconUrl: '/favicon.ico',
  footerText: {
    en: 'BahaiZoom is an independent community initiative dedicated to fostering global unity, spiritual education, and interfaith understanding through online gatherings.',
    fa: 'بهائی‌زوم ابتکاری مستقل برای ترویج یگانگی نوع انسان، پرورش فضائل اخلاقی و گفتگوی بین‌الادیانی از طریق جلسات آنلاین است.',
    ar: 'بهائي زوم مبادرة مستقلة لتعزيز الوحدة العالمية والتفاهم الروحي.',
  },
  contactEmail: 'support@bahaizoom.org',
  contactPhone: '+1 (800) 555-ZOOM',
  telegramUrl: 'https://t.me/bahaizoom',
  youtubeUrl: 'https://youtube.com/@bahaizoom',
  instagramUrl: 'https://instagram.com/bahaizoom',
  facebookUrl: 'https://facebook.com/bahaizoom',
  primaryColor: '#4f46e5',
  defaultLanguage: 'fa',
  defaultTimezone: 'Europe/Amsterdam',
};

// Initial Audit Log Entries
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    user: 'admin',
    action: 'CREATE_MEETING',
    resourceType: 'Meeting',
    timestamp: '2026-07-31T18:30:00Z',
    details: 'Created meeting: Global Devotional & Peace Chants (ID: m1)',
  },
  {
    id: 'log-2',
    user: 'admin',
    action: 'UPDATE_SETTINGS',
    resourceType: 'SiteSettings',
    timestamp: '2026-07-31T19:00:00Z',
    details: 'Updated default site timezone to Europe/Amsterdam',
  }
];

// Helper functions for LocalStorage Persistence
const STORAGE_KEYS = {
  MEETINGS: 'bz_cms_meetings',
  HOSTS: 'bz_cms_hosts',
  SPEAKERS: 'bz_cms_speakers',
  PRAYERS: 'bz_cms_prayers',
  MEDIA: 'bz_cms_media',
  RESOURCES: 'bz_cms_resources',
  EVENTS: 'bz_cms_events',
  USERS: 'bz_cms_users',
  FILES: 'bz_cms_files',
  HOMEPAGE: 'bz_cms_homepage',
  SETTINGS: 'bz_cms_settings',
  AUDIT: 'bz_cms_audit',
  AUTH_USER: 'bz_cms_auth_user',
};

export function loadCmsData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading CMS key', key, e);
  }
  return fallback;
}

export function saveCmsData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving CMS key', key, e);
  }
}

// Global CMS Store state helper
export function getStoredMeetings(): Meeting[] {
  return loadCmsData(STORAGE_KEYS.MEETINGS, INITIAL_MEETINGS);
}

getStoredMeetings(); // Warm up

export function logCmsAudit(user: string, action: string, resourceType: string, details: string) {
  const currentLogs = loadCmsData<AuditLogEntry[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  const newLog: AuditLogEntry = {
    id: `log-${Date.now()}`,
    user,
    action,
    resourceType,
    timestamp: new Date().toISOString(),
    details,
  };
  saveCmsData(STORAGE_KEYS.AUDIT, [newLog, ...currentLogs.slice(0, 99)]);
}
