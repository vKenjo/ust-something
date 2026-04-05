'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HonorsProgram, COURSE_TYPES } from '@/lib/constants';
import { GradeEntry, calculateGWAWithBreakdown } from '@/lib/gradeCalculator';
import { calculateHonorsEligibility } from '@/lib/honorsCalculator';
import { HonorsDisplay } from '@/components/HonorsDisplay';
import { DeansListChecker } from '@/components/DeansListChecker';
import { ProgramSelector, type ProgramSelection } from '@/components/ProgramSelector';
import {
  AnimatedSection,
  MiroCard,
  GradientText,
} from '@/components/miro';
import {
  predictRequiredGrades,
  calculateGWARange,
  getAchievableHonors,
  type CourseGrade,
} from '@/lib/gwaPredictor';
import { getSemestersUpTo } from '@/lib/data/curricula';
import type { Course } from '@/lib/data/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CalculationMode = 'semester' | 'cumulative' | 'prediction';

interface ExtendedGradeEntry extends GradeEntry {
  isFromCurriculum?: boolean;
}

interface SemesterBlock {
  year: number;
  term: 'first' | 'second' | 'summer';
  label: string;
  grades: ExtendedGradeEntry[];
}

// UST grade scale steps
const GRADE_STEPS: number[] = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];

function snapToNearestGrade(value: number): number {
  if (value >= 4.0) return 5.0;
  let closest = GRADE_STEPS[0];
  let minDiff = Math.abs(value - closest);
  for (const step of GRADE_STEPS) {
    const diff = Math.abs(value - step);
    if (diff < minDiff) {
      minDiff = diff;
      closest = step;
    }
  }
  return closest;
}

function formatTermLabel(year: number, term: string): string {
  const termNames: Record<string, string> = { first: '1st Sem', second: '2nd Sem', summer: 'Summer' };
  return `Year ${year} - ${termNames[term] || term}`;
}

function coursesToGradeEntries(courses: Course[]): ExtendedGradeEntry[] {
  return courses.map((c) => ({
    grade: 1.0,
    lecUnits: c.lecUnits,
    labUnits: c.labUnits,
    courseType: c.courseType || COURSE_TYPES.ACADEMIC,
    courseCode: c.code,
    courseName: c.name,
    isFromCurriculum: true,
  }));
}

function getGradeColor(grade: number): string {
  if (grade <= 1.25) return 'text-emerald-600';
  if (grade <= 1.75) return 'text-blue-600';
  if (grade <= 2.5) return 'text-amber-600';
  if (grade <= 3.0) return 'text-orange-600';
  return 'text-red-600';
}

function getGWAQualityLabel(gwa: number): { label: string; color: string } {
  if (gwa <= 1.2) return { label: 'Excellent', color: 'text-emerald-600' };
  if (gwa <= 1.5) return { label: 'Very Good', color: 'text-emerald-500' };
  if (gwa <= 1.75) return { label: 'Good', color: 'text-blue-600' };
  if (gwa <= 2.25) return { label: 'Satisfactory', color: 'text-amber-600' };
  if (gwa <= 3.0) return { label: 'Passing', color: 'text-orange-600' };
  return { label: 'Below Passing', color: 'text-red-600' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Grade Row - polished, Miro-inspired
// ─────────────────────────────────────────────────────────────────────────────

function GradeRow({
  grade,
  onUpdate,
  onRemove,
  showLock,
  isLocked,
  onToggleLock,
  requiredGrade,
}: {
  grade: ExtendedGradeEntry;
  onUpdate: <K extends keyof ExtendedGradeEntry>(field: K, value: ExtendedGradeEntry[K]) => void;
  onRemove: () => void;
  showLock?: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
  requiredGrade?: number | null;
}) {
  const isPeNstp = grade.courseType === COURSE_TYPES.PE || grade.courseType === COURSE_TYPES.NSTP;
  const totalUnits = grade.lecUnits + grade.labUnits;
  const numericGrade = typeof grade.grade === 'number' ? grade.grade : null;

  const stepDown = () => {
    if (numericGrade === null) return;
    const idx = GRADE_STEPS.indexOf(numericGrade);
    if (idx > 0) onUpdate('grade', GRADE_STEPS[idx - 1]);
    else if (idx === -1) onUpdate('grade', snapToNearestGrade(numericGrade - 0.25));
  };

  const stepUp = () => {
    if (numericGrade === null) return;
    const idx = GRADE_STEPS.indexOf(numericGrade);
    if (idx >= 0 && idx < GRADE_STEPS.length - 1) onUpdate('grade', GRADE_STEPS[idx + 1]);
    else if (idx === -1) onUpdate('grade', snapToNearestGrade(numericGrade + 0.25));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      className={`group flex items-center gap-2 md:gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 ${
        isPeNstp ? 'bg-orange-50/60 border border-orange-200/40' :
        isLocked ? 'bg-purple-50/60 border border-purple-200/50 ring-1 ring-purple-200/30' :
        'bg-white border border-gray-100 hover:border-primary/30 hover:shadow-sm'
      }`}
    >
      {/* Lock toggle */}
      {showLock && (
        <button
          onClick={onToggleLock}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
            isLocked
              ? 'bg-purple-100 text-purple-600 shadow-sm'
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
          title={isLocked ? 'Grade is locked (known)' : 'Click to lock this grade'}
        >
          {isLocked ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          )}
        </button>
      )}

      {/* Course code */}
      <input
        type="text"
        placeholder="Code"
        value={grade.courseCode || ''}
        onChange={(e) => onUpdate('courseCode', e.target.value)}
        className="w-20 md:w-24 flex-shrink-0 px-2 py-1 border border-transparent rounded-lg bg-transparent text-sm font-mono font-medium focus:border-primary/40 focus:bg-primary/5 outline-none transition-all"
      />

      {/* Course name */}
      <span className="flex-1 text-sm text-muted-foreground truncate min-w-0">
        {grade.courseName || '—'}
      </span>

      {/* Grade stepper */}
      <div className="flex items-center gap-0 flex-shrink-0">
        <button
          onClick={stepDown}
          disabled={numericGrade === null || numericGrade <= 1.0}
          className="w-7 h-8 rounded-l-lg bg-gray-50 border border-gray-200 border-r-0 text-gray-500 hover:bg-gray-100 hover:text-foreground disabled:opacity-25 text-xs font-bold transition-all active:scale-95"
        >
          −
        </button>
        <input
          type="number"
          step="0.25"
          min="1.0"
          max="5.0"
          value={numericGrade !== null ? numericGrade : ''}
          onChange={(e) => {
            const val = Number.parseFloat(e.target.value);
            if (!Number.isNaN(val)) onUpdate('grade', snapToNearestGrade(val));
          }}
          className={`w-14 text-center py-1.5 border border-gray-200 bg-white text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all tabular-nums ${
            numericGrade !== null ? getGradeColor(numericGrade) : ''
          }`}
        />
        <button
          onClick={stepUp}
          disabled={numericGrade === null || numericGrade >= 5.0}
          className="w-7 h-8 rounded-r-lg bg-gray-50 border border-gray-200 border-l-0 text-gray-500 hover:bg-gray-100 hover:text-foreground disabled:opacity-25 text-xs font-bold transition-all active:scale-95"
        >
          +
        </button>
      </div>

      {/* Required grade hint (prediction) */}
      {requiredGrade != null && !isLocked && (
        <span className="flex-shrink-0 text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg hidden md:inline-flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {requiredGrade.toFixed(2)}
        </span>
      )}

      {/* Units */}
      <span className="flex-shrink-0 w-10 text-center text-xs text-muted-foreground tabular-nums font-medium bg-gray-50 rounded-md py-1">
        {totalUnits}u
      </span>

      {/* Type badge */}
      {isPeNstp && (
        <span className="flex-shrink-0 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
          {grade.courseType === COURSE_TYPES.PE ? 'PE' : 'NSTP'}
        </span>
      )}

      {/* Remove */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 w-6 h-6 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grade Table
// ─────────────────────────────────────────────────────────────────────────────

function GradeTable({
  grades,
  onUpdateGrade,
  onRemoveGrade,
  onAddGrade,
  showLock,
  lockedIndices,
  onToggleLock,
  predictionResult,
  emptyMessage,
}: {
  grades: ExtendedGradeEntry[];
  onUpdateGrade: <K extends keyof ExtendedGradeEntry>(index: number, field: K, value: ExtendedGradeEntry[K]) => void;
  onRemoveGrade: (index: number) => void;
  onAddGrade?: () => void;
  showLock?: boolean;
  lockedIndices?: Set<number>;
  onToggleLock?: (index: number) => void;
  predictionResult?: ReturnType<typeof predictRequiredGrades> | null;
  emptyMessage?: string;
}) {
  return (
    <div>
      {grades.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm font-medium">{emptyMessage || 'No courses yet.'}</p>
          <p className="text-xs text-muted-foreground mt-1">Use Quick Load above or add courses manually</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-1.5">
            {grades.map((grade, index) => (
              <GradeRow
                key={`${grade.courseCode}-${index}`}
                grade={grade}
                onUpdate={(field, value) => onUpdateGrade(index, field, value)}
                onRemove={() => onRemoveGrade(index)}
                showLock={showLock}
                isLocked={lockedIndices?.has(index)}
                onToggleLock={() => onToggleLock?.(index)}
                requiredGrade={
                  predictionResult?.possible
                    ? predictionResult.requiredGrades.get(grade.courseCode || `Course ${index + 1}`) ?? null
                    : null
                }
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {onAddGrade && (
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          onClick={onAddGrade}
          className="mt-3 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-muted-foreground hover:text-secondary hover:border-secondary/40 hover:bg-secondary/5 transition-all font-medium"
        >
          + Add course manually
        </motion.button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cumulative Semester Block (collapsible)
// ─────────────────────────────────────────────────────────────────────────────

const SEMESTER_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200/60', header: 'bg-blue-50/80', accent: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  { bg: 'bg-purple-50', border: 'border-purple-200/60', header: 'bg-purple-50/80', accent: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200/60', header: 'bg-emerald-50/80', accent: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { bg: 'bg-amber-50', border: 'border-amber-200/60', header: 'bg-amber-50/80', accent: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  { bg: 'bg-rose-50', border: 'border-rose-200/60', header: 'bg-rose-50/80', accent: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200/60', header: 'bg-cyan-50/80', accent: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
];

function SemesterBlockUI({
  block,
  onUpdateGrade,
  onRemoveGrade,
  isExpanded,
  onToggle,
  colorIndex,
}: {
  block: SemesterBlock;
  onUpdateGrade: (courseIndex: number, field: keyof ExtendedGradeEntry, value: ExtendedGradeEntry[keyof ExtendedGradeEntry]) => void;
  onRemoveGrade: (courseIndex: number) => void;
  isExpanded: boolean;
  onToggle: () => void;
  colorIndex: number;
}) {
  const breakdown = useMemo(() => calculateGWAWithBreakdown(block.grades), [block.grades]);
  const colors = SEMESTER_COLORS[colorIndex % SEMESTER_COLORS.length];

  return (
    <motion.div
      layout
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${colors.border} ${isExpanded ? 'shadow-sm' : ''}`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 transition-all duration-200 ${colors.header} hover:brightness-[0.98]`}
      >
        <div className="flex items-center gap-3">
          <motion.svg
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className={`w-4 h-4 ${colors.accent}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </motion.svg>
          <span className="text-sm font-semibold text-foreground">{block.label}</span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
            {block.grades.length} courses
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold tabular-nums ${
            breakdown.gwa !== null ? getGradeColor(breakdown.gwa) : 'text-muted-foreground'
          }`}>
            {breakdown.gwa !== null ? breakdown.gwa.toFixed(3) : '—'}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium tabular-nums">{breakdown.academicUnits}u</span>
        </div>
      </button>

      {/* Courses */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-1.5 border-t border-gray-100 bg-white/80">
              {block.grades.map((grade, i) => (
                <GradeRow
                  key={`${grade.courseCode}-${i}`}
                  grade={grade}
                  onUpdate={(field, value) => onUpdateGrade(i, field, value)}
                  onRemove={() => onRemoveGrade(i)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode Selector with icons
// ─────────────────────────────────────────────────────────────────────────────

function ModeSelector({ mode, onChange }: { mode: CalculationMode; onChange: (m: CalculationMode) => void }) {
  const modes: { key: CalculationMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'semester', label: 'This Semester', desc: 'Single semester GWA',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    },
    {
      key: 'cumulative', label: 'Cumulative', desc: 'Track all semesters',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
    },
    {
      key: 'prediction', label: 'Prediction', desc: 'What grades do I need?',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100/80 rounded-2xl backdrop-blur-sm">
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`relative px-3 py-3 rounded-xl transition-all duration-300 text-center ${
            mode === m.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {mode === m.key && (
            <motion.div
              layoutId="mode-indicator"
              className="absolute inset-0 bg-white rounded-xl shadow-miro"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <span className={`transition-colors ${mode === m.key ? 'text-primary' : ''}`}>{m.icon}</span>
            <div className="text-sm font-semibold">{m.label}</div>
            <div className="text-[10px] text-muted-foreground hidden md:block leading-tight">{m.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GWA Result Display - hero style
// ─────────────────────────────────────────────────────────────────────────────

function GWAResultCard({
  breakdown,
  mode,
  semesterCount,
}: {
  breakdown: ReturnType<typeof calculateGWAWithBreakdown>;
  mode: CalculationMode;
  semesterCount?: number;
}) {
  if (breakdown.totalCourses === 0) return null;

  const quality = breakdown.gwa !== null ? getGWAQualityLabel(breakdown.gwa) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden"
    >
      <div className="rounded-3xl bg-gradient-to-br from-[#050038] to-[#1a1060] p-6 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                {mode === 'cumulative' ? 'Cumulative GWA' : 'Semester GWA'}
              </p>
              <p className="text-white/40 text-[10px] mt-0.5">Excludes PE/NSTP</p>
            </div>
            {quality && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white/90"
              >
                {quality.label}
              </motion.span>
            )}
          </div>

          <motion.div
            key={breakdown.gwa}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="mb-4"
          >
            <span className="text-5xl md:text-6xl font-black tabular-nums text-gradient-yellow inline-block">
              {breakdown.gwa !== null ? breakdown.gwa.toFixed(3) : 'N/A'}
            </span>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Courses</p>
              <p className="text-lg font-bold text-white tabular-nums mt-0.5">{breakdown.academicCount}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Units</p>
              <p className="text-lg font-bold text-white tabular-nums mt-0.5">{breakdown.academicUnits}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                {mode === 'cumulative' ? 'Semesters' : 'PE/NSTP'}
              </p>
              <p className="text-lg font-bold text-white tabular-nums mt-0.5">
                {mode === 'cumulative' ? (semesterCount || 0) : breakdown.peNstpCount}
              </p>
            </div>
          </div>

          {/* Warnings */}
          {(breakdown.hasFailures || breakdown.hasIncomplete) && (
            <div className="mt-3 space-y-2">
              {breakdown.hasFailures && (
                <div className="flex items-center gap-2 p-2.5 bg-red-500/15 rounded-xl text-xs text-red-300 font-medium">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Contains failing grades (5.0)
                </div>
              )}
              {breakdown.hasIncomplete && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-500/15 rounded-xl text-xs text-amber-300 font-medium">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Contains incomplete grades
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function GWACalculator() {
  const [selectedProgram, setSelectedProgram] = useState<HonorsProgram>('UNDERGRADUATE');
  const [mode, setMode] = useState<CalculationMode>('semester');

  // ─── Semester mode state ───
  const [grades, setGrades] = useState<ExtendedGradeEntry[]>([]);

  // ─── Cumulative mode state ───
  const [semesterBlocks, setSemesterBlocks] = useState<SemesterBlock[]>([]);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<string>>(new Set());

  // ─── Prediction mode state ───
  const [targetGWA, setTargetGWA] = useState<string>('1.75');
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());
  const [predSubMode, setPredSubMode] = useState<'target' | 'honors'>('target');

  // Honors projection
  const [honorsGWA, setHonorsGWA] = useState<string>('');
  const [honorsUnits, setHonorsUnits] = useState<string>('');
  const [remainingSemesters, setRemainingSemesters] = useState<string>('4');
  const [avgUnitsPerSem, setAvgUnitsPerSem] = useState<string>('21');

  // ─── Grade management ───

  const handleCoursesSelected = useCallback((courses: Course[]) => {
    const entries = coursesToGradeEntries(courses);
    setGrades(entries);
    setLockedIndices(new Set());
  }, []);

  const handleProgramSelected = useCallback((selection: ProgramSelection) => {
    if (mode !== 'cumulative') return;

    const allSemesters = getSemestersUpTo(selection.programSlug, selection.year, selection.semester);

    const blocks: SemesterBlock[] = allSemesters.map((sem) => ({
      year: sem.year,
      term: sem.term,
      label: formatTermLabel(sem.year, sem.term),
      grades: coursesToGradeEntries(sem.courses),
    }));
    setSemesterBlocks(blocks);

    if (blocks.length > 0) {
      const lastKey = `${blocks[blocks.length - 1].year}-${blocks[blocks.length - 1].term}`;
      setExpandedSemesters(new Set([lastKey]));
    }
  }, [mode]);

  const addGrade = useCallback(() => {
    setGrades((prev) => [
      ...prev,
      { grade: 1.0, lecUnits: 3, labUnits: 0, courseType: COURSE_TYPES.ACADEMIC, courseCode: '', courseName: '', isFromCurriculum: false },
    ]);
  }, []);

  const removeGrade = useCallback((index: number) => {
    setGrades((prev) => prev.filter((_, i) => i !== index));
    setLockedIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i < index) next.add(i); else if (i > index) next.add(i - 1); });
      return next;
    });
  }, []);

  const updateGrade = useCallback(<K extends keyof ExtendedGradeEntry>(index: number, field: K, value: ExtendedGradeEntry[K]) => {
    setGrades((prev) => { const next = [...prev]; next[index] = { ...next[index], [field]: value }; return next; });
  }, []);

  const toggleLock = useCallback((index: number) => {
    setLockedIndices((prev) => { const next = new Set(prev); if (next.has(index)) next.delete(index); else next.add(index); return next; });
  }, []);

  // ─── Cumulative grade management ───

  const updateSemesterGrade = useCallback((semIndex: number, courseIndex: number, field: keyof ExtendedGradeEntry, value: ExtendedGradeEntry[keyof ExtendedGradeEntry]) => {
    setSemesterBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[semIndex], grades: [...next[semIndex].grades] };
      block.grades[courseIndex] = { ...block.grades[courseIndex], [field]: value };
      next[semIndex] = block;
      return next;
    });
  }, []);

  const removeSemesterGrade = useCallback((semIndex: number, courseIndex: number) => {
    setSemesterBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[semIndex], grades: next[semIndex].grades.filter((_, i) => i !== courseIndex) };
      next[semIndex] = block;
      return next;
    });
  }, []);

  const toggleSemesterExpanded = useCallback((key: string) => {
    setExpandedSemesters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // ─── Calculations ───

  const gwaBreakdown = useMemo(() => calculateGWAWithBreakdown(grades), [grades]);
  const honorsResult = useMemo(
    () => calculateHonorsEligibility(gwaBreakdown.gwa, grades, selectedProgram),
    [gwaBreakdown.gwa, grades, selectedProgram]
  );

  const allCumulativeGrades = useMemo(() => semesterBlocks.flatMap((b) => b.grades), [semesterBlocks]);
  const cumulativeBreakdown = useMemo(() => calculateGWAWithBreakdown(allCumulativeGrades), [allCumulativeGrades]);
  const cumulativeHonorsResult = useMemo(
    () => calculateHonorsEligibility(cumulativeBreakdown.gwa, allCumulativeGrades, selectedProgram),
    [cumulativeBreakdown.gwa, allCumulativeGrades, selectedProgram]
  );

  const activeGrades = mode === 'cumulative' ? allCumulativeGrades : grades;
  const activeBreakdown = mode === 'cumulative' ? cumulativeBreakdown : gwaBreakdown;
  const activeHonors = mode === 'cumulative' ? cumulativeHonorsResult : honorsResult;

  // Prediction
  const courseGrades: CourseGrade[] = useMemo(() => {
    if (mode !== 'prediction') return [];
    return grades
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => typeof g.grade === 'number' && g.courseType !== COURSE_TYPES.PE && g.courseType !== COURSE_TYPES.NSTP)
      .map(({ g, i }) => ({
        code: g.courseCode || `Course ${i + 1}`,
        grade: g.grade as number,
        units: g.lecUnits + g.labUnits,
        isLocked: lockedIndices.has(i),
      }));
  }, [mode, grades, lockedIndices]);

  const predictionResult = useMemo(() => {
    if (mode !== 'prediction' || predSubMode !== 'target') return null;
    const target = Number.parseFloat(targetGWA);
    if (Number.isNaN(target) || target < 1 || target > 3 || courseGrades.length === 0) return null;
    return predictRequiredGrades(target, courseGrades);
  }, [mode, predSubMode, targetGWA, courseGrades]);

  const gwaRange = useMemo(() => {
    if (mode !== 'prediction' || courseGrades.length === 0) return null;
    return calculateGWARange(courseGrades);
  }, [mode, courseGrades]);

  const honorsProjection = useMemo(() => {
    if (mode !== 'prediction' || predSubMode !== 'honors') return null;
    const gwa = Number.parseFloat(honorsGWA);
    const units = Number.parseFloat(honorsUnits);
    const sems = Number.parseInt(remainingSemesters, 10);
    const avgUnits = Number.parseInt(avgUnitsPerSem, 10);
    if (Number.isNaN(gwa) || Number.isNaN(units) || Number.isNaN(sems) || Number.isNaN(avgUnits)) return null;
    if (gwa < 1 || gwa > 5 || units <= 0 || sems <= 0 || avgUnits <= 0) return null;
    return getAchievableHonors(gwa, units, sems, avgUnits, selectedProgram);
  }, [mode, predSubMode, honorsGWA, honorsUnits, remainingSemesters, avgUnitsPerSem, selectedProgram]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div whileHover={{ scale: 1.05, rotate: -5 }} whileTap={{ scale: 0.95 }} className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-miro-yellow">
                <span className="text-lg font-black text-primary-foreground">U</span>
              </motion.div>
              <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">UST Kit</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-all">Home</Link>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="px-3 py-1.5 rounded-lg text-foreground font-medium bg-primary/5">GWA Calculator</span>
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Header */}
        <AnimatedSection className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-2 tracking-tight">
                <GradientText variant="yellow">GWA</GradientText> Calculator
              </h2>
              <p className="text-muted-foreground text-sm">Calculate, track, and predict your General Weighted Average.</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Mode Selector */}
        <AnimatedSection delay={0.05} className="mb-8">
          <ModeSelector mode={mode} onChange={setMode} />
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Program Type */}
            <AnimatedSection delay={0.1}>
              <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">1</span>
                  Program Type
                </h3>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value as HonorsProgram)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium cursor-pointer hover:border-gray-300"
                >
                  <option value="UNDERGRADUATE">Baccalaureate (Undergraduate)</option>
                  <option value="LAW">Faculty of Civil Law</option>
                  <option value="MEDICINE">Faculty of Medicine & Surgery</option>
                  <option value="GRADUATE">Graduate Programs</option>
                </select>
              </MiroCard>
            </AnimatedSection>

            {/* Load Curriculum */}
            <AnimatedSection delay={0.15}>
              <ProgramSelector
                onCoursesSelected={handleCoursesSelected}
                onProgramSelected={handleProgramSelected}
              />
              {mode === 'cumulative' && (
                <div className="mt-2 px-1 flex items-center gap-2 text-xs text-secondary">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  Loading will preload all previous semesters with courses ready for grade entry.
                </div>
              )}
            </AnimatedSection>

            {/* ── SEMESTER MODE ── */}
            {mode === 'semester' && (
              <AnimatedSection delay={0.2}>
                <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">2</span>
                    Your Grades
                    {grades.length > 0 && (
                      <span className="text-xs text-muted-foreground font-normal ml-auto">{grades.length} courses</span>
                    )}
                  </h3>
                  <GradeTable
                    grades={grades}
                    onUpdateGrade={updateGrade}
                    onRemoveGrade={removeGrade}
                    onAddGrade={addGrade}
                    emptyMessage="No courses loaded yet."
                  />
                </MiroCard>
              </AnimatedSection>
            )}

            {/* ── CUMULATIVE MODE ── */}
            {mode === 'cumulative' && (
              <AnimatedSection delay={0.2}>
                <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center text-xs font-black text-secondary">2</span>
                    Grades per Semester
                    {semesterBlocks.length > 0 && (
                      <span className="text-xs text-muted-foreground font-normal ml-auto">
                        {semesterBlocks.length} {semesterBlocks.length === 1 ? 'block' : 'semesters'}
                      </span>
                    )}
                  </h3>

                  {semesterBlocks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">No semesters loaded yet</p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Select your program and semester above, then click <span className="font-semibold text-secondary">Load Courses</span> to preload all previous semesters.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {semesterBlocks.map((block, semIndex) => {
                        const key = `${block.year}-${block.term}`;
                        return (
                          <SemesterBlockUI
                            key={key}
                            block={block}
                            isExpanded={expandedSemesters.has(key)}
                            onToggle={() => toggleSemesterExpanded(key)}
                            onUpdateGrade={(ci, field, value) => updateSemesterGrade(semIndex, ci, field, value)}
                            onRemoveGrade={(ci) => removeSemesterGrade(semIndex, ci)}
                            colorIndex={semIndex}
                          />
                        );
                      })}

                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => setExpandedSemesters(new Set(semesterBlocks.map((b) => `${b.year}-${b.term}`)))}
                          className="text-xs text-secondary hover:text-secondary/80 font-medium transition-colors"
                        >
                          Expand all
                        </button>
                        <span className="text-xs text-gray-300">|</span>
                        <button
                          onClick={() => setExpandedSemesters(new Set())}
                          className="text-xs text-secondary hover:text-secondary/80 font-medium transition-colors"
                        >
                          Collapse all
                        </button>
                      </div>
                    </div>
                  )}
                </MiroCard>
              </AnimatedSection>
            )}

            {/* ── PREDICTION MODE ── */}
            {mode === 'prediction' && (
              <>
                <AnimatedSection delay={0.18}>
                  <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-xs font-black text-purple-600">P</span>
                      Prediction Settings
                    </h3>

                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100/80 rounded-xl mb-4">
                      <button
                        onClick={() => setPredSubMode('target')}
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${predSubMode === 'target' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >Target GWA</button>
                      <button
                        onClick={() => setPredSubMode('honors')}
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${predSubMode === 'honors' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >Honors Projection</button>
                    </div>

                    {predSubMode === 'target' && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">Lock the grades you already know, and the predictor shows what you need on the rest.</p>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">Target GWA</label>
                          <input type="number" step="0.25" min="1.0" max="3.0" value={targetGWA} onChange={(e) => setTargetGWA(e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-sm font-semibold focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all" />
                        </div>
                        {gwaRange && (
                          <div className="p-3 bg-purple-50 rounded-xl text-xs flex justify-between items-center">
                            <span className="text-purple-600/70 font-medium">Possible range</span>
                            <span className="font-bold tabular-nums text-purple-700">{gwaRange.max.toFixed(2)} — {gwaRange.min.toFixed(2)}</span>
                          </div>
                        )}
                        {predictionResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-xl border text-xs font-medium ${predictionResult.possible ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700' : 'bg-red-50 border-red-200/60 text-red-700'}`}
                          >
                            {predictionResult.message}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {predSubMode === 'honors' && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">Enter your current standing to see which honors levels are still achievable.</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Current GWA', value: honorsGWA, onChange: setHonorsGWA, placeholder: 'e.g. 1.45', step: '0.01', min: '1.0', max: '5.0' },
                            { label: 'Units Earned', value: honorsUnits, onChange: setHonorsUnits, placeholder: 'e.g. 72', min: '0' },
                            { label: 'Semesters Left', value: remainingSemesters, onChange: setRemainingSemesters, min: '1', max: '12' },
                            { label: 'Avg Units/Sem', value: avgUnitsPerSem, onChange: setAvgUnitsPerSem, min: '1' },
                          ].map((field) => (
                            <div key={field.label}>
                              <label className="text-[10px] text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">{field.label}</label>
                              <input
                                type="number"
                                step={field.step}
                                min={field.min}
                                max={field.max}
                                placeholder={field.placeholder}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>
                        {honorsProjection && (
                          <div className="space-y-2 mt-2">
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-3 rounded-xl border text-sm font-semibold ${honorsProjection.bestAchievable ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700' : 'bg-amber-50 border-amber-200/60 text-amber-700'}`}
                            >
                              {honorsProjection.bestAchievable ? `Best achievable: ${honorsProjection.bestAchievable.replace(/_/g, ' ')}` : 'No honors level is currently achievable'}
                            </motion.div>
                            {([
                              { key: 'summa' as const, label: 'Summa Cum Laude' },
                              { key: 'magna' as const, label: 'Magna Cum Laude' },
                              { key: 'cum' as const, label: 'Cum Laude' },
                            ]).map(({ key, label }) => {
                              const result = honorsProjection[key];
                              return (
                                <div key={key} className={`p-3 rounded-xl border text-xs transition-all ${result.achievable ? 'bg-emerald-50/50 border-emerald-200/40' : 'bg-gray-50 border-gray-200/60'}`}>
                                  <div className="flex justify-between items-center">
                                    <span className={`font-semibold ${result.achievable ? 'text-emerald-700' : 'text-muted-foreground'}`}>{label}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${result.achievable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                      {result.achievable ? 'Achievable' : 'Not achievable'}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground mt-1 leading-relaxed">{result.message}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </MiroCard>
                </AnimatedSection>

                {/* Prediction grade table */}
                <AnimatedSection delay={0.2}>
                  <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">2</span>
                      {predSubMode === 'target' ? 'Your Courses (lock known grades)' : 'Your Grades'}
                      {grades.length > 0 && (
                        <span className="text-xs text-muted-foreground font-normal ml-auto">{grades.length} courses</span>
                      )}
                    </h3>
                    <GradeTable
                      grades={grades}
                      onUpdateGrade={updateGrade}
                      onRemoveGrade={removeGrade}
                      onAddGrade={addGrade}
                      showLock={predSubMode === 'target'}
                      lockedIndices={lockedIndices}
                      onToggleLock={toggleLock}
                      predictionResult={predictionResult}
                      emptyMessage="No courses loaded yet."
                    />
                  </MiroCard>
                </AnimatedSection>
              </>
            )}

            {/* GWA Result */}
            <AnimatePresence>
              {activeBreakdown.totalCourses > 0 && (
                <GWAResultCard
                  breakdown={activeBreakdown}
                  mode={mode}
                  semesterCount={mode === 'cumulative' ? semesterBlocks.length : undefined}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - sticky */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <AnimatedSection animation="fadeInRight" delay={0.3}>
              {activeBreakdown.gwa !== null && (
                <HonorsDisplay result={activeHonors} program={selectedProgram} />
              )}
            </AnimatedSection>
            <AnimatedSection animation="fadeInRight" delay={0.4}>
              <DeansListChecker initialGrades={activeGrades} initialFullLoad={true} />
            </AnimatedSection>
          </div>
        </div>

        {/* Policy Note */}
        <AnimatedSection delay={0.5} className="mt-12">
          <div className="rounded-2xl bg-gradient-to-r from-secondary/5 to-primary/5 border border-secondary/10 p-6">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              UST Policy Notes
            </h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                <span>PE and NSTP courses are excluded from GWA calculation per UST policy</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                <span>INC or failures in PE/NSTP disqualify from honors eligibility</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                <span>Theology courses are included in GWA calculation</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                <span>Grade scale: 1.00 (Excellent) to 3.00 (Passed), 0.25 increments</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <footer className="border-t border-gray-200/60 mt-16 bg-white/50">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Created with care by <span className="font-bold text-foreground">Kenjo</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
