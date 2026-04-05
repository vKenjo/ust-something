'use client';

import { motion } from 'framer-motion';
import { HonorsProgram, HonorsLevel, HONORS_THRESHOLDS } from '@/lib/constants';
import { HonorsResult, formatHonorsLevel, getDistanceToNextLevel } from '@/lib/honorsCalculator';
import { MiroCard } from '@/components/miro';

interface HonorsDisplayProps {
  result: HonorsResult;
  program: HonorsProgram;
}

export function HonorsDisplay({ result, program }: HonorsDisplayProps) {
  const { eligible, level, gwa, disqualifyingReasons } = result;
  const distance = gwa ? getDistanceToNextLevel(gwa, program) : null;

  const getHonorsBadgeStyle = (honorsLevel: HonorsLevel | null): string => {
    switch (honorsLevel) {
      case 'SUMMA_CUM_LAUDE':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-miro-yellow';
      case 'MAGNA_CUM_LAUDE':
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 shadow-miro';
      case 'CUM_LAUDE':
        return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-miro';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const programName = HONORS_THRESHOLDS[program].name;

  return (
    <MiroCard variant="elevated" hoverEffect={false} className="!rounded-2xl">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </span>
        Honors Eligibility
      </h3>

      <div className="space-y-4">
        {/* Program Type */}
        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Program Type</p>
          <p className="font-semibold text-foreground text-sm">{programName}</p>
        </div>

        {/* GWA Display */}
        {gwa !== null && (
          <div className="text-center py-5 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl border border-gray-100">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              {program === 'MEDICINE' ? 'GPA' : 'GWA'}
            </p>
            <motion.p
              key={gwa}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-4xl font-black text-gradient-yellow tabular-nums"
            >
              {program === 'MEDICINE' ? gwa.toFixed(2) : gwa.toFixed(3)}
            </motion.p>
          </div>
        )}

        {/* Honors Badge */}
        {eligible && level && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Honors Level</p>
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm ${getHonorsBadgeStyle(level)}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {formatHonorsLevel(level)}
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Range: {HONORS_THRESHOLDS[program][level].min.toFixed(3)} –{' '}
              {HONORS_THRESHOLDS[program][level].max.toFixed(3)}
            </div>
          </motion.div>
        )}

        {/* Not Eligible */}
        {!eligible && (
          <div className="bg-red-50 border border-red-200/60 rounded-xl p-4">
            <p className="font-semibold text-red-700 mb-2 text-sm">Not Eligible for Honors</p>
            <ul className="space-y-1.5">
              {disqualifyingReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-red-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Distance to Next Level */}
        {distance && distance.nextLevel && (
          <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-4">
            <p className="font-semibold text-secondary text-sm mb-1">
              {distance.currentLevel
                ? `Next: ${formatHonorsLevel(distance.nextLevel)}`
                : `Reach ${formatHonorsLevel(distance.nextLevel)}`}
            </p>
            <p className="text-xs text-secondary/70">
              Need{' '}
              <span className="font-bold text-secondary">
                {distance.pointsNeeded?.toFixed(3)} points
              </span>
              {' '}improvement
            </p>
            <p className="text-[10px] text-secondary/50 mt-1">
              Target: {HONORS_THRESHOLDS[program][distance.nextLevel].max.toFixed(3)} or better
            </p>
          </div>
        )}

        {/* Medicine Note */}
        {program === 'MEDICINE' && (
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
            <p className="text-xs text-foreground/70">
              <span className="font-semibold">Note:</span> Final grade = 80% GPA (Years 1-3) + 20% Oral Revalida. This shows GPA-based eligibility only.
            </p>
          </div>
        )}

        {/* Thresholds Reference */}
        <details className="text-sm group">
          <summary className="cursor-pointer text-muted-foreground font-semibold text-xs hover:text-foreground transition-colors flex items-center gap-2 py-1">
            <motion.svg
              className="w-3.5 h-3.5"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </motion.svg>
            View All Honors Thresholds
          </summary>
          <div className="mt-2 space-y-1.5 pl-5 pt-2 border-l-2 border-gray-200">
            {Object.entries(HONORS_THRESHOLDS[program])
              .filter(([key]) => key !== 'name' && key !== 'usesGWAScale' && key !== 'note')
              .map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{value.label}</span>
                  <span className="font-mono text-foreground font-medium tabular-nums">
                    {value.min.toFixed(3)} – {value.max.toFixed(3)}
                  </span>
                </div>
              ))}
          </div>
        </details>
      </div>
    </MiroCard>
  );
}
