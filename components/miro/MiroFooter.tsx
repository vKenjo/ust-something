'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface MiroFooterProps {
  columns?: FooterColumn[];
  className?: string;
}

const defaultColumns: FooterColumn[] = [
  {
    title: 'Tools',
    links: [
      { label: 'GWA Calculator', href: '/gwa' },
      { label: 'Schedule Sync', href: '/schedule' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'How to Use', href: '#' },
      { label: 'UST Grading System', href: '#' },
      { label: 'Calendar Tips', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'Report Issue', href: '#' },
      { label: 'Feedback', href: '#' },
    ],
  },
];

const socialLinks = [
  {
    name: 'GitHub',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function MiroFooter({ columns = defaultColumns, className }: MiroFooterProps) {
  return (
    <footer className={cn('border-t border-border bg-muted/20', className)}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-miro-yellow"
                >
                  <span className="text-xl font-bold text-primary-foreground">u</span>
                </motion.div>
                <span className="text-xl font-semibold text-foreground" style={{ letterSpacing: '-0.5px' }}>
                  uste
                </span>
              </Link>
              <p className="text-body text-muted-foreground max-w-xs mb-6">
                Your academic companion for GWA calculation and schedule management. Built for Thomasians.
              </p>
              
              {/* Social links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Link columns */}
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-button font-semibold text-foreground mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-body text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-caption text-muted-foreground">
              © {new Date().getFullYear()} uste. Created with 💛 by{' '}
              <span className="font-semibold text-foreground">Kenjo</span>{' '}
              for UST Students
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-caption text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-caption text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Minimal footer variant
interface MinimalFooterProps {
  className?: string;
}

export function MinimalFooter({ className }: MinimalFooterProps) {
  return (
    <footer className={cn('border-t border-border', className)}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">u</span>
            </div>
            <span className="font-semibold text-foreground">uste</span>
          </Link>
          
          <p className="text-caption text-muted-foreground text-center">
            Created with 💛 by <span className="font-semibold text-foreground">Kenjo</span> for UST Students
          </p>
          
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
