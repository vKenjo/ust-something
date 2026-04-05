# UST Curriculum Data Validation Report

Generated: 2026-04-04

## Summary
- Programs validated: 5
- Passed: 2/5
- Issues found:
  - BS Nursing: Missing Years 3-4 (only 2 years scraped instead of 4)
  - BA Communication: Data matches but Y1S1 course count differs slightly
  - Bachelor of Music in Composition: Course data merged incorrectly across semesters/years

## Validation Details

### 1. BS Information Technology (STEM)
- **Source URL**: https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-information-technology/
- **Expected years**: 4 | **Actual**: 4 ✅
- **Expected courses Y1S1**: 10 | **Actual**: 10 ✅
- **Sample checks**:
  - `ART_APP` Art Appreciation (3 units) ✅
  - `ICS 2601` Introduction to Computing (3 units) ✅
  - `ICS 2602` Computer Programming I (5 units) ✅
  - `MATH_MW` Mathematics in the Modern World (3 units) ✅
  - `NSTP 1` National Service Training Program 1 (3 units) ✅
- **Status**: ✅ **PASS**

---

### 2. BS Nursing (Health)
- **Source URL**: https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-nursing/
- **Expected years**: 4 | **Actual**: 2 ⚠️
- **Expected courses Y1S1**: 9 | **Actual**: 9 ✅
- **Sample checks**:
  - `ETHICS` Ethics (3 units) ✅
  - `NUR 8101` Theoretical Foundation of Nursing (3 units) ✅
  - `NUR 8102` Applied Anatomy and Physiology in Nursing (5 units) ✅
  - `NUR 8103` Biochemistry (5 units) ✅
- **Status**: ⚠️ **ISSUES** - Only Years 1-2 scraped; Years 3-4 missing

**Issue Details**:
The scraper only captured the first 2 years of the 4-year nursing curriculum. The UST page contains multiple curriculum versions (different effective years), and the parser appears to have stopped after the first Year 2 data was found.

---

### 3. BS Accountancy (ABM)
- **Source URL**: https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-accountancy/
- **Expected years**: 4 (with Year 4 split into 3rd/4th Year) | **Actual**: 4 ✅
- **Expected courses Y1S1**: 10 | **Actual**: 10 ✅
- **Sample checks**:
  - `CA 5101` Financial Accounting and Reporting (6 units) ✅
  - `CA 5102` Managerial Economics (3 units) ✅
  - `CA 5103` Management Science (3 units) ✅
  - `MATH_MW` Mathematics in the Modern World (3 units) ✅
  - `READ_PH` Readings in Philippine History (3 units) ✅
- **Status**: ✅ **PASS**

---

### 4. BA Communication (HUMSS)
- **Source URL**: https://www.ust.edu.ph/academics/programs/bachelor-of-arts-in-communication/
- **Expected years**: 4 | **Actual**: 4 ✅
- **Expected courses Y1S1**: 10 | **Actual**: 10 ✅
- **Sample checks**:
  - `AB 301` Entrepreneurial Mind (3 units) ✅
  - `CA 3281` Introduction to Communication and Media (3 units) ✅
  - `CONTEM_W` The Contemporary World (3 units) ✅
  - `PURPCOM` Purposive Communication (3 units) ✅
  - `SPN 1` Spanish 1 – Basic (3 units) ✅
- **Status**: ✅ **PASS**

---

### 5. Bachelor of Music in Composition (MAD)
- **Source URL**: https://www.ust.edu.ph/academics/programs/bachelor-of-music-in-composition/
- **Expected years**: 4 | **Actual**: 5 ⚠️
- **Expected courses Y1S1**: 10 | **Actual**: 31 ⚠️
- **Sample checks**:
  - `APP MAJ 1` Applied Major 1 (2 units) ✅
  - `MUS 901` Music Theory 1 with Keyboard/Fretboard (3 units) ✅
  - But also contains courses from other semesters mixed in ❌
- **Status**: ⚠️ **ISSUES** - Course data merged incorrectly; years miscounted

**Issue Details**:
The scraper incorrectly merged multiple semesters and years of course data into Year 1 Semester 1. The Y1S1 array contains:
- Year 1, Semester 1 courses (correct)
- Year 1, Semester 2 courses (should be separate)
- Year 2, Semester 1 courses (should be separate)

Additionally, the program is reported as 5 years instead of 4 years. This likely occurs because the UST page contains multiple curriculum versions (old and new), and the parser is combining data from different versions.

---

## Root Cause Analysis

### Issue 1: Incomplete Year Parsing (BS Nursing)
The UST pages often contain multiple curriculum versions with different effective academic years. The current parser may be:
1. Stopping after encountering the first complete "Year 2" block
2. Not properly distinguishing between old and new curriculum versions

### Issue 2: Course Merging (Music Composition)
The parser appears to have difficulties when:
1. Multiple curriculum versions appear on the same page
2. Year headers are inconsistent or missing between blocks
3. The page structure differs from the standard STEM/Business format

## Recommendations

1. **Parser Enhancement**: Add detection for curriculum version markers (e.g., "Effectivity: A.Y. XXXX-XXXX") to isolate the most recent curriculum
2. **Year Boundary Detection**: Improve year boundary detection to handle Music/Arts programs which may have different HTML structure
3. **Validation Heuristics**: Add post-processing validation to detect anomalies like:
   - Programs with unexpected year counts (most UST programs are 4-5 years)
   - Semesters with unusually high course counts (>15 is suspicious)
   - Duplicate course codes within a single year

## Affected Programs
Based on patterns identified:
- **High Risk**: All Music programs (28 programs in MAD cluster)
- **Medium Risk**: Health programs with extensive prerequisites (may have parsing issues)
- **Low Risk**: STEM, ABM programs (standard structure)

---

## Data Quality Summary

| Cluster | Programs | Validated | Pass Rate |
|---------|----------|-----------|-----------|
| STEM    | 19       | 1         | 100%      |
| Health  | 10       | 1         | 0%        |
| ABM     | 12       | 1         | 100%      |
| HUMSS   | 25       | 1         | 100%      |
| MAD     | 28       | 1         | 0%        |

**Overall Estimated Quality**: ~60% of programs may be accurately scraped (STEM, ABM, most HUMSS). MAD and some Health programs need parser fixes before data is reliable.
