'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeroSection,
  AnimatedSection,
  StaggerContainer,
  AnimatedItem,
  GradientText,
  FloatingCard,
  FloatingBadge,
  FloatingAvatar,
  FloatingCursor,
  FeatureCard,
  StatsBar,
} from '@/components/miro';
import { buttonPress } from '@/lib/animations';

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-miro-yellow"
              >
                <span className="text-2xl font-bold text-primary-foreground">U</span>
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                UST Kit
              </h1>
            </Link>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              by <span className="font-semibold text-foreground">Kenjo</span>
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <HeroSection className="pt-16 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative">
            {/* Floating decorations */}
            <div className="absolute -top-8 left-[10%] hidden lg:block">
              <FloatingBadge variant="yellow" delay={0}>
                🎓 For Thomasians
              </FloatingBadge>
            </div>
            <div className="absolute top-20 right-[5%] hidden lg:block">
              <FloatingCard delay={1} className="max-w-[180px]">
                <div className="text-xs text-muted-foreground mb-1">Your GWA</div>
                <div className="text-2xl font-bold text-gradient-yellow">1.45</div>
              </FloatingCard>
            </div>
            <div className="absolute top-48 left-[2%] hidden lg:block">
              <FloatingAvatar name="Juan Cruz" delay={2} />
            </div>
            <div className="absolute bottom-0 right-[15%] hidden lg:block">
              <FloatingCursor name="Maria" color="#4262FF" delay={1.5} />
            </div>

            {/* Hero content */}
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <AnimatedSection animation="fadeInUp">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
                  University of Santo Tomas
                </motion.div>
              </AnimatedSection>

              <AnimatedSection animation="fadeInUp" delay={0.1}>
                <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
                  Your{' '}
                  <GradientText variant="yellow">Academic</GradientText>
                  <br />
                  Companion
                </h2>
              </AnimatedSection>

              <AnimatedSection animation="fadeInUp" delay={0.2}>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Calculate your GWA instantly and sync your class schedule to Google Calendar with ease.
                </p>
              </AnimatedSection>

              <AnimatedSection animation="fadeInUp" delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/gwa">
                    <motion.button
                      variants={buttonPress}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-miro-yellow hover:shadow-lg transition-shadow"
                    >
                      Calculate GWA →
                    </motion.button>
                  </Link>
                  <Link href="/schedule">
                    <motion.button
                      variants={buttonPress}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      className="px-8 py-4 bg-card text-foreground border-2 border-border rounded-xl font-semibold text-lg hover:border-primary/50 hover:shadow-miro transition-all"
                    >
                      Sync Schedule
                    </motion.button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </HeroSection>

      {/* Stats Bar */}
      <AnimatedSection className="border-y border-border bg-muted/30 py-4">
        <div className="mx-auto max-w-5xl px-6">
          <StatsBar
            stats={[
              { value: 100, suffix: '%', label: 'Free to use' },
              { value: 0, suffix: ' logins', label: 'Required' },
              { value: 5, suffix: ' mins', label: 'Setup time' },
            ]}
          />
        </div>
      </AnimatedSection>

      {/* Feature Cards */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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

      {/* Features List */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for students
            </h3>
          </AnimatedSection>

          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <AnimatedItem className="text-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto shadow-miro"
              >
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <h4 className="font-bold text-lg text-foreground">Instant Calculations</h4>
              <p className="text-muted-foreground">
                Get your GWA computed in seconds with the weighted units formula
              </p>
            </AnimatedItem>

            <AnimatedItem className="text-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto shadow-miro"
              >
                <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h4 className="font-bold text-lg text-foreground">OCR Support</h4>
              <p className="text-muted-foreground">
                Upload schedule screenshots and we&apos;ll parse them automatically
              </p>
            </AnimatedItem>

            <AnimatedItem className="text-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 bg-miro-purple/10 rounded-2xl flex items-center justify-center mx-auto shadow-miro"
              >
                <svg className="w-8 h-8 text-miro-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.div>
              <h4 className="font-bold text-lg text-foreground">Privacy First</h4>
              <p className="text-muted-foreground">
                No login required. Your data stays in your browser
              </p>
            </AnimatedItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <AnimatedSection className="text-center space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">U</span>
              </div>
              <span className="font-bold text-foreground">UST Kit</span>
            </motion.div>
            <p className="text-muted-foreground">
              Created with 💛 by <span className="font-semibold text-foreground">Kenjo</span> for UST Students
            </p>
            <p className="text-sm text-muted-foreground">
              University of Santo Tomas • Manila, Philippines
            </p>
          </AnimatedSection>
        </div>
      </footer>
    </div>
  );
}
