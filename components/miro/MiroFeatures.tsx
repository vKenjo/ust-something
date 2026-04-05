'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  color?: string;
}

interface MiroFeatureTabsProps {
  title?: string;
  subtitle?: string;
  tabs: Tab[];
  className?: string;
}

export function MiroFeatureTabs({
  title = "Experience the Academic Tools",
  subtitle,
  tabs,
  className,
}: MiroFeatureTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' as const });

  const activeContent = tabs.find(t => t.id === activeTab);

  return (
    <section ref={ref} className={cn('py-24 bg-muted/20', className)}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
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

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-6 py-3 rounded-xl text-button transition-all duration-200',
                'flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-secondary text-secondary-foreground shadow-miro-elevated'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted shadow-miro'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {activeContent?.content}
        </motion.div>
      </div>
    </section>
  );
}

// Feature showcase card (for use inside tabs)
interface FeatureShowcaseProps {
  image?: string;
  title: string;
  description: string;
  features?: string[];
  color?: 'coral' | 'teal' | 'rose' | 'orange' | 'pink';
  className?: string;
}

export function FeatureShowcase({
  image,
  title,
  description,
  features = [],
  color = 'teal',
  className,
}: FeatureShowcaseProps) {
  const colorClasses = {
    coral: 'bg-miro-coral',
    teal: 'bg-miro-teal',
    rose: 'bg-miro-rose',
    orange: 'bg-miro-orange',
    pink: 'bg-miro-pink',
  };

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden shadow-miro-elevated bg-card',
      className
    )}>
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image/Visual side */}
        <div className={cn(
          'aspect-[4/3] md:aspect-auto relative',
          colorClasses[color]
        )}>
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-foreground/30 text-display-hero">
                📊
              </div>
            </div>
          )}
        </div>
        
        {/* Content side */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-card-title font-semibold text-foreground mb-4">
            {title}
          </h3>
          <p className="text-body text-muted-foreground mb-6">
            {description}
          </p>
          
          {features.length > 0 && (
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-miro-success flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-body text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple feature grid for alternative layout
interface FeatureGridItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface MiroFeatureGridProps {
  title?: string;
  subtitle?: string;
  features: FeatureGridItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MiroFeatureGrid({
  title,
  subtitle,
  features,
  columns = 3,
  className,
}: MiroFeatureGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' as const });

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section ref={ref} className={cn('py-24', className)}>
      <div className="mx-auto max-w-7xl px-6">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            {title && (
              <h2 className="text-section-heading font-semibold text-foreground mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={cn('grid gap-8', gridCols[columns])}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 5 : -5 }}
                className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto shadow-miro"
              >
                <div className="text-secondary">{feature.icon}</div>
              </motion.div>
              <h3 className="text-feature font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-body text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
