import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * UST Kit - Convex Queries
 * Read operations for colleges, courses, and subjects
 */

// Get all colleges
export const getColleges = query({
  handler: async (ctx) => {
    return await ctx.db.query('colleges').order('asc').collect();
  },
});

// Get colleges by category
export const getCollegesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query('colleges')
      .withIndex('by_category', (q) => q.eq('category', category))
      .order('asc')
      .collect();
  },
});

// Get college by code
export const getCollegeByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query('colleges')
      .withIndex('by_code', (q) => q.eq('code', code))
      .first();
  },
});

// Get courses by college
export const getCoursesByCollege = query({
  args: { collegeId: v.id('colleges') },
  handler: async (ctx, { collegeId }) => {
    return await ctx.db
      .query('courses')
      .withIndex('by_college', (q) => q.eq('collegeId', collegeId))
      .order('asc')
      .collect();
  },
});

// Get subjects by course, year, and semester
export const getSubjectsByCurriculum = query({
  args: {
    courseId: v.id('courses'),
    yearLevel: v.number(),
    semester: v.number(),
  },
  handler: async (ctx, { courseId, yearLevel, semester }) => {
    return await ctx.db
      .query('subjects')
      .withIndex('by_curriculum', (q) =>
        q.eq('courseId', courseId).eq('yearLevel', yearLevel).eq('semester', semester)
      )
      .order('asc')
      .collect();
  },
});

// Get all subjects for a course (for complete curriculum view)
export const getAllSubjectsByCourse = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query('subjects')
      .withIndex('by_course', (q) => q.eq('courseId', courseId))
      .order('asc')
      .collect();
  },
});

