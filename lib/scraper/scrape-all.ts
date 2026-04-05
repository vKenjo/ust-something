/**
 * Bulk UST Curriculum Scraper
 * Scrapes curriculum data from all UST bachelor's programs
 */

import { scrapeProgramCurriculum } from './ustCurriculumScraper';
import programsData from '../data/ust-programs.json';
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

const DELAY_MS = 1500; // 1.5 seconds between requests

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeAllPrograms(): Promise<void> {
  const programs = programsData.programs as ProgramEntry[];
  const totalPrograms = programs.length;
  
  console.log(`\n🎓 UST Curriculum Scraper`);
  console.log(`========================`);
  console.log(`Starting scrape of ${totalPrograms} programs...\n`);

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
      
      const scraped = await scrapeProgramCurriculum(program.url);
      
      // Merge scraped data with cluster from source
      result.programs.push({
        name: scraped.name || program.name,
        slug: scraped.slug || program.slug,
        college: scraped.college,
        cluster: program.cluster,
        curriculum: scraped.curriculum,
      });
      
      result.successfulScrapes++;
      
      const courseCount = scraped.curriculum.reduce((acc, year) => {
        return acc + year.semesters.reduce((semAcc, sem) => semAcc + sem.courses.length, 0);
      }, 0);
      
      console.log(`  ✅ Success: ${scraped.curriculum.length} year levels, ${courseCount} courses`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  ❌ Failed: ${errorMessage}`);
      
      result.errors.push({
        slug: program.slug,
        name: program.name,
        error: errorMessage,
      });
    }
    
    // Add delay between requests to be respectful to the server
    if (i < programs.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Save results to file
  const outputPath = path.join(__dirname, '../data/ust-curricula.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  
  console.log(`\n========================`);
  console.log(`📊 Scrape Complete!`);
  console.log(`========================`);
  console.log(`Total programs: ${totalPrograms}`);
  console.log(`Successful: ${result.successfulScrapes}`);
  console.log(`Failed: ${result.errors.length}`);
  console.log(`\nResults saved to: ${outputPath}`);
  
  if (result.errors.length > 0) {
    console.log(`\n⚠️ Failed programs:`);
    result.errors.forEach(err => {
      console.log(`  - ${err.name}: ${err.error}`);
    });
  }
}

// Run the scraper
scrapeAllPrograms().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
