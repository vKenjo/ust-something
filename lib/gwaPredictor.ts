/**
 * GWA Prediction Engine
 * Algorithms for target GWA calculation and honors projection
 *
 * UST GWA Scale: 1.0 (best) to 5.0 (failed), passing is 3.0
 * GWA = Σ(grade × units) / Σ(units)
 */

import {
  HONORS_THRESHOLDS,
  HonorsLevel,
  HonorsProgram,
  UST_GRADING_SCALE,
} from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseGrade {
  code: string;
  grade: number;
  units: number;
  isLocked: boolean; // User has confirmed this grade
}

export interface PredictionResult {
  possible: boolean;
  requiredGrades: Map<string, number>; // courseCode -> required grade
  message: string;
  minPossibleGWA: number;
  maxPossibleGWA: number;
}

export interface SemesterProjection {
  semester: number;
  requiredGWA: number;
  requiredTotalUnits: number;
  cumulativeGWA: number;
}

export interface HonorsProjectionResult {
  achievable: boolean;
  targetHonors: HonorsLevel;
  semesterPlan: SemesterProjection[];
  message: string;
  bufferGWA: number; // How much room for error
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MIN_GRADE = UST_GRADING_SCALE.MIN; // 1.0 - best possible
const MAX_PASSING_GRADE = UST_GRADING_SCALE.PASSING; // 3.0 - lowest passing
const GRADE_STEP = UST_GRADING_SCALE.STEP; // 0.25 increments

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate GWA from course grades
 * Formula: Σ(grade × units) / Σ(units)
 */
export function calculateGWA(courses: CourseGrade[]): number | null {
  if (courses.length === 0) return null;

  let totalWeightedGrades = 0;
  let totalUnits = 0;

  for (const course of courses) {
    if (course.units > 0 && course.grade >= MIN_GRADE && course.grade <= 5.0) {
      totalWeightedGrades += course.grade * course.units;
      totalUnits += course.units;
    }
  }

  if (totalUnits === 0) return null;

  return Math.round((totalWeightedGrades / totalUnits) * 100) / 100;
}

/**
 * Get honors threshold range for a given honors level and program
 */
export function getHonorsThreshold(
  level: HonorsLevel,
  program: HonorsProgram = 'UNDERGRADUATE'
): { min: number; max: number; label: string } {
  const programThresholds = HONORS_THRESHOLDS[program];
  const threshold = programThresholds[level];

  return {
    min: threshold.min,
    max: threshold.max,
    label: threshold.label,
  };
}

/**
 * Check if a required grade is achievable (between 1.0 and 3.0)
 */
export function isAchievable(requiredGrade: number): boolean {
  return requiredGrade >= MIN_GRADE && requiredGrade <= MAX_PASSING_GRADE;
}

/**
 * Round grade to nearest UST grade step (0.25)
 */
export function roundToGradeStep(grade: number): number {
  const rounded = Math.round(grade / GRADE_STEP) * GRADE_STEP;
  // Clamp between min and max passing
  return Math.max(MIN_GRADE, Math.min(MAX_PASSING_GRADE, rounded));
}

/**
 * Calculate the required average grade for unlocked courses to achieve target GWA
 */
function calculateRequiredAverage(
  targetGWA: number,
  lockedContribution: number,
  lockedUnits: number,
  unlockedUnits: number
): number {
  // targetGWA = (lockedContribution + unlockedContribution) / totalUnits
  // targetGWA * totalUnits = lockedContribution + unlockedContribution
  // unlockedContribution = targetGWA * totalUnits - lockedContribution
  // requiredAverage = unlockedContribution / unlockedUnits

  const totalUnits = lockedUnits + unlockedUnits;
  const unlockedContribution = targetGWA * totalUnits - lockedContribution;
  return unlockedContribution / unlockedUnits;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Prediction Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate min/max possible GWA given locked grades
 */
export function calculateGWARange(courses: CourseGrade[]): {
  min: number;
  max: number;
} {
  const lockedCourses = courses.filter((c) => c.isLocked);
  const unlockedCourses = courses.filter((c) => !c.isLocked);

  // Calculate locked contribution
  const lockedContribution = lockedCourses.reduce(
    (sum, c) => sum + c.grade * c.units,
    0
  );
  const lockedUnits = lockedCourses.reduce((sum, c) => sum + c.units, 0);
  const unlockedUnits = unlockedCourses.reduce((sum, c) => sum + c.units, 0);
  const totalUnits = lockedUnits + unlockedUnits;

  if (totalUnits === 0) {
    return { min: MIN_GRADE, max: MAX_PASSING_GRADE };
  }

  // No unlocked courses - GWA is fixed
  if (unlockedUnits === 0) {
    const gwa = lockedContribution / lockedUnits;
    return { min: gwa, max: gwa };
  }

  // Max GWA: all unlocked get 1.0 (best)
  const maxContribution = lockedContribution + MIN_GRADE * unlockedUnits;
  const maxGWA = maxContribution / totalUnits;

  // Min GWA: all unlocked get 3.0 (lowest passing)
  const minContribution = lockedContribution + MAX_PASSING_GRADE * unlockedUnits;
  const minGWA = minContribution / totalUnits;

  return {
    min: Math.round(minGWA * 100) / 100,
    max: Math.round(maxGWA * 100) / 100,
  };
}

/**
 * Calculate required grades for unlocked courses to achieve target GWA
 */
export function predictRequiredGrades(
  targetGWA: number,
  courses: CourseGrade[]
): PredictionResult {
  const lockedCourses = courses.filter((c) => c.isLocked);
  const unlockedCourses = courses.filter((c) => !c.isLocked);

  // Calculate locked contribution
  const lockedContribution = lockedCourses.reduce(
    (sum, c) => sum + c.grade * c.units,
    0
  );
  const lockedUnits = lockedCourses.reduce((sum, c) => sum + c.units, 0);
  const unlockedUnits = unlockedCourses.reduce((sum, c) => sum + c.units, 0);
  const totalUnits = lockedUnits + unlockedUnits;

  // Calculate GWA range
  const gwaRange = calculateGWARange(courses);
  const requiredGrades = new Map<string, number>();

  // Edge case: no courses
  if (totalUnits === 0) {
    return {
      possible: false,
      requiredGrades,
      message: 'No courses provided for prediction.',
      minPossibleGWA: MIN_GRADE,
      maxPossibleGWA: MAX_PASSING_GRADE,
    };
  }

  // Edge case: no unlocked courses - just check if target is met
  if (unlockedUnits === 0) {
    const currentGWA = lockedContribution / lockedUnits;
    const isPossible = currentGWA <= targetGWA;
    return {
      possible: isPossible,
      requiredGrades,
      message: isPossible
        ? `Target GWA of ${targetGWA.toFixed(2)} is already achieved with current GWA of ${currentGWA.toFixed(2)}.`
        : `All grades are locked. Current GWA is ${currentGWA.toFixed(2)}, which is lower than target ${targetGWA.toFixed(2)}.`,
      minPossibleGWA: currentGWA,
      maxPossibleGWA: currentGWA,
    };
  }

  // Edge case: target already achieved even with worst grades
  if (gwaRange.min <= targetGWA) {
    // Target is guaranteed - assign comfortable grades
    const requiredAvg = calculateRequiredAverage(
      targetGWA,
      lockedContribution,
      lockedUnits,
      unlockedUnits
    );

    for (const course of unlockedCourses) {
      requiredGrades.set(course.code, roundToGradeStep(requiredAvg));
    }

    return {
      possible: true,
      requiredGrades,
      message: `Target GWA of ${targetGWA.toFixed(2)} is achievable. Average grade of ${roundToGradeStep(requiredAvg).toFixed(2)} needed for unlocked courses.`,
      minPossibleGWA: gwaRange.min,
      maxPossibleGWA: gwaRange.max,
    };
  }

  // Check if target is achievable
  if (gwaRange.max > targetGWA) {
    // Calculate how much better than 1.0 would be needed
    const impossibleAvg = calculateRequiredAverage(
      targetGWA,
      lockedContribution,
      lockedUnits,
      unlockedUnits
    );

    return {
      possible: false,
      requiredGrades,
      message: `Target GWA of ${targetGWA.toFixed(2)} is not achievable. Would require an average grade of ${impossibleAvg.toFixed(2)}, but the best possible grade is 1.0. Best achievable GWA is ${gwaRange.max.toFixed(2)}.`,
      minPossibleGWA: gwaRange.min,
      maxPossibleGWA: gwaRange.max,
    };
  }

  // Target is achievable - calculate required grades
  const requiredAvg = calculateRequiredAverage(
    targetGWA,
    lockedContribution,
    lockedUnits,
    unlockedUnits
  );

  // Distribute grades - start with equal distribution
  for (const course of unlockedCourses) {
    requiredGrades.set(course.code, roundToGradeStep(requiredAvg));
  }

  // Verify distribution achieves target (might need adjustment due to rounding)
  let distributedContribution = 0;
  for (const course of unlockedCourses) {
    distributedContribution +=
      (requiredGrades.get(course.code) || requiredAvg) * course.units;
  }
  const projectedGWA =
    (lockedContribution + distributedContribution) / totalUnits;

  // If rounding caused us to miss target, adjust grades
  if (projectedGWA > targetGWA) {
    // Need better grades - try to improve the highest-unit courses first
    const sortedUnlocked = [...unlockedCourses].sort(
      (a, b) => b.units - a.units
    );

    for (const course of sortedUnlocked) {
      const currentGrade = requiredGrades.get(course.code) || requiredAvg;
      const betterGrade = roundToGradeStep(currentGrade - GRADE_STEP);
      if (betterGrade >= MIN_GRADE) {
        requiredGrades.set(course.code, betterGrade);

        // Recalculate and check
        let newContribution = 0;
        for (const c of unlockedCourses) {
          newContribution +=
            (requiredGrades.get(c.code) || requiredAvg) * c.units;
        }
        const newGWA = (lockedContribution + newContribution) / totalUnits;
        if (newGWA <= targetGWA) break;
      }
    }
  }

  return {
    possible: true,
    requiredGrades,
    message: `Target GWA of ${targetGWA.toFixed(2)} is achievable. See required grades for each course.`,
    minPossibleGWA: gwaRange.min,
    maxPossibleGWA: gwaRange.max,
  };
}

/**
 * Project semester-by-semester requirements for target honors
 */
export function projectHonorsPath(
  currentCumulativeGWA: number,
  currentTotalUnits: number,
  targetHonors: HonorsLevel,
  remainingSemesters: number,
  avgUnitsPerSemester: number,
  program: HonorsProgram = 'UNDERGRADUATE'
): HonorsProjectionResult {
  const threshold = getHonorsThreshold(targetHonors, program);
  const targetGWA = threshold.max; // Use max to have some buffer

  // Calculate projected graduation units
  const remainingUnits = remainingSemesters * avgUnitsPerSemester;
  const totalUnitsAtGraduation = currentTotalUnits + remainingUnits;

  // Calculate current contribution
  const currentContribution = currentCumulativeGWA * currentTotalUnits;

  // Calculate required contribution from remaining semesters
  // targetGWA = (currentContribution + remainingContribution) / totalUnitsAtGraduation
  // remainingContribution = targetGWA * totalUnitsAtGraduation - currentContribution
  const requiredContribution =
    targetGWA * totalUnitsAtGraduation - currentContribution;
  const requiredAverageGWA = requiredContribution / remainingUnits;

  // Check achievability
  const achievable = isAchievable(requiredAverageGWA);

  // Create semester plan
  const semesterPlan: SemesterProjection[] = [];
  let runningTotalUnits = currentTotalUnits;
  let runningContribution = currentContribution;

  for (let i = 1; i <= remainingSemesters; i++) {
    runningTotalUnits += avgUnitsPerSemester;
    runningContribution += requiredAverageGWA * avgUnitsPerSemester;

    const cumulativeGWA = runningContribution / runningTotalUnits;

    semesterPlan.push({
      semester: i,
      requiredGWA: Math.round(requiredAverageGWA * 100) / 100,
      requiredTotalUnits: runningTotalUnits,
      cumulativeGWA: Math.round(cumulativeGWA * 100) / 100,
    });
  }

  // Calculate buffer (how much worse than required you can do)
  // Buffer = requiredAverageGWA - MIN_GRADE (lower is better in UST scale)
  const bufferGWA = achievable
    ? Math.round((requiredAverageGWA - MIN_GRADE) * 100) / 100
    : 0;

  // Generate message
  let message: string;
  if (!achievable) {
    if (requiredAverageGWA < MIN_GRADE) {
      message = `${threshold.label} is not achievable. Would require an average GWA of ${requiredAverageGWA.toFixed(2)} across remaining semesters, but the best possible grade is 1.0.`;
    } else {
      message = `${threshold.label} is not achievable. Would require an average GWA of ${requiredAverageGWA.toFixed(2)}, which exceeds the passing grade of 3.0.`;
    }
  } else if (requiredAverageGWA <= 1.5) {
    message = `${threshold.label} is achievable but challenging. You need an average GWA of ${requiredAverageGWA.toFixed(2)} per semester.`;
  } else if (requiredAverageGWA <= 2.0) {
    message = `${threshold.label} is achievable with good performance. Maintain an average GWA of ${requiredAverageGWA.toFixed(2)} per semester.`;
  } else {
    message = `${threshold.label} is comfortably achievable. An average GWA of ${requiredAverageGWA.toFixed(2)} per semester is sufficient.`;
  }

  return {
    achievable,
    targetHonors,
    semesterPlan,
    message,
    bufferGWA,
  };
}

/**
 * Suggest optimal grade distribution to hit target with minimum effort
 * Strategy: Keep grades achievable and balanced, prioritize high-unit courses
 */
export function suggestOptimalGrades(
  targetGWA: number,
  courses: CourseGrade[]
): Map<string, number> {
  const result = new Map<string, number>();
  const lockedCourses = courses.filter((c) => c.isLocked);
  const unlockedCourses = courses.filter((c) => !c.isLocked);

  // Calculate locked contribution
  const lockedContribution = lockedCourses.reduce(
    (sum, c) => sum + c.grade * c.units,
    0
  );
  const lockedUnits = lockedCourses.reduce((sum, c) => sum + c.units, 0);
  const unlockedUnits = unlockedCourses.reduce((sum, c) => sum + c.units, 0);
  const totalUnits = lockedUnits + unlockedUnits;

  // If no unlocked courses, return empty map
  if (unlockedUnits === 0) {
    return result;
  }

  // Calculate required average
  const requiredAvg = calculateRequiredAverage(
    targetGWA,
    lockedContribution,
    lockedUnits,
    unlockedUnits
  );

  // If not achievable, return the best we can do (all 1.0s)
  if (requiredAvg < MIN_GRADE) {
    for (const course of unlockedCourses) {
      result.set(course.code, MIN_GRADE);
    }
    return result;
  }

  // If easy target, aim for comfortable grades around 2.0-2.5
  if (requiredAvg >= 2.5) {
    for (const course of unlockedCourses) {
      result.set(course.code, roundToGradeStep(requiredAvg));
    }
    return result;
  }

  // Optimization strategy: distribute grades to minimize variance
  // Give high-unit courses the target, adjust lower-unit courses

  // Sort by units descending
  const sortedCourses = [...unlockedCourses].sort((a, b) => b.units - a.units);

  // Initial assignment: all get required average
  for (const course of sortedCourses) {
    result.set(course.code, roundToGradeStep(requiredAvg));
  }

  // Calculate current contribution
  let currentUnlockedContribution = 0;
  for (const course of unlockedCourses) {
    currentUnlockedContribution +=
      (result.get(course.code) || requiredAvg) * course.units;
  }

  const targetUnlockedContribution = targetGWA * totalUnits - lockedContribution;
  let deficit = currentUnlockedContribution - targetUnlockedContribution;

  // Adjust if rounding caused a deficit (we need better grades)
  if (deficit > 0.001) {
    // Need to improve some grades
    for (const course of sortedCourses) {
      if (deficit <= 0.001) break;

      const currentGrade = result.get(course.code) || requiredAvg;
      const improvement = Math.min(
        currentGrade - MIN_GRADE,
        deficit / course.units
      );
      const newGrade = roundToGradeStep(currentGrade - improvement);

      if (newGrade < currentGrade) {
        deficit -= (currentGrade - newGrade) * course.units;
        result.set(course.code, newGrade);
      }
    }
  }

  // If we have surplus (grades are better than needed), relax smaller courses
  if (deficit < -0.001) {
    const surplus = -deficit;
    // Start from smallest unit courses
    const reverseSorted = [...sortedCourses].reverse();

    let remainingSurplus = surplus;
    for (const course of reverseSorted) {
      if (remainingSurplus <= 0.001) break;

      const currentGrade = result.get(course.code) || requiredAvg;
      const relaxation = Math.min(
        MAX_PASSING_GRADE - currentGrade,
        remainingSurplus / course.units
      );
      const newGrade = roundToGradeStep(currentGrade + relaxation);

      if (newGrade > currentGrade && newGrade <= MAX_PASSING_GRADE) {
        remainingSurplus -= (newGrade - currentGrade) * course.units;
        result.set(course.code, newGrade);
      }
    }
  }

  return result;
}

/**
 * Determine which honors level is achievable given current standing
 */
export function getAchievableHonors(
  currentCumulativeGWA: number,
  currentTotalUnits: number,
  remainingSemesters: number,
  avgUnitsPerSemester: number,
  program: HonorsProgram = 'UNDERGRADUATE'
): {
  summa: HonorsProjectionResult;
  magna: HonorsProjectionResult;
  cum: HonorsProjectionResult;
  bestAchievable: HonorsLevel | null;
} {
  const summa = projectHonorsPath(
    currentCumulativeGWA,
    currentTotalUnits,
    'SUMMA_CUM_LAUDE',
    remainingSemesters,
    avgUnitsPerSemester,
    program
  );

  const magna = projectHonorsPath(
    currentCumulativeGWA,
    currentTotalUnits,
    'MAGNA_CUM_LAUDE',
    remainingSemesters,
    avgUnitsPerSemester,
    program
  );

  const cum = projectHonorsPath(
    currentCumulativeGWA,
    currentTotalUnits,
    'CUM_LAUDE',
    remainingSemesters,
    avgUnitsPerSemester,
    program
  );

  let bestAchievable: HonorsLevel | null = null;
  if (summa.achievable) {
    bestAchievable = 'SUMMA_CUM_LAUDE';
  } else if (magna.achievable) {
    bestAchievable = 'MAGNA_CUM_LAUDE';
  } else if (cum.achievable) {
    bestAchievable = 'CUM_LAUDE';
  }

  return {
    summa,
    magna,
    cum,
    bestAchievable,
  };
}

/**
 * Calculate what GWA is needed in remaining units to achieve target cumulative GWA
 */
export function calculateRequiredFutureGWA(
  currentCumulativeGWA: number,
  currentTotalUnits: number,
  targetCumulativeGWA: number,
  remainingUnits: number
): {
  requiredGWA: number;
  achievable: boolean;
  message: string;
} {
  // targetGWA = (currentContribution + futureContribution) / totalUnits
  // futureContribution = targetGWA * totalUnits - currentContribution
  // requiredFutureGWA = futureContribution / remainingUnits

  const currentContribution = currentCumulativeGWA * currentTotalUnits;
  const totalUnits = currentTotalUnits + remainingUnits;
  const requiredContribution =
    targetCumulativeGWA * totalUnits - currentContribution;
  const requiredGWA = requiredContribution / remainingUnits;

  const achievable = isAchievable(requiredGWA);

  let message: string;
  if (requiredGWA < MIN_GRADE) {
    message = `Impossible. Would require a GWA of ${requiredGWA.toFixed(2)}, but the best possible is 1.0.`;
  } else if (requiredGWA > MAX_PASSING_GRADE) {
    message = `Impossible. Would require a GWA of ${requiredGWA.toFixed(2)}, which is below passing (3.0).`;
  } else if (requiredGWA <= 1.25) {
    message = `Very challenging. You need a GWA of ${requiredGWA.toFixed(2)} (nearly perfect).`;
  } else if (requiredGWA <= 1.75) {
    message = `Challenging but achievable. Target GWA of ${requiredGWA.toFixed(2)} required.`;
  } else if (requiredGWA <= 2.25) {
    message = `Achievable with good performance. Target GWA of ${requiredGWA.toFixed(2)} required.`;
  } else {
    message = `Comfortably achievable. Only need a GWA of ${requiredGWA.toFixed(2)}.`;
  }

  return {
    requiredGWA: Math.round(requiredGWA * 100) / 100,
    achievable,
    message,
  };
}
