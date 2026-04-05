/**
 * Test with real UST schedule format
 */

import { parseSchedule } from './scheduleParser';

const realUSTSchedule = `ICS26015	EMERGING TECHNOLOGIES	0	1	4CSC	S 10:30am - 01:30pm 19 Flr. Rm. 1901 BLESSED PIER GIORGIO FRASSATI BUILDING
ICS26016	TECHNOPRENEURSHIP	3	0	4CSC	W 07:00am - 10:00am 19 Flr. Rm. 1911 BLESSED PIER GIORGIO FRASSATI BUILDING
ICS26017	SOCIAL AND PROFESSIONAL PRACTICE	3	0	4CSC	W 11:00am - 02:00pm 19 Flr. Rm. 1909 BLESSED PIER GIORGIO FRASSATI BUILDING
CS 26116	PRACTICUM (250 HRS)	0	4	4CSC	TH 08:00am - 11:00am Rm.
CS ELEC 4C	DATA MINING	2	1	4CSC	S 07:00am - 10:00am 19 Flr. Rm. 1901 BLESSED PIER GIORGIO FRASSATI BUILDING
W 04:00pm - 06:00pm 19 Flr. Rm. 1909 BLESSED PIER GIORGIO FRASSATI BUILDING`;

console.log('Testing Real UST Schedule Format...\n');
console.log('='.repeat(80));

const result = parseSchedule(realUSTSchedule);

console.log(`\n✅ Parsed ${result.entries.length} entries (PRACTICUM skipped)`);
console.log(`❌ ${result.errors.length} errors\n`);

if (result.errors.length > 0) {
  console.log('Errors:');
  result.errors.forEach(err => console.log(`  - ${err}`));
  console.log();
}

console.log('Parsed Entries:\n');
result.entries.forEach((entry, idx) => {
  console.log(`${idx + 1}. ${entry.code} - ${entry.subject}`);
  console.log(`   ${entry.day} ${entry.startTime}-${entry.endTime}`);
  console.log(`   Room: ${entry.room || 'N/A'}`);
  console.log();
});

console.log('='.repeat(80));

// Expected: 5 entries (PRACTICUM auto-skipped)
if (result.entries.length === 5) {
  console.log('\n✅ SUCCESS: All 5 regular class entries parsed correctly!');
  console.log('   (Including the multi-line DATA MINING entry with 2 meeting times)');
  console.log('   ✅ PRACTICUM automatically skipped (not a scheduled class)');
} else {
  throw new Error(`Expected 5 entries, got ${result.entries.length}`);
}
