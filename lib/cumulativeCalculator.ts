/**
 * Cumulative GWA Calculator
 * Track GWA across multiple semesters with running totals.
 */

import { GradeEntry, calculateGWAWithBreakdown, type GWABreakdown } from './gradeCalculator';

export interface SemesterRecord {
  id: string;
  year: number;
  term: 'first' | 'second' | 'summer';
  grades: GradeEntry[];
  breakdown: GWABreakdown;
}

export interface CumulativeResult {
  semesters: SemesterRecord[];
  cumulativeGWA: number | null;
  totalAcademicUnits: number;
  totalAcademicCourses: number;
  totalPeNstpUnits: number;
  hasFailures: boolean;
  hasIncomplete: boolean;
}

/**
 * Calculate cumulative GWA from multiple semester records.
 */
export function calculateCumulativeGWA(
  semesters: SemesterRecord[]
): CumulativeResult {
  let totalWeightedGrades = 0;
  let totalAcademicUnits = 0;
  let totalAcademicCourses = 0;
  let totalPeNstpUnits = 0;
  let hasFailures = false;
  let hasIncomplete = false;

  for (const sem of semesters) {
    const breakdown = sem.breakdown;
    if (breakdown.gwa !== null) {
      totalWeightedGrades += breakdown.gwa * breakdown.academicUnits;
      totalAcademicUnits += breakdown.academicUnits;
    }
    totalAcademicCourses += breakdown.academicCount;
    totalPeNstpUnits += breakdown.peNstpUnits;
    if (breakdown.hasFailures) hasFailures = true;
    if (breakdown.hasIncomplete) hasIncomplete = true;
  }

  const cumulativeGWA =
    totalAcademicUnits > 0
      ? Math.round((totalWeightedGrades / totalAcademicUnits) * 1000) / 1000
      : null;

  return {
    semesters,
    cumulativeGWA,
    totalAcademicUnits,
    totalAcademicCourses,
    totalPeNstpUnits,
    hasFailures,
    hasIncomplete,
  };
}

/**
 * Create a new semester record from grade entries.
 */
export function createSemesterRecord(
  year: number,
  term: 'first' | 'second' | 'summer',
  grades: GradeEntry[]
): SemesterRecord {
  return {
    id: `${year}-${term}`,
    year,
    term,
    grades,
    breakdown: calculateGWAWithBreakdown(grades),
  };
}

/**
 * Calculate cumulative GWA from manual input
 * (when user already knows their previous cumulative GWA and units).
 */
export function calculateCumulativeFromManual(
  previousGWA: number,
  previousUnits: number,
  currentSemesterGrades: GradeEntry[]
): {
  cumulativeGWA: number | null;
  currentSemesterGWA: number | null;
  totalUnits: number;
} {
  const currentBreakdown = calculateGWAWithBreakdown(currentSemesterGrades);

  if (currentBreakdown.gwa === null) {
    return {
      cumulativeGWA: previousUnits > 0 ? previousGWA : null,
      currentSemesterGWA: null,
      totalUnits: previousUnits,
    };
  }

  const previousContribution = previousGWA * previousUnits;
  const currentContribution =
    currentBreakdown.gwa * currentBreakdown.academicUnits;
  const totalUnits = previousUnits + currentBreakdown.academicUnits;

  const cumulativeGWA =
    totalUnits > 0
      ? Math.round(
          ((previousContribution + currentContribution) / totalUnits) * 1000
        ) / 1000
      : null;

  return {
    cumulativeGWA,
    currentSemesterGWA: currentBreakdown.gwa,
    totalUnits,
  };
}

/**
 * Format a semester label for display.
 */
export function formatSemesterLabel(
  year: number,
  term: 'first' | 'second' | 'summer'
): string {
  const termNames = {
    first: '1st Semester',
    second: '2nd Semester',
    summer: 'Summer',
  };
  return `Year ${year} - ${termNames[term]}`;
}
