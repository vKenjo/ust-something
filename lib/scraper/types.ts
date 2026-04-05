/**
 * UST Curriculum Scraper Types
 * Types for representing program curriculum data scraped from ust.edu.ph
 */

export interface Course {
  code: string;           // e.g., "ICS 2601"
  name: string;           // e.g., "Introduction to Computing"
  lecUnits: number;       // Lecture hours/units
  labUnits: number;       // Lab hours/units
  totalUnits: number;     // Total units
  prerequisites: string[]; // Array of prerequisite course codes
  courseType: 'academic' | 'pe' | 'nstp'; // For GWA calculation
}

export interface Semester {
  term: 'first' | 'second' | 'summer';
  courses: Course[];
}

export interface YearLevel {
  year: 1 | 2 | 3 | 4 | 5;
  semesters: Semester[];
}

export interface Program {
  name: string;
  slug: string;
  college: string;
  url: string;
  curriculum: YearLevel[];
}

/** Raw table row parsed from HTML before processing */
export interface RawCourseRow {
  abbreviation: string;
  description: string;
  lecHrs: string;
  labHrs: string;
  units: string;
  prerequisites: string;
}
