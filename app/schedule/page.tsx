'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { parseSchedule, type ScheduleEntry } from '@/lib/scheduleParser';
import {
  scheduleToEvents,
  generateAllGoogleCalendarURLs,
  generateICS,
  downloadICS,
  type SemesterType,
} from '@/lib/calendarGenerator';
import {
  HeroSection,
  AnimatedSection,
  MiroCard,
  GradientText,
  FloatingBadge,
  FloatingCard,
} from '@/components/miro';
import { buttonPress } from '@/lib/animations';

type UiSemester = 'FIRST' | 'SECOND' | 'SUMMER';

interface EditableScheduleEntry extends ScheduleEntry {
  id: string;
  color: string;
  reminder: number;
  notes: string;
}

const COLOR_OPTIONS = [
  { value: 'yellow', label: 'UST Yellow', hex: '#FDB813' },
  { value: 'blue', label: 'Blue', hex: '#4262FF' },
  { value: 'green', label: 'Green', hex: '#22C55E' },
  { value: 'purple', label: 'Purple', hex: '#8B5CF6' },
  { value: 'red', label: 'Red', hex: '#EF4444' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'gray', label: 'Gray', hex: '#6B7280' },
] as const;

const REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
] as const;

const COLOR_CATEGORY_MAP: Record<string, string> = {
  yellow: 'UST-Yellow',
  blue: 'UST-Blue',
  green: 'UST-Green',
  purple: 'UST-Purple',
  red: 'UST-Red',
  orange: 'UST-Orange',
  pink: 'UST-Pink',
  gray: 'UST-Gray',
};

function toCalendarSemester(semester: UiSemester): SemesterType {
  switch (semester) {
    case 'FIRST':
      return 'first';
    case 'SECOND':
      return 'second';
    case 'SUMMER':
      return 'summer';
  }
}

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              scale: step === currentStep ? 1.1 : 1,
              backgroundColor: step <= currentStep ? '#FDB813' : '#E5E7EB',
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              step <= currentStep ? 'text-[#050038]' : 'text-muted-foreground'
            }`}
          >
            {step < currentStep ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </motion.div>
          {step < totalSteps && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor: step < currentStep ? '#FDB813' : '#E5E7EB',
              }}
              className="w-12 h-1 rounded-full mx-2"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SchedulePage() {
  const [scheduleText, setScheduleText] = useState('');
  const [semester, setSemester] = useState<UiSemester>('FIRST');
  const [schoolYear, setSchoolYear] = useState(new Date().getFullYear());
  const [editableEntries, setEditableEntries] = useState<EditableScheduleEntry[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessed, setIsProcessed] = useState(false);
  
  // Multi-event Google Calendar state
  const [isAddingToGoogleCalendar, setIsAddingToGoogleCalendar] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);

  const currentStep = isProcessed && editableEntries.length > 0 ? 3 : isProcessed ? 2 : scheduleText.trim() ? 2 : 1;

  const handleParse = () => {
    const parsed = parseSchedule(scheduleText);
    setErrors(parsed.errors);

    if (parsed.entries.length === 0) {
      setEditableEntries([]);
      setIsProcessed(true);
      return;
    }

    const editable = parsed.entries.map((entry, index) => ({
      ...entry,
      id: `entry-${Date.now()}-${index}`,
      color: 'yellow',
      reminder: 15,
      notes: '',
    }));

    setEditableEntries(editable);
    setIsProcessed(true);
  };

  const buildEventsFromEntries = () => {
    const baseEvents = scheduleToEvents(editableEntries, toCalendarSemester(semester), schoolYear);

    return baseEvents.map((event, index) => {
      const source = editableEntries[index];
      if (!source) return event;

      const noteSuffix = source.notes.trim() ? `\n\nNotes: ${source.notes.trim()}` : '';
      return {
        ...event,
        description: `${event.description}${noteSuffix}`,
        categories: [COLOR_CATEGORY_MAP[source.color] ?? COLOR_CATEGORY_MAP.yellow],
      };
    });
  };

  const handleGenerateCalendar = () => {
    const enrichedEvents = buildEventsFromEntries();
    const reminders = editableEntries.map((entry) => entry.reminder);
    const icsContent = generateICS(enrichedEvents, reminders);
    downloadICS(icsContent, `ust-schedule-${semester.toLowerCase()}-${schoolYear}.ics`);
  };

  const handleAddAllToGoogleCalendar = async () => {
    const events = buildEventsFromEntries();
    const urls = generateAllGoogleCalendarURLs(events);
    
    if (urls.length === 0) return;
    
    setIsAddingToGoogleCalendar(true);
    setIsCancelled(false);
    setTotalEvents(urls.length);
    setCurrentEventIndex(0);
    
    for (let i = 0; i < urls.length; i++) {
      if (isCancelled) {
        break;
      }
      
      setCurrentEventIndex(i + 1);
      
      // Open the Google Calendar link in a new tab
      const opened = window.open(urls[i], '_blank');
      
      // Check if popup was blocked
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        alert('Popup blocker detected! Please allow popups for this site to add all events to Google Calendar.');
        break;
      }
      
      // Wait 1 second before opening the next link (except for the last one)
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    
    setIsAddingToGoogleCalendar(false);
    setCurrentEventIndex(0);
    setTotalEvents(0);
  };
  
  const handleCancelGoogleCalendarAdd = () => {
    setIsCancelled(true);
    setIsAddingToGoogleCalendar(false);
    setCurrentEventIndex(0);
    setTotalEvents(0);
  };

  const handleUpdateEntry = (id: string, updates: Partial<EditableScheduleEntry>) => {
    setEditableEntries((previous) =>
      previous.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)),
    );
  };

  const handleDeleteEntry = (id: string) => {
    setEditableEntries((previous) => previous.filter((entry) => entry.id !== id));
  };

  const loadExample = () => {
    const example = `ICS26015\tEMERGING TECHNOLOGIES\t0\t1\t4CSC\tS 10:30am - 01:30pm 19 Flr. Rm. 1901 BLESSED PIER GIORGIO FRASSATI BUILDING
ICS26016\tTECHNOPRENEURSHIP\t3\t0\t4CSC\tW 07:00am - 10:00am 19 Flr. Rm. 1911 BLESSED PIER GIORGIO FRASSATI BUILDING
ICS26017\tSOCIAL AND PROFESSIONAL PRACTICE\t3\t0\t4CSC\tW 11:00am - 02:00pm 19 Flr. Rm. 1909 BLESSED PIER GIORGIO FRASSATI BUILDING
CS 26116\tPRACTICUM (250 HRS)\t0\t4\t4CSC\tRm.
CS ELEC 4C\tDATA MINING\t2\t1\t4CSC\tS 07:00am - 10:00am 19 Flr. Rm. 1901 BLESSED PIER GIORGIO FRASSATI BUILDING
W 04:00pm - 06:00pm 19 Flr. Rm. 1909 BLESSED PIER GIORGIO FRASSATI BUILDING`;

    setScheduleText(example);
  };

  const resetForm = () => {
    setScheduleText('');
    setEditableEntries([]);
    setErrors([]);
    setIsProcessed(false);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-miro-yellow"
              >
                <span className="text-xl font-bold text-primary-foreground">U</span>
              </motion.div>
              <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                UST Kit
              </h1>
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="px-3 py-1.5 text-foreground font-medium">Schedule</span>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <HeroSection className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative text-center">
            {/* Floating decorations */}
            <div className="absolute -top-4 right-[10%] hidden lg:block">
              <FloatingCard delay={0} className="max-w-[140px] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Synced!</span>
                </div>
              </FloatingCard>
            </div>
            <div className="absolute top-20 left-[5%] hidden lg:block">
              <FloatingBadge variant="blue" delay={1}>
                📅 Google Calendar
              </FloatingBadge>
            </div>

            <AnimatedSection>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Convert Your Schedule to{' '}
                <GradientText variant="yellow">Calendar</GradientText>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Paste your class schedule and generate a calendar file for Google Calendar, Apple Calendar, or Outlook.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </HeroSection>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        {/* Step Indicator */}
        <AnimatedSection delay={0.1}>
          <StepIndicator currentStep={currentStep} totalSteps={3} />
        </AnimatedSection>

        {/* Step 1: Paste Schedule */}
        <AnimatedSection delay={0.2}>
          <MiroCard variant="elevated" hoverEffect={false} className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                1
              </span>
              <h2 className="text-xl font-bold text-foreground">Paste Your Schedule</h2>
            </div>

            <div className="relative">
              <textarea
                className="w-full h-48 resize-y rounded-xl border-2 border-border p-4 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-muted/30 transition-all"
                placeholder="Paste your schedule here (tab-separated format from UST portal)..."
                value={scheduleText}
                onChange={(event) => setScheduleText(event.target.value)}
              />
              {scheduleText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 right-3"
                >
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    ✓ Text detected
                  </span>
                </motion.div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <motion.button
                variants={buttonPress}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={loadExample}
                className="px-5 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
              >
                Load Example
              </motion.button>
              <motion.button
                variants={buttonPress}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={resetForm}
                className="px-5 py-2.5 bg-muted/50 text-muted-foreground rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Clear All
              </motion.button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Note:</strong> PRACTICUM, OJT, INTERNSHIP, THESIS, and CAPSTONE entries are automatically filtered out.
            </p>
          </MiroCard>
        </AnimatedSection>

        {/* Step 2: Select Semester */}
        <AnimatedSection delay={0.3}>
          <MiroCard variant="elevated" hoverEffect={false} className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground">
                2
              </span>
              <h2 className="text-xl font-bold text-foreground">Select Semester</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Semester</label>
                <select
                  value={semester}
                  onChange={(event) => setSemester(event.target.value as UiSemester)}
                  className="w-full rounded-xl border-2 border-border px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                >
                  <option value="FIRST">First Semester (Aug-Dec)</option>
                  <option value="SECOND">Second Semester (Jan-May)</option>
                  <option value="SUMMER">Summer (Jun-Jul)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">School Year</label>
                <input
                  type="number"
                  value={schoolYear}
                  onChange={(event) =>
                    setSchoolYear(Number(event.target.value) || new Date().getFullYear())
                  }
                  className="w-full rounded-xl border-2 border-border px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all"
                  min={2020}
                  max={2050}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <motion.button
                variants={buttonPress}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={handleParse}
                disabled={!scheduleText.trim()}
                className="px-10 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-bold shadow-miro-yellow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              >
                Parse Schedule →
              </motion.button>
            </div>
          </MiroCard>
        </AnimatedSection>

        {/* Errors */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <MiroCard variant="bordered" hoverEffect={false} className="bg-destructive/5 border-destructive/20">
                <h3 className="text-lg font-bold text-destructive mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Parsing Errors
                </h3>
                <ul className="list-inside list-disc space-y-1">
                  {errors.map((error) => (
                    <li key={error} className="text-sm text-destructive/80">
                      {error}
                    </li>
                  ))}
                </ul>
              </MiroCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Customize & Export */}
        <AnimatePresence>
          {isProcessed && editableEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MiroCard variant="elevated" hoverEffect={false} className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-sm font-bold text-white">
                    3
                  </span>
                  <h2 className="text-xl font-bold text-foreground">Customize Your Classes</h2>
                  <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                    {editableEntries.length} classes found
                  </span>
                </div>

                <p className="text-muted-foreground mb-6">
                  Edit class names, pick colors, add reminders and notes, then export your calendar file.
                </p>

                <div className="space-y-4">
                  {editableEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl border-2 border-border bg-muted/30 p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Class Name</label>
                          <input
                            type="text"
                            value={entry.subject}
                            onChange={(event) => handleUpdateEntry(entry.id, { subject: event.target.value })}
                            className="w-full rounded-lg border-2 border-border px-4 py-2 outline-none focus:border-primary bg-background transition-colors"
                          />
                        </div>

                        <div className="md:col-span-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-2">
                            <p><strong>Code:</strong> {entry.code ?? 'N/A'}</p>
                            <p><strong>Schedule:</strong> {entry.day} • {entry.startTime} - {entry.endTime}</p>
                            <p><strong>Room:</strong> {entry.room || 'TBA'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Color</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={entry.color}
                              onChange={(event) => handleUpdateEntry(entry.id, { color: event.target.value })}
                              className="flex-1 rounded-lg border-2 border-border px-4 py-2 outline-none focus:border-primary bg-background transition-colors"
                            >
                              {COLOR_OPTIONS.map((color) => (
                                <option key={color.value} value={color.value}>
                                  {color.label}
                                </option>
                              ))}
                            </select>
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                              style={{
                                backgroundColor:
                                  COLOR_OPTIONS.find((color) => color.value === entry.color)?.hex ?? '#FDB813',
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Reminder</label>
                          <select
                            value={entry.reminder}
                            onChange={(event) =>
                              handleUpdateEntry(entry.id, { reminder: Number(event.target.value) })
                            }
                            className="w-full rounded-lg border-2 border-border px-4 py-2 outline-none focus:border-primary bg-background transition-colors"
                          >
                            {REMINDER_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                          <textarea
                            value={entry.notes}
                            onChange={(event) => handleUpdateEntry(entry.id, { notes: event.target.value })}
                            placeholder="Add professor, requirements, or reminders"
                            className="w-full resize-y rounded-lg border-2 border-border px-4 py-2 outline-none focus:border-primary bg-background transition-colors"
                            rows={2}
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                          <motion.button
                            variants={buttonPress}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20 transition-colors"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Export Actions */}
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      variants={buttonPress}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleGenerateCalendar}
                      className="px-8 py-4 bg-green-600 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-green-700 transition-colors"
                    >
                      📥 Download ICS File
                    </motion.button>
                    <motion.button
                      variants={buttonPress}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleAddAllToGoogleCalendar}
                      disabled={isAddingToGoogleCalendar}
                      className={`px-8 py-4 rounded-xl text-lg font-bold shadow-miro-yellow hover:shadow-lg transition-all ${
                        isAddingToGoogleCalendar
                          ? 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      🔗 Add All to Google Calendar
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {isAddingToGoogleCalendar && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-xl"
                      >
                        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-sm text-center">
                          <p className="font-semibold text-foreground mb-2">
                            Opening event {currentEventIndex} of {totalEvents}...
                          </p>
                          <motion.button
                            variants={buttonPress}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleCancelGoogleCalendarAdd}
                            className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20 transition-colors"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    <strong>Recommended:</strong> Download the ICS file for the most reliable way to add all events at once. 
                    The Google Calendar button opens multiple tabs (one per event) with a 1-second delay.
                    <br />
                    <span className="text-xs mt-1 block">
                      💡 Make sure to allow popups for this site if using the Google Calendar option.
                    </span>
                  </p>
                </div>
              </MiroCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results message */}
        <AnimatePresence>
          {isProcessed && editableEntries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <MiroCard variant="bordered" hoverEffect={false} className="bg-amber-50 border-amber-200 text-center py-12">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-amber-800 font-medium">
                  No schedule entries were parsed.
                </p>
                <p className="text-amber-600 text-sm mt-1">
                  Please check your format and try again.
                </p>
              </MiroCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Created with 💛 by <span className="font-semibold text-foreground">Kenjo</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
