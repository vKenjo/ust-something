/**
 * UST Curriculum Scraper
 * Scrapes program curriculum data from ust.edu.ph program pages
 */

import type { Course, Semester, YearLevel, Program, RawCourseRow } from './types';

/**
 * Fetch HTML content from a UST program page
 */
export async function fetchProgramPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; UST-Kit/1.0; Curriculum Scraper)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Detect course type based on code and name
 * - NSTP: National Service Training Program
 * - PE: Physical Education (PATH-FIT)
 * - Academic: Everything else (including practicum/OJT which get 0 units for GWA)
 */
export function detectCourseType(code: string, name: string): 'academic' | 'pe' | 'nstp' {
  const upperCode = code.toUpperCase();
  const upperName = name.toUpperCase();

  // NSTP courses
  if (upperCode.startsWith('NSTP') || upperName.includes('NATIONAL SERVICE TRAINING')) {
    return 'nstp';
  }

  // PE/PATH-FIT courses
  if (
    upperCode.includes('PATH-FIT') ||
    upperCode.startsWith('PE ') ||
    upperCode.startsWith('PE') && /^\d/.test(upperCode.slice(2)) ||
    upperName.includes('PHYSICAL ACTIVITIES') ||
    upperName.includes('PATH-FIT') ||
    upperName.includes('PHYSICAL EDUCATION')
  ) {
    return 'pe';
  }

  return 'academic';
}

/**
 * Check if a course is practicum/OJT/internship (units shouldn't count for GWA)
 */
export function isPracticumCourse(_code: string, name: string): boolean {
  const upperName = name.toUpperCase();

  return (
    upperName.includes('PRACTICUM') ||
    upperName.includes('OJT') ||
    upperName.includes('ON-THE-JOB') ||
    upperName.includes('INTERNSHIP') ||
    upperName.includes('FIELD TRIP') ||
    upperName.includes('SEMINARS')
  );
}

/**
 * Parse prerequisites string into array of course codes
 */
function parsePrerequisites(prereqStr: string): string[] {
  if (!prereqStr || prereqStr.trim() === '' || prereqStr.trim() === '-') {
    return [];
  }

  // Split by common delimiters: comma, newline, and
  const prereqs = prereqStr
    .split(/[,\n]|(?:\s+and\s+)/i)
    .map(p => p.trim())
    .filter(p => p.length > 0 && p !== '-' && p !== 'none' && p.toLowerCase() !== 'none');

  return prereqs;
}

/**
 * Parse a number from string, defaulting to 0
 */
function parseNumber(str: string): number {
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalize term string to standard format
 */
function normalizeTerm(termStr: string): 'first' | 'second' | 'summer' | null {
  const lower = termStr.toLowerCase();
  
  if (lower.includes('first')) return 'first';
  if (lower.includes('second')) return 'second';
  if (lower.includes('special') || lower.includes('summer') || lower.includes('midyear')) {
    return 'summer';
  }
  
  return null;
}

/**
 * Parse raw course row into Course object
 */
function parseCourseRow(row: RawCourseRow): Course | null {
  // Skip TOTAL rows and empty rows
  if (
    row.abbreviation.toUpperCase().includes('TOTAL') ||
    row.abbreviation.trim() === '' ||
    row.abbreviation.toUpperCase() === 'ABBREVIATION'
  ) {
    return null;
  }

  const code = row.abbreviation.trim();
  const name = row.description.trim();
  const lecUnits = parseNumber(row.lecHrs);
  const labUnits = parseNumber(row.labHrs);
  const totalUnits = parseNumber(row.units);
  const prerequisites = parsePrerequisites(row.prerequisites);
  const courseType = detectCourseType(code, name);

  return {
    code,
    name,
    lecUnits,
    labUnits,
    totalUnits,
    prerequisites,
    courseType,
  };
}

/**
 * Extract tables from HTML
 * Returns array of objects with term info and table rows
 */
function extractTablesFromHTML(html: string): { term: string; rows: RawCourseRow[] }[] {
  const results: { term: string; rows: RawCourseRow[] }[] = [];
  
  // Pattern to match term headers followed by tables
  // Looking for patterns like "**First Term**" or "<strong>First Term</strong>"
  const termPattern = /(?:<strong>|<b>|\*\*)\s*((?:First|Second|Special|Summer|Midyear)\s*Term[^<*]*?)(?:<\/strong>|<\/b>|\*\*)/gi;
  
  // Find all term markers
  const termMatches: { term: string; index: number }[] = [];
  let match;
  
  while ((match = termPattern.exec(html)) !== null) {
    termMatches.push({
      term: match[1].trim(),
      index: match.index,
    });
  }

  // For each term, find the subsequent table
  for (let i = 0; i < termMatches.length; i++) {
    const termMatch = termMatches[i];
    const nextTermIndex = i < termMatches.length - 1 ? termMatches[i + 1].index : html.length;
    const section = html.slice(termMatch.index, nextTermIndex);
    
    // Extract table rows from this section
    const rows = extractTableRows(section);
    
    if (rows.length > 0) {
      results.push({
        term: termMatch.term,
        rows,
      });
    }
  }

  return results;
}

/**
 * Extract table rows from an HTML section
 */
function extractTableRows(html: string): RawCourseRow[] {
  const rows: RawCourseRow[] = [];
  
  // Try to find table rows
  const tablePattern = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdPattern = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  
  let tableMatch;
  while ((tableMatch = tablePattern.exec(html)) !== null) {
    const tableContent = tableMatch[1];
    let trMatch;
    
    while ((trMatch = trPattern.exec(tableContent)) !== null) {
      const rowContent = trMatch[1];
      const cells: string[] = [];
      let tdMatch;
      
      // Reset lastIndex for tdPattern
      tdPattern.lastIndex = 0;
      while ((tdMatch = tdPattern.exec(rowContent)) !== null) {
        // Strip HTML tags and decode entities
        const cellText = stripHTML(tdMatch[1]);
        cells.push(cellText);
      }
      
      // We expect at least 6 columns: Abbreviation, Description, Lec, Lab, Units, Prerequisites
      if (cells.length >= 5) {
        const row: RawCourseRow = {
          abbreviation: cells[0] || '',
          description: cells[1] || '',
          lecHrs: cells[2] || '0',
          labHrs: cells[3] || '0',
          units: cells[4] || '0',
          prerequisites: cells[5] || '',
        };
        
        // Skip header rows
        if (!row.abbreviation.toLowerCase().includes('abbreviation')) {
          rows.push(row);
        }
      }
    }
  }
  
  // If no tables found, try markdown-style parsing
  if (rows.length === 0) {
    rows.push(...extractMarkdownTableRows(html));
  }
  
  return rows;
}

/**
 * Extract rows from markdown-style tables (pipe-separated)
 */
function extractMarkdownTableRows(text: string): RawCourseRow[] {
  const rows: RawCourseRow[] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Skip if not a table row
    if (!line.includes('|')) continue;
    
    const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
    
    // Skip header rows and separator rows
    if (cells.length < 5) continue;
    if (cells[0].toLowerCase().includes('abbreviation')) continue;
    if (cells[0].match(/^[-:]+$/)) continue;
    if (cells[0].toUpperCase().includes('TOTAL')) continue;
    
    const row: RawCourseRow = {
      abbreviation: cells[0] || '',
      description: cells[1] || '',
      lecHrs: cells[2] || '0',
      labHrs: cells[3] || '0',
      units: cells[4] || '0',
      prerequisites: cells[5] || '',
    };
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Strip HTML tags and decode common entities
 */
function stripHTML(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse curriculum from HTML content
 * Handles pages with multiple curriculum versions by detecting year resets
 */
export function parseCurriculum(html: string): YearLevel[] {
  const tables = extractTablesFromHTML(html);
  
  // Track courses by year and term, detecting curriculum boundaries
  const yearLevels = new Map<number, Map<string, Course[]>>();
  
  let currentYear = 1;
  let lastTerm: string | null = null;
  
  // Track which courses we've seen to detect curriculum resets
  const seenCourseCodes = new Set<string>();
  let foundYear4 = false;
  
  for (const table of tables) {
    const normalizedTerm = normalizeTerm(table.term);
    if (!normalizedTerm) continue;
    
    // Detect year transitions based on term sequence
    if (normalizedTerm === 'first' && (lastTerm === 'second' || lastTerm === 'summer')) {
      currentYear++;
    }
    
    // Check for curriculum reset (seeing Year 1 courses again after Year 4)
    if (currentYear >= 4) {
      foundYear4 = true;
    }
    
    if (foundYear4 && currentYear > 4 && normalizedTerm === 'first') {
      // Check if these are Year 1 courses (NSTP 1, PATH-FIT 1, etc.)
      const year1Indicators = ['NSTP 1', 'PATH-FIT 1', 'THY 1', 'ICS 2601', 'ICS 2602'];
      const hasYear1Courses = table.rows.some(r => 
        year1Indicators.some(ind => r.abbreviation.includes(ind))
      );
      
      if (hasYear1Courses) {
        // This is a new curriculum version, stop here
        break;
      }
    }
    
    // Skip if beyond year 5
    if (currentYear > 5) continue;
    
    // Initialize year if needed
    if (!yearLevels.has(currentYear)) {
      yearLevels.set(currentYear, new Map());
    }
    
    const yearSemesters = yearLevels.get(currentYear)!;
    if (!yearSemesters.has(normalizedTerm)) {
      yearSemesters.set(normalizedTerm, []);
    }
    
    // Parse courses and add to semester
    for (const row of table.rows) {
      const course = parseCourseRow(row);
      if (course) {
        // Track seen courses
        seenCourseCodes.add(course.code);
        yearSemesters.get(normalizedTerm)!.push(course);
      }
    }
    
    lastTerm = normalizedTerm;
  }
  
  // Convert to array format
  const result: YearLevel[] = [];
  
  for (const [year, semesters] of yearLevels) {
    if (year > 5) continue;
    
    const semesterArray: Semester[] = [];
    const termOrder: ('first' | 'second' | 'summer')[] = ['first', 'second', 'summer'];
    
    for (const term of termOrder) {
      const courses = semesters.get(term);
      if (courses && courses.length > 0) {
        // Deduplicate courses by code
        const uniqueCourses = deduplicateCourses(courses);
        semesterArray.push({
          term,
          courses: uniqueCourses,
        });
      }
    }
    
    if (semesterArray.length > 0) {
      result.push({
        year: year as 1 | 2 | 3 | 4 | 5,
        semesters: semesterArray,
      });
    }
  }
  
  return result.sort((a, b) => a.year - b.year);
}

/**
 * Deduplicate courses by code, keeping the first occurrence
 */
function deduplicateCourses(courses: Course[]): Course[] {
  const seen = new Set<string>();
  const result: Course[] = [];
  
  for (const course of courses) {
    if (!seen.has(course.code)) {
      seen.add(course.code);
      result.push(course);
    }
  }
  
  return result;
}

/**
 * Extract program name from HTML
 */
function extractProgramName(html: string): string {
  // Try to find h1 or title
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return stripHTML(h1Match[1]);
  }
  
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    return stripHTML(titleMatch[1]).replace(/\s*[-|]\s*UST.*$/i, '').trim();
  }
  
  return 'Unknown Program';
}

/**
 * Extract college name from HTML or URL
 */
function extractCollegeName(html: string, url: string): string {
  // Try to find college from breadcrumbs or page content
  const collegePatterns = [
    /College of ([^<,]+)/i,
    /Faculty of ([^<,]+)/i,
    /Institute of ([^<,]+)/i,
  ];
  
  for (const pattern of collegePatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  // Infer from URL or common course prefixes
  if (url.includes('information-technology') || url.includes('computer-science')) {
    return 'College of Information and Computing Sciences';
  }
  
  return 'Unknown College';
}

/**
 * Generate slug from URL
 */
function generateSlug(url: string): string {
  const match = url.match(/\/programs\/([^/]+)\/?$/);
  return match ? match[1] : 'unknown-program';
}

/**
 * Main function to scrape a complete program curriculum
 */
export async function scrapeProgramCurriculum(url: string): Promise<Program> {
  const html = await fetchProgramPage(url);
  
  const name = extractProgramName(html);
  const slug = generateSlug(url);
  const college = extractCollegeName(html, url);
  const curriculum = parseCurriculum(html);
  
  return {
    name,
    slug,
    college,
    url,
    curriculum,
  };
}

/**
 * Parse curriculum from pre-fetched text (useful for testing)
 */
export function parseCurriculumFromText(text: string): YearLevel[] {
  // This handles both HTML and plain text/markdown formats
  return parseCurriculum(text);
}
