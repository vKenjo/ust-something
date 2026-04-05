/**
 * UST Curriculum Data Store
 * Barrel export for curriculum data types and utilities
 */

// Types
export type {
  Course,
  Semester,
  YearLevel,
  Program,
  ProgramEntry,
  CurriculaData,
  CollegeGroup,
  ClusterGroup,
} from './types';

// Helper functions
export {
  getClusters,
  getProgramsByCluster,
  getColleges,
  getProgramsByCollege,
  getProgram,
  getCoursesForSemester,
  getYearLevels,
  getMetadata,
  hasData,
} from './curricula';
