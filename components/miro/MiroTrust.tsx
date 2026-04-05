'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeInUp } from '@/lib/animations';

// Company logos for trust section
const companyLogos = [
  { name: 'Company 1', initials: 'C1' },
  { name: 'Company 2', initials: 'C2' },
  { name: 'Company 3', initials: 'C3' },
  { name: 'Company 4', initials: 'C4' },
  { name: 'Company 5', initials: 'C5' },
  { name: 'Company 6', initials: 'C6' },
];

interface MiroTrustBarProps {
  title?: string;
  logos?: Array<{ name: string; initials: string; logo?: string }>;
  className?: string;
}

export function MiroTrustBar({
  title = "Trusted by Thomasians from",
  logos = companyLogos,
  className,
}: MiroTrustBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' as const });

  return (
    <div
      ref={ref}
      className={cn(
        'py-8 border-y border-border bg-muted/30',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-caption text-muted-foreground mb-6">{title}</p>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
          >
            {logos.map((logo, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-center justify-center"
              >
                {logo.logo ? (
                  <img
                    src={logo.logo}
                    alt={logo.name}
                    className="h-8 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  />
                ) : (
                  <div className="h-8 px-4 flex items-center justify-center rounded bg-muted text-muted-foreground text-small font-medium opacity-60 hover:opacity-100 transition-opacity">
                    {logo.initials}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Trust badges section (enterprise-style)
interface TrustBadge {
  icon: React.ReactNode;
  label: string;
}

interface MiroTrustBadgesProps {
  badges?: TrustBadge[];
  className?: string;
}

const defaultBadges: TrustBadge[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    label: 'No login required',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Data stays in browser',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'Instant calculations',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: '100% Free',
  },
];

export function MiroTrustBadges({
  badges = defaultBadges,
  className,
}: MiroTrustBadgesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' as const });

  return (
    <div ref={ref} className={cn('py-6', className)}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="flex flex-wrap justify-center items-center gap-6 md:gap-10"
      >
        {badges.map((badge, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="text-miro-success">{badge.icon}</div>
            <span className="text-caption">{badge.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// Social proof stats row
interface StatItem {
  value: string;
  label: string;
}

interface MiroSocialProofProps {
  stats?: StatItem[];
  className?: string;
}

const defaultStats: StatItem[] = [
  { value: '100%', label: 'Free to use' },
  { value: '0', label: 'Logins required' },
  { value: '5 min', label: 'Setup time' },
];

export function MiroSocialProof({
  stats = defaultStats,
  className,
}: MiroSocialProofProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' as const });

  return (
    <div
      ref={ref}
      className={cn(
        'py-6 border-y border-border bg-muted/20',
        className
      )}
    >
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex justify-center items-center divide-x divide-border"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="px-8 md:px-12 text-center first:pl-0 last:pr-0"
            >
              <div className="text-card-title md:text-section-heading font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-small text-muted-foreground mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
