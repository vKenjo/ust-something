'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEANS_LIST, SPECIAL_GRADES } from '@/lib/constants';
import { GradeEntry } from '@/lib/gradeCalculator';
import { checkDeansListEligibility, DeansListResult, TermGrades } from '@/lib/deansListCalculator';
import { MiroCard } from '@/components/miro';

interface DeansListCheckerProps {
  initialGrades?: GradeEntry[];
  initialFullLoad?: boolean;
}

export function DeansListChecker({ initialGrades = [], initialFullLoad = true }: DeansListCheckerProps) {
  const [grades] = useState<GradeEntry[]>(initialGrades);
  const [isFullLoad, setIsFullLoad] = useState(initialFullLoad);
  const [result, setResult] = useState<DeansListResult | null>(null);

  const handleCheck = () => {
    const termData: TermGrades = { grades, isFullLoad };
    setResult(checkDeansListEligibility(termData));
  };

  const failures = grades.filter(
    (g) => (typeof g.grade === 'number' && g.grade === 5.0) || g.grade === SPECIAL_GRADES.FA
  ).length;
  const incompletes = grades.filter((g) => g.grade === SPECIAL_GRADES.INC).length;
  const totalUnits = grades.reduce((sum, g) => sum + g.lecUnits + g.labUnits, 0);

  return (
    <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-secondary to-purple-500 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        Dean&apos;s List Eligibility
      </h3>

      <div className="space-y-4">
        {/* Requirements */}
        <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-4">
          <p className="font-semibold text-secondary mb-2.5 text-xs uppercase tracking-wider">Requirements</p>
          <div className="space-y-2">
            {[
              `GWA of at least ${DEANS_LIST.MIN_GWA} for the term`,
              'Enrolled in full load (regular student)',
              'No failures (including PE and NSTP)',
              'No Incomplete (INC) grades',
            ].map((req, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-secondary/70">
                <span className="w-4 h-4 rounded-md bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {req}
              </div>
            ))}
          </div>
        </div>

        {/* Full Load Toggle */}
        <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors group">
          <div className={`relative w-10 h-6 rounded-full transition-colors ${isFullLoad ? 'bg-secondary' : 'bg-gray-300'}`}>
            <motion.div
              animate={{ x: isFullLoad ? 16 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
            />
          </div>
          <input type="checkbox" checked={isFullLoad} onChange={(e) => setIsFullLoad(e.target.checked)} className="sr-only" />
          <span className="text-sm font-medium text-foreground">Full load (regular student)</span>
        </label>

        {/* Grade Summary */}
        {grades.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className={`text-center p-3 rounded-xl border ${failures > 0 ? 'bg-red-50 border-red-200/60' : 'bg-gray-50 border-gray-100'}`}>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Failures</p>
              <p className={`text-lg font-bold tabular-nums ${failures > 0 ? 'text-red-600' : 'text-foreground'}`}>{failures}</p>
            </div>
            <div className={`text-center p-3 rounded-xl border ${incompletes > 0 ? 'bg-amber-50 border-amber-200/60' : 'bg-gray-50 border-gray-100'}`}>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">INC</p>
              <p className={`text-lg font-bold tabular-nums ${incompletes > 0 ? 'text-amber-600' : 'text-foreground'}`}>{incompletes}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Units</p>
              <p className="text-lg font-bold tabular-nums text-foreground">{totalUnits}</p>
            </div>
          </div>
        )}

        {/* Check Button */}
        <motion.button
          whileHover={{ scale: grades.length > 0 ? 1.01 : 1 }}
          whileTap={{ scale: grades.length > 0 ? 0.99 : 1 }}
          onClick={handleCheck}
          disabled={grades.length === 0}
          className="w-full bg-secondary hover:bg-secondary/90 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm disabled:shadow-none text-sm"
        >
          Check Eligibility
        </motion.button>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`rounded-xl p-4 ${
                result.eligible
                  ? 'bg-emerald-50 border border-emerald-200/60'
                  : 'bg-red-50 border border-red-200/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  result.eligible ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {result.eligible ? (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-sm mb-1 ${result.eligible ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result.eligible ? "Eligible for Dean's List!" : 'Not Eligible'}
                  </p>
                  {result.termGWA !== null && (
                    <p className={`text-xs mb-1.5 ${result.eligible ? 'text-emerald-600' : 'text-red-600/80'}`}>
                      Term GWA: <span className="font-bold tabular-nums">{result.termGWA.toFixed(3)}</span>
                    </p>
                  )}
                  {!result.eligible && result.disqualifyingReasons.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {result.disqualifyingReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-muted-foreground">
          Uses GWA from entered grades (excl. PE/NSTP). Ensure all term courses are entered.
        </p>
      </div>
    </MiroCard>
  );
}
