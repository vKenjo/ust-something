import { DEANS_LIST, SPECIAL_GRADES } from './constants';
import { GradeEntry, calculateGWA } from './gradeCalculator';

/**
 * Dean's List Calculator
 * Per UST Student Handbook - Dean's List Policy (PPS NO. 1024b)
 */

export interface DeansListResult {
  eligible: boolean;
  termGWA: number | null;
  disqualifyingReasons: string[];
}

export interface TermGrades {
  grades: GradeEntry[];
  isFullLoad: boolean;
}

/**
 * Check Dean's List eligibility for a term
 * 
 * Requirements per UST Policy:
 * 1. GWA of at least 1.750 in the immediately preceding term
 * 2. Must be a regular student (full load)
 * 3. No failures incurred (including PE and NSTP)
 * 4. No incomplete grades (including PE and NSTP)
 * 
 * @param termData Term grade data with full load status
 * @returns Dean's List eligibility result
 */
export function checkDeansListEligibility(termData: TermGrades): DeansListResult {
  const disqualifyingReasons: string[] = [];
  
  // Calculate term GWA
  const termGWA = calculateGWA(termData.grades, true); // Exclude PE/NSTP from GWA
  
  // Check 1: GWA requirement
  if (termGWA === null) {
    disqualifyingReasons.push('No valid GWA for the term');
  } else if (termGWA > DEANS_LIST.MIN_GWA) {
    disqualifyingReasons.push(
      `GWA of ${termGWA.toFixed(3)} does not meet minimum requirement of ${DEANS_LIST.MIN_GWA}`
    );
  }
  
  // Check 2: Full load requirement
  if (DEANS_LIST.REQUIRES_FULL_LOAD && !termData.isFullLoad) {
    disqualifyingReasons.push('Not enrolled in full load (regular student requirement)');
  }
  
  // Check 3: No failures (including PE and NSTP per policy)
  if (DEANS_LIST.NO_FAILURES_ALLOWED) {
    const failures = termData.grades.filter((g) => {
      return (typeof g.grade === 'number' && g.grade === 5.0) || g.grade === SPECIAL_GRADES.FA;
    });
    
    if (failures.length > 0) {
      const failedCourses = failures
        .map((f) => f.courseCode || f.courseName || 'Unknown')
        .join(', ');
      disqualifyingReasons.push(
        `Has ${failures.length} failure(s) in: ${failedCourses} (including PE/NSTP)`
      );
    }
  }
  
  // Check 4: No incomplete grades (including PE and NSTP per policy)
  if (DEANS_LIST.NO_INCOMPLETE_ALLOWED) {
    const incompletes = termData.grades.filter((g) => g.grade === SPECIAL_GRADES.INC);
    
    if (incompletes.length > 0) {
      const incompleteCourses = incompletes
        .map((f) => f.courseCode || f.courseName || 'Unknown')
        .join(', ');
      disqualifyingReasons.push(
        `Has ${incompletes.length} Incomplete (INC) grade(s) in: ${incompleteCourses} (including PE/NSTP)`
      );
    }
  }
  
  const eligible = disqualifyingReasons.length === 0;
  
  return {
    eligible,
    termGWA,
    disqualifyingReasons,
  };
}

/**
 * Get term GWA (convenience function)
 * Excludes PE/NSTP per UST policy
 */
export function getTermGWA(grades: GradeEntry[]): number | null {
  return calculateGWA(grades, true);
}

/**
 * Check if student is enrolled in full load
 * 
 * Note: This is a simplified check. Full implementation would need:
 * - Curriculum requirements for each year level
 * - Justifiable causes for lighter load (determined by Dean)
 * - Transferee/shifter classification logic
 * 
 * For MVP, this is passed as a parameter (manual input)
 * 
 * @param enrolledUnits Units enrolled in the term
 * @param expectedUnits Expected units for year level (from curriculum)
 * @returns True if enrolled units meet or exceed expected
 */
export function isFullLoad(enrolledUnits: number, expectedUnits: number): boolean {
  // A student taking all courses scheduled for their section is considered full load
  return enrolledUnits >= expectedUnits;
}

/**
 * Format Dean's List result for display
 */
export function formatDeansListResult(result: DeansListResult): string {
  if (result.eligible) {
    return `Eligible for Dean's List (Term GWA: ${result.termGWA?.toFixed(3)})`;
  }
  
  return `Not eligible for Dean's List: ${result.disqualifyingReasons.join('; ')}`;
}

/**
 * Calculate Dean's List eligibility for multiple terms
 * Returns term-by-term breakdown
 */
export function checkMultipleTerms(terms: TermGrades[]): {
  termResults: DeansListResult[];
  totalEligibleTerms: number;
  consecutiveEligibleTerms: number;
} {
  const termResults = terms.map((term) => checkDeansListEligibility(term));
  
  const totalEligibleTerms = termResults.filter((r) => r.eligible).length;
  
  // Calculate consecutive eligible terms (from most recent)
  let consecutiveEligibleTerms = 0;
  for (let i = termResults.length - 1; i >= 0; i--) {
    if (termResults[i].eligible) {
      consecutiveEligibleTerms++;
    } else {
      break;
    }
  }
  
  return {
    termResults,
    totalEligibleTerms,
    consecutiveEligibleTerms,
  };
}
