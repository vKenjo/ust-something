/**
 * Fix broken semester data in ust-curricula.json
 *
 * Many programs have oversized "first" semesters containing courses from
 * multiple real semesters merged together. This script splits them using
 * THY (Theology) course markers as natural semester boundaries.
 *
 * Run: npx tsx lib/data/fix-semesters.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Course {
  code: string;
  name: string;
  lecUnits: number;
  labUnits: number;
  totalUnits: number;
  prerequisites: string[];
  courseType: 'academic' | 'pe' | 'nstp';
}

interface Semester {
  term: 'first' | 'second' | 'summer';
  courses: Course[];
}

interface YearLevel {
  year: number;
  semesters: Semester[];
}

interface ProgramEntry {
  name: string;
  slug: string;
  college: string;
  cluster: string;
  curriculum: YearLevel[];
}

interface CurriculaData {
  generatedAt: string;
  totalPrograms: number;
  successfulScrapes: number;
  programs: ProgramEntry[];
  errors: { slug: string; error: string }[];
}

const MAX_COURSES_PER_SEMESTER = 15;
const IDEAL_SEMESTER_SIZE = 10;

/**
 * Split an oversized course list at THY boundaries.
 * THY 1, THY 2, THY 3, THY 4 mark the end of successive semesters.
 */
function splitAtThyBoundaries(courses: Course[]): Course[][] {
  const thyGroups: Course[][] = [];
  let current: Course[] = [];

  for (const c of courses) {
    current.push(c);
    if (/^THY [1-4]$/.test(c.code)) {
      thyGroups.push([...current]);
      current = [];
    }
  }

  if (current.length > 0) {
    thyGroups.push(current);
  }

  // Post-process: split any group still oversized by size
  const finalGroups: Course[][] = [];
  for (const group of thyGroups) {
    if (group.length > MAX_COURSES_PER_SEMESTER) {
      finalGroups.push(...splitBySize(group, IDEAL_SEMESTER_SIZE));
    } else {
      finalGroups.push(group);
    }
  }

  return finalGroups;
}

/**
 * Split a course list into chunks of roughly `size` courses.
 * Tries to break at GE marker courses for cleaner boundaries.
 */
function splitBySize(courses: Course[], size: number): Course[][] {
  const GE_MARKERS = new Set([
    'ETHICS', 'CONTEM_W', 'LIWORIZ', 'READ_PH', 'ART_APP',
    'PURPCOM', 'STS', 'FIL', 'FIL 1', 'FIL 2', 'UND_SELF', 'MATH_MW',
  ]);

  const groups: Course[][] = [];
  let current: Course[] = [];

  for (const c of courses) {
    current.push(c);
    // Try to break at GE markers when we're near the target size
    if (current.length >= size - 2 && GE_MARKERS.has(c.code)) {
      groups.push([...current]);
      current = [];
    }
    // Force break at max to prevent oversized semesters
    if (current.length >= MAX_COURSES_PER_SEMESTER) {
      groups.push([...current]);
      current = [];
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

/**
 * Assign year/term labels to a flat list of semester groups.
 */
function assignYearTerms(groups: Course[][]): YearLevel[] {
  const terms: ('first' | 'second' | 'summer')[] = ['first', 'second'];
  const yearLevels: YearLevel[] = [];
  let yearNum = 1;
  let termIdx = 0;

  for (const courses of groups) {
    if (yearNum > 5) break;

    if (!yearLevels.find(yl => yl.year === yearNum)) {
      yearLevels.push({ year: yearNum, semesters: [] });
    }

    const yl = yearLevels.find(yl => yl.year === yearNum)!;
    yl.semesters.push({ term: terms[termIdx], courses });

    termIdx++;
    if (termIdx >= terms.length) {
      termIdx = 0;
      yearNum++;
    }
  }

  return yearLevels;
}

/**
 * Check if a program needs fixing.
 */
function needsFix(program: ProgramEntry): boolean {
  for (const yl of program.curriculum) {
    for (const sem of yl.semesters) {
      if (sem.courses.length > MAX_COURSES_PER_SEMESTER) return true;
    }
  }
  return false;
}

/**
 * Check if a program has the "duplicated across years" pattern.
 * These programs have nearly identical first semesters in every year.
 */
function isDuplicatedPattern(program: ProgramEntry): boolean {
  const firstSems = program.curriculum
    .map(yl => yl.semesters.find(s => s.term === 'first'))
    .filter(Boolean) as Semester[];

  if (firstSems.length < 3) return false;

  const codes0 = new Set(firstSems[0].courses.map(c => c.code));
  const codes1 = new Set(firstSems[1].courses.map(c => c.code));
  const overlap = [...codes0].filter(c => codes1.has(c)).length;
  const overlapPct = overlap / Math.max(codes0.size, codes1.size);

  return overlapPct > 0.8;
}

/**
 * Get all unique courses from a program, preserving the order
 * from the first occurrence.
 */
function getAllUniqueCourses(program: ProgramEntry): Course[] {
  const seen = new Set<string>();
  const result: Course[] = [];
  for (const yl of program.curriculum) {
    for (const sem of yl.semesters) {
      for (const c of sem.courses) {
        if (!seen.has(c.code)) {
          seen.add(c.code);
          result.push(c);
        }
      }
    }
  }
  return result;
}

/**
 * Fix a program with the "merged in-order" pattern.
 * Splits oversized semesters at THY boundaries, keeps clean ones.
 */
function fixMergedProgram(program: ProgramEntry): YearLevel[] {
  // Collect all semester groups in order, splitting oversized ones
  const allGroups: Course[][] = [];

  for (const yl of program.curriculum) {
    for (const sem of yl.semesters) {
      if (sem.courses.length > MAX_COURSES_PER_SEMESTER) {
        const split = splitAtThyBoundaries(sem.courses);
        allGroups.push(...split);
      } else {
        allGroups.push(sem.courses);
      }
    }
  }

  return assignYearTerms(allGroups);
}

/**
 * Fix a program with the "duplicated" pattern.
 * Deduplicates all courses, then splits into semesters.
 */
function fixDuplicatedProgram(program: ProgramEntry): YearLevel[] {
  const allCourses = getAllUniqueCourses(program);
  const groups = splitAtThyBoundaries(allCourses);
  return assignYearTerms(groups);
}

// ── Main ──

const jsonPath = path.join(__dirname, 'ust-curricula.json');
const data: CurriculaData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

let fixedMerged = 0;
let fixedDuplicated = 0;
let alreadyClean = 0;

for (const program of data.programs) {
  if (!needsFix(program)) {
    alreadyClean++;
    continue;
  }

  if (isDuplicatedPattern(program)) {
    const before = program.curriculum.flatMap(yl => yl.semesters.map(s => `Y${yl.year}-${s.term}:${s.courses.length}`)).join(', ');
    program.curriculum = fixDuplicatedProgram(program);
    const after = program.curriculum.flatMap(yl => yl.semesters.map(s => `Y${yl.year}-${s.term}:${s.courses.length}`)).join(', ');
    console.log(`[DUP] ${program.slug}`);
    console.log(`  before: ${before}`);
    console.log(`  after:  ${after}`);
    fixedDuplicated++;
  } else {
    const before = program.curriculum.flatMap(yl => yl.semesters.map(s => `Y${yl.year}-${s.term}:${s.courses.length}`)).join(', ');
    program.curriculum = fixMergedProgram(program);
    const after = program.curriculum.flatMap(yl => yl.semesters.map(s => `Y${yl.year}-${s.term}:${s.courses.length}`)).join(', ');
    console.log(`[FIX] ${program.slug}`);
    console.log(`  before: ${before}`);
    console.log(`  after:  ${after}`);
    fixedMerged++;
  }
}

console.log(`\nSummary: ${alreadyClean} clean, ${fixedMerged} merged-fixed, ${fixedDuplicated} deduplicated`);

// Validate: no semester should have > MAX_COURSES
let postFixIssues = 0;
for (const program of data.programs) {
  for (const yl of program.curriculum) {
    for (const sem of yl.semesters) {
      if (sem.courses.length > MAX_COURSES_PER_SEMESTER) {
        console.log(`POST-FIX ISSUE: ${program.slug} Y${yl.year}-${sem.term}: ${sem.courses.length} courses`);
        postFixIssues++;
      }
    }
  }
}

if (postFixIssues === 0) {
  console.log('Validation passed: all semesters <= ' + MAX_COURSES_PER_SEMESTER + ' courses');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log('Saved to ' + jsonPath);
} else {
  console.log(`\n${postFixIssues} semesters still oversized — NOT saving`);
}
