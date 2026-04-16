/**
 * Bulk UST Curriculum Scraper (Puppeteer)
 *
 * Scrapes curriculum data from all UST bachelor's programs using
 * headless Chromium for proper JS-rendered content extraction.
 *
 * Run: npx tsx lib/scraper/scrape-all-puppeteer.ts
 */

import { launchBrowser, scrapeProgramWithPuppeteer } from './puppeteerScraper';
import programsData from '../data/ust-programs.json';
import { resolveCollege, UST_COLLEGES } from '../collegeMapping';
import * as fs from 'fs';
import * as path from 'path';

interface ProgramEntry {
  name: string;
  slug: string;
  url: string;
  cluster: string;
}

interface ScrapedProgram {
  name: string;
  slug: string;
  college: string;
  cluster: string;
  curriculum: unknown[];
}

interface ScrapeError {
  slug: string;
  name: string;
  error: string;
}

interface ScrapeResult {
  generatedAt: string;
  totalPrograms: number;
  successfulScrapes: number;
  programs: ScrapedProgram[];
  errors: ScrapeError[];
}

const DELAY_MS = 2000; // 2 seconds between requests

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeAllPrograms(): Promise<void> {
  const programs = programsData.programs as ProgramEntry[];
  const totalPrograms = programs.length;

  console.log(`\n🎓 UST Curriculum Scraper (Puppeteer)`);
  console.log(`======================================`);
  console.log(`Starting scrape of ${totalPrograms} programs...\n`);

  const browser = await launchBrowser();
  const page = await browser.newPage();

  // Set a reasonable viewport and user agent
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  const result: ScrapeResult = {
    generatedAt: new Date().toISOString(),
    totalPrograms,
    successfulScrapes: 0,
    programs: [],
    errors: [],
  };

  for (let i = 0; i < programs.length; i++) {
    const program = programs[i];
    const progress = `[${i + 1}/${totalPrograms}]`;

    try {
      console.log(`${progress} Scraping: ${program.name}...`);

      const scraped = await scrapeProgramWithPuppeteer(page, program.url);

      const collegeKey = resolveCollege(program.name);
      const collegeName = UST_COLLEGES[collegeKey]?.name ?? 'Unknown College';

      result.programs.push({
        name: program.name,
        slug: program.slug,
        college: collegeName,
        cluster: program.cluster,
        curriculum: scraped.curriculum,
      });

      result.successfulScrapes++;

      const courseCount = scraped.curriculum.reduce(
        (acc: number, year: { semesters: { courses: unknown[] }[] }) =>
          acc + year.semesters.reduce((semAcc: number, sem: { courses: unknown[] }) => semAcc + sem.courses.length, 0),
        0
      );
      const yearCount = scraped.curriculum.length;

      if (courseCount === 0) {
        console.log(`  ⚠️  0 courses found (page may have different structure)`);
      } else {
        console.log(`  ✅ ${yearCount} years, ${courseCount} courses`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const shortError = errorMessage.includes('timeout')
        ? 'Navigation timeout'
        : errorMessage.substring(0, 80);
      console.log(`  ❌ ${shortError}`);

      result.errors.push({
        slug: program.slug,
        name: program.name,
        error: errorMessage,
      });
    }

    // Delay between requests
    if (i < programs.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  await browser.close();

  // Save results
  const outputPath = path.join(__dirname, '../data/ust-curricula.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`\n======================================`);
  console.log(`📊 Scrape Complete!`);
  console.log(`======================================`);
  console.log(`Total programs: ${totalPrograms}`);
  console.log(`Successful: ${result.successfulScrapes}`);
  console.log(`Failed: ${result.errors.length}`);
  console.log(`\nResults saved to: ${outputPath}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️ Failed programs:`);
    result.errors.forEach(err => {
      console.log(`  - ${err.name}: ${err.error.substring(0, 80)}`);
    });
  }

  // Report programs with 0 courses
  const emptyPrograms = result.programs.filter(
    p => (p.curriculum as { semesters: { courses: unknown[] }[] }[]).reduce(
      (a, y) => a + y.semesters.reduce((b, s) => b + s.courses.length, 0), 0
    ) === 0
  );
  if (emptyPrograms.length > 0) {
    console.log(`\n⚠️ Programs with 0 courses (need manual review):`);
    emptyPrograms.forEach(p => console.log(`  - ${p.name}`));
  }
}

scrapeAllPrograms().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
