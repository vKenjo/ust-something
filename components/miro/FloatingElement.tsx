'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { Easing } from 'framer-motion';

interface FloatingElementProps extends Omit<HTMLMotionProps<'div'>, 'animate'> {
  children: React.ReactNode;
  delay?: number;
  withRotation?: boolean;
  amplitude?: 'small' | 'medium' | 'large';
}

export function FloatingElement({
  children,
  delay = 0,
  withRotation = false,
  amplitude = 'medium',
  className = '',
  ...props
}: FloatingElementProps) {
  const amplitudeValues = {
    small: [-5, 5, -5],
    medium: [-10, 10, -10],
    large: [-15, 15, -15],
  };

  const customFloat = {
    y: amplitudeValues[amplitude],
    rotate: withRotation ? [-2, 2, -2] : 0,
    transition: {
      duration: 5 + delay,
      repeat: Infinity,
      ease: 'easeInOut' as Easing,
      delay: delay * 0.5,
    },
  };

  return (
    <motion.div
      initial={{ y: 0, rotate: 0 }}
      animate={customFloat}
      className={`${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Pre-styled floating decorations
export function FloatingCard({
  children,
  className = '',
  ...props
}: Omit<FloatingElementProps, 'children'> & { children?: React.ReactNode }) {
  return (
    <FloatingElement
      className={`rounded-2xl bg-card shadow-miro p-4 ${className}`}
      withRotation
      {...props}
    >
      {children}
    </FloatingElement>
  );
}

export function FloatingBadge({
  children,
  className = '',
  variant = 'yellow',
  ...props
}: Omit<FloatingElementProps, 'children'> & {
  children?: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'purple';
}) {
  const variantClasses = {
    yellow: 'bg-primary text-primary-foreground',
    blue: 'bg-secondary text-secondary-foreground',
    purple: 'bg-miro-purple text-white',
  };

  return (
    <FloatingElement
      amplitude="small"
      className={`rounded-full px-4 py-2 text-sm font-medium shadow-md ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </FloatingElement>
  );
}

export function FloatingAvatar({
  src,
  name,
  className = '',
  size = 'md',
  ...props
}: Omit<FloatingElementProps, 'children'> & {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <FloatingElement amplitude="small" withRotation className={className} {...props}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-md`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-md`}
        >
          {initials}
        </div>
      )}
    </FloatingElement>
  );
}

export function FloatingCursor({
  name,
  color = '#FDB813',
  className = '',
  ...props
}: Omit<FloatingElementProps, 'children'> & {
  name: string;
  color?: string;
}) {
  return (
    <FloatingElement amplitude="small" className={className} {...props}>
      <div className="flex items-start gap-1">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={color}
          className="drop-shadow-md"
        >
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z" />
        </svg>
        <span
          className="rounded-md px-2 py-0.5 text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          {name}
        </span>
      </div>
    </FloatingElement>
  );
}
