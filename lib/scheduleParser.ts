/**
 * Schedule Parser Utilities
 * Parses UST class schedules from text format
 */

export interface ScheduleEntry {
  subject: string;
  code?: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  instructor?: string;
}

export interface ParsedSchedule {
  entries: ScheduleEntry[];
  errors: string[];
}

// Common day abbreviations in UST schedules
const DAY_PATTERNS: Record<string, string[]> = {
  Monday: ['M', 'MON', 'MONDAY'],
  Tuesday: ['T', 'TUE', 'TUESDAY'],
  Wednesday: ['W', 'WED', 'WEDNESDAY'],
  Thursday: ['TH', 'THU', 'THURSDAY'],
  Friday: ['F', 'FRI', 'FRIDAY'],
  Saturday: ['S', 'SAT', 'SATURDAY'],
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SKIP_KEYWORDS = ['PRACTICUM', 'OJT', 'INTERNSHIP', 'THESIS', 'CAPSTONE'];

/**
 * Normalize day abbreviations to full day names
 */
function normalizeDay(day: string): string | null {
  const upperDay = day.toUpperCase().trim();
  
  for (const [fullDay, patterns] of Object.entries(DAY_PATTERNS)) {
    if (patterns.includes(upperDay)) {
      return fullDay;
    }
  }
  
  return null;
}

/**
 * Parse time string to 24-hour format
 * Handles: "8:00 AM", "08:00", "8:00AM", "10:30am", "07:00am", etc.
 */
function parseTime(timeStr: string): string | null {
  const cleaned = timeStr.trim().replace(/\s+/g, '').toUpperCase();
  
  // Match patterns like "8:00AM", "10:30AM", "08:00", "8AM", etc.
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);
  
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3];
  
  // Convert to 24-hour format
  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Parse a time range like "8:00 AM - 10:00 AM" or "8:00-10:00"
 */
function parseTimeRange(timeRange: string): { start: string; end: string } | null {
  const parts = timeRange.split('-').map(s => s.trim());
  
  if (parts.length !== 2) return null;
  
  const start = parseTime(parts[0]);
  const end = parseTime(parts[1]);
  
  if (!start || !end) return null;
  
  return { start, end };
}

function shouldSkipLine(line: string): boolean {
  const upperLine = line.toUpperCase();
  return SKIP_KEYWORDS.some(keyword => upperLine.includes(keyword));
}

function parseScheduleInfo(
  scheduleInfo: string
): { day: string; startTime: string; endTime: string; room: string } | null {
  const scheduleMatch = scheduleInfo.match(
    /^([A-Za-z]+)\s+(\d{1,2}:\d{2}(?:\s*[ap]m?)?)\s*-\s*(\d{1,2}:\d{2}(?:\s*[ap]m?)?)\s*(.*)$/i
  );

  if (!scheduleMatch) {
    return null;
  }

  const day = normalizeDay(scheduleMatch[1]);
  const startTime = parseTime(scheduleMatch[2]);
  const endTime = parseTime(scheduleMatch[3]);
  const room = scheduleMatch[4] ? scheduleMatch[4].trim() : '';

  if (!day || !startTime || !endTime) {
    return null;
  }

  return { day, startTime, endTime, room };
}

/**
 * Parse UST-specific tabular format
 * Format: CODE | NAME | LEC | LAB | SECTION | DAY TIME ROOM
 * Example: ICS26015 | EMERGING TECHNOLOGIES | 0 | 1 | 4CSC | S 10:30am - 01:30pm 19 Flr. Rm. 1901
 */
function parseTabular(text: string): ParsedSchedule {
  const entries: ScheduleEntry[] = [];
  const errors: string[] = [];
  
  const lines = text.split('\n').filter(line => line.trim());
  let currentCourse: { subject: string; code?: string; room?: string } | null = null;
  
  for (const line of lines) {
    if (shouldSkipLine(line)) {
      continue;
    }
    
    const parts = line.split('\t').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) continue;
    
    const firstPart = parts[0];
    const isMainEntry = /^[A-Z]{2,}(?:\s+ELEC)?\s*\d+[A-Z0-9]*$/i.test(firstPart);
    
    // Continuation line for previous subject (e.g. additional meeting day/time)
    if (!isMainEntry && currentCourse) {
      const continuation = parseScheduleInfo(parts.join(' '));
      if (continuation) {
        entries.push({
          subject: currentCourse.subject,
          code: currentCourse.code,
          day: continuation.day,
          startTime: continuation.startTime,
          endTime: continuation.endTime,
          room: continuation.room || currentCourse.room || '',
        });
      }
      continue;
    }

    if (!isMainEntry) {
      errors.push(`Could not parse line: ${line}`);
      continue;
    }

    // Simple tab format: CODE<TAB>DAY<TAB>START-END<TAB>ROOM
    if (parts.length >= 3 && normalizeDay(parts[1])) {
      const day = normalizeDay(parts[1]);
      const timeRange = parseTimeRange(parts[2]);
      if (day && timeRange) {
        const room = parts.slice(3).join(' ').trim();
        entries.push({
          subject: parts[0],
          code: parts[0],
          day,
          startTime: timeRange.start,
          endTime: timeRange.end,
          room,
        });
        currentCourse = { subject: parts[0], code: parts[0], room };
        continue;
      }
    }

    // UST format: CODE | NAME | LEC | LAB | SECTION | DAY TIME ROOM
    const code = parts[0];
    const subject = parts[1] || code;
    const scheduleInfo = parts.length >= 6 ? parts.slice(5).join(' ') : parts[parts.length - 1];
    const parsedSchedule = parseScheduleInfo(scheduleInfo);

    if (parsedSchedule) {
      entries.push({
        subject,
        code,
        day: parsedSchedule.day,
        startTime: parsedSchedule.startTime,
        endTime: parsedSchedule.endTime,
        room: parsedSchedule.room,
      });
      currentCourse = { subject, code, room: parsedSchedule.room };
      continue;
    }

    // Keep course context if next line contains continuation schedule
    currentCourse = { subject, code };
  }
  
  return { entries, errors };
}

/**
 * Parse free-form text format
 * Example: "ICS26015 Monday 8:00-10:00 P301"
 */
function parseFreeForm(text: string): ParsedSchedule {
  const entries: ScheduleEntry[] = [];
  const errors: string[] = [];
  
  const lines = text.split('\n').filter(line => line.trim());
  const compactRegex =
    /^(.*?)(MONDAY|MON|M|TUESDAY|TUE|T|WEDNESDAY|WED|W|THURSDAY|THU|TH|FRIDAY|FRI|F|SATURDAY|SAT|S)\s+(\d{1,2}:\d{2}(?:\s*[ap]m?)?)\s*-\s*(\d{1,2}:\d{2}(?:\s*[ap]m?)?)\s*(.*)$/i;
  
  for (const line of lines) {
    if (shouldSkipLine(line)) {
      continue;
    }

    const compactMatch = line.match(compactRegex);
    if (!compactMatch) {
      errors.push(`Could not parse line: ${line}`);
      continue;
    }

    const rawPrefix = compactMatch[1].trim();
    const day = normalizeDay(compactMatch[2]);
    const startTime = parseTime(compactMatch[3]);
    const endTime = parseTime(compactMatch[4]);
    const room = compactMatch[5].trim();
    if (!day || !startTime || !endTime) {
      errors.push(`Could not parse line: ${line}`);
      continue;
    }

    const prefix = rawPrefix.replace(/\s+/g, ' ').trim();
    const compactCode = prefix.match(/^([A-Z]{2,5}\d{4,6})(.*)$/i);
    const spacedCode = prefix.match(/^([A-Z]{2,}(?:\s+[A-Z]{2,})*\s+\d+[A-Z]?)(.*)$/i);
    const code = compactCode?.[1]?.trim() ?? spacedCode?.[1]?.trim();
    const rawSubject =
      compactCode?.[2]?.trim() ??
      spacedCode?.[2]?.trim() ??
      (code ? prefix.slice(code.length).trim() : prefix);

    const subject =
      rawSubject
        .replace(/\s+\d+\s+\d+\s+[A-Z0-9]{2,}$/i, '')
        .replace(/\s*\d{2,4}[A-Z0-9]{2,}$/i, '')
        .trim() ||
      code ||
      prefix ||
      line.trim();

    entries.push({
      subject,
      code,
      day,
      startTime,
      endTime,
      room,
    });
  }
  
  return { entries, errors };
}

/**
 * Main parser function - tries different formats
 */
export function parseSchedule(text: string): ParsedSchedule {
  if (!text.trim()) {
    return { entries: [], errors: ['No schedule text provided'] };
  }
  
  // Determine format based on content
  const hasDelimiters = text.includes('\t') || text.includes('|');
  
  let result: ParsedSchedule;
  
  if (hasDelimiters) {
    result = parseTabular(text);
    if (result.entries.length === 0) {
      const fallback = parseFreeForm(text);
      if (fallback.entries.length > 0) {
        result = fallback;
      }
    }
  } else {
    result = parseFreeForm(text);
  }
  
  // Sort entries by day and time
  result.entries.sort((a, b) => {
    const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    
    return a.startTime.localeCompare(b.startTime);
  });
  
  return result;
}

/**
 * Validate schedule entries
 */
export function validateSchedule(entries: ScheduleEntry[]): string[] {
  const errors: string[] = [];
  
  if (entries.length === 0) {
    errors.push('No schedule entries found');
    return errors;
  }
  
  for (const entry of entries) {
    if (!entry.day) {
      errors.push(`Missing day for ${entry.subject}`);
    }
    
    if (!entry.startTime || !entry.endTime) {
      errors.push(`Missing time for ${entry.subject}`);
    }
    
    if (entry.startTime >= entry.endTime) {
      errors.push(`Invalid time range for ${entry.subject} (start >= end)`);
    }
  }
  
  return errors;
}

/**
 * Format schedule entry for display
 */
export function formatScheduleEntry(entry: ScheduleEntry): string {
  const time = `${formatTime12Hour(entry.startTime)} - ${formatTime12Hour(entry.endTime)}`;
  const parts = [entry.subject, entry.day, time];
  
  if (entry.room) {
    parts.push(entry.room);
  }
  
  return parts.join(' | ');
}

/**
 * Convert 24-hour time to 12-hour format
 */
function formatTime12Hour(time: string): string {
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return `${hours}:${minutes} ${meridiem}`;
}
