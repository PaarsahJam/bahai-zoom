import { CmsUser, Meeting, Language, Resource } from '../types';

/**
 * Authorization: Returns true ONLY IF the user is an authenticated, active Administrator.
 * Unauthenticated guests, pending/rejected/suspended members return false.
 */
export function isAdministrator(user: CmsUser | null | undefined): boolean {
  if (!user) return false;
  if (!user.isActive) return false;
  return user.role === 'Administrator';
}

/**
 * Alias used for all admin-gated UI & route decisions.
 */
export function canAccessAdmin(user: CmsUser | null | undefined): boolean {
  return isAdministrator(user);
}

/**
 * Server/Data-boundary enforcement guard.
 * Throws for unauthorized data mutations so admin CRUD can never be executed
 * by relying on hidden buttons alone.
 */
export function assertAdminAccess(user: CmsUser | null | undefined, action: string): void {
  if (!isAdministrator(user)) {
    throw new Error(`AUTH_FORBIDDEN: Administrator privileges required for "${action}".`);
  }
}

/**
 * Lightweight admin route definitions (hash-based since the app is a SPA).
 * Any route beginning with #/admin is considered an administrator route.
 */
export const ADMIN_ROUTE_PREFIX = '#/admin';

export function isAdminRouteHash(hash: string): boolean {
  return typeof hash === 'string' && hash.startsWith(ADMIN_ROUTE_PREFIX);
}

const ADMIN_TAB_MAP: Record<string, string> = {
  dashboard: 'overview',
  meetings: 'meetings',
  cms: 'settings',
  settings: 'settings',
  users: 'users',
  media: 'media',
  analytics: 'overview',
  schedule: 'schedule',
  prayers: 'prayers',
  hosts: 'hosts_speakers',
  audit: 'audit',
};

export function getAdminTabFromHash(hash: string): string {
  const segment = hash.slice(ADMIN_ROUTE_PREFIX.length).replace(/^\/+/, '').split('/')[0].toLowerCase();
  return ADMIN_TAB_MAP[segment] || 'overview';
}

/**
 * Core security check: Returns true ONLY IF the user is an Approved Member or Administrator.
 * Unauthenticated guests, pending members, rejected, or suspended accounts return false.
 */
export function canUserAccessZoom(user: CmsUser | null): boolean {
  if (!user) return false;
  if (!user.isActive) return false;
  if (user.role === 'Administrator') return true;
  if (user.role === 'Member' && user.status === 'Approved') return true;
  return false;
}

export function canUserAccessMemberResources(user: CmsUser | null): boolean {
  return canUserAccessZoom(user);
}

/**
 * Server/Data-boundary security stripper.
 * Guarantees that unauthorized users (guests, pending members) NEVER receive Zoom URLs,
 * Meeting IDs, or Passcodes in the data payload.
 */
export function sanitizeMeetingForUser(meeting: Meeting, user: CmsUser | null): Meeting {
  if (canUserAccessZoom(user)) {
    return meeting;
  }
  return {
    ...meeting,
    zoomUrl: '',
    zoomMeetingId: undefined,
    passCode: '••••••••',
    recordingUrl: meeting.recordingUrl ? undefined : undefined,
  };
}

export function sanitizeMeetingsList(meetings: Meeting[], user: CmsUser | null): Meeting[] {
  return meetings.map((m) => sanitizeMeetingForUser(m, user));
}

export function sanitizeResourceForUser(resource: Resource, user: CmsUser | null): Resource {
  if (canUserAccessMemberResources(user)) {
    return resource;
  }
  // Strip download URL if it's protected
  if (resource.category === 'Downloads' || resource.category === 'Books') {
    return {
      ...resource,
      downloadUrl: undefined,
    };
  }
  return resource;
}

export function sanitizeResourcesList(resources: Resource[], user: CmsUser | null): Resource[] {
  return resources.map((r) => sanitizeResourceForUser(r, user));
}

export interface MeetingButtonState {
  label: string;
  type: 'LOGIN_REQUIRED' | 'PENDING_APPROVAL' | 'REJECTED' | 'SUSPENDED' | 'JOIN_ALLOWED';
  enabled: boolean;
  tooltip?: string;
  badgeText?: string;
}

export function getMeetingButtonState(
  user: CmsUser | null,
  isLive: boolean,
  isEnded: boolean,
  language: Language
): MeetingButtonState {
  const isFa = language === 'fa';
  const isAr = language === 'ar';

  if (!user) {
    return {
      label: isFa ? 'ورود به سایت برای شرکت' : isAr ? 'تسجيل الدخول للانضمام' : 'Login to Join',
      type: 'LOGIN_REQUIRED',
      enabled: true,
      tooltip: isFa ? 'برای مشاهده لینک زوم باید وارد شوید' : 'Sign in to access Zoom meeting details',
      badgeText: isFa ? 'نیاز به ورود' : 'Login Required',
    };
  }

  if (user.status === 'Suspended' || !user.isActive) {
    return {
      label: isFa ? 'حساب کاربری معلق است' : 'Account Suspended',
      type: 'SUSPENDED',
      enabled: false,
      tooltip: isFa ? 'حساب شما معلق شده است' : 'Your account has been suspended.',
    };
  }

  if (user.status === 'Rejected') {
    return {
      label: isFa ? 'تأیید نشده' : 'Access Restricted',
      type: 'REJECTED',
      enabled: false,
      tooltip: isFa ? 'ثبت‌نام شما به تأیید نرسیده است' : 'Registration was not approved.',
    };
  }

  if (user.status === 'Pending' && user.role !== 'Administrator') {
    return {
      label: isFa ? 'در انتظار تأیید مدیریت' : 'Awaiting Approval',
      type: 'PENDING_APPROVAL',
      enabled: false,
      tooltip: isFa ? 'حساب شما پس از بررسی توسط مدیریت فعال خواهد شد' : 'Your registration is awaiting approval by an administrator.',
      badgeText: isFa ? 'در انتظار تأیید' : 'Pending Approval',
    };
  }

  // Approved Member or Administrator
  if (isEnded) {
    return {
      label: isFa ? 'جلسه پایان یافته' : 'Meeting Ended',
      type: 'JOIN_ALLOWED',
      enabled: false,
    };
  }

  if (isLive) {
    return {
      label: isFa ? 'ورود به جلسه زنده' : 'Join Live Now',
      type: 'JOIN_ALLOWED',
      enabled: true,
    };
  }

  return {
    label: isFa ? 'ورود به زوم' : 'Join Meeting',
    type: 'JOIN_ALLOWED',
    enabled: true,
  };
}
