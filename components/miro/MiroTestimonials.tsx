'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  company?: string;
  companyLogo?: string;
}

interface MiroTestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials: Testimonial[];
  className?: string;
}

export function MiroTestimonials({
  title = "What students are saying",
  subtitle,
  testimonials,
  className,
}: MiroTestimonialsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' as const });

  return (
    <section ref={ref} className={cn('py-24 bg-muted/20', className)}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-section-heading font-semibold text-foreground mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  company,
  companyLogo,
}: Testimonial) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl p-6 shadow-miro hover:shadow-miro-elevated transition-all"
    >
      {/* Quote */}
      <div className="relative mb-6">
        <div className="absolute -top-2 -left-1 text-4xl text-primary/30 font-serif">
          &ldquo;
        </div>
        <p className="text-body text-foreground pt-4 pl-4">
          {quote}
        </p>
      </div>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {author.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="text-body font-semibold text-foreground">{author}</div>
          {(role || company) && (
            <div className="text-caption text-muted-foreground">
              {role}{role && company && ' · '}{company}
            </div>
          )}
        </div>
        {companyLogo && (
          <img
            src={companyLogo}
            alt={company}
            className="h-6 opacity-60"
          />
        )}
      </div>
    </motion.div>
  );
}

// Featured testimonial (larger, single quote)
interface FeaturedTestimonialProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  image?: string;
  className?: string;
}

export function FeaturedTestimonial({
  quote,
  author,
  role,
  avatar,
  image,
  className,
}: FeaturedTestimonialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' as const });

  return (
    <section ref={ref} className={cn('py-24', className)}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="relative bg-card rounded-3xl shadow-miro-elevated overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Image side */}
            {image && (
              <div className="relative aspect-[4/3] md:aspect-auto bg-miro-teal">
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Quote side */}
            <div className={cn(
              'p-8 md:p-12 flex flex-col justify-center',
              !image && 'md:col-span-2 text-center max-w-3xl mx-auto'
            )}>
              <div className="text-primary text-6xl font-serif mb-4">&ldquo;</div>
              <blockquote className="text-sub-heading text-foreground mb-8">
                {quote}
              </blockquote>
              
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={author}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {author.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-feature font-semibold text-foreground">{author}</div>
                  {role && (
                    <div className="text-body text-muted-foreground">{role}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
