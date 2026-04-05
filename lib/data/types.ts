/**
 * UST Curriculum Data Store Types
 * Types for working with scraped curriculum data
 */

// Re-export from scraper types
export type { Course, Semester, YearLevel, Program } from '../scraper/types';

import type { Program } from '../scraper/types';

// Additional types for the data store
export interface ProgramEntry extends Omit<Program, 'url'> {
  cluster: string;
}

export interface CurriculaData {
  generatedAt: string;
  totalPrograms: number;
  successfulScrapes: number;
  programs: ProgramEntry[];
  errors: { slug: string; error: string }[];
}

export type CollegeGroup = {
  college: string;
  programs: ProgramEntry[];
};

export type ClusterGroup = {
  cluster: string;
  programs: ProgramEntry[];
};
