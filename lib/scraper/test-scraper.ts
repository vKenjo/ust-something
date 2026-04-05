/**
 * Test script for UST Curriculum Scraper
 * Run with: npx tsx lib/scraper/test-scraper.ts
 */

import { scrapeProgramCurriculum, detectCourseType } from './index';

const TEST_URL = 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-information-technology/';

async function runTests() {
  console.log('=== UST Curriculum Scraper Test ===\n');

  // Test detectCourseType
  console.log('Testing detectCourseType:');
  const testCases = [
    { code: 'NSTP 1', name: 'National Service Training Program 1', expected: 'nstp' },
    { code: 'NSTP 2', name: 'National Service Training Program 2', expected: 'nstp' },
    { code: 'PATH-FIT 1', name: 'Physical Activities Toward Health', expected: 'pe' },
    { code: 'PATH-FIT', name: 'Fitness Exercises', expected: 'pe' },
    { code: 'PE 1', name: 'Physical Education', expected: 'pe' },
    { code: 'ICS 2601', name: 'Introduction to Computing', expected: 'academic' },
    { code: 'IT 2621', name: 'IT Fundamentals', expected: 'academic' },
    { code: 'IT 26212', name: 'Practicum (500 hours)', expected: 'academic' }, // Practicum is academic but 0 units
  ];

  let passed = 0;
  for (const tc of testCases) {
    const result = detectCourseType(tc.code, tc.name);
    const ok = result === tc.expected;
    console.log(`  ${ok ? '✓' : '✗'} ${tc.code}: ${result} (expected ${tc.expected})`);
    if (ok) passed++;
  }
  console.log(`  ${passed}/${testCases.length} tests passed\n`);

  // Test actual scraping
  console.log('Testing scrapeProgramCurriculum:');
  console.log(`  Fetching: ${TEST_URL}\n`);

  try {
    const program = await scrapeProgramCurriculum(TEST_URL);

    console.log('Program Details:');
    console.log(`  Name: ${program.name}`);
    console.log(`  Slug: ${program.slug}`);
    console.log(`  College: ${program.college}`);
    console.log(`  URL: ${program.url}`);
    console.log(`  Years: ${program.curriculum.length}\n`);

    // Summary by year
    for (const year of program.curriculum) {
      console.log(`Year ${year.year}:`);
      for (const semester of year.semesters) {
        const totalUnits = semester.courses.reduce((sum, c) => sum + c.totalUnits, 0);
        const courseTypes = {
          academic: semester.courses.filter(c => c.courseType === 'academic').length,
          pe: semester.courses.filter(c => c.courseType === 'pe').length,
          nstp: semester.courses.filter(c => c.courseType === 'nstp').length,
        };
        console.log(`  ${semester.term} term: ${semester.courses.length} courses, ${totalUnits} units`);
        console.log(`    Types: ${courseTypes.academic} academic, ${courseTypes.pe} PE, ${courseTypes.nstp} NSTP`);
      }
    }

    // Sample courses from first term
    console.log('\nSample courses (Year 1, First Term):');
    const firstSem = program.curriculum[0]?.semesters[0];
    if (firstSem) {
      for (const course of firstSem.courses.slice(0, 5)) {
        console.log(`  ${course.code}: ${course.name}`);
        console.log(`    Units: ${course.lecUnits}L + ${course.labUnits}Lab = ${course.totalUnits}`);
        console.log(`    Type: ${course.courseType}`);
        if (course.prerequisites.length > 0) {
          console.log(`    Prerequisites: ${course.prerequisites.join(', ')}`);
        }
      }
    }

    // Look for courses with prerequisites
    console.log('\nCourses with prerequisites:');
    let prereqCount = 0;
    for (const year of program.curriculum) {
      for (const semester of year.semesters) {
        for (const course of semester.courses) {
          if (course.prerequisites.length > 0 && prereqCount < 5) {
            console.log(`  ${course.code}: requires ${course.prerequisites.join(', ')}`);
            prereqCount++;
          }
        }
      }
    }

    console.log('\n✓ Scraper test completed successfully!');
  } catch (error) {
    console.error('✗ Scraper test failed:', error);
    process.exit(1);
  }
}

runTests();
