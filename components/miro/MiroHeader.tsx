'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { buttonPress } from '@/lib/animations';

interface NavItem {
  label: string;
  href: string;
}

interface MiroHeaderProps {
  className?: string;
}

const navItems: NavItem[] = [
  { label: 'GWA Calculator', href: '/gwa' },
  { label: 'Schedule', href: '/schedule' },
];

export function MiroHeader({ className }: MiroHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'sticky top-0 z-50',
        'bg-background/80 backdrop-blur-lg',
        'border-b border-border',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-miro-yellow"
            >
              <span className="text-xl font-bold text-primary-foreground">u</span>
            </motion.div>
            <span className="text-xl font-semibold text-foreground group-hover:text-secondary transition-colors" style={{ letterSpacing: '-0.5px' }}>
              uste
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-body text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/gwa">
              <motion.button
                variants={buttonPress}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="px-4 py-2 text-button rounded-lg border border-border hover:border-secondary hover:text-secondary transition-colors"
              >
                Start Free
              </motion.button>
            </Link>
            <Link href="/gwa">
              <motion.button
                variants={buttonPress}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="px-4 py-2 text-button rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                Try Now →
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-body text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                <Link href="/gwa" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full px-4 py-3 text-button rounded-lg bg-secondary text-secondary-foreground">
                    Try Now →
                  </button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
