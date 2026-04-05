/**
 * UST Curriculum Data Store
 * Helper functions for working with scraped curriculum data
 */

import type { Course, CurriculaData, ProgramEntry } from './types';
import curriculaJson from './ust-curricula.json';
import {
  UST_COLLEGES,
  resolveCollege,
  type CollegeInfo,
} from '../collegeMapping';

const data = curriculaJson as CurriculaData;

// ─── Data quality helpers ──────────────────────────────────────────────────
// The scraper has a bug where many programs duplicate courses across semesters.
// For example, Year 1 "first" semester might contain ALL courses from the entire
// program (50-130 entries), repeated identically across every year. We detect
// and fix this at the data-access layer.

const MAX_REASONABLE_COURSES_PER_SEMESTER = 15;

/**
 * Check if a program has broken/duplicated semester data.
 * Returns true when any single semester has an unreasonable number of courses.
 */
export function isProgramDataClean(slug: string): boolean {
  const program = getProgram(slug);
  if (!program) return true;
  for (const yl of program.curriculum) {
    for (const sem of yl.semesters) {
      if (sem.courses.length > MAX_REASONABLE_COURSES_PER_SEMESTER) return false;
    }
  }
  return true;
}

/**
 * Get all unique courses for a program (deduplicated by course code).
 * Useful when per-semester data is unreliable.
 */
export function getAllUniqueCourses(slug: string): Course[] {
  const program = getProgram(slug);
  if (!program) return [];
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
    const key = resolveCollege(p.name);
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
  return data.programs.filter((p) => {
    const key = resolveCollege(p.name);
    const info = UST_COLLEGES[key];
    return (
      info &&
      (info.name === college ||
        info.shortName === college ||
        p.college === college)
    );
  });
}

/**
 * Get a specific program by its slug
 */
export function getProgram(slug: string): ProgramEntry | undefined {
  return data.programs.find((p) => p.slug === slug);
}

/**
 * Get courses for a specific year and semester of a program.
 * For programs with broken data, returns all unique courses (flat list).
 */
export function getCoursesForSemester(
  slug: string,
  year: number,
  term: 'first' | 'second' | 'summer'
): Course[] {
  const program = getProgram(slug);
  if (!program) return [];

  // If the data is broken, return the deduplicated course list
  if (!isProgramDataClean(slug)) {
    return getAllUniqueCourses(slug);
  }

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
 * Get all programs, optionally sorted by name
 */
export function getAllPrograms(): ProgramEntry[] {
  return [...data.programs].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get all semesters for a program up to (and including) the given year/term.
 * Returns them in chronological order.
 *
 * For programs with broken scraper data (duplicated courses across semesters),
 * returns a single entry with all unique courses.
 */
export function getSemestersUpTo(
  slug: string,
  upToYear: number,
  upToTerm: 'first' | 'second' | 'summer'
): { year: number; term: 'first' | 'second' | 'summer'; courses: Course[]; dataIsBroken?: boolean }[] {
  const program = getProgram(slug);
  if (!program) return [];

  // For programs with broken data, return a single flat block
  if (!isProgramDataClean(slug)) {
    return [{
      year: 0, // signals "all"
      term: 'first',
      courses: getAllUniqueCourses(slug),
      dataIsBroken: true,
    }];
  }

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
