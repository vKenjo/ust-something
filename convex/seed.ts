import { mutation} from './_generated/server';

/**
 * Seed initial UST data
 * This mutation adds sample college and course data for testing
 */

export const seedInitialData = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Check if data already exists
    const existingColleges = await ctx.db.query('colleges').collect();
    if (existingColleges.length > 0) {
      return { message: 'Data already seeded', count: existingColleges.length };
    }

    // Add College of Information and Computing Sciences (CICS)
    const cicsId = await ctx.db.insert('colleges', {
      code: 'CICS',
      name: 'College of Information and Computing Sciences',
      description: 'The premier IT and Computer Science college in UST',
      category: 'college',
      yearEstablished: 2014,
      gradingSystem: 'gwa',
      createdAt: now,
      updatedAt: now,
    });

    // Add BS Computer Science course
    const bscsId = await ctx.db.insert('courses', {
      collegeId: cicsId,
      code: 'BSCS',
      name: 'Bachelor of Science in Computer Science',
      description: '4-year program in Computer Science',
      yearLevels: 4,
      createdAt: now,
      updatedAt: now,
    });

    // Add sample 4th year subjects based on the screenshot
    const subjects = [
      {
        code: 'ICS26015',
        name: 'EMERGING TECHNOLOGIES',
        lecUnits: 0,
        labUnits: 1,
        yearLevel: 4,
        semester: 2,
      },
      {
        code: 'ICS26016',
        name: 'TECHNOPRENEURSHIP',
        lecUnits: 3,
        labUnits: 0,
        yearLevel: 4,
        semester: 2,
      },
      {
        code: 'ICS26017',
        name: 'SOCIAL AND PROFESSIONAL PRACTICE',
        lecUnits: 3,
        labUnits: 0,
        yearLevel: 4,
        semester: 2,
      },
      {
        code: 'CS 26116',
        name: 'PRACTICUM (250 HRS)',
        lecUnits: 0,
        labUnits: 4,
        yearLevel: 4,
        semester: 2,
      },
      {
        code: 'CS ELEC 4C',
        name: 'DATA MINING',
        lecUnits: 2,
        labUnits: 1,
        yearLevel: 4,
        semester: 2,
      },
    ];

    for (const subject of subjects) {
      await ctx.db.insert('subjects', {
        courseId: bscsId,
        code: subject.code,
        name: subject.name,
        description: '',
        lecUnits: subject.lecUnits,
        labUnits: subject.labUnits,
        yearLevel: subject.yearLevel,
        semester: subject.semester,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update scrape metadata
    await ctx.db.insert('scrapeMetadata', {
      entity: 'initial_seed',
      lastScrapedAt: now,
      status: 'success',
    });

    return {
      message: 'Successfully seeded initial data',
      colleges: 1,
      courses: 1,
      subjects: subjects.length,
    };
  },
});
