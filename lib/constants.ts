/**
 * UST Kit Constants
 * Design system and app-wide constants
 */

export const COLORS = {
  UST_YELLOW: '#FDB813',
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  CREAM: '#FFFDF7',
  LIGHT_GRAY: '#E5E5E5',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
} as const;

export const SEMESTER_PERIODS = {
  FIRST: {
    name: 'First Semester',
    code: 1,
    startMonth: 8, // August
    endMonth: 12, // December
  },
  SECOND: {
    name: 'Second Semester',
    code: 2,
    startMonth: 1, // January
    endMonth: 5, // May
  },
  SUMMER: {
    name: 'Summer Term',
    code: 3,
    startMonth: 6, // June
    endMonth: 7, // July
  },
} as const;

export const GRADING_SYSTEMS = {
  GWA: {
    type: 'gwa',
    name: 'GWA (1.0-5.0)',
    min: 1.0,
    max: 5.0,
    passing: 3.0,
    step: 0.25,
    description: 'General Weighted Average - standard UST college system',
    scale: [
      { grade: 1.0, label: 'Excellent', equivalent: '96-100%' },
      { grade: 1.25, label: 'Very Good', equivalent: '94-95%' },
      { grade: 1.5, label: 'Very Good', equivalent: '92-93%' },
      { grade: 1.75, label: 'Good', equivalent: '89-91%' },
      { grade: 2.0, label: 'Good', equivalent: '87-88%' },
      { grade: 2.25, label: 'Good', equivalent: '84-86%' },
      { grade: 2.5, label: 'Fair', equivalent: '82-83%' },
      { grade: 2.75, label: 'Fair', equivalent: '79-81%' },
      { grade: 3.0, label: 'Passed', equivalent: '75-78%' },
      { grade: 5.0, label: 'Failed', equivalent: 'Below 75%' },
    ],
  },
  AVERAGE: {
    type: 'average',
    name: 'Average (0-100)',
    min: 0,
    max: 100,
    passing: 75,
    step: 1,
    description: 'Average-based grading for Senior High School',
    scale: [
      { grade: 98, label: 'Outstanding', range: '98-100' },
      { grade: 95, label: 'Outstanding', range: '95-97' },
      { grade: 92, label: 'Very Satisfactory', range: '92-94' },
      { grade: 89, label: 'Very Satisfactory', range: '89-91' },
      { grade: 86, label: 'Satisfactory', range: '86-88' },
      { grade: 83, label: 'Satisfactory', range: '83-85' },
      { grade: 80, label: 'Fairly Satisfactory', range: '80-82' },
      { grade: 77, label: 'Fairly Satisfactory', range: '77-79' },
      { grade: 75, label: 'Passing', range: '75-76' },
      { grade: 0, label: 'Failed', range: 'Below 75' },
    ],
  },
  MEDICINE: {
    type: 'medicine',
    name: 'Medical (1.0-5.0)',
    min: 1.0,
    max: 5.0,
    passing: 2.5, // Medical schools often have stricter passing (75% = 2.5)
    step: 0.1, // Finer gradations
    description: 'Medical grading system with stricter passing grade',
    scale: [
      { grade: 1.0, label: 'Excellent', equivalent: '95-100%' },
      { grade: 1.5, label: 'Very Good', equivalent: '90-94%' },
      { grade: 2.0, label: 'Good', equivalent: '85-89%' },
      { grade: 2.5, label: 'Passing', equivalent: '75-84%' },
      { grade: 5.0, label: 'Failed', equivalent: 'Below 75%' },
    ],
  },
  LAW: {
    type: 'law',
    name: 'Law (1.0-5.0)',
    min: 1.0,
    max: 5.0,
    passing: 2.5, // Law schools typically have 75% = 2.5 as passing
    step: 0.1,
    description: 'Law grading system with strict passing requirements',
    scale: [
      { grade: 1.0, label: 'Excellent', equivalent: '95-100%' },
      { grade: 1.5, label: 'Very Good', equivalent: '90-94%' },
      { grade: 2.0, label: 'Good', equivalent: '85-89%' },
      { grade: 2.5, label: 'Passing', equivalent: '75-84%' },
      { grade: 5.0, label: 'Failed', equivalent: 'Below 75%' },
    ],
  },
} as const;

export type GradingSystemType = keyof typeof GRADING_SYSTEMS;

export const UST_GRADING_SCALE = {
  MIN: 1.0,
  MAX: 5.0,
  PASSING: 3.0,
  STEP: 0.25, // Grades in increments of 0.25
} as const;

export const CREDITS = {
  DEVELOPER: 'Kenjo',
  UNIVERSITY: 'University of Santo Tomas',
  APP_NAME: 'UST Kit',
} as const;

export const DAYS_OF_WEEK = ['M', 'T', 'W', 'Th', 'F', 'S'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const COLLEGE_CATEGORIES = {
  COLLEGE: 'college',
  FACULTY: 'faculty',
  GRADUATE: 'graduate',
  CONSERVATORY: 'conservatory',
  INSTITUTE: 'institute',
  ECCLESIASTICAL: 'ecclesiastical',
  BASIC_EDUCATION: 'basic_education',
} as const;

export type CollegeCategory = (typeof COLLEGE_CATEGORIES)[keyof typeof COLLEGE_CATEGORIES];

/**
 * Special grade types per UST policy
 */
export const SPECIAL_GRADES = {
  INC: 'INC', // Incomplete
  INP: 'INP', // In Progress
  FA: 'FA',   // Failure due to Absences
  WP: 'WP',   // Withdrew with Permission
  WF: 'WF',   // Withdrew without Permission
} as const;

export type SpecialGrade = (typeof SPECIAL_GRADES)[keyof typeof SPECIAL_GRADES];

/**
 * Course types for GWA calculation
 */
export const COURSE_TYPES = {
  ACADEMIC: 'academic',     // Regular academic courses (included in GWA)
  PE: 'pe',                 // Physical Education (excluded from GWA)
  NSTP: 'nstp',            // National Service Training Program (excluded from GWA)
  THEOLOGY: 'theology',     // Theology courses (included in GWA per policy)
} as const;

export type CourseType = (typeof COURSE_TYPES)[keyof typeof COURSE_TYPES];

/**
 * Academic honors thresholds per UST Student Handbook
 */
export const HONORS_THRESHOLDS = {
  UNDERGRADUATE: {
    name: 'Baccalaureate Programs',
    usesGWAScale: true,
    CUM_LAUDE: { min: 1.451, max: 1.750, label: 'Cum Laude' },
    MAGNA_CUM_LAUDE: { min: 1.201, max: 1.450, label: 'Magna Cum Laude' },
    SUMMA_CUM_LAUDE: { min: 1.000, max: 1.200, label: 'Summa Cum Laude' },
  },
  LAW: {
    name: 'Faculty of Civil Law',
    usesGWAScale: true,
    CUM_LAUDE: { min: 1.860, max: 2.100, label: 'Cum Laude', percentEquivalent: '86-88.4%' },
    MAGNA_CUM_LAUDE: { min: 1.510, max: 1.859, label: 'Magna Cum Laude', percentEquivalent: '88.5-91.9%' },
    SUMMA_CUM_LAUDE: { min: 1.000, max: 1.509, label: 'Summa Cum Laude', percentEquivalent: '92% and above' },
  },
  MEDICINE: {
    name: 'Faculty of Medicine & Surgery',
    usesGWAScale: false, // Uses percentage scale
    CUM_LAUDE: { min: 88.00, max: 90.99, label: 'Cum Laude' },
    MAGNA_CUM_LAUDE: { min: 91.00, max: 93.99, label: 'Magna Cum Laude' },
    SUMMA_CUM_LAUDE: { min: 94.00, max: 100.00, label: 'Summa Cum Laude' },
    note: 'Final grade = 80% GPA (Years 1-3) + 20% Oral Revalida. MVP uses GPA thresholds only.',
  },
  GRADUATE: {
    name: 'Graduate Programs',
    usesGWAScale: true,
    CUM_LAUDE: { min: 1.155, max: 1.254, label: 'Cum Laude' },
    MAGNA_CUM_LAUDE: { min: 1.055, max: 1.154, label: 'Magna Cum Laude' },
    SUMMA_CUM_LAUDE: { min: 1.000, max: 1.054, label: 'Summa Cum Laude' },
  },
} as const;

export type HonorsProgram = keyof typeof HONORS_THRESHOLDS;
export type HonorsLevel = 'CUM_LAUDE' | 'MAGNA_CUM_LAUDE' | 'SUMMA_CUM_LAUDE';

/**
 * Dean's List requirements per UST policy
 */
export const DEANS_LIST = {
  MIN_GWA: 1.750,
  REQUIRES_FULL_LOAD: true,
  NO_FAILURES_ALLOWED: true,
  NO_INCOMPLETE_ALLOWED: true,
  INCLUDES_PE_NSTP: true, // PE/NSTP failures/INC disqualify from Dean's List
} as const;

