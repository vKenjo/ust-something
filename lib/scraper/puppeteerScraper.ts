/**
 * UST Curriculum Scraper (Puppeteer)
 *
 * Uses headless Chromium to render JS-heavy UST program pages
 * and extract curriculum data structured by year level and semester.
 *
 * Page structure (Elementor-based):
 *   - Multiple curriculum versions on one page (different AYs)
 *   - Each version has: summary table, then course tables
 *   - Summary table: "Year | First Term | Second Term | Special Term"
 *   - Course tables: preceded by <strong> "First Term" / "Second Term" labels
 *   - We want only the FIRST curriculum version from the "New" section
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import type { Course, YearLevel, Semester } from './types';
import { detectCourseType } from './ustCurriculumScraper';

export interface ScrapedProgramData {
  name: string;
  curriculum: YearLevel[];
}

interface RawTableData {
  type: 'year-summary' | 'course';
  termLabel?: string;
  rows: string[][];
}

function normalizeTerm(label: string): 'first' | 'second' | 'summer' | null {
  const lower = label.toLowerCase();
  if (lower.includes('first')) return 'first';
  if (lower.includes('second')) return 'second';
  if (lower.includes('special') || lower.includes('summer') || lower.includes('midyear')) return 'summer';
  return null;
}

function parsePrereqs(str: string): string[] {
  if (!str || str.trim() === '' || str.trim() === '-') return [];
  return str
    .split(/[,\n]|(?:\s+and\s+)/i)
    .map(p => p.trim())
    .filter(p => p.length > 0 && p !== '-' && p.toLowerCase() !== 'none');
}

/**
 * Parse raw table data into structured curriculum.
 * Assigns year levels by tracking term sequence:
 * First → Second (→ Summer) = Year N, then next First = Year N+1
 */
function parseTablesToYearLevels(tables: RawTableData[]): YearLevel[] {
  const yearMap = new Map<number, Map<string, Course[]>>();
  let currentYear = 1;
  let lastTerm: string | null = null;
  let seenFirstSummary = false;

  for (const table of tables) {
    if (table.type === 'year-summary') {
      // Only use the first summary table; stop at the second (next curriculum version)
      if (seenFirstSummary) break;
      seenFirstSummary = true;
      continue;
    }

    if (table.type === 'course') {
      const term = normalizeTerm(table.termLabel || '');
      if (!term) continue;

      // Advance year when we see a new "first" after a "second" or "summer"
      if (term === 'first' && lastTerm !== null) {
        currentYear++;
      }
      lastTerm = term;

      if (!yearMap.has(currentYear)) yearMap.set(currentYear, new Map());
      const termMap = yearMap.get(currentYear)!;
      if (!termMap.has(term)) termMap.set(term, []);

      const courses = termMap.get(term)!;

      for (const row of table.rows) {
        if (row.length < 5) continue;

        const code = row[0].trim();
        const name = row[1].trim();

        if (!code || code.toUpperCase().includes('TOTAL') || code.toUpperCase() === 'ABBREVIATION') continue;

        const lecUnits = parseFloat(row[2]) || 0;
        const labUnits = parseFloat(row[3]) || 0;
        const totalUnits = parseFloat(row[4]) || 0;
        const prereqStr = row[5] || '';
        const prerequisites = parsePrereqs(prereqStr);
        const courseType = detectCourseType(code, name);

        if (!courses.some(c => c.code === code)) {
          courses.push({ code, name, lecUnits, labUnits, totalUnits, prerequisites, courseType });
        }
      }
    }
  }

  const termOrder = ['first', 'second', 'summer'];
  const result: YearLevel[] = [];

  for (const [year, termMap] of Array.from(yearMap.entries()).sort((a, b) => a[0] - b[0])) {
    if (year < 1 || year > 6) continue;

    const semesters: Semester[] = [];
    for (const t of termOrder) {
      const courses = termMap.get(t);
      if (courses && courses.length > 0) {
        semesters.push({ term: t as 'first' | 'second' | 'summer', courses });
      }
    }

    if (semesters.length > 0) {
      result.push({ year: year as 1 | 2 | 3 | 4 | 5, semesters });
    }
  }

  return result;
}

/**
 * Scrape a single program page using Puppeteer.
 */
export async function scrapeProgramWithPuppeteer(
  page: Page,
  url: string
): Promise<ScrapedProgramData> {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

  await page.waitForSelector('table', { timeout: 15000 }).catch(() => {});

  const raw: { name: string; tables: RawTableData[] } = await page.evaluate(() => {
    const results: Array<{
      type: 'year-summary' | 'course';
      termLabel?: string;
      rows: string[][];
    }> = [];

    // Get program name
    const h2s = document.querySelectorAll('h2');
    let programName = '';
    let oldCurriculumNode: Element | null = null;
    let newCurriculumNode: Element | null = null;

    for (const h of h2s) {
      const text = (h.textContent || '').trim();
      if (/^Bachelor|^Doctor|^BS /i.test(text) && !text.includes('Curriculum') && !programName) {
        programName = text;
      }
      if (text.includes('Curriculum (New)') && !newCurriculumNode) {
        newCurriculumNode = h;
      }
      if (text.includes('Curriculum (Old)') && !oldCurriculumNode) {
        oldCurriculumNode = h;
      }
    }

    // If no "New" section, use "Old" section (some programs only have one version)
    // and clear oldCurriculumNode so we don't filter out its tables
    if (!newCurriculumNode && oldCurriculumNode) {
      newCurriculumNode = oldCurriculumNode;
      oldCurriculumNode = null;
    }
    // If neither found, try generic "Program Curriculum" heading
    if (!newCurriculumNode) {
      for (const h of h2s) {
        const text = (h.textContent || '').trim();
        if (text.includes('Program Curriculum') && !newCurriculumNode) {
          newCurriculumNode = h;
        }
      }
    }

    // Filter tables to the curriculum section
    const allTables = Array.from(document.querySelectorAll('table'));
    const curriculumTables = allTables.filter(table => {
      if (newCurriculumNode) {
        if (!(newCurriculumNode.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
      }
      if (oldCurriculumNode) {
        if (!(oldCurriculumNode.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_PRECEDING)) return false;
      }
      return true;
    });

    for (const table of curriculumTables) {
      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length === 0) continue;

      const parsedRows: string[][] = rows.map(row =>
        Array.from(row.querySelectorAll('th, td')).map(cell =>
          (cell.textContent || '').replace(/\s+/g, ' ').trim()
        )
      );

      const headerText = (parsedRows[0] || []).join(' ').toLowerCase();

      // Year summary table
      if (headerText.includes('year') && headerText.includes('first term') && headerText.includes('second term')) {
        results.push({ type: 'year-summary', rows: parsedRows.slice(1) });
        continue;
      }

      // Course table
      if (headerText.includes('abbreviation') || headerText.includes('course code')) {
        let termLabel = '';
        let el: Element | null = table;

        for (let attempts = 0; attempts < 10 && !termLabel; attempts++) {
          const parent: Element | null = el ? el.parentElement : null;
          if (!parent) break;

          let prev: Element | null = el ? el.previousElementSibling : null;
          while (prev && !termLabel) {
            const strong = prev.querySelector('strong') || (prev.tagName === 'STRONG' ? prev : null);
            const text = (strong?.textContent || prev.textContent || '').trim();
            if (/^(First|Second|Special|Summer|Midyear)\s*Term/i.test(text)) {
              termLabel = text;
            }
            prev = prev.previousElementSibling;
          }
          el = parent;
        }

        results.push({ type: 'course', termLabel, rows: parsedRows.slice(1) });
        continue;
      }
    }

    return { name: programName, tables: results };
  });

  const curriculum = parseTablesToYearLevels(raw.tables);

  return {
    name: raw.name || 'Unknown Program',
    curriculum,
  };
}

/**
 * Launch a browser instance for scraping.
 */
export async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}
