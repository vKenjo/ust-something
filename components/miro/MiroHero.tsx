'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonPress, fadeInUp } from '@/lib/animations';
import { FloatingCard, FloatingBadge, FloatingAvatar, FloatingCursor } from './FloatingElement';
import { GradientText } from './GradientText';

interface MiroHeroProps {
  title?: React.ReactNode;
  subtitle?: string;
  badge?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function MiroHero({
  title,
  subtitle = "Calculate your GWA instantly and sync your class schedule to Google Calendar with ease.",
  badge = "🎓 For Thomasians",
  primaryCta = { label: "Calculate GWA →", href: "/gwa" },
  secondaryCta = { label: "Sync Schedule", href: "/schedule" },
  className,
}: MiroHeroProps) {
  return (
    <section className={cn('relative overflow-hidden pt-16 pb-24', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5 pointer-events-none" />
      
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                            linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/8 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="relative">
          {/* Floating decorations - hidden on mobile */}
          <div className="absolute -top-8 left-[10%] hidden lg:block">
            <FloatingBadge variant="yellow" delay={0}>
              {badge}
            </FloatingBadge>
          </div>
          
          <div className="absolute top-20 right-[5%] hidden lg:block">
            <FloatingCard delay={1} className="max-w-[180px]">
              <div className="text-small text-muted-foreground mb-1">Your GWA</div>
              <div className="text-card-title font-bold text-gradient-yellow">1.45</div>
            </FloatingCard>
          </div>
          
          <div className="absolute top-48 left-[2%] hidden lg:block">
            <FloatingAvatar name="Juan Cruz" delay={2} />
          </div>
          
          <div className="absolute bottom-0 right-[15%] hidden lg:block">
            <FloatingCursor name="Maria" color="#5b76fe" delay={1.5} />
          </div>

          {/* Hero content */}
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-caption font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-soft" />
              University of Santo Tomas
            </motion.div>

            {/* Title */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              {title || (
                <h1 className="text-display-hero md:text-[64px] font-semibold text-foreground leading-tight">
                  Your{' '}
                  <GradientText variant="yellow">Academic</GradientText>
                  <br />
                  Companion
                </h1>
              )}
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="text-sub-heading text-muted-foreground max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href={primaryCta.href}>
                <motion.button
                  variants={buttonPress}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-button shadow-miro-yellow hover:shadow-lg transition-shadow"
                >
                  {primaryCta.label}
                </motion.button>
              </Link>
              <Link href={secondaryCta.href}>
                <motion.button
                  variants={buttonPress}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 bg-card text-foreground border border-border rounded-xl text-button hover:border-secondary hover:text-secondary transition-all shadow-miro"
                >
                  {secondaryCta.label}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Collaborative canvas hero variant (more Miro-like)
interface CanvasHeroProps {
  className?: string;
}

export function CanvasHero({ className }: CanvasHeroProps) {
  return (
    <section className={cn('relative overflow-hidden bg-background', className)}>
      {/* Canvas-style background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)
            `,
            backgroundSize: '24px 24px',
          }}
        />
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-miro-teal text-miro-teal-dark rounded-full text-small font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free for UST students
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-section-heading md:text-display-hero font-semibold text-foreground"
            >
              Get from{' '}
              <GradientText variant="blue">schedule</GradientText>
              {' '}to{' '}
              <GradientText variant="yellow">success</GradientText>
              {' '}with uste
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-body-lg text-muted-foreground max-w-lg"
            >
              Tools that help you track your GWA, organize your schedule, and stay on top of your academic journey.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/gwa">
                <motion.button
                  variants={buttonPress}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg text-button hover:bg-miro-blue-pressed transition-colors"
                >
                  Calculate GWA Free →
                </motion.button>
              </Link>
              <Link href="/schedule">
                <motion.button
                  variants={buttonPress}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="px-6 py-3 bg-background text-foreground border border-border rounded-lg text-button hover:border-secondary transition-colors shadow-miro"
                >
                  Sync Schedule
                </motion.button>
              </Link>
            </motion.div>
          </div>
          
          {/* Visual canvas preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl bg-card shadow-miro-elevated overflow-hidden">
              {/* Mock canvas content */}
              <div className="absolute inset-4 grid grid-cols-3 gap-3">
                <div className="col-span-2 row-span-2 rounded-xl bg-miro-coral-light p-4">
                  <div className="text-small font-medium text-miro-coral-dark mb-2">GWA Tracker</div>
                  <div className="text-section-heading font-bold text-foreground">1.45</div>
                </div>
                <div className="rounded-xl bg-miro-teal p-3">
                  <div className="text-micro text-miro-teal-dark">Units</div>
                  <div className="text-card-title font-bold text-foreground">21</div>
                </div>
                <div className="rounded-xl bg-miro-orange-light p-3">
                  <div className="text-micro text-foreground/70">Honors</div>
                  <div className="text-caption font-semibold text-foreground">Magna ✨</div>
                </div>
                <div className="col-span-3 rounded-xl bg-miro-rose-light p-3">
                  <div className="text-small font-medium text-foreground/80">Schedule synced to Google Calendar</div>
                </div>
              </div>
              
              {/* Floating cursor */}
              <div className="absolute bottom-6 right-6">
                <FloatingCursor name="You" color="#FDB813" delay={0} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
