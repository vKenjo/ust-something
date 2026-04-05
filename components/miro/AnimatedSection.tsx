'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  fadeIn,
  scaleIn,
  staggerContainer,
  viewportConfig,
} from '@/lib/animations';
import { cn } from '@/lib/utils';

type AnimationType = 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'scaleIn';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main';
}

const animationVariants = {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  fadeIn,
  scaleIn,
};

export function AnimatedSection({
  children,
  animation = 'fadeInUp',
  delay = 0,
  className,
  as = 'div',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, viewportConfig);

  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={ref}
      variants={animationVariants[animation]}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'ul' | 'ol';
}

export function StaggerContainer({
  children,
  className,
  as = 'div',
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, viewportConfig);

  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </Component>
  );
}

// Animated item for use inside StaggerContainer
interface AnimatedItemProps {
  children: React.ReactNode;
  animation?: AnimationType;
  className?: string;
}

export function AnimatedItem({
  children,
  animation = 'fadeInUp',
  className,
}: AnimatedItemProps) {
  return (
    <motion.div variants={animationVariants[animation]} className={className}>
      {children}
    </motion.div>
  );
}

// Hero section wrapper with background effects
interface HeroSectionProps {
  children: React.ReactNode;
  className?: string;
  withGradient?: boolean;
  withGrid?: boolean;
}

export function HeroSection({
  children,
  className,
  withGradient = true,
  withGrid = true,
}: HeroSectionProps) {
  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Background gradient */}
      {withGradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      )}
      
      {/* Grid pattern */}
      {withGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--miro-navy) 1px, transparent 1px),
                              linear-gradient(90deg, var(--miro-navy) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}
      
      {/* Glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">{children}</div>
    </section>
  );
}

// Page wrapper with consistent layout
interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <main className={cn('min-h-screen bg-background', className)}>
      {children}
    </main>
  );
}
