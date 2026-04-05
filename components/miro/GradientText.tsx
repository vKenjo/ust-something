'use client';

import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'purple' | 'rainbow';
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

const gradients = {
  yellow: 'from-[#FDB813] via-[#FFE066] to-[#FDB813]',
  blue: 'from-[#4262FF] via-[#6B8AFF] to-[#8B5CF6]',
  purple: 'from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD]',
  rainbow: 'from-[#FDB813] via-[#4262FF] to-[#8B5CF6]',
};

export function GradientText({
  children,
  variant = 'yellow',
  className,
  as: Component = 'span',
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradients[variant],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Highlighted text with background
interface HighlightTextProps {
  children: React.ReactNode;
  color?: 'yellow' | 'blue' | 'purple';
  className?: string;
}

const highlightColors = {
  yellow: 'bg-primary/20 text-primary-foreground',
  blue: 'bg-secondary/20 text-secondary',
  purple: 'bg-miro-purple/20 text-miro-purple',
};

export function HighlightText({
  children,
  color = 'yellow',
  className,
}: HighlightTextProps) {
  return (
    <span
      className={cn(
        'rounded-md px-2 py-0.5 font-medium',
        highlightColors[color],
        className
      )}
    >
      {children}
    </span>
  );
}

// Underline text with animated gradient
export function UnderlineText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'relative inline-block',
        className
      )}
    >
      {children}
      <span className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-primary via-secondary to-miro-purple rounded-full" />
    </span>
  );
}
