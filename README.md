# UST Kit

> Your Academic Companion for University of Santo Tomas Students

A modern web application that helps UST students calculate their General Weighted Average (GWA), check academic honors eligibility, and manage their academic performance according to official UST policies.

**Created by Kenjo**

## 🌟 Features

### 1. GWA Calculator (Enhanced)
- **Accurate Grade Scale**: Updated to match UST's official 5-point grading system
  - 1.00 = 96-100% (Excellent)
  - 1.25 = 94-95% (Very Good)
  - 1.50 = 92-93% (Very Good)
  - ... and all other grade mappings per UST Student Handbook
- **PE/NSTP Handling**: Automatically excludes PE and NSTP courses from GWA calculation per policy
- **Course Type Classification**: Mark courses as Academic, Theology, PE, or NSTP
- **Special Grades Support**: Handle INC, INP, FA, WP, WF grades
- **Real-time Breakdown**: See academic vs. non-academic course separation
- **Formula**: `GWA = Σ(Grade × Units) / Σ(Units)` (excluding PE/NSTP)

### 2. Academic Honors Calculator
Calculate eligibility for Latin honors with program-specific thresholds:

#### Undergraduate Programs
- **Summa Cum Laude**: 1.000 - 1.200
- **Magna Cum Laude**: 1.201 - 1.450
- **Cum Laude**: 1.451 - 1.750

#### Faculty of Civil Law
- **Summa Cum Laude**: 1.000 - 1.509 (92% and above)
- **Magna Cum Laude**: 1.510 - 1.859 (88.5-91.9%)
- **Cum Laude**: 1.860 - 2.100 (86-88.4%)

#### Faculty of Medicine & Surgery
- **Summa Cum Laude**: 94.00 and higher
- **Magna Cum Laude**: 91.00 - 93.99
- **Cum Laude**: 88.00 - 90.99

#### Graduate Programs
- **Summa Cum Laude**: 1.000 - 1.054
- **Magna Cum Laude**: 1.055 - 1.154
- **Cum Laude**: 1.155 - 1.254

**Features**:
- Visual color-coded badges (Gold/Silver/Bronze)
- Distance to next honors level indicator
- Automatic disqualification checking (failures, INC grades)
- PE/NSTP grades tracked for eligibility (no INC/failures allowed)

### 3. Dean's List Checker
Check term-by-term eligibility for UST Dean's List:
- **Requirements**:
  - GWA ≥ 1.750 for the term
  - Enrolled in full load (regular student)
  - No failures (including PE/NSTP)
  - No Incomplete grades (including PE/NSTP)
- **Multi-term tracking**: Track consecutive eligible terms

### 4. Schedule to Google Calendar
- **Upload** a screenshot of your schedule
- **Paste** schedule text directly
- **Enter** schedule manually
- Intelligent OCR parsing using Tesseract.js
- Generate Google Calendar links or .ics files
- Recurring events for entire semester (Aug-Dec, Jan-May, Jun-Jul)

## 📋 UST Policy Compliance

This calculator implements official UST policies from the Student Handbook:

### Grading System (5-Point Numerical Scale)
Per UST Student Handbook - Grading System Policy:
```
1.00 = 96-100%  Excellent
1.25 = 94-95%   Very Good
1.50 = 92-93%   Very Good
1.75 = 89-91%   Good
2.00 = 87-88%   Good
2.25 = 84-86%   Good
2.50 = 82-83%   Fair
2.75 = 79-81%   Fair
3.00 = 75-78%   Passed
5.00            Failed
```

### Special Grades
- **INC** (Incomplete): Given when student fails to take final exam or submit major requirement due to valid reasons
- **INP** (In Progress): Given for continuing projects or practicum/OJT courses
- **FA** (Failure due to Absences)
- **WP** (Withdrew with Permission)
- **WF** (Withdrew without Permission)

### PE/NSTP Treatment
Per policy: "PE and NSTP are not considered general education courses"
- **Excluded** from GWA calculation
- **Still tracked** for honors eligibility (no INC or failures allowed)

### Honors Eligibility (Basic Implementation)
**Checked by calculator**:
- ✅ GWA within honors threshold for program type
- ✅ No failing grades (5.0) in any course
- ✅ No unremoved Incomplete (INC) grades (including PE/NSTP)
- ✅ No Failure due to Absences (FA)

**Advanced requirements** (not yet implemented):
- ⏳ 6 consecutive terms residence requirement
- ⏳ 76% of total units completed at UST
- ⏳ 75% regular load per term requirement
- ⏳ No major/grave offenses or crimes involving moral turpitude
- ⏳ Transferee/second-degree student rules
- ⏳ Medicine special case: 80% GPA + 20% Oral Revalida

### Dean's List (PPS NO. 1024b)
Requirements:
- GWA ≥ 1.750 in immediately preceding term
- Regular student status (full load enrollment)
- No failures (including PE/NSTP)
- No incomplete grades (including PE/NSTP)

## 📊 Calculation Methodology

### GWA Formula
```typescript
GWA = Σ(Grade × Units) / Σ(Units)

where:
  - Grade = numerical grade (1.0-5.0)
  - Units = lecture units + laboratory units
  - PE and NSTP courses are excluded per UST policy
```

### Example Calculation
```
Course A: 1.75 grade, 3 lec units, 0 lab units = 1.75 × 3 = 5.25
Course B: 2.00 grade, 2 lec units, 1 lab units = 2.00 × 3 = 6.00
PE 101:   1.00 grade, 0 lec units, 2 lab units = EXCLUDED

Total weighted: 5.25 + 6.00 = 11.25
Total units: 3 + 3 = 6
GWA = 11.25 / 6 = 1.875
```

## ⚠️ Known Limitations

This is a calculator tool for estimation purposes. It does NOT:
- Track your official UST transcript
- Guarantee honors eligibility (full verification requires registrar review)
- Handle complex transferee credit evaluations
- Include oral revalida scores for Medicine program
- Verify residence requirements or unit completion percentages
- Check for disciplinary records

**Always consult the Office of the Registrar for official GWA and honors eligibility.**

## 🎨 Design

- **Primary Color**: UST Yellow (#FDB813)
- **Style**: Miro-inspired with generous whitespace
- **UI Library**: shadcn/ui + Tailwind CSS
- **Responsive**: Mobile-first design

## 🏗️ Tech Stack

- **Framework**: Next.js 15+ (App Router, Server Components, Turbopack)
- **Language**: TypeScript
- **Backend**: Convex (real-time database & queries)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **OCR**: Tesseract.js
- **Calendar**: Google Calendar API / .ics generation
- **Scraping**: Puppeteer + Cheerio

## 📦 Installation

```bash
# Navigate to project
cd ust-web

# Install dependencies
npm install

# Run development servers (Next.js + Convex)
npm run dev

# Visit http://localhost:3000
```

## 🚀 Development

```bash
# Start Next.js + Convex dev servers
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## 📁 Project Structure

```
ust-web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── gwa/                  # GWA Calculator
│   ├── schedule/             # Schedule Calendar
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles (UST theme)
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   └── ...
│   └── providers.tsx         # Convex provider
├── convex/
│   ├── schema.ts             # Database schema (colleges, courses, subjects)
│   ├── queries.ts            # Read operations
│   ├── mutations.ts          # Write operations (upsert data)
│   └── seed.ts               # Seed sample data
├── lib/
│   ├── constants.ts          # App constants (colors, semester dates)
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## 🗄️ Database Schema (Convex)

### Tables
- **colleges**: UST colleges/faculties (CICS, COS, COE, etc.)
- **courses**: Degree programs per college (BSCS, BSIT, etc.)
- **subjects**: Curriculum subjects with lecture/lab units
- **scrapeMetadata**: Track web scraping status and freshness

### Sample Query
```typescript
// Get all subjects for BSCS Year 4, Semester 2
const subjects = useQuery(api.queries.getSubjectsByCurriculum, {
  courseId: "...",
  yearLevel: 4,
  semester: 2,
});
```

## 🎯 Development Progress

### ✅ Phase 1: Project Setup (Complete)
- [x] Next.js 15 with App Router & Turbopack
- [x] Convex backend configured
- [x] shadcn/ui installed (Radix preset)
- [x] UST yellow theme applied (OKLCH colors)
- [x] Scraping dependencies (Puppeteer, Cheerio, Tesseract.js)
- [x] Landing page with feature cards
- [x] Convex schema & mutations/queries
- [x] Build verification passed

### 🚧 Phase 2: UST Course Data (Planned)
- [ ] Research ust.edu.ph structure
- [ ] Build college scraper
- [ ] Build course scraper
- [ ] Build curriculum scraper  
- [x] Seed sample data (CICS/BSCS subjects)

### 📋 Phase 3-7: Feature Implementation (Planned)
See [PLAN.md](../../.copilot/session-state/396a0ce2-e827-4dab-86bf-602117400b5b/plan.md) for full roadmap

## 📝 Environment Variables

```env
# Convex (auto-generated by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=https://elated-clownfish-654.convex.cloud
CONVEX_DEPLOYMENT=elated-clownfish-654
```

## 🧪 Running Seed Data

```bash
# In Convex dashboard or CLI
npx convex run seed:seedInitialData
```

## 📄 License

MIT License - Created by Kenjo for UST Students

## 🤝 Contributing

Contributions are welcome! This project is built for the UST community.

---

**University of Santo Tomas** | Manila, Philippines | **Created by Kenjo**

