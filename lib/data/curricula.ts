/**
 * UST Curriculum Data Store
 * Helper functions for working with scraped curriculum data
 */

import type { Course, CurriculaData, ProgramEntry } from './types';
import curriculaJson from './ust-curricula.json';
import {
  UST_COLLEGES,
  resolveCollege,
  resolveCollegeByName,
  type CollegeInfo,
} from '../collegeMapping';

const data = curriculaJson as CurriculaData;

const PROGRAM_COLLEGE_KEY_OVERRIDES: [RegExp, string][] = [
  [/^Bachelor of Science in Accountancy$/i, 'ACCOUNTANCY'],
];

function resolveProgramCollegeKey(program: ProgramEntry): string {
  for (const [pattern, collegeKey] of PROGRAM_COLLEGE_KEY_OVERRIDES) {
    if (pattern.test(program.name)) {
      return collegeKey;
    }
  }

  return resolveCollegeByName(program.college) ?? resolveCollege(program.name);
}

function resolveRequestedCollegeKey(college: string): string | null {
  return resolveCollegeByName(college);
}

/**
 * Get all unique clusters from the curriculum data
 */
export function getClusters(): string[] {
  const clusters = new Set(data.programs.map((p) => p.cluster));
  return Array.from(clusters).sort();
}

/**
 * Get all programs belonging to a specific cluster
 */
export function getProgramsByCluster(cluster: string): ProgramEntry[] {
  return data.programs.filter((p) => p.cluster === cluster);
}

/**
 * Get all unique colleges from the curriculum data, with clean names.
 */
export function getColleges(): CollegeInfo[] {
  const seen = new Set<string>();
  const result: CollegeInfo[] = [];

  for (const p of data.programs) {
    const key = resolveProgramCollegeKey(p);
    if (!seen.has(key)) {
      seen.add(key);
      const info = UST_COLLEGES[key];
      if (info) result.push(info);
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all programs belonging to a specific college (by full name or short name).
 */
export function getProgramsByCollege(college: string): ProgramEntry[] {
  const targetKey = resolveRequestedCollegeKey(college);
  if (!targetKey) return [];

  const seenNames = new Set<string>();
  const result: ProgramEntry[] = [];

  for (const program of data.programs) {
    const programKey = resolveProgramCollegeKey(program);
    if (programKey !== targetKey) continue;

    // De-duplicate accidental duplicate entries from data source drift.
    const nameKey = program.name.trim().toLowerCase();
    if (seenNames.has(nameKey)) continue;
    seenNames.add(nameKey);
    result.push(program);
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific program by its slug
 */
export function getProgram(slug: string): ProgramEntry | undefined {
  return data.programs.find((p) => p.slug === slug);
}

/**
 * Get courses for a specific year and semester of a program.
 */
export function getCoursesForSemester(
  slug: string,
  year: number,
  term: 'first' | 'second' | 'summer'
): Course[] {
  const program = getProgram(slug);
  if (!program) return [];

  const yearLevel = program.curriculum.find((y) => y.year === year);
  if (!yearLevel) return [];

  const semester = yearLevel.semesters.find((s) => s.term === term);
  return semester?.courses ?? [];
}

/**
 * Get all academic year levels available for a program
 */
export function getYearLevels(slug: string): number[] {
  const program = getProgram(slug);
  if (!program) return [];

  return program.curriculum.map((y) => y.year).sort((a, b) => a - b);
}

/**
 * Get metadata about the curriculum data
 */
export function getMetadata(): {
  generatedAt: string;
  totalPrograms: number;
  successfulScrapes: number;
  errorCount: number;
} {
  return {
    generatedAt: data.generatedAt,
    totalPrograms: data.totalPrograms,
    successfulScrapes: data.successfulScrapes,
    errorCount: data.errors.length,
  };
}

/**
 * Check if curriculum data has been loaded (scraper has run)
 */
export function hasData(): boolean {
  return data.programs.length > 0;
}

/**
 * Check if a program's curriculum data is complete (has valid courses).
 * Some programs may have incomplete data due to scraping issues.
 */
export function isProgramDataClean(slug: string): boolean {
  const program = getProgram(slug);
  if (!program) return false;
  
  // Check if program has at least one semester with courses
  for (const year of program.curriculum) {
    for (const semester of year.semesters) {
      if (semester.courses.length > 0) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get all programs, optionally sorted by name
 */
export function getAllPrograms(): ProgramEntry[] {
  return [...data.programs].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all semesters for a program up to (and including) the given year/term.
 * Returns them in chronological order.
 */
export function getSemestersUpTo(
  slug: string,
  upToYear: number,
  upToTerm: 'first' | 'second' | 'summer'
): { year: number; term: 'first' | 'second' | 'summer'; courses: Course[] }[] {
  const program = getProgram(slug);
  if (!program) return [];

  const termOrder: Record<string, number> = { first: 0, second: 1, summer: 2 };
  const result: { year: number; term: 'first' | 'second' | 'summer'; courses: Course[] }[] = [];

  for (const yearLevel of program.curriculum) {
    if (yearLevel.year > upToYear) break;
    for (const sem of yearLevel.semesters) {
      if (
        yearLevel.year < upToYear ||
        termOrder[sem.term] <= termOrder[upToTerm]
      ) {
        result.push({
          year: yearLevel.year,
          term: sem.term,
          courses: sem.courses,
        });
      }
    }
  }

  return result;
}
