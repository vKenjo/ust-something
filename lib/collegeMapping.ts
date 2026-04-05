/**
 * UST College → Program Mapping
 *
 * The scraped college names are malformed (HTML entities, truncated text).
 * This file provides a manual, authoritative mapping of every undergraduate
 * program to its correct college/faculty/institute at UST.
 */

export interface CollegeInfo {
  name: string;
  shortName: string;
  category: 'college' | 'faculty' | 'conservatory' | 'institute';
}

/**
 * All UST colleges/faculties/institutes that offer undergraduate programs.
 */
export const UST_COLLEGES: Record<string, CollegeInfo> = {
  CICS: {
    name: 'College of Information and Computing Sciences',
    shortName: 'CICS',
    category: 'college',
  },
  COS: {
    name: 'College of Science',
    shortName: 'COS',
    category: 'college',
  },
  ENGINEERING: {
    name: 'Faculty of Engineering',
    shortName: 'FoE',
    category: 'faculty',
  },
  EDUCATION: {
    name: 'College of Education',
    shortName: 'CoEd',
    category: 'college',
  },
  ARTS_LETTERS: {
    name: 'Faculty of Arts and Letters',
    shortName: 'AB',
    category: 'faculty',
  },
  COMMERCE: {
    name: 'College of Commerce and Business Administration',
    shortName: 'Commerce',
    category: 'college',
  },
  TOURISM: {
    name: 'College of Tourism and Hospitality Management',
    shortName: 'CTHM',
    category: 'college',
  },
  FINE_ARTS: {
    name: 'College of Fine Arts and Design',
    shortName: 'CFAD',
    category: 'college',
  },
  MUSIC: {
    name: 'Conservatory of Music',
    shortName: 'Conservatory',
    category: 'conservatory',
  },
  NURSING: {
    name: 'College of Nursing',
    shortName: 'CoN',
    category: 'college',
  },
  PHARMACY: {
    name: 'Faculty of Pharmacy',
    shortName: 'Pharmacy',
    category: 'faculty',
  },
  REHAB_SCIENCES: {
    name: 'College of Rehabilitation Sciences',
    shortName: 'CRS',
    category: 'college',
  },
  MEDICINE: {
    name: 'Faculty of Medicine and Surgery',
    shortName: 'FMS',
    category: 'faculty',
  },
  ARCHITECTURE: {
    name: 'College of Architecture',
    shortName: 'CoA',
    category: 'college',
  },
};

/**
 * Maps program name substrings to their correct college key.
 * Order matters — more specific patterns should come first.
 */
const PROGRAM_TO_COLLEGE_RULES: [RegExp, string][] = [
  // CICS
  [/Computer Science/, 'CICS'],
  [/Information Systems/, 'CICS'],
  [/Information Technology/, 'CICS'],

  // College of Science
  [/Applied Mathematics/, 'COS'],
  [/Actuarial Science/, 'COS'],
  [/Biochemistry/, 'COS'],
  [/Biology/, 'COS'],
  [/Chemistry/, 'COS'],
  [/Applied Physics/, 'COS'],
  [/Microbiology/, 'COS'],
  [/Food Technology/, 'COS'],
  [/Library and Information Science/, 'COS'],

  // Architecture
  [/Architecture/, 'ARCHITECTURE'],

  // Engineering
  [/Chemical Engineering/, 'ENGINEERING'],
  [/Civil Engineering/, 'ENGINEERING'],
  [/Electrical Engineering/, 'ENGINEERING'],
  [/Electronics Engineering/, 'ENGINEERING'],
  [/Industrial Engineering/, 'ENGINEERING'],
  [/Mechanical Engineering/, 'ENGINEERING'],

  // Education
  [/Secondary Education/, 'EDUCATION'],
  [/Elementary Education/, 'EDUCATION'],
  [/Early Childhood Education$/, 'EDUCATION'],
  [/Special Needs Education/, 'EDUCATION'],
  [/Nutrition and Dietetics/, 'EDUCATION'],

  // Tourism & Hospitality (before Commerce to avoid "Culinary Entrepreneurship" misroute)
  [/Hospitality Management/, 'TOURISM'],
  [/Tourism Management/, 'TOURISM'],

  // Commerce (Business Administration before Economics to avoid "Business Economics" misroute)
  [/Accountancy/, 'COMMERCE'],
  [/Accounting Information/, 'COMMERCE'],
  [/Business Administration/, 'COMMERCE'],
  [/Entrepreneurship/, 'COMMERCE'],
  [/Management Accounting/, 'COMMERCE'],

  // Arts and Letters
  [/Asian Studies/, 'ARTS_LETTERS'],
  [/Behavioral Science/, 'ARTS_LETTERS'],
  [/Communication$/, 'ARTS_LETTERS'],
  [/Creative Writing/, 'ARTS_LETTERS'],
  [/Economics/, 'ARTS_LETTERS'],
  [/English Language Studies/, 'ARTS_LETTERS'],
  [/History/, 'ARTS_LETTERS'],
  [/Journalism/, 'ARTS_LETTERS'],
  [/Legal Management/, 'ARTS_LETTERS'],
  [/Literature/, 'ARTS_LETTERS'],
  [/Philosophy/, 'ARTS_LETTERS'],
  [/Political Science/, 'ARTS_LETTERS'],
  [/Psychology/, 'ARTS_LETTERS'],
  [/Sociology/, 'ARTS_LETTERS'],

  // Fine Arts & Design
  [/Fine Arts/, 'FINE_ARTS'],
  [/Interior Design/, 'FINE_ARTS'],

  // Conservatory of Music
  [/Music/, 'MUSIC'],

  // Nursing
  [/Nursing/, 'NURSING'],

  // Pharmacy
  [/Pharmacy/, 'PHARMACY'],

  // Rehabilitation Sciences
  [/Occupational Therapy/, 'REHAB_SCIENCES'],
  [/Physical Therapy/, 'REHAB_SCIENCES'],
  [/Speech-Language Pathology/, 'REHAB_SCIENCES'],

  // Medicine
  [/Medical Technology/, 'MEDICINE'],
  [/Basic Human Studies/, 'MEDICINE'],
];

/**
 * Resolve the correct college key for a given program name.
 */
export function resolveCollege(programName: string): string {
  for (const [pattern, collegeKey] of PROGRAM_TO_COLLEGE_RULES) {
    if (pattern.test(programName)) {
      return collegeKey;
    }
  }
  return 'COS'; // Fallback
}

/**
 * Get the clean college name for a program.
 */
export function getCleanCollegeName(programName: string): string {
  const key = resolveCollege(programName);
  return UST_COLLEGES[key]?.name ?? 'College of Science';
}

/**
 * Get all college info entries, sorted by name.
 */
export function getAllColleges(): CollegeInfo[] {
  return Object.values(UST_COLLEGES).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Get college info by key.
 */
export function getCollegeByKey(key: string): CollegeInfo | undefined {
  return UST_COLLEGES[key];
}

/**
 * Generate a URL-safe slug from a program name.
 */
export function generateSlug(programName: string): string {
  return programName
    .replace(/ - University of Santo Tomas$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Clean a program name by removing the university suffix.
 */
export function cleanProgramName(name: string): string {
  return name.replace(/ - University of Santo Tomas$/i, '').trim();
}
