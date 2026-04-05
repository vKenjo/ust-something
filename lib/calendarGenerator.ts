import type { ScheduleEntry } from './scheduleParser';
import { SEMESTER_PERIODS } from './constants';

/**
 * Google Calendar & ICS Generator
 * Creates calendar events from schedule entries
 */

export type SemesterType = 'first' | 'second' | 'summer';

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  recurrence: string; // RRULE format
  categories?: string[];
}

function formatICSDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${min}${sec}`;
}

function formatICSDateUTC(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICSValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function normalizeICSCategories(categories: string[]): string {
  return categories
    .map((category) => category.replace(/[\r\n,;]/g, ' ').trim())
    .filter(Boolean)
    .join(',');
}

/**
 * Get semester date range
 */
export function getSemesterDates(semester: SemesterType, year: number): { start: Date; end: Date } {
  const semesterMap = {
    first: SEMESTER_PERIODS.FIRST,
    second: SEMESTER_PERIODS.SECOND,
    summer: SEMESTER_PERIODS.SUMMER,
  };
  
  const period = semesterMap[semester];
  
  let startYear = year;
  let endYear = year;
  
  // First semester spans two calendar years (Aug-Dec)
  if (semester === 'first') {
    endYear = year;
    startYear = year;
  }
  // Second semester is same year (Jan-May)
  else if (semester === 'second') {
    startYear = year;
    endYear = year;
  }
  // Summer is same year (Jun-Jul)
  else {
    startYear = year;
    endYear = year;
  }
  
  const start = new Date(startYear, period.startMonth - 1, 1);
  const end = new Date(endYear, period.endMonth, 0); // Last day of end month
  
  return { start, end };
}

/**
 * Get the first occurrence of a day in the semester
 */
function getFirstOccurrence(day: string, semesterStart: Date): Date {
  const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
  
  if (dayIndex === -1) {
    throw new Error(`Invalid day: ${day}`);
  }
  
  const date = new Date(semesterStart);
  
  // Find the first occurrence of this day
  while (date.getDay() !== dayIndex) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
}

/**
 * Convert schedule entries to calendar events
 */
export function scheduleToEvents(
  entries: ScheduleEntry[],
  semester: SemesterType,
  year: number
): CalendarEvent[] {
  const { start: semesterStart, end: semesterEnd } = getSemesterDates(semester, year);
  const events: CalendarEvent[] = [];
  const semesterEndInclusive = new Date(semesterEnd);
  semesterEndInclusive.setHours(23, 59, 59, 0);
  
  for (const entry of entries) {
    const firstOccurrence = getFirstOccurrence(entry.day, semesterStart);
    
    // Parse start time
    const [startHour, startMin] = entry.startTime.split(':').map(Number);
    const startDate = new Date(firstOccurrence);
    startDate.setHours(startHour, startMin, 0, 0);
    
    // Parse end time
    const [endHour, endMin] = entry.endTime.split(':').map(Number);
    const endDate = new Date(firstOccurrence);
    endDate.setHours(endHour, endMin, 0, 0);
    
    // Create recurrence rule (weekly until semester end)
    const until = formatICSDateUTC(semesterEndInclusive);
    const recurrence = `FREQ=WEEKLY;UNTIL=${until}`;
    const title = entry.subject?.trim() || entry.code || 'Class';
    const hasDistinctCode = !!entry.code && entry.code.trim() !== title;
    const description = hasDistinctCode ? `${entry.subject}\nCode: ${entry.code}` : entry.subject;
    
    events.push({
      title,
      description,
      location: entry.room || '',
      startDate,
      endDate,
      recurrence,
    });
  }
  
  return events;
}

/**
 * Generate Google Calendar URL
 * Note: Google Calendar has URL length limits, so this works best for small schedules
 */
export function generateGoogleCalendarURL(event: CalendarEvent): string {
  const params = new URLSearchParams();
  
  params.set('action', 'TEMPLATE');
  params.set('text', event.title);
  params.set('details', event.description);
  params.set('location', event.location);
  params.set('ctz', 'Asia/Manila');
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSS)
  const formatGoogleDate = (date: Date) => formatICSDateLocal(date);
  
  const dates = `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`;
  params.set('dates', dates);
  
  // Add recurrence
  params.set('recur', `RRULE:${event.recurrence}`);
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate .ics file content (iCalendar format)
 * This is the better option for multiple events
 */
export function generateICS(events: CalendarEvent[], reminders?: number[]): string {
  const lines: string[] = [];
  
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//UST Kit//Schedule to Calendar//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('X-WR-CALNAME:UST Class Schedule');
  lines.push('X-WR-TIMEZONE:Asia/Manila');
  lines.push('BEGIN:VTIMEZONE');
  lines.push('TZID:Asia/Manila');
  lines.push('X-LIC-LOCATION:Asia/Manila');
  lines.push('BEGIN:STANDARD');
  lines.push('TZOFFSETFROM:+0800');
  lines.push('TZOFFSETTO:+0800');
  lines.push('TZNAME:PST');
  lines.push('DTSTART:19700101T000000');
  lines.push('END:STANDARD');
  lines.push('END:VTIMEZONE');
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const reminder = reminders?.[i] || 0;
    
    lines.push('BEGIN:VEVENT');
    
    // Generate UID
    const uidTitle = event.title.replace(/\s+/g, '-').replace(/[^A-Za-z0-9-_]/g, '');
    const uid = `${event.startDate.getTime()}-${uidTitle || 'event'}@ust-kit.app`;
    lines.push(`UID:${uid}`);

    lines.push(`DTSTART;TZID=Asia/Manila:${formatICSDateLocal(event.startDate)}`);
    lines.push(`DTEND;TZID=Asia/Manila:${formatICSDateLocal(event.endDate)}`);
    lines.push(`RRULE:${event.recurrence}`);
    
    lines.push(`SUMMARY:${escapeICSValue(event.title)}`);
    lines.push(`DESCRIPTION:${escapeICSValue(event.description)}`);
    lines.push(`LOCATION:${escapeICSValue(event.location)}`);
    if (event.categories && event.categories.length > 0) {
      lines.push(`CATEGORIES:${normalizeICSCategories(event.categories)}`);
    }
    
    // Add reminder (VALARM)
    if (reminder && reminder > 0) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeICSValue(`${event.title} starts soon`)}`);
      lines.push(`TRIGGER:-PT${reminder}M`); // Minutes before
      lines.push('END:VALARM');
    }
    
    // Add current timestamp
    lines.push(`DTSTAMP:${formatICSDateUTC(new Date())}`);
    
    lines.push('END:VEVENT');
  }
  
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

/**
 * Download ICS file
 */
export function downloadICS(icsContent: string, filename: string = 'ust-schedule.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Get shareable calendar link (for the first event as example)
 * For multiple events, use ICS download instead
 */
export function getFirstEventGoogleLink(events: CalendarEvent[]): string | null {
  if (events.length === 0) return null;
  return generateGoogleCalendarURL(events[0]);
}
