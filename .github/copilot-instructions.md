# Copilot Knowledge Base — {{PROJECT_NAME}}

<!-- ═══════════════════════════════════════════════════════════════════════════
     TEMPLATE INSTRUCTIONS
     ═══════════════════════════════════════════════════════════════════════════
     This is a TEMPLATE. Replace all {{PLACEHOLDER}} markers with your
     project-specific values. See the Placeholder Legend below.

     After filling in placeholders, this becomes a LIVING DOCUMENT.
     Copilot MUST update it at the end of every coding session.
     The rules are in § 4 · Self-Update Protocol.
     ═══════════════════════════════════════════════════════════════════════════ -->

<!-- ═══════════════════════════════════════════════════════════════════════════
     PLACEHOLDER LEGEND — Find & replace these across the entire file

     {{PROJECT_NAME}}        → Full project name
                               Example: "Shelf Quality Audit (SQA)"
     {{PROJECT_SHORT_NAME}}  → Abbreviated name used in headers/labels
                               Example: "SQA"
     {{WORKSPACE_DIR}}       → Parent workspace directory name
                               Example: "02-shelf-quality-audit"
     {{WA_REPO_NAME}}        → Frontend repo folder name
                               Example: "cqa-sqa-web"
     {{SUPABASE_URL}}        → Deployed Supabase base URL
                               Example: "https://xxxx.supabase.co"
     {{CONVEX_URL}}          → Deployed Convex base URL
                               Example: "https://xxxx.convex.cloud"
     {{DOMAIN_DESCRIPTION}}  → One-line description of what the app does
                               Example: "store shelf quality auditing"
     ═══════════════════════════════════════════════════════════════════════════ -->

---

## 1 · Project Identity & Architecture

### Workspace Layout

```
{{WORKSPACE_DIR}}/                  ← parent workspace (NOT a git repo itself)
├── .github/
│   ├── copilot-instructions.md     ← THIS FILE — root knowledge base
│   └── instructions.md             ← Copilot prompt: template setup guide
├── {{WA_REPO_NAME}}/               ← Next.js + Convex repo (own git repo)
├── local-dev-config.json           ← Local dev configuration (from .example)
└── README.md                       ← Template usage documentation
```

### {{WA_REPO_NAME}} — Web App & Backend

| Attribute | Value |
|-----------|-------|
| Framework | Next.js (App Router, Server Components) |
| Language | TypeScript |
| API/Realtime | Convex |
| Relational DB | Supabase (PostgreSQL) |
| Styling | Tailwind CSS + shadcn/ui |

<!-- ── ADD YOUR KEY CONVEX MUTATIONS/QUERIES BELOW ────────────────────────── -->
<!-- List each primary mutation/query. Example:                                -->
<!--                                                                           -->
<!-- | Function           | Purpose                                    |       -->
<!-- |--------------------|----------------------------------------------|     -->
<!-- | `createRecord`     | Create new records                           |     -->
<!-- | `getRecords`       | Query records with filtering                 |     -->
<!-- ─────────────────────────────────────────────────────────────────────────  -->

**Convex Functions**:

| Function | Purpose |
|----------|---------|
| _Fill in your Convex functions here_ | |

<!-- ── ADD YOUR KEY UTILITIES BELOW ──────────────────────────────────────── -->
<!-- List important files in your utils/ folder. Example:                     -->
<!--                                                                          -->
<!-- | File              | Purpose                                     |      -->
<!-- |-------------------|-----------------------------------------------|    -->
<!-- | `supabase.ts`     | Supabase client management                   |     -->
<!-- ────────────────────────────────────────────────────────────────────────  -->

**Key utilities** (`src/lib/` or `utils/`):

| File | Purpose |
|------|---------|
| _Fill in your utility files here_ | |

### How They Connect

```
Browser  →  Next.js WA (localhost:3000)  →  Convex Backend (Realtime Updates)
                                               ↓
                                          Supabase PostgreSQL DB (Relational/Blob)
```

### Local Development

```bash
# From workspace root:
cd {{WA_REPO_NAME}}
npm run dev # Starts Next.js and Convex concurrently (if configured via package.json)
```

---

## 2 · Sub-Repo Instruction References

Each sub-repo has its own detailed Copilot instructions. **Do NOT duplicate their content here.** Instead, load them on-demand:

### When working in `{{WA_REPO_NAME}}/`

<!-- ── ADD YOUR WA INSTRUCTION FILES BELOW ───────────────────────────────── -->
<!-- If your WA repo has .github/instructions/ files, list them here.         -->
<!-- Example:                                                                  -->
<!--                                                                           -->
<!-- **Always load first:**                                                    -->
<!-- - `{{WA_REPO_NAME}}/.github/instructions/00-global-context.md`           -->
<!--                                                                           -->
<!-- **Load on demand:**                                                       -->
<!-- | Working on…          | Load this file             |                     -->
<!-- |----------------------|----------------------------|                     -->
<!-- | Design tokens        | `01-design-tokens.md`      |                    -->
<!-- | Forms                | `components/c03-form.md`   |                     -->
<!-- ────────────────────────────────────────────────────────────────────────  -->

_List your WA instruction files here, or remove this section if none exist._

**WA finalization checklist** (must pass all before marking done):

```bash
npm run build   # TypeScript + Next.js compilation — must exit 0
npm run lint    # ESLint — must exit 0, zero warnings
npm test        # tests — must exit 0, all passing
```

---

## 3 · Cross-Repo Conventions

### Domain Model — {{PROJECT_SHORT_NAME}}

<!-- ── FILL IN YOUR DOMAIN MODEL ─────────────────────────────────────────── -->
<!-- Map your domain concepts to Convex schemas, Supabase tables, and WA components. -->
<!-- ────────────────────────────────────────────────────────────────────────  -->

The {{PROJECT_SHORT_NAME}} domain centers on {{DOMAIN_DESCRIPTION}}:

| Concept | Description | Schema Table (Convex / Supabase) | Associated Mutations | WA Resource |
|---------|-------------|----------------------------------|----------------------|-------------|
| _Fill in your domain entities here_ | | | | |

### API Contract Pattern

- Real-time and internal state data is served by **Convex** via `useQuery` / `useMutation`.
- Large relational workloads, robust Auth, and Blob storage are handled by **Supabase**.

### Environment Variables

<!-- ── FILL IN YOUR ENVIRONMENT VARIABLES ─────────────────────────────────── -->
<!-- List the env vars both repos need. Group by category.                     -->
<!-- ────────────────────────────────────────────────────────────────────────  -->

**Shared naming conventions:**

- Convex: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 4 · Self-Update Protocol

<!-- ═══════════════════════════════════════════════════════════════════════════
     MANDATORY: Copilot MUST follow these rules at the END of every session.
     ═══════════════════════════════════════════════════════════════════════════ -->

### Rules

1. **At the end of every coding session**, before presenting final results to the user, Copilot MUST update this file by editing the following sections **inline** (overwrite, not append):

   | Section | Action |
   |---------|--------|
   | `§ 7 · Current Status` | **Overwrite** with what was accomplished this session |
   | `§ 8 · Next Steps` | **Overwrite** with the updated prioritized list |
   | `§ 5 · Lessons Learned` | **Add** new entries for any failures, gotchas, or confirmed patterns discovered. **Remove** entries only if they are proven wrong. |
   | `§ 6 · Known Issues` | **Add** new issues found. **Update** status of existing issues. **Remove** only when fully resolved and verified. |

2. **Entry format for Lessons Learned:**

   ```
   - ✅ **WORKS**: [description] — _[date], [context/files]_
   - ❌ **DOESN'T WORK**: [description] — _[date], [context/files]_
   - ⚠️ **GOTCHA**: [description] — _[date], [context/files]_
   ```

3. **Entry format for Known Issues:**

   ```
   - 🔴 **[OPEN]** [description] — _[date discovered]_
   - 🟡 **[INVESTIGATING]** [description] — _[date], [current hypothesis]_
   - 🟢 **[RESOLVED]** [description] — _[date resolved], [how it was fixed]_
   ```

4. **Never delete the section headers or protocol rules.** Only modify content within sections.

5. **Before starting work**, read `§ 5 Lessons Learned` and `§ 6 Known Issues` to avoid repeating known failures.

6. **If a previously documented approach fails again**, escalate the Lessons Learned entry with more detail rather than silently retrying.

---

## 5 · Lessons Learned

<!-- Add entries here as discoveries are made. Format: ✅ WORKS / ❌ DOESN'T WORK / ⚠️ GOTCHA -->

### Web App ({{WA_REPO_NAME}})

_No entries yet. Copilot will add discoveries here as development progresses._

- ✅ **WORKS**: UST policy-aligned GWA mapping with PE/NSTP exclusion can be implemented cleanly by adding `courseType` metadata and filtering in calculator utilities. — _2026-04-04, `ust-web/lib/constants.ts`, `ust-web/lib/gradeCalculator.ts`_
- ✅ **WORKS**: Honors and Dean's List logic is maintainable when split into dedicated modules (`honorsCalculator` / `deansListCalculator`) and consumed via small presentation components. — _2026-04-04, `ust-web/lib/honorsCalculator.ts`, `ust-web/lib/deansListCalculator.ts`, `ust-web/components/*`_
- ⚠️ **GOTCHA**: `app/schedule/page.tsx` semester state must use lowercase values (`first|second|summer`) to match `SemesterType`; uppercase values break type-check during build. — _2026-04-04, `ust-web/app/schedule/page.tsx`, `ust-web/lib/calendarGenerator.ts`_
- ⚠️ **GOTCHA**: Current repo has no `npm test` script; test-phase tasks must be marked blocked until a test runner/script is added. — _2026-04-04, `ust-web/package.json`_
- ✅ **WORKS**: UST schedule parsing is reliable when tabular parsing is combined with free-form fallback and continuation-line handling; this covers real portal exports and compact OCR-like lines. — _2026-04-04, `ust-web/lib/scheduleParser.ts`_
- ✅ **WORKS**: ICS import reliability improves with explicit `VTIMEZONE` (`Asia/Manila`), escaped ICS field values, and `VALARM` reminders per event. — _2026-04-04, `ust-web/lib/calendarGenerator.ts`_
- ⚠️ **GOTCHA**: Broken template literals in sample schedule text can fail Turbopack with `Unterminated template`; keep pasted examples simple and valid TS string literals. — _2026-04-04, `ust-web/app/schedule/page.tsx`_

### Architecture & Integrations

- ✅ **WORKS**: Utilizing Convex for high-frequency UI mutations and Supabase for reporting and blob storage. — _2026-04-02_
- ✅ **WORKS**: Framer Motion integrates cleanly with Next.js 16 App Router when components are marked `'use client'`; animation variants centralized in `lib/animations.ts` keep pages DRY. — _2026-04-05, `ust-web/lib/animations.ts`, `ust-web/components/miro/*`_
- ⚠️ **GOTCHA**: Framer Motion `useInView` margin parameter requires literal type assertion (e.g., `margin: '-100px' as const`) or TypeScript will complain. — _2026-04-05, `ust-web/lib/animations.ts`_
- ⚠️ **GOTCHA**: Framer Motion ease values need explicit `Easing` type import when used in transition objects to satisfy stricter TypeScript checking. — _2026-04-05, `ust-web/components/miro/FloatingElement.tsx`_
- ✅ **WORKS**: Creating a component library under `components/miro/` with barrel exports (`index.ts`) enables clean imports (`import { MiroCard, GradientText } from '@/components/miro'`). — _2026-04-05, `ust-web/components/miro/index.ts`_
- ✅ **WORKS**: UST curriculum pages have consistent table structure for most programs; scraping with regex-based HTML parsing works for STEM/ABM/HUMSS clusters. — _2026-04-04, `ust-web/lib/scraper/ustCurriculumScraper.ts`_
- ⚠️ **GOTCHA**: MAD cluster (Music/Arts) programs have non-standard table HTML that causes course merging issues; parser stops at wrong curriculum boundaries. — _2026-04-04, `ust-web/lib/data/VALIDATION.md`_
- ⚠️ **GOTCHA**: Some Health programs (e.g., Nursing) span curriculum tables across multiple page sections; scraper only captures first 2 years. — _2026-04-04, `ust-web/lib/data/VALIDATION.md`_
- ✅ **WORKS**: Cascading dropdown UI (cluster→program→year→semester) provides good UX for curriculum selection; reset dependent values when parent changes. — _2026-04-04, `ust-web/components/ProgramSelector.tsx`_

---

## 6 · Known Issues

<!-- Track issues here. Format: 🔴 OPEN / 🟡 INVESTIGATING / 🟢 RESOLVED -->

- 🔴 **[OPEN]** Automated unit/integration tests for the new GWA/honors/dean's-list logic are not implemented because `npm test` script is missing. — _2026-04-04_
- 🟢 **[RESOLVED]** `schedule` page semester type mismatch (`'FIRST'|'SECOND'|'SUMMER'` vs `SemesterType`) caused build type error. — _2026-04-04, fixed by switching to lowercase `SemesterType` values in `ust-web/app/schedule/page.tsx`_
- 🟢 **[RESOLVED]** Schedule route build failures from malformed `loadExample` content (`Unterminated template`) blocked `/schedule` page generation. — _2026-04-04, fixed by rebuilding `ust-web/app/schedule/page.tsx` with valid template string content_
- 🟢 **[RESOLVED]** Calendar export lacked timezone block and consistent ICS escaping/reminder reliability. — _2026-04-04, fixed in `ust-web/lib/calendarGenerator.ts` by adding `VTIMEZONE`, ICS escaping, and per-event `VALARM` handling_

---

## 7 · Current Status

<!-- Copilot: OVERWRITE this section at the end of every session -->

**Last updated**: _2026-04-04_

- **UST Curriculum Scraper implemented** — Auto-populate GWA calculator with program courses:
  - Scraped **94 programs** from ust.edu.ph across 5 clusters (STEM, Health, ABM, HUMSS, MAD)
  - **4.8MB curriculum data** stored in `lib/data/ust-curricula.json`
  - New scraper module: `lib/scraper/` with types, parser, and scraping utilities
  - Data store helpers: `lib/data/curricula.ts` for querying programs/courses
- **GWA Calculator now has Quick Load feature** (`app/gwa/page.tsx`):
  - New `ProgramSelector` component with cascading dropdowns
  - Select Cluster → Program → Year → Semester to auto-load courses
  - Courses marked with "From Curriculum" badge
  - Manual entry still available for custom courses
- **Validation completed**: 3/5 programs fully validated; known issues with MAD cluster parsing
- Build and lint pass successfully

---

## 8 · Next Steps

<!-- Copilot: OVERWRITE this section at the end of every session -->

1. **Fix MAD cluster parsing** — Update scraper to handle Music/Arts programs with non-standard HTML tables; re-scrape affected programs.
2. **Re-scrape Health programs** — Some programs missing later years; investigate curriculum page structure differences.
3. **Add Formal Test Harness** — Introduce `npm test` (e.g., Vitest/Jest) and migrate current script-based checks into repeatable CI-friendly tests.
4. **Add prefers-reduced-motion support** — Update `lib/animations.ts` to detect and disable animations for users who prefer reduced motion.
5. **Implement OCR Input Path** — Wire screenshot upload + OCR extraction into the schedule parser UI flow with correction UX.

---

## 9 · Quick Reference

### Commands Cheat Sheet

```bash
# === Web App ({{WA_REPO_NAME}}) ===
cd {{WA_REPO_NAME}}
npm run dev                        # Start dev servers (Next.js + Convex)
npm run build                      # Production build
npm run lint                       # ESLint check
npm test                           # Test suite
npx convex dev                     # Start Convex dev explicitly
```

### Database Tables / Schemas

<!-- ── FILL IN YOUR DATABASE TABLES ──────────────────────────────────────── -->

| Table / Collection | Engine | Description |
|--------------------|--------|-------------|
| _Fill in your schema here_ | | |

### API URLs

| Service | URL |
|---------|-----|
| Supabase (Local/Dev) | `{{SUPABASE_URL}}` |
| Convex (Local/Dev) | `{{CONVEX_URL}}` |
