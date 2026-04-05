import { HONORS_THRESHOLDS, HonorsProgram, HonorsLevel, SPECIAL_GRADES } from './constants';
import { GradeEntry } from './gradeCalculator';

/**
 * Academic Honors Calculator
 * Per UST Student Handbook - Academic Honors Policy
 */

export interface HonorsResult {
  eligible: boolean;
  level: HonorsLevel | null;
  gwa: number | null;
  disqualifyingReasons: string[];
}

/**
 * Determine honors level based on GWA and program type
 * 
 * @param gwa General Weighted Average (1.0-5.0 or percentage for Medicine)
 * @param program Program type (UNDERGRADUATE, LAW, MEDICINE, GRADUATE)
 * @returns Honors level or null if not eligible
 */
export function getHonorsLevel(gwa: number, program: HonorsProgram): HonorsLevel | null {
  if (gwa === null || gwa === undefined) return null;
  
  const thresholds = HONORS_THRESHOLDS[program];
  
  // Check from highest to lowest honor
  if (gwa >= thresholds.SUMMA_CUM_LAUDE.min && gwa <= thresholds.SUMMA_CUM_LAUDE.max) {
    return 'SUMMA_CUM_LAUDE';
  }
  
  if (gwa >= thresholds.MAGNA_CUM_LAUDE.min && gwa <= thresholds.MAGNA_CUM_LAUDE.max) {
    return 'MAGNA_CUM_LAUDE';
  }
  
  if (gwa >= thresholds.CUM_LAUDE.min && gwa <= thresholds.CUM_LAUDE.max) {
    return 'CUM_LAUDE';
  }
  
  return null;
}

/**
 * Get honors threshold for a specific program and level
 */
export function getHonorsThreshold(program: HonorsProgram, level: HonorsLevel) {
  return HONORS_THRESHOLDS[program][level];
}

/**
 * Calculate honors eligibility with basic checks
 * 
 * Per UST Policy (Basic Implementation):
 * - Must have qualifying GWA within honors range
 * - Must have no failing grades (5.0)
 * - Must have no unremoved Incomplete (INC) grades in any course (including PE/NSTP)
 * 
 * Advanced checks (deferred to future version):
 * - 6 consecutive terms residence requirement
 * - 76% of units completed at UST
 * - 75% regular load per term
 * - No major/grave offenses
 * 
 * @param gwa General Weighted Average
 * @param allGrades All grade entries (including PE/NSTP)
 * @param program Program type
 * @returns Honors result with eligibility and disqualifying reasons
 */
export function calculateHonorsEligibility(
  gwa: number | null,
  allGrades: GradeEntry[],
  program: HonorsProgram
): HonorsResult {
  const disqualifyingReasons: string[] = [];
  
  // Check GWA validity
  if (gwa === null || gwa === undefined) {
    disqualifyingReasons.push('No valid GWA calculated');
    return {
      eligible: false,
      level: null,
      gwa,
      disqualifyingReasons,
    };
  }
  
  // Determine honors level based on GWA
  const level = getHonorsLevel(gwa, program);
  
  if (!level) {
    disqualifyingReasons.push('GWA does not meet minimum honors threshold');
  }
  
  // Check for failing grades (including in PE/NSTP)
  const failingGrades = allGrades.filter(
    (g) => typeof g.grade === 'number' && g.grade === 5.0
  );
  
  if (failingGrades.length > 0) {
    disqualifyingReasons.push(
      `Has ${failingGrades.length} failing grade(s) - not eligible for honors`
    );
  }
  
  // Check for incomplete grades (INC) in ANY course including PE/NSTP
  const incompleteGrades = allGrades.filter((g) => g.grade === SPECIAL_GRADES.INC);
  
  if (incompleteGrades.length > 0) {
    disqualifyingReasons.push(
      `Has ${incompleteGrades.length} unremoved Incomplete (INC) grade(s) - not eligible for honors`
    );
  }
  
  // Check for FA (Failure due to Absences)
  const absenceFailures = allGrades.filter((g) => g.grade === SPECIAL_GRADES.FA);
  
  if (absenceFailures.length > 0) {
    disqualifyingReasons.push(
      `Has ${absenceFailures.length} Failure due to Absences (FA) - not eligible for honors`
    );
  }
  
  const eligible = disqualifyingReasons.length === 0 && level !== null;
  
  return {
    eligible,
    level: eligible ? level : null,
    gwa,
    disqualifyingReasons,
  };
}

/**
 * Format honors level for display
 */
export function formatHonorsLevel(level: HonorsLevel): string {
  switch (level) {
    case 'SUMMA_CUM_LAUDE':
      return 'Summa Cum Laude';
    case 'MAGNA_CUM_LAUDE':
      return 'Magna Cum Laude';
    case 'CUM_LAUDE':
      return 'Cum Laude';
    default:
      return '';
  }
}

/**
 * Get distance to next honors level
 * Useful for showing students how close they are to the next tier
 */
export function getDistanceToNextLevel(gwa: number, program: HonorsProgram): {
  currentLevel: HonorsLevel | null;
  nextLevel: HonorsLevel | null;
  pointsNeeded: number | null;
} {
  const currentLevel = getHonorsLevel(gwa, program);
  
  if (!currentLevel) {
    // Not currently at honors level, check distance to Cum Laude
    const cumLaudeMax = HONORS_THRESHOLDS[program].CUM_LAUDE.max;
    if (gwa <= cumLaudeMax + 0.5) { // Only show if within reasonable range
      return {
        currentLevel: null,
        nextLevel: 'CUM_LAUDE',
        pointsNeeded: Math.abs(gwa - cumLaudeMax),
      };
    }
    return {
      currentLevel: null,
      nextLevel: null,
      pointsNeeded: null,
    };
  }
  
  // Already at honors level, check next tier
  if (currentLevel === 'CUM_LAUDE') {
    const magnaMax = HONORS_THRESHOLDS[program].MAGNA_CUM_LAUDE.max;
    return {
      currentLevel,
      nextLevel: 'MAGNA_CUM_LAUDE',
      pointsNeeded: Math.abs(gwa - magnaMax),
    };
  }
  
  if (currentLevel === 'MAGNA_CUM_LAUDE') {
    const summaMax = HONORS_THRESHOLDS[program].SUMMA_CUM_LAUDE.max;
    return {
      currentLevel,
      nextLevel: 'SUMMA_CUM_LAUDE',
      pointsNeeded: Math.abs(gwa - summaMax),
    };
  }
  
  // Already at highest level
  return {
    currentLevel,
    nextLevel: null,
    pointsNeeded: null,
  };
}

/**
 * Format honors result for display
 */
export function formatHonorsResult(result: HonorsResult, program: HonorsProgram): string {
  if (!result.eligible) {
    return `Not eligible for honors: ${result.disqualifyingReasons.join(', ')}`;
  }
  
  if (result.level) {
    const formattedLevel = formatHonorsLevel(result.level);
    const threshold = HONORS_THRESHOLDS[program][result.level];
    return `${formattedLevel} (GWA: ${result.gwa?.toFixed(3)}, Range: ${threshold.min}-${threshold.max})`;
  }
  
  return 'Not eligible for honors';
}
