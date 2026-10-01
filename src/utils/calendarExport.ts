import { Meeting, Language } from '../types';
import { getLocalizedText } from './localizedHelper';

export function getMeetingDates(meeting: Meeting): { start: Date; end: Date } {
  // Compute next occurrence date of meeting based on dayOfWeek
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = (meeting.dayOfWeek - currentDay + 7) % 7;
  
  // Parse time e.g. "18:00 UTC" or "19:30"
  let hours = 18;
  let minutes = 0;
  try {
    const timeMatch = meeting.time.match(/(\d+):(\d+)/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
  } catch (e) {
    // fallback
  }

  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysUntil);
  startDate.setHours(hours, minutes, 0, 0);

  // If time today already passed, jump to next week
  if (daysUntil === 0 && startDate.getTime() < now.getTime()) {
    startDate.setDate(startDate.getDate() + 7);
  }

  const endDate = new Date(startDate.getTime() + (meeting.durationMinutes || 60) * 60 * 1000);

  return { start: startDate, end: endDate };
}

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

export function generateGoogleCalendarUrl(meeting: Meeting, lang: Language): string {
  const { start, end } = getMeetingDates(meeting);
  const title = getLocalizedText(meeting.title, lang);
  const desc = `${getLocalizedText(meeting.description, lang)}\n\nZoom Link: ${meeting.zoomUrl}\nPasscode: ${meeting.passCode || 'None'}`;
  
  const startIso = formatDateToICS(start);
  const endIso = formatDateToICS(end);

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', `BahaiZoom: ${title}`);
  url.searchParams.append('dates', `${startIso}/${endIso}`);
  url.searchParams.append('details', desc);
  url.searchParams.append('location', meeting.zoomUrl);

  return url.toString();
}

export function generateOutlookWebUrl(meeting: Meeting, lang: Language): string {
  const { start, end } = getMeetingDates(meeting);
  const title = getLocalizedText(meeting.title, lang);
  const desc = `${getLocalizedText(meeting.description, lang)}\n\nZoom Link: ${meeting.zoomUrl}\nPasscode: ${meeting.passCode || 'None'}`;

  const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  url.searchParams.append('subject', `BahaiZoom: ${title}`);
  url.searchParams.append('startdt', start.toISOString());
  url.searchParams.append('enddt', end.toISOString());
  url.searchParams.append('body', desc);
  url.searchParams.append('location', meeting.zoomUrl);

  return url.toString();
}

export function generateOutlook365Url(meeting: Meeting, lang: Language): string {
  const { start, end } = getMeetingDates(meeting);
  const title = getLocalizedText(meeting.title, lang);
  const desc = `${getLocalizedText(meeting.description, lang)}\n\nZoom Link: ${meeting.zoomUrl}\nPasscode: ${meeting.passCode || 'None'}`;

  const url = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
  url.searchParams.append('subject', `BahaiZoom: ${title}`);
  url.searchParams.append('startdt', start.toISOString());
  url.searchParams.append('enddt', end.toISOString());
  url.searchParams.append('body', desc);
  url.searchParams.append('location', meeting.zoomUrl);

  return url.toString();
}

export function downloadICSFile(meeting: Meeting, lang: Language): void {
  const { start, end } = getMeetingDates(meeting);
  const title = getLocalizedText(meeting.title, lang).replace(/\n/g, ' ');
  const desc = getLocalizedText(meeting.description, lang).replace(/\n/g, '\\n');
  const nowIso = formatDateToICS(new Date());
  const startIso = formatDateToICS(start);
  const endIso = formatDateToICS(end);

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BahaiZoom International//NONGNS',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:meeting-${meeting.id}-${start.getTime()}@bahaizoom.org`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:BahaiZoom: ${title}`,
    `DESCRIPTION:${desc}\\n\\nZoom URL: ${meeting.zoomUrl}\\nPasscode: ${meeting.passCode || 'None'}`,
    `LOCATION:${meeting.zoomUrl}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: BahaiZoom Gathering starting in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `bahaizoom-meeting-${meeting.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
