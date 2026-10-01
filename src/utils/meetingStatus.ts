import { Meeting, Language } from '../types';

export type MeetingStatusType = 'LIVE' | 'STARTING_SOON' | 'TODAY' | 'TOMORROW' | 'UPCOMING' | 'ENDED';

export interface MeetingStatusInfo {
  status: MeetingStatusType;
  startDate: Date;
  endDate: Date;
  formattedLocalTime: string;
  formattedLocalEndTime: string;
  formattedUtcTime: string;
  timeZoneName: string;
  countdownText: string;
  badgeLabel: string;
  badgeColorClass: string;
  indicatorColor: string;
  borderHighlightClass: string;
  priority: number; // 1 = Live, 2 = Starting Soon, 3 = Today, 4 = Tomorrow, 5 = Upcoming, 6 = Ended
  isJoinable: boolean;
}

/**
 * Parses time string like "19:00 UTC", "19:30", "7:00 PM" into hours and minutes
 */
export function parseHoursMinutes(timeStr: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 19, minutes: 0 };
  
  // Clean up string
  const cleaned = timeStr.replace(/UTC/i, '').trim();
  
  // Match 24-hour format "19:30"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
  }

  // Match 12-hour format "7:30 PM"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  }

  // Fallback match any numbers
  const nums = cleaned.match(/\d+/g);
  if (nums && nums.length >= 2) {
    return { hours: parseInt(nums[0], 10), minutes: parseInt(nums[1], 10) };
  }

  return { hours: 19, minutes: 0 };
}

/**
 * Computes exact start Date and end Date objects in UTC for a meeting
 */
export function getMeetingUtcTimes(meeting: Meeting, refDate: Date = new Date()): { startDate: Date; endDate: Date } {
  const { hours, minutes } = parseHoursMinutes(meeting.startTime || meeting.time);
  const duration = meeting.durationMinutes || 60;

  // If specific date YYYY-MM-DD is specified
  if (meeting.date) {
    const parts = meeting.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const startDate = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
      return { startDate, endDate };
    }
  }

  // Weekly recurring based on dayOfWeek (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  const meetingDay = typeof meeting.dayOfWeek === 'number' ? meeting.dayOfWeek : refDate.getUTCDay();
  const currentUtcDay = refDate.getUTCDay();
  
  let dayOffset = meetingDay - currentUtcDay;

  // Check candidate date for this week
  const candidateYear = refDate.getUTCFullYear();
  const candidateMonth = refDate.getUTCMonth();
  const candidateDate = refDate.getUTCDate() + dayOffset;

  let startDate = new Date(Date.UTC(candidateYear, candidateMonth, candidateDate, hours, minutes, 0, 0));
  let endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  // If the meeting for this week has ended more than 12 hours ago and refDate is looking forward,
  // or if dayOffset is negative by more than 3 days, consider next week's occurrence
  const timeSinceEnd = refDate.getTime() - endDate.getTime();
  if (timeSinceEnd > 12 * 60 * 60 * 1000 && dayOffset < 0) {
    // Check next week's occurrence
    const nextWeekStartDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekEndDate = new Date(nextWeekStartDate.getTime() + duration * 60 * 1000);
    
    // If next week's occurrence is closer to now than last week's, use next week
    if (Math.abs(refDate.getTime() - nextWeekStartDate.getTime()) < Math.abs(refDate.getTime() - startDate.getTime())) {
      startDate = nextWeekStartDate;
      endDate = nextWeekEndDate;
    }
  }

  return { startDate, endDate };
}

/**
 * Gets local browser time zone abbreviation or name
 */
export function getVisitorTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
  } catch {
    return 'Local Time';
  }
}

/**
 * Format date into visitor's local browser time (or specified timezone)
 */
export function formatToLocalTime(date: Date, lang: Language = 'en', targetTimeZone?: string): string {
  try {
    const tz = targetTimeZone || getVisitorTimeZone();
    return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz === 'UTC' ? 'UTC' : tz === 'Tehran' ? 'Asia/Tehran' : tz === 'EST' ? 'America/New_York' : tz === 'PST' ? 'America/Los_Angeles' : tz === 'CET' ? 'Europe/Paris' : tz === 'Dubai' ? 'Asia/Dubai' : tz,
    }).format(date);
  } catch {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Formats time difference into human-readable countdown string (e.g., "42 minutes", "1 hour 18 minutes", "2 days")
 */
export function formatDurationCompact(ms: number, showSeconds: boolean = false): string {
  if (ms <= 0) return '0 minutes';

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days >= 2) {
    return `${days} days`;
  }
  if (days === 1) {
    return `1 day ${hours} hrs`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  if (showSeconds && minutes < 10) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes} minutes`;
}

export function resolveIanaTimeZone(tzName: string): string {
  if (!tzName || tzName === 'Local Time') {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }
  if (tzName === 'UTC') return 'UTC';
  if (tzName === 'Tehran') return 'Asia/Tehran';
  if (tzName === 'EST') return 'America/New_York';
  if (tzName === 'PST') return 'America/Los_Angeles';
  if (tzName === 'CET') return 'Europe/Paris';
  if (tzName === 'Dubai') return 'Asia/Dubai';
  return tzName;
}

export function getLocalDateStringInTZ(date: Date, tzName: string): string {
  try {
    const ianaTz = resolveIanaTimeZone(tzName);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: ianaTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // Output format "YYYY-MM-DD"
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Calculates meeting status based on scheduled UTC start/end vs current time & local browser timezone
 */
export function calculateMeetingStatus(
  meeting: Meeting,
  now: Date = new Date(),
  lang: Language = 'en',
  customTimeZone?: string
): MeetingStatusInfo {
  const { startDate, endDate } = getMeetingUtcTimes(meeting, now);
  const nowMs = now.getTime();
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const timeZoneName = customTimeZone || getVisitorTimeZone();
  const formattedLocalTime = formatToLocalTime(startDate, lang, customTimeZone);
  const formattedLocalEndTime = formatToLocalTime(endDate, lang, customTimeZone);
  const formattedUtcTime = `${startDate.getUTCHours().toString().padStart(2, '0')}:${startDate.getUTCMinutes().toString().padStart(2, '0')} UTC`;

  // Local calendar date comparison in visitor's target time zone
  const meetingLocalDateStr = getLocalDateStringInTZ(startDate, timeZoneName);
  const nowLocalDateStr = getLocalDateStringInTZ(now, timeZoneName);

  const tomorrowDateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowLocalDateStr = getLocalDateStringInTZ(tomorrowDateObj, timeZoneName);

  const isTodayInLocalTz = meetingLocalDateStr === nowLocalDateStr;
  const isTomorrowInLocalTz = meetingLocalDateStr === tomorrowLocalDateStr;

  let status: MeetingStatusType = 'UPCOMING';
  let priority = 5;
  let countdownText = '';
  let badgeLabel = '';
  let badgeColorClass = '';
  let indicatorColor = '';
  let borderHighlightClass = '';
  let isJoinable = false;

  // 1. LIVE NOW
  if (nowMs >= startMs && nowMs < endMs) {
    status = 'LIVE';
    priority = 1;
    const remainingMs = endMs - nowMs;
    countdownText = `Ends in ${formatDurationCompact(remainingMs, remainingMs < 10 * 60 * 1000)}`;
    badgeLabel = lang === 'fa' ? 'در حال برگزاری' : lang === 'ar' ? 'مباشر الآن' : 'LIVE NOW';
    badgeColorClass = 'bg-emerald-500 text-white shadow-emerald-500/30 animate-pulse';
    indicatorColor = 'bg-emerald-500';
    borderHighlightClass = 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20';
    isJoinable = true;
  }
  // 2. STARTING SOON (Starts within 60 minutes)
  else if (nowMs < startMs && (startMs - nowMs) <= 60 * 60 * 1000) {
    status = 'STARTING_SOON';
    priority = 2;
    const untilStartMs = startMs - nowMs;
    countdownText = `Starts in ${formatDurationCompact(untilStartMs, true)}`;
    badgeLabel = lang === 'fa' ? 'به زودی آغاز می‌شود' : lang === 'ar' ? 'يبدأ قريباً' : 'STARTING SOON';
    badgeColorClass = 'bg-amber-500 text-slate-950 shadow-amber-500/30';
    indicatorColor = 'bg-amber-500';
    borderHighlightClass = 'border-amber-500/80 ring-2 ring-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20';
    isJoinable = true;
  }
  // 3. TODAY (Starts later today in visitor local time zone)
  else if (nowMs < startMs && isTodayInLocalTz) {
    status = 'TODAY';
    priority = 3;
    const untilStartMs = startMs - nowMs;
    countdownText = `Starts in ${formatDurationCompact(untilStartMs)}`;
    badgeLabel = lang === 'fa' ? 'امروز' : lang === 'ar' ? 'اليوم' : 'TODAY';
    badgeColorClass = 'bg-sky-600 text-white';
    indicatorColor = 'bg-sky-500';
    borderHighlightClass = 'border-sky-500/50 hover:border-sky-500';
    isJoinable = true;
  }
  // 4. TOMORROW (Occurs tomorrow in visitor local time zone)
  else if (nowMs < startMs && isTomorrowInLocalTz) {
    status = 'TOMORROW';
    priority = 4;
    const untilStartMs = startMs - nowMs;
    countdownText = `Starts in ${formatDurationCompact(untilStartMs)}`;
    badgeLabel = lang === 'fa' ? 'فردا' : lang === 'ar' ? 'غداً' : 'TOMORROW';
    badgeColorClass = 'bg-purple-600 text-white';
    indicatorColor = 'bg-purple-500';
    borderHighlightClass = 'border-purple-500/40 hover:border-purple-500';
    isJoinable = false;
  }
  // 5. UPCOMING (Future date >= 2 days away in visitor local time zone)
  else if (nowMs < startMs) {
    status = 'UPCOMING';
    priority = 5;
    const untilStartMs = startMs - nowMs;
    countdownText = `In ${formatDurationCompact(untilStartMs)}`;
    badgeLabel = lang === 'fa' ? 'پیش‌رو' : lang === 'ar' ? 'القادمة' : 'UPCOMING';
    badgeColorClass = 'bg-slate-700 text-slate-100 dark:bg-slate-800 dark:text-slate-300';
    indicatorColor = 'bg-slate-400';
    borderHighlightClass = 'border-slate-200 dark:border-slate-800';
    isJoinable = false;
  }
  // 6. ENDED (Past meeting)
  else {
    status = 'ENDED';
    priority = 6;
    const timeSinceEndMs = nowMs - endMs;
    countdownText = timeSinceEndMs < 24 * 60 * 60 * 1000
      ? `Ended ${formatDurationCompact(timeSinceEndMs)} ago`
      : 'Ended';
    badgeLabel = lang === 'fa' ? 'پایان یافته' : lang === 'ar' ? 'انتهت' : 'ENDED';
    badgeColorClass = 'bg-slate-400/80 text-white dark:bg-slate-800 dark:text-slate-400';
    indicatorColor = 'bg-slate-400';
    borderHighlightClass = 'border-slate-200 dark:border-slate-800/60 opacity-80';
    isJoinable = false;
  }

  return {
    status,
    startDate,
    endDate,
    formattedLocalTime,
    formattedLocalEndTime,
    formattedUtcTime,
    timeZoneName,
    countdownText,
    badgeLabel,
    badgeColorClass,
    indicatorColor,
    borderHighlightClass,
    priority,
    isJoinable,
  };
}

/**
 * Sorts an array of meetings automatically by priority (Live -> Starting Soon -> Today -> Tomorrow -> Upcoming -> Ended)
 * and chronologically within each priority group.
 */
export function sortMeetingsByStatus(meetings: Meeting[], now: Date = new Date(), lang: Language = 'en', customTimeZone?: string): Meeting[] {
  return [...meetings].sort((a, b) => {
    const statusA = calculateMeetingStatus(a, now, lang, customTimeZone);
    const statusB = calculateMeetingStatus(b, now, lang, customTimeZone);

    if (statusA.priority !== statusB.priority) {
      return statusA.priority - statusB.priority;
    }

    // Secondary sort: chronological by start date
    return statusA.startDate.getTime() - statusB.startDate.getTime();
  });
}
