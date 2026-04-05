import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * UST Kit - Convex Mutations
 * Write operations for seeding scraped data
 */

// Add or update a college
export const upsertCollege = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    yearEstablished: v.optional(v.number()),
    gradingSystem: v.string(),
  },
  handler: async (ctx, { code, name, description, category, yearEstablished, gradingSystem }) => {
    const existing = await ctx.db
      .query('colleges')
      .withIndex('by_code', (q) => q.eq('code', code))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        description,
        category,
        yearEstablished,
        gradingSystem,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert('colleges', {
        code,
        name,
        description,
        category,
        yearEstablished,
        gradingSystem,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Add or update a course
export const upsertCourse = mutation({
  args: {
    collegeId: v.id('colleges'),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    yearLevels: v.number(),
  },
  handler: async (ctx, { collegeId, code, name, description, yearLevels }) => {
    const existing = await ctx.db
      .query('courses')
      .withIndex('by_code', (q) => q.eq('code', code))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        collegeId,
        name,
        description,
        yearLevels,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert('courses', {
        collegeId,
        code,
        name,
        description,
        yearLevels,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Add or update a subject
export const upsertSubject = mutation({
  args: {
    courseId: v.id('courses'),
    yearLevel: v.number(),
    semester: v.number(),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    lecUnits: v.number(),
    labUnits: v.number(),
  },
  handler: async (ctx, args) => {
    const { courseId, yearLevel, semester, code, name, description, lecUnits, labUnits } = args;

    const existing = await ctx.db
      .query('subjects')
      .withIndex('by_code', (q) => q.eq('code', code))
      .filter((q) =>
        q.and(
          q.eq(q.field('courseId'), courseId),
          q.eq(q.field('yearLevel'), yearLevel),
          q.eq(q.field('semester'), semester)
        )
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        description,
        lecUnits,
        labUnits,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert('subjects', {
        courseId,
        yearLevel,
        semester,
        code,
        name,
        description,
        lecUnits,
        labUnits,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Update scrape metadata
export const updateScrapeMetadata = mutation({
  args: {
    entity: v.string(),
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { entity, status, errorMessage }) => {
    const existing = await ctx.db
      .query('scrapeMetadata')
      .withIndex('by_entity', (q) => q.eq('entity', entity))
      .first();

    const data = {
      entity,
      lastScrapedAt: Date.now(),
      status,
      errorMessage,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert('scrapeMetadata', data);
    }
  },
});
