'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getColleges,
  getProgramsByCollege,
  getYearLevels,
  getCoursesForSemester,
  hasData,
  getProgram,
} from '@/lib/data/curricula';
import type { Course } from '@/lib/data/types';
import type { CollegeInfo } from '@/lib/collegeMapping';
import { MiroCard } from '@/components/miro';

export interface ProgramSelection {
  programSlug: string;
  programName: string;
  year: number;
  semester: 'first' | 'second' | 'summer';
  courses: Course[];
}

interface ProgramSelectorProps {
  onCoursesSelected: (courses: Course[]) => void;
  onProgramSelected?: (selection: ProgramSelection) => void;
}

type SemesterTerm = 'first' | 'second' | 'summer';

export function ProgramSelector({ onCoursesSelected, onProgramSelected }: ProgramSelectorProps) {
  const [college, setCollege] = useState<string>('');
  const [programSlug, setProgramSlug] = useState<string>('');
  const [year, setYear] = useState<number>(0);
  const [semester, setSemester] = useState<SemesterTerm | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadedInfo, setLoadedInfo] = useState<{ programName: string; year: number; semester: string } | null>(null);

  const colleges = useMemo(() => getColleges(), []);

  const programs = useMemo(() => {
    if (!college) return [];
    return getProgramsByCollege(college);
  }, [college]);

  const yearLevels = useMemo(() => {
    if (!programSlug) return [];
    return getYearLevels(programSlug);
  }, [programSlug]);

  const semesters = useMemo((): SemesterTerm[] => {
    if (!programSlug || !year) return [];
    const program = getProgram(programSlug);
    if (!program) return [];
    const yearLevel = program.curriculum.find((y) => y.year === year);
    if (!yearLevel) return [];
    return yearLevel.semesters.map((s) => s.term);
  }, [programSlug, year]);

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setProgramSlug('');
    setYear(0);
    setSemester('');
    setLoadedInfo(null);
  };

  const handleProgramChange = (value: string) => {
    setProgramSlug(value);
    setYear(0);
    setSemester('');
    setLoadedInfo(null);
  };

  const handleYearChange = (value: number) => {
    setYear(value);
    setSemester('');
    setLoadedInfo(null);
  };

  const handleLoadCourses = () => {
    if (!programSlug || !year || !semester) return;
    setIsLoading(true);
    setTimeout(() => {
      const courses = getCoursesForSemester(programSlug, year, semester);
      const program = getProgram(programSlug);
      onCoursesSelected(courses);
      onProgramSelected?.({
        programSlug,
        programName: program?.name || programSlug,
        year,
        semester: semester as SemesterTerm,
        courses,
      });
      setLoadedInfo({
        programName: program?.name || programSlug,
        year,
        semester: semester.charAt(0).toUpperCase() + semester.slice(1),
      });
      setIsLoading(false);
    }, 300);
  };

  const canLoad = college && programSlug && year && semester;
  const dataAvailable = hasData();

  const formatSemester = (term: SemesterTerm): string => {
    switch (term) {
      case 'first': return 'First Semester';
      case 'second': return 'Second Semester';
      case 'summer': return 'Summer Term';
    }
  };

  const formatCollegeLabel = (info: CollegeInfo): string => {
    return `${info.name} (${info.shortName})`;
  };

  // Progress indicator
  const completedSteps = [college, programSlug, year, semester].filter(Boolean).length;

  const selectClasses = "w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none transition-all cursor-pointer hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200";

  return (
    <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
          <span className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </span>
          Quick Load from Curriculum
        </h3>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((step) => (
            <motion.div
              key={step}
              animate={{
                scale: step < completedSteps ? 1 : 0.8,
                backgroundColor: step < completedSteps ? '#4262FF' : '#E5E7EB',
              }}
              className="w-2 h-2 rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          ))}
        </div>
      </div>

      {!dataAvailable ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm font-medium mb-1">Curriculum data not available</p>
          <p className="text-xs text-muted-foreground">Run the scraper to auto-load UST program courses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Select your college and program to auto-populate courses from the UST curriculum.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">College / Faculty</label>
              <select value={college} onChange={(e) => handleCollegeChange(e.target.value)} className={selectClasses}>
                <option value="">Select college...</option>
                {colleges.map((c) => (
                  <option key={c.shortName} value={c.name}>{formatCollegeLabel(c)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">Program</label>
              <select value={programSlug} onChange={(e) => handleProgramChange(e.target.value)} disabled={!college} className={selectClasses}>
                <option value="">{college ? 'Select program...' : 'Select college first'}</option>
                {programs.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">Year Level</label>
              <select value={year || ''} onChange={(e) => handleYearChange(Number(e.target.value))} disabled={!programSlug} className={selectClasses}>
                <option value="">{programSlug ? 'Select year...' : 'Select program first'}</option>
                {yearLevels.map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">Semester</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value as SemesterTerm | '')} disabled={!year} className={selectClasses}>
                <option value="">{year ? 'Select semester...' : 'Select year first'}</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>{formatSemester(s)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Load Button */}
          <div className="flex items-center gap-4 pt-1">
            <motion.button
              whileHover={{ scale: canLoad && !isLoading ? 1.02 : 1 }}
              whileTap={{ scale: canLoad && !isLoading ? 0.98 : 1 }}
              onClick={handleLoadCourses}
              disabled={!canLoad || isLoading}
              className="px-6 py-2.5 bg-secondary text-white rounded-xl shadow-sm hover:shadow-miro text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Load Courses
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {loadedInfo && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  className="flex items-center gap-2 text-xs text-secondary bg-secondary/5 px-3 py-1.5 rounded-full"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="font-medium">
                    {loadedInfo.programName} — Year {loadedInfo.year}, {loadedInfo.semester}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </MiroCard>
  );
}
