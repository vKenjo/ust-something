import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * UST Kit - Convex Schema
 * Database schema for colleges, courses, and subjects
 */

export default defineSchema({
  // Colleges/Faculties at UST
  colleges: defineTable({
    name: v.string(),
    code: v.string(), // e.g., "CICS", "COS", "COE"
    description: v.optional(v.string()),
    category: v.string(), // "college", "faculty", "institute", "ecclesiastical", "basic_education"
    yearEstablished: v.optional(v.number()),
    gradingSystem: v.string(), // "gwa", "average", "medicine", "law"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_code', ['code'])
    .index('by_category', ['category']),

  // Courses/Programs within colleges
  courses: defineTable({
    collegeId: v.id('colleges'),
    name: v.string(), // e.g., "Bachelor of Science in Computer Science"
    code: v.string(), // e.g., "BSCS"
    description: v.optional(v.string()),
    yearLevels: v.number(), // 4 for college, 2 for SHS, etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_college', ['collegeId'])
    .index('by_code', ['code']),

  // Subjects in curriculum
  subjects: defineTable({
    courseId: v.id('courses'),
    yearLevel: v.number(), // 1-4
    semester: v.number(), // 1=First, 2=Second, 3=Summer
    code: v.string(), // e.g., "ICS26015"
    name: v.string(), // e.g., "Emerging Technologies"
    description: v.optional(v.string()),
    lecUnits: v.number(), // Lecture units
    labUnits: v.number(), // Laboratory units
    courseType: v.optional(v.string()), // "academic", "pe", "nstp", "theology" - for GWA calculation
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_course', ['courseId'])
    .index('by_curriculum', ['courseId', 'yearLevel', 'semester'])
    .index('by_code', ['code'])
    .index('by_type', ['courseType']),

  // Scraping metadata (track last scrape time, etc.)
  scrapeMetadata: defineTable({
    entity: v.string(), // "colleges", "courses", "subjects"
    lastScrapedAt: v.number(),
    status: v.string(), // "success", "failed", "in_progress"
    errorMessage: v.optional(v.string()),
  }).index('by_entity', ['entity']),
});
