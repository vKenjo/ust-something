'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cardHover, fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface MiroCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  hoverEffect?: boolean;
  className?: string;
}

export function MiroCard({
  children,
  variant = 'default',
  hoverEffect = true,
  className,
  ...props
}: MiroCardProps) {
  const variantClasses = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-miro',
    bordered: 'bg-card border-2 border-primary/20 hover:border-primary/40',
    gradient: 'bg-gradient-to-br from-card to-muted border border-border',
  };

  return (
    <motion.div
      variants={hoverEffect ? cardHover : undefined}
      initial={hoverEffect ? 'rest' : undefined}
      whileHover={hoverEffect ? 'hover' : undefined}
      className={cn(
        'rounded-2xl p-6 transition-colors',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Feature card with icon, title, description
interface FeatureCardProps extends Omit<MiroCardProps, 'children'> {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function FeatureCard({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <MiroCard
      variant="elevated"
      className={cn('group relative overflow-hidden', className)}
      {...props}
    >
      {/* Accent decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
          <div className="text-primary group-hover:text-primary-foreground transition-colors">
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        
        {action && (
          <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
            {action}
          </div>
        )}
      </div>
    </MiroCard>
  );
}

// Stats card for social proof
interface StatsCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ value, label, icon, className }: StatsCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        'text-center p-6 rounded-2xl bg-card shadow-miro',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <div className="text-4xl font-bold text-gradient-yellow mb-2">{value}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </motion.div>
  );
}

// Testimonial card
interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  className,
}: TestimonialCardProps) {
  return (
    <MiroCard variant="elevated" className={cn('relative', className)}>
      <div className="absolute -top-3 -left-2 text-6xl text-primary/20 font-serif">
        &ldquo;
      </div>
      <p className="text-foreground mb-6 relative z-10">{quote}</p>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-foreground">{author}</div>
          {role && <div className="text-sm text-muted-foreground">{role}</div>}
        </div>
      </div>
    </MiroCard>
  );
}
