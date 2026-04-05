'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MiroHeader,
  MiroHero,
  MiroSocialProof,
  MiroTrustBadges,
  MiroFeatureTabs,
  FeatureShowcase,
  MiroFeatureGrid,
  MiroTestimonials,
  MiroFooter,
  AnimatedSection,
  StaggerContainer,
  AnimatedItem,
  FeatureCard,
} from '@/components/miro';
import { buttonPress } from '@/lib/animations';

// Feature tabs data
const featureTabs = [
  {
    id: 'gwa',
    label: 'GWA Calculator',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <FeatureShowcase
        title="Calculate your GWA instantly"
        description="Select your program from the UST curriculum and compute your General Weighted Average using the official 1.0-5.0 grading scale. Check your honors eligibility in real-time."
        features={[
          'Auto-load courses from 94+ UST programs',
          'PE/NSTP excluded from GWA (per UST policy)',
          'Instant honors status (Summa, Magna, Cum Laude)',
          "Dean's List eligibility checker",
        ]}
        color="coral"
      />
    ),
  },
  {
    id: 'schedule',
    label: 'Schedule Sync',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <FeatureShowcase
        title="Sync your schedule to Google Calendar"
        description="Paste your class schedule from the UST portal and export it directly to Google Calendar with recurring events for the entire semester."
        features={[
          'Paste schedule text or upload screenshot',
          'Smart parsing with OCR support',
          'Export to .ics for any calendar app',
          'Automatic recurring events',
        ]}
        color="teal"
      />
    ),
  },
];

// Feature grid data
const featureGridItems = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Calculations',
    description: 'Get your GWA computed in seconds using the weighted units formula',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'OCR Support',
    description: 'Upload schedule screenshots and we\'ll parse them automatically',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Privacy First',
    description: 'No login required. Your data stays in your browser',
  },
];

// Testimonials data
const testimonials = [
  {
    quote: "Finally, a GWA calculator that understands UST's grading system! The honors checker is super helpful.",
    author: 'Maria Santos',
    role: 'BS Psychology',
    company: 'College of Science',
  },
  {
    quote: 'The schedule sync feature saved me hours. Now all my classes are in Google Calendar with reminders.',
    author: 'Juan Cruz',
    role: 'BS Computer Science',
    company: 'College of Information and Computing Sciences',
  },
  {
    quote: "Love that it auto-loads my program's curriculum. No more manual course entry!",
    author: 'Angela Reyes',
    role: 'BS Accountancy',
    company: 'College of Commerce',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MiroHeader />

      {/* Hero Section */}
      <MiroHero />

      {/* Trust badges */}
      <MiroTrustBadges />

      {/* Social proof stats */}
      <MiroSocialProof
        stats={[
          { value: '94+', label: 'UST programs' },
          { value: '100%', label: 'Free to use' },
          { value: '0', label: 'Logins required' },
        ]}
      />

      {/* Feature Cards Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-section-heading font-semibold text-foreground mb-4">
              Everything you need
            </h2>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Simple tools designed specifically for UST students
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <AnimatedItem>
              <Link href="/gwa" className="block h-full">
                <FeatureCard
                  className="h-full cursor-pointer"
                  icon={
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                  title="GWA Calculator"
                  description="Select your program and compute your General Weighted Average using the official UST grading system (1.0-5.0 scale). Check honors eligibility instantly."
                  action={
                    <>
                      <span>Calculate now</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  }
                />
              </Link>
            </AnimatedItem>

            <AnimatedItem>
              <Link href="/schedule" className="block h-full">
                <FeatureCard
                  className="h-full cursor-pointer"
                  icon={
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  title="Schedule to Calendar"
                  description="Upload a screenshot or paste your class schedule, and we'll generate a Google Calendar link with recurring events for the semester."
                  action={
                    <>
                      <span>Create calendar</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  }
                />
              </Link>
            </AnimatedItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Feature Tabs */}
      <MiroFeatureTabs
        title="Experience the Academic Tools"
        subtitle="Powerful features designed to help you succeed"
        tabs={featureTabs}
      />

      {/* Feature Grid */}
      <MiroFeatureGrid
        title="Built for students"
        features={featureGridItems}
      />

      {/* Testimonials */}
      <MiroTestimonials
        title="What students are saying"
        testimonials={testimonials}
      />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <AnimatedSection>
            <h2 className="text-section-heading font-semibold text-foreground mb-6">
              Ready to get started?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Thomasians who use uste to track their academic progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/gwa">
                <motion.button
                  variants={buttonPress}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-button shadow-miro-yellow hover:shadow-lg transition-shadow"
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
                  className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl text-button hover:bg-miro-blue-pressed transition-colors"
                >
                  Sync Schedule
                </motion.button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <MiroFooter />
    </div>
  );
}
