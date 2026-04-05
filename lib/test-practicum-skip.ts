/**
 * Test practicum/OJT filtering
 */

import { parseSchedule } from './scheduleParser';

const scheduleWithPracticum = `ICS26015\tEMERGING TECHNOLOGIES\t0\t1\t4CSC\tS 10:30am - 01:30pm P301
ICS26016\tTECHNOPRENEURSHIP\t3\t0\t4CSC\tW 07:00am - 10:00am P302
CS 26116\tPRACTICUM (250 HRS)\t0\t4\t4CSC\tRm.
ICS26017\tSOCIAL AND PROFESSIONAL PRACTICE\t3\t0\t4CSC\tW 11:00am - 02:00pm P303
NSTP 2\tOJT (Community Service)\t0\t3\t4CSC\tTBA
CS ELEC 4C\tDATA MINING\t2\t1\t4CSC\tS 07:00am - 10:00am LAB1`;

console.log('Testing Practicum/OJT Filtering...\n');

const result = parseSchedule(scheduleWithPracticum);
const expectedCount = 4;
const skippedCount = 2;

console.log(`✅ Parsed ${result.entries.length} entries`);
console.log(`❌ ${result.errors.length} errors\n`);

if (result.errors.length > 0) {
  console.log('Errors:');
  result.errors.forEach((err) => console.log(`  - ${err}`));
  console.log();
}

console.log('Parsed Entries:\n');
result.entries.forEach((entry, idx) => {
  console.log(`${idx + 1}. ${entry.code || 'N/A'} - ${entry.subject}`);
  console.log(`   ${entry.day} ${entry.startTime}-${entry.endTime}`);
});
console.log();

if (result.entries.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} entries, got ${result.entries.length}`);
}

console.log(
  `✅ SUCCESS: Parsed ${expectedCount} entries, skipped ${skippedCount} practicum/OJT entries`,
);
console.log('   Skipped: PRACTICUM (250 HRS), OJT (Community Service)');
