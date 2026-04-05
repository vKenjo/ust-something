'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { countUpConfig } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface StatsCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  label,
  icon,
  className,
}: StatsCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: countUpConfig.duration,
        ease: countUpConfig.ease,
      });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return (
    <div ref={ref} className={cn('text-center', className)}>
      {icon && (
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <div className="text-primary">{icon}</div>
        </div>
      )}
      <motion.div className="text-4xl md:text-5xl font-bold text-gradient-yellow mb-2">
        {rounded}
      </motion.div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

// Horizontal stats bar (like Miro's "100M+ users, 250+ apps")
interface StatsBarProps {
  stats: Array<{
    value: number;
    suffix?: string;
    label: string;
  }>;
  className?: string;
}

export function StatsBar({ stats, className }: StatsBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap justify-center gap-8 md:gap-16 py-8',
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatItem
          key={index}
          value={stat.value}
          suffix={stat.suffix}
          label={stat.label}
          isInView={isInView}
          delay={index * 0.2}
        />
      ))}
    </div>
  );
}

function StatItem({
  value,
  suffix = '',
  label,
  isInView,
  delay,
}: {
  value: number;
  suffix?: string;
  label: string;
  isInView: boolean;
  delay: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Math.round(latest) + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: countUpConfig.duration,
        ease: countUpConfig.ease,
        delay,
      });
      return controls.stop;
    }
  }, [isInView, value, count, delay]);

  return (
    <div className="text-center">
      <motion.div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
        {rounded}
      </motion.div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// Progress ring (for achievements/scores)
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  className,
}: ProgressRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  
  const strokeDashoffset = useMotionValue(circumference);
  
  useEffect(() => {
    if (isInView) {
      const target = circumference - (percentage / 100) * circumference;
      animate(strokeDashoffset, target, {
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      });
    }
  }, [isInView, circumference, percentage, strokeDashoffset]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDB813" />
            <stop offset="100%" stopColor="#4262FF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
