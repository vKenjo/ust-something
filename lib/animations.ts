'use client';

import type { Variants, Transition } from 'framer-motion';

// Shared spring transition for natural feel
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export const smoothTransition: Transition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const quickTransition: Transition = {
  duration: 0.3,
  ease: 'easeOut',
};

// Fade in from bottom (for sections)
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

// Fade in from right
export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

// Simple fade
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
};

// Scale in (for cards, buttons)
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

// Pop in (more dramatic scale)
export const popIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

// Staggered container for child animations
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Faster stagger for lists
export const staggerContainerFast: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Float animation (for decorative elements)
export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Float with rotation
export const floatRotate: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-8, 8, -8],
    rotate: [-3, 3, -3],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Hover scale effect
export const hoverScale = {
  scale: 1.02,
  transition: quickTransition,
};

// Hover lift effect (scale + shadow implied)
export const hoverLift = {
  scale: 1.03,
  y: -4,
  transition: quickTransition,
};

// Tap effect
export const tapScale = {
  scale: 0.98,
};

// Card hover animation
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 20px -4px rgba(5, 0, 56, 0.1)',
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 8px 40px -8px rgba(5, 0, 56, 0.15)',
    transition: quickTransition,
  },
};

// Button press animation
export const buttonPress: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Slide in from side (for modals, drawers)
export const slideInFromRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: quickTransition,
  },
};

// Blur fade in (premium feel)
export const blurFadeIn: Variants = {
  hidden: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// Count up animation helper (for stats)
export const countUpConfig = {
  duration: 2,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

// Viewport config for useInView
export const viewportConfig = {
  once: true,
  margin: '-100px' as const,
};

// Reduce motion check helper
export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Get variants respecting reduced motion
export function getMotionVariants<T extends Variants>(variants: T): T | Record<string, object> {
  if (prefersReducedMotion) {
    return {
      hidden: {},
      visible: {},
    } as Record<string, object>;
  }
  return variants;
}
