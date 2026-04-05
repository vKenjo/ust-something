/**
 * Quick test for schedule parser and calendar generator
 */

import { parseSchedule, validateSchedule } from './scheduleParser';
import { scheduleToEvents, generateICS, getSemesterDates } from './calendarGenerator';

const testSchedule = `ICS26015\tM\t8:00-10:00\tP301
ICS26016\tT\t10:00-12:00\tP302
ICS26017\tW\t13:00-15:00\tP303
CS26116\tTH\t8:00-11:00\tP301
CS ELEC 4C\tF\t15:00-18:00\tLAB1`;

console.log('Testing Schedule Parser...\n');

const result = parseSchedule(testSchedule);
console.log(`✅ Parsed ${result.entries.length} entries`);
console.log(`❌ ${result.errors.length} errors\n`);

if (result.errors.length > 0) {
  throw new Error(`Unexpected parsing errors: ${result.errors.join(' | ')}`);
}

const validationErrors = validateSchedule(result.entries);
if (validationErrors.length > 0) {
  throw new Error(`Validation errors: ${validationErrors.join(' | ')}`);
}

result.entries.forEach((entry, idx) => {
  console.log(`${idx + 1}. ${entry.code || entry.subject}`);
  console.log(`   ${entry.day} ${entry.startTime}-${entry.endTime} ${entry.room || ''}`);
});

console.log('\n✅ All entries valid');
console.log('\n\nTesting Calendar Generator...\n');

const semesterDates = getSemesterDates('first', 2026);
console.log('Semester: Aug-Dec 2026');
console.log(`Start: ${semesterDates.start.toDateString()}`);
console.log(`End: ${semesterDates.end.toDateString()}\n`);

const events = scheduleToEvents(result.entries, 'first', 2026);
if (events.length !== result.entries.length) {
  throw new Error(`Expected ${result.entries.length} events, got ${events.length}`);
}
console.log(`✅ Generated ${events.length} calendar events\n`);

events.forEach((event, idx) => {
  console.log(`${idx + 1}. ${event.title}`);
  console.log(`   ${event.startDate.toLocaleString()}`);
  console.log(`   Recurrence: ${event.recurrence}`);
});

console.log('\n\nTesting ICS Generator...\n');
const reminders = events.map(() => 15);
const categorizedEvents = events.map((event, index) => ({
  ...event,
  categories: [`Test-Color-${index + 1}`],
}));
const icsContent = generateICS(categorizedEvents, reminders);

if (!icsContent.includes('BEGIN:VCALENDAR') || !icsContent.includes('END:VCALENDAR')) {
  throw new Error('ICS output missing VCALENDAR wrapper');
}
if (!icsContent.includes('BEGIN:VALARM') || !icsContent.includes('TRIGGER:-PT15M')) {
  throw new Error('ICS output missing expected reminder blocks');
}
if (!icsContent.includes('TZID:Asia/Manila')) {
  throw new Error('ICS output missing Asia/Manila timezone');
}
if (!icsContent.includes('CATEGORIES:')) {
  throw new Error('ICS output missing categories line');
}

const icsLines = icsContent.split('\r\n').length;
console.log(`✅ Generated ICS file with ${icsLines} lines\n`);

const previewLines = icsContent.split('\r\n').slice(0, 18);
console.log('Preview:');
previewLines.forEach((line) => console.log(`   ${line}`));

console.log('\n\n✅ All tests passed!');
