/**
 * Validates curriculum ownership and selector coverage integrity.
 *
 * Run: npx tsx lib/data/validate-program-ownership.ts
 */

import curriculaData from './ust-curricula.json';
import sourceProgramsData from './ust-programs.json';
import { getAllPrograms, getColleges, getProgramsByCollege } from './curricula';
import { resolveCollegeByName, UST_COLLEGES } from '../collegeMapping';

type CurriculumProgram = (typeof curriculaData.programs)[number];
type CurriculumError = { slug: string; name?: string; error: string };
type SourceProgram = { slug: string; name: string; url: string; cluster: string };

function formatList(items: string[]): string {
  return items.map((item) => `  - ${item}`).join('\n');
}

function runValidation(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  const programs = curriculaData.programs as CurriculumProgram[];
  const sourcePrograms = sourceProgramsData.programs as SourceProgram[];
  const scrapeErrors = curriculaData.errors as CurriculumError[];

  if (curriculaData.totalPrograms !== programs.length) {
    errors.push(
      `Metadata mismatch: totalPrograms=${curriculaData.totalPrograms}, actualPrograms=${programs.length}`
    );
  }

  if (curriculaData.successfulScrapes !== programs.length) {
    warnings.push(
      `successfulScrapes=${curriculaData.successfulScrapes} differs from actualPrograms=${programs.length}`
    );
  }

  // Raw data integrity checks.
  const slugSet = new Set<string>();
  const duplicateSlugs: string[] = [];
  const invalidCollegeNames: string[] = [];

  for (const program of programs) {
    if (slugSet.has(program.slug)) {
      duplicateSlugs.push(program.slug);
    } else {
      slugSet.add(program.slug);
    }

    const key = resolveCollegeByName(program.college);
    if (!key || !UST_COLLEGES[key]) {
      invalidCollegeNames.push(`${program.slug} -> "${program.college}"`);
    }
  }

  if (duplicateSlugs.length > 0) {
    errors.push(`Duplicate program slugs detected:\n${formatList(duplicateSlugs)}`);
  }

  if (invalidCollegeNames.length > 0) {
    errors.push(
      `Programs with unrecognized college/faculty/institute names:\n${formatList(invalidCollegeNames)}`
    );
  }

  // Selector-level checks: each program should appear in exactly one college list.
  const selectorColleges = getColleges();
  const selectorCollegeNames = selectorColleges.map((college) => college.name);
  const selectorProgramsByCollege = new Map(
    selectorCollegeNames.map((collegeName) => [
      collegeName,
      getProgramsByCollege(collegeName),
    ])
  );

  for (const college of selectorColleges) {
    const programCount = selectorProgramsByCollege.get(college.name)?.length ?? 0;
    if (programCount === 0) {
      errors.push(`College has zero selectable programs: ${college.name}`);
    }
  }

  const selectorPrograms = getAllPrograms();
  const zeroMappings: string[] = [];
  const multiMappings: string[] = [];

  for (const program of selectorPrograms) {
    const matchedColleges = selectorCollegeNames.filter((collegeName) =>
      (selectorProgramsByCollege.get(collegeName) ?? []).some(
        (candidate) => candidate.slug === program.slug
      )
    );

    if (matchedColleges.length === 0) {
      zeroMappings.push(program.slug);
    } else if (matchedColleges.length > 1) {
      multiMappings.push(`${program.slug} -> ${matchedColleges.join(', ')}`);
    }
  }

  if (zeroMappings.length > 0) {
    errors.push(`Programs with zero selector mappings:\n${formatList(zeroMappings)}`);
  }

  if (multiMappings.length > 0) {
    errors.push(`Programs with multiple selector mappings:\n${formatList(multiMappings)}`);
  }

  // Direct regression check for reported issue.
  const accountancyCollege = 'UST-Alfredo M. Velayo College of Accountancy';
  const commerceCollege = 'College of Commerce and Business Administration';
  const bsaName = 'Bachelor of Science in Accountancy';
  const accountancyPrograms = getProgramsByCollege(accountancyCollege).map((p) => p.name);
  const commercePrograms = getProgramsByCollege(commerceCollege).map((p) => p.name);

  if (!accountancyPrograms.includes(bsaName)) {
    errors.push(`${bsaName} is missing from ${accountancyCollege}`);
  }

  if (commercePrograms.includes(bsaName)) {
    errors.push(`${bsaName} is incorrectly listed under ${commerceCollege}`);
  }

  // Source catalog drift checks.
  const sourceSlugs = new Set(sourcePrograms.map((program) => program.slug));
  const dataSlugs = new Set(programs.map((program) => program.slug));
  const errorSlugs = new Set(scrapeErrors.map((error) => error.slug));

  const missingFromData = [...sourceSlugs].filter((slug) => !dataSlugs.has(slug));
  const unexpectedMissing = missingFromData.filter((slug) => !errorSlugs.has(slug));

  if (unexpectedMissing.length > 0) {
    errors.push(
      `Source programs missing from curricula without scrape error records:\n${formatList(
        unexpectedMissing
      )}`
    );
  }

  if (missingFromData.length > 0) {
    warnings.push(`Source slugs missing from curricula: ${missingFromData.length}`);
  }

  const allowedExtraSlugs = new Set(['doctor-of-medicine']);
  const extraInData = [...dataSlugs].filter(
    (slug) => !sourceSlugs.has(slug) && !allowedExtraSlugs.has(slug)
  );
  if (extraInData.length > 0) {
    warnings.push(`Extra curricula slugs not found in source list:\n${formatList(extraInData)}`);
  }

  // Human-readable summary.
  const collegeSummary = selectorColleges
    .map((college) => {
      const count = selectorProgramsByCollege.get(college.name)?.length ?? 0;
      return `${college.name}: ${count}`;
    })
    .sort((a, b) => a.localeCompare(b));

  console.log('Program ownership summary by college/faculty/institute:');
  console.log(formatList(collegeSummary));

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    console.log(formatList(warnings));
  }

  if (errors.length > 0) {
    console.error('\nValidation failed:');
    console.error(formatList(errors));
    process.exit(1);
  }

  console.log('\nValidation passed.');
}

runValidation();
