/**
 * UST Curriculum Scraper - Barrel Export
 */

// Types
export type {
  Course,
  Semester,
  YearLevel,
  Program,
  RawCourseRow,
} from './types';

// Functions
export {
  fetchProgramPage,
  parseCurriculum,
  parseCurriculumFromText,
  detectCourseType,
  isPracticumCourse,
  scrapeProgramCurriculum,
} from './ustCurriculumScraper';
