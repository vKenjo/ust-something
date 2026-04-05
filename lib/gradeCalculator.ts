import { GRADING_SYSTEMS, GradingSystemType, SpecialGrade, SPECIAL_GRADES, CourseType, COURSE_TYPES } from './constants';

/**
 * GWA Calculator Utilities
 * Functions for calculating grades based on different grading systems
 */

export interface GradeEntry {
  grade: number | SpecialGrade;
  lecUnits: number;
  labUnits: number;
  courseType?: CourseType;
  courseCode?: string;
  courseName?: string;
}

export interface GWABreakdown {
  gwa: number | null;
  academicCount: number;
  academicUnits: number;
  peNstpCount: number;
  peNstpUnits: number;
  specialGradeCount: number;
  totalCourses: number;
  hasFailures: boolean;
  hasIncomplete: boolean;
}

export interface AverageEntry {
  grade: number; // 0-100
  weight?: number; // Optional weighting
}

/**
 * Check if grade is a special grade (non-numeric)
 */
export function isSpecialGrade(grade: number | SpecialGrade): grade is SpecialGrade {
  return typeof grade === 'string' && Object.values(SPECIAL_GRADES).includes(grade as SpecialGrade);
}

/**
 * Check if a grade entry should be included in GWA calculation
 * Per UST policy: PE and NSTP are excluded from GWA
 */
export function shouldIncludeInGWA(entry: GradeEntry): boolean {
  // Exclude PE and NSTP courses
  if (entry.courseType === COURSE_TYPES.PE || entry.courseType === COURSE_TYPES.NSTP) {
    return false;
  }
  
  // Exclude special grades (INC, FA, WP, WF, INP)
  if (isSpecialGrade(entry.grade)) {
    return false;
  }
  
  // Exclude invalid numeric grades
  if (typeof entry.grade === 'number' && (entry.grade < 1.0 || entry.grade > 5.0)) {
    return false;
  }
  
  return true;
}

/**
 * Calculate GWA (General Weighted Average) for college/university
 * Formula: Σ(Grade × Units) / Σ(Units)
 * 
 * Per UST Policy: PE and NSTP courses are excluded from GWA calculation
 * 
 * @param grades Array of grade entries with units
 * @param excludeNonAcademic If true, exclude PE/NSTP (default: true per UST policy)
 * @returns GWA value (1.0-5.0) or null if no valid grades
 */
export function calculateGWA(grades: GradeEntry[], excludeNonAcademic: boolean = true): number | null {
  if (grades.length === 0) return null;

  let totalWeightedGrades = 0;
  let totalUnits = 0;

  for (const entry of grades) {
    // Skip if should be excluded
    if (excludeNonAcademic && !shouldIncludeInGWA(entry)) {
      continue;
    }
    
    // Only process numeric grades
    if (typeof entry.grade !== 'number') {
      continue;
    }

    const units = entry.lecUnits + entry.labUnits;
    if (units > 0 && entry.grade >= 1.0 && entry.grade <= 5.0) {
      totalWeightedGrades += entry.grade * units;
      totalUnits += units;
    }
  }

  if (totalUnits === 0) return null;

  const gwa = totalWeightedGrades / totalUnits;
  return Math.round(gwa * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate GWA with separate accounting for academic and non-academic courses
 * Returns both the official GWA (excluding PE/NSTP) and total units breakdown
 */
export function calculateGWAWithBreakdown(grades: GradeEntry[]): GWABreakdown {
  const academicGrades = grades.filter(shouldIncludeInGWA);
  const peNstpGrades = grades.filter(
    (g) => g.courseType === COURSE_TYPES.PE || g.courseType === COURSE_TYPES.NSTP
  );
  const specialGrades = grades.filter((g) => isSpecialGrade(g.grade));

  const gwa = calculateGWA(grades, true); // Exclude PE/NSTP
  
  const academicUnits = academicGrades.reduce((sum, g) => sum + g.lecUnits + g.labUnits, 0);
  const peNstpUnits = peNstpGrades.reduce((sum, g) => sum + g.lecUnits + g.labUnits, 0);
  
  return {
    gwa,
    academicCount: academicGrades.length,
    academicUnits,
    peNstpCount: peNstpGrades.length,
    peNstpUnits,
    specialGradeCount: specialGrades.length,
    totalCourses: grades.length,
    hasFailures: grades.some((g) => typeof g.grade === 'number' && g.grade === 5.0),
    hasIncomplete: grades.some((g) => g.grade === SPECIAL_GRADES.INC),
  };
}

/**
 * Calculate Average for SHS (0-100 scale)
 * Simple average of all grades
 * 
 * @param grades Array of grade entries
 * @returns Average value (0-100) or null if no valid grades
 */
export function calculateAverage(grades: AverageEntry[]): number | null {
  if (grades.length === 0) return null;

  const validGrades = grades.filter((g) => g.grade >= 0 && g.grade <= 100);
  if (validGrades.length === 0) return null;

  const sum = validGrades.reduce((acc, g) => acc + g.grade, 0);
  const average = sum / validGrades.length;
  
  return Math.round(average * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate grade based on grading system type
 */
export function calculateGrade(
  grades: Array<{ grade: number; lecUnits?: number; labUnits?: number; weight?: number }>,
  gradingSystem: GradingSystemType
): number | null {
  if (grades.length === 0) return null;

  switch (gradingSystem) {
    case 'GWA':
      return calculateGWA(
        grades.map((g) => ({
          grade: g.grade,
          lecUnits: g.lecUnits || 0,
          labUnits: g.labUnits || 0,
        }))
      );
    
    case 'MEDICINE':
    case 'LAW':
      // Medicine and Law use same weighted calculation as GWA
      // but with different passing thresholds and scales
      return calculateGWA(
        grades.map((g) => ({
          grade: g.grade,
          lecUnits: g.lecUnits || 0,
          labUnits: g.labUnits || 0,
        }))
      );
    
    case 'AVERAGE':
      return calculateAverage(
        grades.map((g) => ({
          grade: g.grade,
          weight: g.weight,
        }))
      );
    
    default:
      return null;
  }
}
/**
 * Validate grade based on grading system
 */
export function isValidGrade(grade: number, gradingSystem: GradingSystemType): boolean {
  const system = GRADING_SYSTEMS[gradingSystem];
  return grade >= system.min && grade <= system.max;
}

/**
 * Check if grade is passing
 */
export function isPassing(grade: number, gradingSystem: GradingSystemType): boolean {
  const system = GRADING_SYSTEMS[gradingSystem];
  
  if (gradingSystem === 'AVERAGE') {
    // In average, higher is better
    return grade >= system.passing;
  } else {
    // In GWA/Medicine/Law, lower is better (1.0 is highest)
    return grade <= system.passing;
  }
}

/**
 * Get grade description/label
 */
export function getGradeLabel(grade: number, gradingSystem: GradingSystemType): string {
  if (gradingSystem === 'AVERAGE') {
    if (grade >= 98) return 'Outstanding';
    if (grade >= 95) return 'Outstanding';
    if (grade >= 92) return 'Very Satisfactory';
    if (grade >= 89) return 'Very Satisfactory';
    if (grade >= 86) return 'Satisfactory';
    if (grade >= 83) return 'Satisfactory';
    if (grade >= 80) return 'Fairly Satisfactory';
    if (grade >= 77) return 'Fairly Satisfactory';
    if (grade >= 75) return 'Passing';
    return 'Failed';
  } else if (gradingSystem === 'MEDICINE' || gradingSystem === 'LAW') {
    if (grade <= 1.0) return 'Excellent';
    if (grade <= 1.5) return 'Very Good';
    if (grade <= 2.0) return 'Good';
    if (grade <= 2.5) return 'Passing';
    return 'Failed';
  } else {
    // Standard GWA - updated labels per UST policy
    if (grade === 1.0) return 'Excellent';
    if (grade <= 1.25) return 'Very Good';
    if (grade <= 1.75) return 'Good';
    if (grade <= 2.5) return 'Fair';
    if (grade <= 3.0) return 'Passed';
    return 'Failed';
  }
}

/**
 * Format grade for display
 */
export function formatGrade(grade: number, gradingSystem: GradingSystemType): string {
  if (gradingSystem === 'AVERAGE') {
    return Math.round(grade).toString();
  } else {
    return grade.toFixed(2);
  }
}
