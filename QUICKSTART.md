# UST Kit - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Convex account (free tier)

### Initial Setup

```bash
# 1. Navigate to project
cd /Users/kenjo/Projects/ust-kit/ust-web

# 2. Install dependencies (if not already done)
npm install

# 3. Start development servers
npm run dev

# This runs both:
# - Next.js dev server on http://localhost:3000
# - Convex backend sync
```

### First Time Only: Seed Sample Data

```bash
# Open Convex dashboard or use CLI
npx convex dev  # Keep this running

# In another terminal:
npx convex run seed:seedInitialData

# This adds:
# - CICS college
# - BSCS course
# - 5 sample 4th year subjects
```

### Accessing the App

- **Landing**: http://localhost:3000
- **GWA Calculator**: http://localhost:3000/gwa (placeholder)
- **Schedule**: http://localhost:3000/schedule (placeholder)
- **Convex Dashboard**: https://dashboard.convex.dev/t/stac/ust-kit

---

## 📂 Project Structure

```
ust-kit/
├── ust-web/                    ← Main Next.js app
│   ├── app/                    ← Pages (App Router)
│   ├── components/             ← React components
│   ├── convex/                 ← Backend (Convex)
│   ├── lib/                    ← Utilities
│   └── public/                 ← Static files
├── .github/                    ← Copilot instructions
└── example/                    ← Reference screenshots
```

---

## 🎨 Design Tokens

### Colors
```typescript
// From lib/constants.ts
UST_YELLOW = '#FDB813'  // Primary
BLACK = '#000000'        // Text
CREAM = '#FFFDF7'        // Background
```

### CSS Variables
```css
/* In app/globals.css */
--primary: oklch(0.78 0.15 85);  /* UST Yellow */
--background: oklch(0.99 0.01 90); /* Cream */
--radius: 0.75rem;  /* Miro-style */
```

---

## 🗄️ Database Queries

### Get All Colleges
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const colleges = useQuery(api.queries.getColleges);
```

### Get Subjects for Curriculum
```typescript
const subjects = useQuery(api.queries.getSubjectsByCurriculum, {
  courseId: "...",
  yearLevel: 4,
  semester: 2,
});
```

---

## 🛠️ Common Commands

```bash
# Development
npm run dev          # Start Next.js + Convex
npm run dev:next     # Only Next.js
npm run dev:convex   # Only Convex

# Build & Deploy
npm run build        # Production build
npm run lint         # ESLint

# Convex
npx convex dev       # Start Convex watcher
npx convex deploy    # Deploy to production
npx convex dashboard # Open dashboard
```

---

## 📋 Implementation Checklist

### ✅ Completed (Phase 1)
- [x] Next.js 15 + TypeScript + Tailwind
- [x] Convex backend with schema
- [x] shadcn/ui components
- [x] UST yellow design system
- [x] Landing page
- [x] Sample data seeded

### 🚧 Next Up (Phase 2-3)
- [ ] Scrape ust.edu.ph course data
- [ ] Build GWA calculator UI
- [ ] Implement grade computation
- [ ] Add localStorage persistence

### 📅 Later (Phase 4-7)
- [ ] Schedule parser with OCR
- [ ] Google Calendar integration
- [ ] Mobile responsiveness
- [ ] Testing & deployment

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Convex Issues
```bash
# Reset Convex deployment
npx convex dev --once

# Check Convex status
npx convex dashboard
```

---

## 📝 Feature Implementation Guide

### Adding a New Page
```bash
# Create page file
mkdir app/my-feature
echo "export default function MyFeature() {
  return <div>My Feature</div>;
}" > app/my-feature/page.tsx
```

### Adding a New Convex Query
```typescript
// In convex/queries.ts
export const myQuery = query({
  args: { ... },
  handler: async (ctx, args) => {
    return await ctx.db.query('tableName').collect();
  },
});
```

### Adding a shadcn Component
```bash
npx shadcn@latest add dropdown-menu
# Component added to components/ui/
```

---

## 🎓 UST-Specific Info

### Semester Schedule
- **1st Sem**: Aug 1 - Dec 31
- **2nd Sem**: Jan 1 - May 31  
- **Summer**: Jun 1 - Jul 31

### GWA Formula
```
GWA = Σ(Grade × (LecUnits + LabUnits)) / Σ(LecUnits + LabUnits)

Example:
Subject A: Grade 1.5, 3 lec + 0 lab = 1.5 × 3 = 4.5
Subject B: Grade 2.0, 2 lec + 1 lab = 2.0 × 3 = 6.0
GWA = (4.5 + 6.0) / (3 + 3) = 1.75
```

---

## 👤 Credits
**Created by**: Kenjo  
**For**: University of Santo Tomas Students  
**Date**: April 2026

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [UST Website](https://ust.edu.ph)
