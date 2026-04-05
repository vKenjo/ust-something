import { mutation } from './_generated/server';

/**
 * Seed all UST Colleges/Faculties/Institutes
 * Comprehensive list of all UST academic units
 */

export const seedAllColleges = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Check if colleges already exist
    const existingCount = await ctx.db.query('colleges').collect();
    if (existingCount.length >= 20) {
      return { 
        message: 'Colleges already seeded', 
        count: existingCount.length 
      };
    }

    const colleges = [
      // Colleges
      {
        code: 'ACCOUNTANCY',
        name: 'UST-Alfredo M. Velayo College of Accountancy',
        category: 'college',
        yearEstablished: 2004,
        gradingSystem: 'gwa',
      },
      {
        code: 'ARCHITECTURE',
        name: 'College of Architecture',
        category: 'college',
        yearEstablished: 1930,
        gradingSystem: 'gwa',
      },
      {
        code: 'COMMERCE',
        name: 'College of Commerce and Business Administration',
        category: 'college',
        yearEstablished: 1933,
        gradingSystem: 'gwa',
      },
      {
        code: 'EDUCATION',
        name: 'College of Education',
        category: 'college',
        yearEstablished: 1926,
        gradingSystem: 'gwa',
      },
      {
        code: 'FINE_ARTS',
        name: 'College of Fine Arts and Design',
        category: 'college',
        yearEstablished: 2000,
        gradingSystem: 'gwa',
      },
      {
        code: 'CICS',
        name: 'College of Information and Computing Sciences',
        category: 'college',
        yearEstablished: 2014,
        gradingSystem: 'gwa',
      },
      {
        code: 'NURSING',
        name: 'College of Nursing',
        category: 'college',
        yearEstablished: 1946,
        gradingSystem: 'gwa',
      },
      {
        code: 'REHAB_SCI',
        name: 'College of Rehabilitation Sciences',
        category: 'college',
        yearEstablished: 1974,
        gradingSystem: 'gwa',
      },
      {
        code: 'SCIENCE',
        name: 'College of Science',
        category: 'college',
        yearEstablished: 1926,
        gradingSystem: 'gwa',
      },
      {
        code: 'TOURISM',
        name: 'College of Tourism and Hospitality Management',
        category: 'college',
        yearEstablished: 2006,
        gradingSystem: 'gwa',
      },

      // Faculties
      {
        code: 'ARTS_LETTERS',
        name: 'Faculty of Arts and Letters',
        category: 'faculty',
        yearEstablished: 1896,
        gradingSystem: 'gwa',
      },
      {
        code: 'CIVIL_LAW',
        name: 'Faculty of Civil Law',
        category: 'faculty',
        yearEstablished: 1734,
        gradingSystem: 'law', // Law uses stricter grading
      },
      {
        code: 'ENGINEERING',
        name: 'Faculty of Engineering',
        category: 'faculty',
        yearEstablished: 1907,
        gradingSystem: 'gwa',
      },
      {
        code: 'MEDICINE',
        name: 'Faculty of Medicine and Surgery',
        category: 'faculty',
        yearEstablished: 1871,
        gradingSystem: 'medicine', // Medicine uses stricter grading
      },
      {
        code: 'PHARMACY',
        name: 'Faculty of Pharmacy',
        category: 'faculty',
        yearEstablished: 1871,
        gradingSystem: 'gwa',
      },

      // Graduate Schools
      {
        code: 'GRAD_SCHOOL',
        name: 'Graduate School',
        category: 'graduate',
        yearEstablished: 1938,
        gradingSystem: 'gwa',
      },
      {
        code: 'GRAD_LAW',
        name: 'Graduate School of Law',
        category: 'graduate',
        yearEstablished: 2017,
        gradingSystem: 'law', // Law uses stricter grading
      },

      // Conservatory
      {
        code: 'MUSIC',
        name: 'Conservatory of Music',
        category: 'conservatory',
        yearEstablished: 1945,
        gradingSystem: 'gwa',
      },

      // Institute
      {
        code: 'PE_ATHLETICS',
        name: 'Institute of Physical Education and Athletics',
        category: 'institute',
        yearEstablished: 2000,
        gradingSystem: 'gwa',
      },

      // Ecclesiastical Faculties
      {
        code: 'CANON_LAW',
        name: 'Faculty of Canon Law',
        category: 'ecclesiastical',
        yearEstablished: 1733,
        gradingSystem: 'law', // Canon Law uses law grading
      },
      {
        code: 'PHILOSOPHY',
        name: 'Faculty of Philosophy',
        category: 'ecclesiastical',
        yearEstablished: 1611,
        gradingSystem: 'gwa',
      },
      {
        code: 'THEOLOGY',
        name: 'Faculty of Sacred Theology',
        category: 'ecclesiastical',
        yearEstablished: 1611,
        gradingSystem: 'gwa',
      },

      // Basic Education (Average-based grading system)
      {
        code: 'SHS',
        name: 'Senior High School',
        category: 'basic_education',
        yearEstablished: 2016,
        gradingSystem: 'average', // 0-100 grading system
      },
      {
        code: 'JHS',
        name: 'Junior High School',
        category: 'basic_education',
        yearEstablished: 1928,
        gradingSystem: 'average',
      },
      {
        code: 'EDUC_HS',
        name: 'Education High School',
        category: 'basic_education',
        yearEstablished: 1950,
        gradingSystem: 'average',
      },
    ];

    let insertedCount = 0;
    for (const college of colleges) {
      await ctx.db.insert('colleges', {
        ...college,
        description: `Established in ${college.yearEstablished}`,
        createdAt: now,
        updatedAt: now,
      });
      insertedCount++;
    }

    // Update metadata
    await ctx.db.insert('scrapeMetadata', {
      entity: 'all_colleges_seed',
      lastScrapedAt: now,
      status: 'success',
    });

    return {
      message: 'Successfully seeded all UST colleges',
      colleges: insertedCount,
      breakdown: {
        colleges: 10,
        faculties: 5,
        graduate: 2,
        conservatory: 1,
        institute: 1,
        ecclesiastical: 3,
        basicEducation: 3,
      },
      gradingSystems: {
        gwa: 18,      // Standard GWA
        medicine: 1,  // Faculty of Medicine
        law: 3,       // Civil Law, Grad Law, Canon Law
        average: 3,   // SHS, JHS, Education HS
      },
    };
  },
});

/**
 * Clear all colleges (for re-seeding)
 */
export const clearAllColleges = mutation({
  handler: async (ctx) => {
    const colleges = await ctx.db.query('colleges').collect();
    for (const college of colleges) {
      await ctx.db.delete(college._id);
    }
    return { message: 'All colleges cleared', count: colleges.length };
  },
});
