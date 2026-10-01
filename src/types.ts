export type Language = 'en' | 'fa' | 'ar' | 'es' | 'fr' | 'tr' | 'ru';
export type ThemeMode = 'light' | 'dark';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  locale: string;
}

export type LocalizedText = Record<string, string> & { en: string };

export type UserRole = 'Guest' | 'Member' | 'Administrator';
export type AccountStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
export type AdminRole = 'Super Admin' | 'Admin' | 'Editor' | 'Content Manager';

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface CmsUser {
  id: string;
  username: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  preferredLanguage?: Language;
  role: UserRole;
  adminRole?: AdminRole;
  status: AccountStatus;
  emailVerified: boolean;
  isActive: boolean;
  mustChangePassword?: boolean;
  gender?: 'male' | 'female' | 'other' | 'unspecified';
  avatarType?: 'preset_male' | 'preset_female' | 'preset_neutral' | 'custom_photo';
  avatarUrl?: string;
  createdAt: string;
  registeredAt?: string;
  lastLoginAt?: string;
  invitedByCode?: string;
  rejectionReason?: string;
  activityHistory?: UserActivity[];
}

export interface MemberInvitation {
  id: string;
  code: string;
  inviteeEmail: string;
  inviteeName?: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  usedByEmail?: string;
}

export interface Meeting {
  id: string;
  title: Record<string, string>;
  subtitle?: Record<string, string>;
  host: string;
  hostId?: string;
  hostRole?: string;
  speakerIds?: string[];
  featuredSpeaker?: string;
  time: string; // e.g. "18:00 UTC"
  startTime?: string;
  endTime?: string;
  date?: string;
  localTimeDisplay?: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ... 6=Saturday
  durationMinutes: number;
  timezone: string;
  language: 'English' | 'Persian' | 'Bilingual' | 'Arabic' | 'Spanish' | 'French' | 'Turkish' | 'Russian';
  zoomUrl: string;
  zoomMeetingId?: string;
  passCode: string;
  description: Record<string, string>;
  category: 'Prayer' | 'Educational' | 'Youth' | 'Devotional' | 'Special Event';
  meetingType?: 'Zoom' | 'Hybrid' | 'In-Person';
  recurrence?: 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'One-Time';
  isLive?: boolean;
  isFeatured?: boolean;
  countdownMinutes?: number;
  registrationLink?: string;
  maxAttendees?: number;
  thumbnailUrl?: string;
  bgImageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  recordingUrl?: string;
  recordingStatus?: 'AVAILABLE' | 'COMING_SOON';
  relatedMediaIds?: string[];
}

export interface Host {
  id: string;
  name: string;
  photoUrl?: string;
  bio: Record<string, string>;
  languages: string[];
  country: string;
  email?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  topics: string[];
  isActive: boolean;
}

export interface Prayer {
  id: string;
  title: Record<string, string>;
  author: string;
  category: 'Persian Prayers' | 'English Prayers' | 'Arabic Prayers' | "Children's Prayers" | 'Healing' | 'Morning';
  textEn?: string;
  textFa?: string;
  textAr?: string;
  textEs?: string;
  textFr?: string;
  textTr?: string;
  textRu?: string;
  audioUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  audioChanter?: string;
  duration?: string;
  tags: string[];
  isFavorite?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface Speaker {
  id: string;
  name: string;
  nameFa?: string;
  title: Record<string, string>;
  bio: Record<string, string>;
  topics: string[];
  expertise?: string[];
  country?: string;
  photoUrl: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  recentTalksCount: number;
  language: 'English' | 'Persian' | 'Bilingual' | 'Arabic' | 'Spanish' | 'French' | 'Turkish' | 'Russian';
  upcomingSession?: string;
  featuredTalks?: string[];
  relatedMediaIds?: string[];
}

export type MediaType = 'video' | 'audio' | 'document' | 'podcast' | 'livestream';
export type MediaProvider = 'youtube' | 'vimeo' | 'archive_org' | 'r2_s3' | 'google_cloud' | 'dropbox' | 'google_drive' | 'direct_url' | 'other';

export interface MediaItem {
  id: string;
  title: Record<string, string>;
  description: Record<string, string> | string;
  mediaType: MediaType;
  provider: MediaProvider;
  externalUrl: string;
  thumbnailUrl: string;
  language: 'English' | 'Persian' | 'Bilingual' | 'Arabic' | 'Spanish' | 'French' | 'Turkish' | 'Russian';
  duration: string;
  relatedMeetingId?: string;
  relatedSpeakerId?: string;
  dateAdded: string;
  tags: string[];
  category: 'Talks' | 'Music & Chants' | 'Children' | 'History' | 'Education' | 'Health' | 'Books';
  speakerName: string;
  embedUrl: string; // Auto-generated / fallback preview URL
  year?: number;
  month?: string;
  views: number;
  isPopular?: boolean;
  isNew?: boolean;
  type?: 'video' | 'audio' | 'document' | 'image'; // Legacy backward compatibility
}

export interface Resource {
  id: string;
  title: Record<string, string>;
  category: 'Children' | 'Junior Youth' | 'Study Circles' | 'Holy Days' | 'Books' | 'Downloads';
  description: Record<string, string>;
  format: 'PDF' | 'Link' | 'Article';
  downloadUrl?: string;
  externalUrl?: string;
}

export interface EventItem {
  id: string;
  title: Record<string, string>;
  date: string;
  category: 'Conference' | 'Holy Day' | 'Feast' | 'Workshop' | 'Online Gathering';
  description: Record<string, string>;
  registrationOpen: boolean;
  isRegistered?: boolean;
  location?: string;
  isWorkSuspended?: boolean;
}

export interface HomepageContent {
  heroTitle: Record<string, string>;
  heroSubtitle: Record<string, string>;
  heroBgUrl?: string;
  primaryBtnText: Record<string, string>;
  secondaryBtnText: Record<string, string>;
  announcementText?: Record<string, string>;
  announcementActive?: boolean;
  showWorldClockSection: boolean;
  showFeaturedSpeakersSection: boolean;
  showPrayerCenterSection: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerText: Record<string, string>;
  contactEmail: string;
  contactPhone: string;
  telegramUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  primaryColor: string;
  defaultLanguage: Language;
  defaultTimezone: string;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  resourceType: string;
  timestamp: string;
  details: string;
  prevValue?: string;
  newValue?: string;
}

export interface MediaLibraryFile {
  id: string;
  name: string;
  category: 'Images' | 'Videos' | 'Audio' | 'Documents';
  fileType: string;
  url: string;
  sizeMb: number;
  uploadDate: string;
  dimensions?: string;
}

export interface UserAccount {
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  bookmarkedPrayers: string[];
  favoriteSpeakers: string[];
  savedMedia: string[];
  registeredEvents: string[];
}

