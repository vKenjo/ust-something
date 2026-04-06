/**
 * Fix Faculty of Medicine and Surgery + Faculty of Pharmacy programs
 *
 * Replaces broken/mangled data with correct curricula from official
 * UST prospectuses and web pages.
 *
 * Programs fixed:
 * - BS Basic Human Studies (LEAPMed) — 2-year trimester, was duplicated across 5 years
 * - Doctor of Medicine — new, was missing entirely
 * - BS Biochemistry — fix college assignment + semester structure
 * - BS Medical Technology — fix college assignment + semester structure
 * - BS Pharmacy — fix semester structure
 * - BS Pharmacy, Clinical Pharmacy — fix semester structure (5-year program)
 *
 * Run: npx tsx lib/data/fix-medicine-pharmacy.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Course {
  code: string;
  name: string;
  lecUnits: number;
  labUnits: number;
  totalUnits: number;
  prerequisites: string[];
  courseType: 'academic' | 'pe' | 'nstp';
}

interface Semester {
  term: 'first' | 'second' | 'summer';
  courses: Course[];
}

interface YearLevel {
  year: number;
  semesters: Semester[];
}

interface ProgramEntry {
  name: string;
  slug: string;
  college: string;
  cluster: string;
  curriculum: YearLevel[];
}

interface CurriculaData {
  generatedAt: string;
  totalPrograms: number;
  successfulScrapes: number;
  programs: ProgramEntry[];
  errors: { slug: string; error: string }[];
}

// Helper to create a course object
function c(
  code: string,
  name: string,
  lec: number,
  lab: number,
  prereqs: string[] = [],
  type: 'academic' | 'pe' | 'nstp' = 'academic'
): Course {
  return {
    code,
    name,
    lecUnits: lec,
    labUnits: lab,
    totalUnits: lec + lab,
    prerequisites: prereqs,
    courseType: type,
  };
}

// ─── BSBHS (LEAPMed) — Trimester system, 2 years ───────────────────────

const bsbhsCurriculum: YearLevel[] = [
  {
    year: 1,
    semesters: [
      {
        term: 'summer', // Special Term
        courses: [
          c('LIWORIZ', 'Life and Works of Rizal', 3, 0),
          c('PURPCOM', 'Purposive Communication', 3, 0),
          c('UND_SELF', 'Understanding the Self', 3, 0),
        ],
      },
      {
        term: 'first',
        courses: [
          c('ART_APP', 'Art Appreciation', 3, 0),
          c('BHS 3151', 'Introduction to Anatomy and Embryology 1', 3, 0),
          c('BHS 3152', 'Introduction to Biochemistry and Genetics 1', 3, 0),
          c('BHS 3153', 'Introduction to Human Physiology 1', 3, 0),
          c('BHS 3154', 'Introduction to Histology', 3, 0),
          c('BHS 3155', 'Biostatistics', 3, 0),
          c('NSTP 1', 'National Service Training Program 1', 3, 0, [], 'nstp'),
          c('PATH-FIT 2', 'Physical Activities Toward Health and Fitness 2', 2, 0, [], 'pe'),
          c('READ_PH', 'Readings in Philippine History', 3, 0),
          c('THY 1', 'Christian Vision of the Human Person', 3, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('BHS 3156', 'Basic Neuroscience', 3, 0),
          c('BHS 3157', 'Introduction to Anatomy and Embryology 2', 3, 0, ['BHS 3151']),
          c('BHS 3158', 'Introduction to Biochemistry and Genetics 2', 3, 0, ['BHS 3152']),
          c('BHS 3159', 'Introduction to Human Physiology 2', 3, 0, ['BHS 3153']),
          c('BHS 31510', 'Behavioral Medicine', 3, 0),
          c('MATH_MW', 'Mathematics in the Modern World', 3, 0),
          c('NSTP 2', 'National Service Training Program 2', 3, 0, ['NSTP 1'], 'nstp'),
          c('PATH-FIT 1', 'Physical Activities Toward Health and Fitness 1', 2, 0, [], 'pe'),
          c('STS', 'Science, Technology and Society', 3, 0),
          c('THY 2', 'Christian Vision of Marriage and Family', 3, 0, ['THY 1']),
        ],
      },
    ],
  },
  {
    year: 2,
    semesters: [
      {
        term: 'summer', // Special Term
        courses: [
          c('CONTEM_W', 'The Contemporary World', 3, 0),
          c('ETHICS', 'Ethics', 3, 0),
          c('GE ELEC II', 'GE Elective II', 3, 0),
          c('GE ELEC III', 'GE Elective III', 3, 0),
        ],
      },
      {
        term: 'first',
        courses: [
          c('BHS 31511', 'Patient Care 1', 3, 0),
          c('BHS 31512', 'Laboratory Medicine', 3, 1),
          c('BHS 31513', 'General Medical Surgical Foundation 1', 3, 0),
          c('BHS 31514', 'Integration 1', 3, 0),
          c('BHS 31515', 'Research 1', 3, 0),
          c('BHS 31516', 'Basic Pharmacology', 3, 0),
          c('BHS 31517', 'Immunology', 3, 0),
          c('GE ELEC I', 'GE Elective I', 3, 0),
          c('PATH-FIT 4', 'Physical Activities Toward Health and Fitness in Sports', 2, 0, ['PATH-FIT 1', 'PATH-FIT 2'], 'pe'),
          c('THY 3', 'Christian Vision of the Church in Society', 3, 0, ['THY 1', 'THY 2']),
        ],
      },
      {
        term: 'second',
        courses: [
          c('BHS 31518', 'Patient Care 2', 3, 0, ['BHS 31511']),
          c('BHS 31519', 'Basic Microbiology and Parasitology', 3, 1),
          c('BHS 31520', 'General Medical Surgical Foundation 2', 3, 0, ['BHS 31513']),
          c('BHS 31521', 'Integration 2', 3, 0, ['BHS 31514']),
          c('BHS 31522', 'Research 2', 3, 0, ['BHS 31515']),
          c('BHS 31523', 'Kinesiology', 3, 0),
          c('BHS 31524', 'Pathology', 3, 0),
          c('FIL', 'Panimulang Pagsasalin', 3, 0),
          c('PATH-FIT 3', 'Physical Activities Toward Health and Fitness in Dance', 2, 0, ['PATH-FIT 1', 'PATH-FIT 2'], 'pe'),
          c('THY 4', 'Living the Christian Vision in the Contemporary World', 3, 0, ['THY 1', 'THY 2', 'THY 3']),
        ],
      },
    ],
  },
];

// ─── Doctor of Medicine — 4-year post-graduate, weighted score system ───

const medicineCurriculum: YearLevel[] = [
  {
    year: 1,
    semesters: [
      {
        term: 'first',
        courses: [
          c('MED-ANAT', 'Gross and Clinical Anatomy', 10, 0),
          c('MED-PHYS', 'Physiology', 8, 0),
          c('MED-BIOC', 'Biochemistry', 8, 0),
          c('MED-HIST', 'Histology', 3, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('MED-NEUR1', 'Basic Neuroscience I', 2, 0),
          c('MED-PREV1', 'Preventive, Family and Community Medicine I', 1.5, 0),
          c('MED-EPID1', 'Clinical Epidemiology I', 1.5, 0),
          c('MED-ETH1', 'Bioethics I', 1, 0),
        ],
      },
    ],
  },
  {
    year: 2,
    semesters: [
      {
        term: 'first',
        courses: [
          c('MED-MED1', 'Introduction to & Essentials of Clinical Medicine', 6, 0),
          c('MED-PATH', 'Pathology', 7, 0),
          c('MED-PHAR', 'Pharmacology-Therapeutics', 5, 0),
          c('MED-MICR', 'Microbiology', 4, 0),
          c('MED-SURG1', 'Surgery I', 3, 0),
          c('MED-CLPA', 'Clinical Pathology', 2, 0),
          c('MED-OB1', 'Obstetrics I', 1.5, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('MED-PARA', 'Parasitology', 0.5, 0),
          c('MED-ETH2', 'Bioethics II', 1, 0, ['MED-ETH1']),
          c('MED-EPID2', 'Clinical Epidemiology II', 1, 0, ['MED-EPID1']),
          c('MED-NEUR2', 'Basic Neuroscience II', 1, 0, ['MED-NEUR1']),
          c('MED-BEH1', 'Behavioral Medicine I', 1, 0),
          c('MED-PREV2', 'Preventive, Family and Community Medicine II', 1, 0, ['MED-PREV1']),
          c('MED-PED1', 'Pediatrics I', 0.5, 0),
          c('MED-ANES', 'Anesthesiology', 0.5, 0),
        ],
      },
    ],
  },
  {
    year: 3,
    semesters: [
      {
        term: 'first',
        courses: [
          c('MED-MED2', 'Problem-Solving in Internal Medicine', 10, 0, ['MED-MED1']),
          c('MED-SURG2', 'Surgery II', 7, 0, ['MED-SURG1']),
          c('MED-PED2', 'Pediatrics II', 5, 0, ['MED-PED1']),
          c('MED-OB2', 'Obstetrics II', 1.5, 0, ['MED-OB1']),
          c('MED-CNEUR', 'Clinical Neuroscience', 1.5, 0, ['MED-NEUR2']),
          c('MED-BEH2', 'Behavioral Medicine II', 1.5, 0, ['MED-BEH1']),
          c('MED-GYNE', 'Gynecology', 1.5, 0),
          c('MED-LEGM', 'Legal Medicine', 1.5, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('MED-EPID3', 'Clinical Epidemiology III', 1, 0, ['MED-EPID2']),
          c('MED-PREV3', 'Preventive, Family and Community Medicine III', 1.5, 0, ['MED-PREV2']),
          c('MED-OPHT', 'Ophthalmology', 1, 0),
          c('MED-NUTR', 'Medical Nutrition', 1, 0),
          c('MED-RADI', 'Radiology', 1, 0),
          c('MED-ENT', 'Otorhinolaryngology (ENT)', 1, 0),
          c('MED-ETH3', 'Bioethics III', 1, 0, ['MED-ETH2']),
          c('MED-DERM', 'Dermatology', 0.5, 0),
          c('MED-REHB', 'Rehabilitation Medicine', 0.5, 0),
        ],
      },
    ],
  },
  {
    year: 4,
    semesters: [
      {
        term: 'first',
        courses: [
          c('CLK-MED', 'Clinical Clerkship: Internal Medicine', 8, 0),
          c('CLK-SURG', 'Clinical Clerkship: Surgery', 8, 0),
          c('CLK-PED', 'Clinical Clerkship: Pediatrics', 8, 0),
          c('CLK-OBGY', 'Clinical Clerkship: OB-Gynecology', 8, 0),
          c('CLK-COMM', 'Clinical Clerkship: Community Medicine', 4, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CLK-DERM', 'Clinical Clerkship: Dermatology', 2, 0),
          c('CLK-ID', 'Clinical Clerkship: Infectious Diseases', 1, 0),
          c('CLK-LEGM', 'Clinical Clerkship: Legal Medicine', 1, 0),
          c('CLK-OPHT', 'Clinical Clerkship: Ophthalmology', 1, 0),
          c('CLK-ENT', 'Clinical Clerkship: ENT', 1, 0),
          c('CLK-RADI', 'Clinical Clerkship: Radiology', 1, 0),
          c('CLK-NPSY', 'Clinical Clerkship: Neurology/Psychiatry', 2, 0),
          c('CLK-ELEC', 'Clinical Clerkship: Elective Rotations', 3, 0),
          c('MED-ETH4', 'Bioethics IV', 1, 0, ['MED-ETH3']),
          c('MED-REVA', 'Revalida (Comprehensive Examination)', 0, 0),
        ],
      },
    ],
  },
];

// ─── BS Biochemistry — Faculty of Pharmacy, 4 years + summer practicum ──

const biochemCurriculum: YearLevel[] = [
  {
    year: 1,
    semesters: [
      {
        term: 'first',
        courses: [
          c('CHEM 111', 'General Chemistry I', 3, 2),
          c('ENG 1', 'Introduction to College English', 3, 0),
          c('FIL 1', 'Komunikasyon sa Akademikong Filipino', 3, 0),
          c('MATH 101', 'College Algebra', 3, 0),
          c('PSY 1', 'General Psychology', 3, 0),
          c('THY 1', 'Contextualized Salvation History', 3, 0),
          c('RC', 'Rizal Course', 3, 0),
          c('ZOO 101', 'General Zoology', 2, 1),
          c('PE 1', 'Physical Education I', 2, 0, [], 'pe'),
          c('NSTP 1', 'National Service Training Program I', 3, 0, [], 'nstp'),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CHEM 112', 'General Chemistry II', 3, 2, ['CHEM 111']),
          c('ENG 2', 'Reading and Thinking Skills for Academic Study', 3, 0, ['ENG 1']),
          c('FIL 2', 'Pagbasa at Pagsulat Tungo sa Pananaliksik', 3, 0, ['FIL 1']),
          c('MATH 102', 'Trigonometry', 3, 0, ['MATH 101']),
          c('PHL 2', 'Logic', 3, 0),
          c('THY 2', 'Church and Sacraments', 3, 0, ['THY 1']),
          c('BOT 102', 'General Botany with Taxonomy', 3, 2),
          c('PE 2', 'Physical Education II', 2, 0, [], 'pe'),
          c('NSTP 2', 'National Service Training Program II', 3, 0, ['NSTP 1'], 'nstp'),
        ],
      },
    ],
  },
  {
    year: 2,
    semesters: [
      {
        term: 'first',
        courses: [
          c('CHEM 200', 'Organic Chemistry', 3, 2, ['CHEM 111', 'CHEM 112']),
          c('CHEM 301', 'Analytical Chemistry I', 3, 2, ['CHEM 111', 'CHEM 112']),
          c('ENG 4', 'Oral Communication in Context', 3, 0),
          c('MATH 108', 'Differential Calculus', 3, 0, ['MATH 101', 'MATH 102']),
          c('PHL 5', 'Christian Ethics', 3, 0, ['THY 1', 'THY 2']),
          c('BIOSCI 2', 'Human Anatomy with Physiology', 3, 2, ['ZOO 101']),
          c('PE 3', 'Physical Education III', 2, 0, [], 'pe'),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CHEM 203', 'Organic Analysis', 3, 2, ['CHEM 200']),
          c('CHEM 302', 'Analytical Chemistry II', 3, 2, ['CHEM 301']),
          c('BIOCHEM 1', 'Chemistry of Biomolecules', 3, 2, ['CHEM 200']),
          c('MATH 109', 'Integral Calculus', 3, 0, ['MATH 108']),
          c('PHYSICS 201', 'General Physics', 4, 1, ['MATH 101', 'MATH 102']),
          c('SCL 3', 'The Social Teachings of the Church', 3, 0, ['THY 1', 'THY 2', 'PHL 5']),
          c('PE 4', 'Physical Education IV', 2, 0, [], 'pe'),
        ],
      },
    ],
  },
  {
    year: 3,
    semesters: [
      {
        term: 'first',
        courses: [
          c('CHEM 401', 'Physical Chemistry I', 3, 2, ['MATH 109', 'CHEM 111', 'PHYSICS 201']),
          c('BIOCHEM 2', 'Proteins, Carbohydrates and Lipids', 3, 2, ['BIOCHEM 1']),
          c('BIOCHEM 3', 'Nucleic Acids and Molecular Biology', 3, 0, ['BIOCHEM 1']),
          c('GIM', 'General and Industrial Microbiology', 3, 2, ['BOT 102', 'BIOCHEM 1']),
          c('MATH 600', 'Biostatistics', 2, 1, ['MATH 101', 'MATH 102']),
          c('HETAR', 'Health Economics with Taxation and Land Reform', 3, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CHEM 402', 'Physical Chemistry 2', 3, 1, ['CHEM 401']),
          c('BIOCHEM 4', 'Biochemical Catalysis', 2, 2, ['BIOCHEM 2', 'BIOCHEM 3']),
          c('BIOCHEM 5', 'Biochemical Techniques', 2, 2, ['BIOCHEM 2', 'BIOCHEM 3']),
          c('BIOCHEM 12', 'Cell Physiology and Genetics', 3, 0, ['BIOCHEM 2', 'BIOCHEM 3']),
          c('BIOINFO', 'Bioinformatics', 2, 1, ['BIOCHEM 2', 'BIOCHEM 3']),
          c('ENG 3', 'Academic Writing Skills', 3, 0, ['ENG 1', 'ENG 2']),
          c('SCL 9', 'Marriage and Family', 3, 0, ['THY 1', 'THY 2', 'PHL 5']),
        ],
      },
      {
        term: 'summer',
        courses: [
          c('APEPRACT', 'Advanced Practice Experience/Practicum', 0, 2),
        ],
      },
    ],
  },
  {
    year: 4,
    semesters: [
      {
        term: 'first',
        courses: [
          c('BIOCHEM 6', 'Intermediary Metabolism', 3, 2, ['BIOCHEM 4', 'BIOCHEM 12']),
          c('BIOCHEM 7', 'Physical Biochemistry', 2, 2, ['CHEM 402', 'BIOCHEM 1']),
          c('BIOCHEM 8', 'Nutritional Biochemistry', 3, 0, ['BIOCHEM 4', 'BIOCHEM 5']),
          c('BIOCHEM 9', 'Phytochemistry', 3, 0, ['BOT 102', 'BIOCHEM 2']),
          c('BIOENTREP', 'Bioentrepreneurship', 3, 0),
          c('PHAR', 'Pharmacology', 3, 1, ['MATH 600', 'BIOSCI 2']),
          c('THS 1', 'Thesis I', 1, 1),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CHEM 104', 'Advanced Inorganic Chemistry', 3, 0, ['CHEM 111', 'CHEM 112']),
          c('BIOCHEM 10', 'Immunology, Virology and Cancer', 3, 0, ['BIOCHEM 6']),
          c('BIOCHEM 11', 'Seminar in Biochemistry', 3, 0),
          c('LIT 102A', 'Philippine Literatures', 3, 0),
          c('SA', 'Socio-Anthropology', 3, 0),
          c('PD', 'Professional Deontology', 3, 0),
          c('PHISTCONS', 'Philippine History and Constitution', 3, 0),
          c('THS 2', 'Thesis II', 0, 2, ['THS 1']),
        ],
      },
    ],
  },
];

// ─── BS Medical Technology — Faculty of Pharmacy, 4 years ───────────────

const medtechCurriculum: YearLevel[] = [
  {
    year: 1,
    semesters: [
      {
        term: 'first',
        courses: [
          c('CHEM 100', 'General Inorganic Chemistry', 3, 2),
          c('ENG 1', 'Introduction to College English', 3, 0),
          c('FIL 1', 'Komunikasyon sa Akademikong Filipino', 3, 0),
          c('MATH 101', 'College Algebra', 3, 0),
          c('MT 1', 'Introduction to Medical Technology with STS', 3, 0),
          c('PHISTCONS', 'Philippine History and Constitution', 3, 0),
          c('PHL 2', 'Logic', 3, 0),
          c('THY 1', 'Contextualized Salvation History', 3, 0),
          c('PE 1', 'Physical Education 1', 2, 0, [], 'pe'),
        ],
      },
      {
        term: 'second',
        courses: [
          c('BIOSCI', 'Biological Sciences', 2, 1),
          c('CHEM 301', 'Analytical Chemistry I', 3, 2, ['CHEM 100']),
          c('ENG 2', 'Reading and Thinking Skills for Academic Study', 3, 0, ['ENG 1']),
          c('FIL 2', 'Pagbasa at Pagsulat tungo sa Pananaliksik', 3, 0, ['FIL 1']),
          c('MATH 102', 'Trigonometry', 3, 0),
          c('PHL 4', 'Philosophy of Man', 3, 0),
          c('PSY 1', 'General Psychology', 3, 0),
          c('THY 2', 'Church and Sacraments', 3, 0, ['THY 1']),
          c('PE 2', 'Physical Education 2', 2, 0, [], 'pe'),
        ],
      },
    ],
  },
  {
    year: 2,
    semesters: [
      {
        term: 'first',
        courses: [
          c('CHEM 200', 'Organic Chemistry', 3, 2, ['CHEM 100']),
          c('COMP 103', 'Introduction to Computer with Applications', 2, 1),
          c('ENG 4', 'Oral Communication in Context', 3, 0, ['ENG 1', 'ENG 2']),
          c('PHL 5', 'Christian Ethics', 3, 0, ['THY 1', 'THY 2']),
          c('PHYANA', 'Physiology-Anatomy', 3, 2),
          c('PHYS 201', 'General Physics', 3, 1, ['MATH 102']),
          c('SA', 'Socio-Anthropology', 3, 0),
          c('PE 3', 'Physical Education 3', 2, 0, [], 'pe'),
          c('NSTP 1', 'National Service Training Program I', 3, 0, [], 'nstp'),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CHEM 600', 'Biochemistry', 3, 2, ['PHYANA']),
          c('HHISTCG', 'Human Histology with Cytogenetics', 3, 1),
          c('LIT 102', 'Philippine Literatures', 3, 0),
          c('MTEDUC', 'Principles and Strategies of Teaching in Health Education', 3, 0),
          c('PHAR-MT', 'Pharmacology', 2, 0),
          c('RC', 'Rizal Course', 3, 0),
          c('SCL 3', 'The Social Teachings of the Church', 3, 0, ['PHL 5', 'THY 1', 'THY 2']),
          c('PE 4', 'Physical Education 4', 2, 0, [], 'pe'),
          c('NSTP 2', 'National Service Training Program II', 3, 0, ['NSTP 1'], 'nstp'),
        ],
      },
    ],
  },
  {
    year: 3,
    semesters: [
      {
        term: 'first',
        courses: [
          c('BIOSTAT', 'Biostatistics incl. Prevention and Community Nutrition', 2, 1, ['MATH 101', 'CHEM 600']),
          c('CLCH 1', 'Clinical Chemistry I', 4, 1, ['CHEM 301', 'CHEM 600', 'PHYANA']),
          c('ENG 3', 'Academic Writing Skills', 3, 0, ['ENG 1', 'ENG 2']),
          c('HEMA 1A', 'Clinical Hematology I', 3, 1),
          c('MICR 231', 'Bacteriology', 3, 2),
          c('PARA', 'Parasitology', 3, 0),
          c('SCL 9', 'Marriage and Family', 3, 0, ['PHL 5', 'SCL 3', 'THY 1', 'THY 2']),
        ],
      },
      {
        term: 'second',
        courses: [
          c('BB 1', 'Immunohematology (Blood Banking)', 2, 1, ['CHEM 600', 'HEMA 1A']),
          c('CLCH 2', 'Clinical Chemistry II', 4, 1, ['CLCH 1']),
          c('CLMC 1', 'Clinical Microscopy', 2, 1, ['CLCH 1', 'HEMA 1A', 'MICR 231', 'PARA']),
          c('GPHT 1', 'General Pathology and Histopathologic Techniques', 2, 1, ['HHISTCG']),
          c('HEMA 2', 'Clinical Hematology II', 2, 1, ['HEMA 1A']),
          c('MCRBIO 2', 'Mycology and Virology', 2, 0, ['MICR 231']),
          c('MTLB', 'Medical Technology Laws and Bioethics', 3, 0),
          c('SI 1', 'Immunology and Serology', 3, 1, ['CHEM 600', 'HHISTCG', 'MICR 231', 'PARA', 'PHYANA']),
        ],
      },
    ],
  },
  {
    year: 4,
    semesters: [
      {
        term: 'first',
        courses: [
          c('INTERN 1', 'Clinical Internship I', 0, 15),
          c('LABMGT', 'Clinical Laboratory Management', 2, 0),
          c('SEM I', 'Seminar I', 3, 0),
          c('THS I', 'Thesis I', 2, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CPH', 'Community and Public Health', 2, 3),
          c('INTERN II', 'Clinical Internship II', 0, 15),
          c('SEM 2', 'Seminar II', 3, 0),
          c('THS 2', 'Thesis II', 2, 0, ['THS I']),
        ],
      },
    ],
  },
];

// ─── BS Pharmacy — Faculty of Pharmacy, 4 years ────────────────────────

const pharmacyCurriculum: YearLevel[] = [
  {
    year: 1,
    semesters: [
      {
        term: 'first',
        courses: [
          c('BOT 102A', 'Pharmaceutical Botany with Taxonomy', 3, 2),
          c('CHEM 100', 'General Inorganic Chemistry', 3, 2),
          c('ENG 1', 'Introduction to College English', 3, 0),
          c('FIL 1', 'Komunikasyon sa Akademikong Filipino', 3, 0),
          c('MATH 101', 'College Algebra', 3, 0),
          c('PHAR 1', 'Introduction to Pharmacy', 3, 0),
          c('PSY 1', 'General Psychology', 3, 0),
          c('THY 1', 'Contextualized Salvation History', 3, 0),
          c('PE 1', 'Physical Education 1', 2, 0, [], 'pe'),
        ],
      },
      {
        term: 'second',
        courses: [
          c('ENG 2', 'Reading and Thinking Skills for Academic Study', 3, 0, ['ENG 1']),
          c('FIL 2', 'Pagbasa at Pagsulat tungo sa Pananaliksik', 3, 0, ['FIL 1']),
          c('PHAR 2', 'Pharmaceutical Calculations', 3, 0, ['PHAR 1']),
          c('PHARCARE 1', 'General Concepts of Health Care System', 3, 0),
          c('PHARCHM 1', 'Pharmaceutical Chemistry (Inorganic Medicinals)', 3, 2, ['CHEM 100', 'PHAR 1']),
          c('PHL 2', 'Logic', 3, 0),
          c('RC', 'Rizal Course', 3, 0),
          c('THY 2', 'Church and Sacraments', 3, 0, ['THY 1']),
          c('PE 2', 'Physical Education 2', 2, 0, [], 'pe'),
        ],
      },
    ],
  },
  {
    year: 2,
    semesters: [
      {
        term: 'first',
        courses: [
          c('BIOSCI 3', 'Human Anatomy, Physiology, & Patho-Physiology', 3, 2),
          c('CHEM 200', 'Organic Chemistry', 3, 2, ['CHEM 100']),
          c('COMP 103', 'Introduction to Computer with Applications', 2, 1),
          c('HETAR', 'Health Economics with Taxation and Land Reform', 3, 0),
          c('INTERN 1', 'Internship 1: Community Pharmacy', 1, 1, ['PHAR 1', 'PHAR 2']),
          c('PHAR 3', 'Pharmaceutical Dosage Forms', 3, 2),
          c('PHL 5', 'Christian Ethics', 3, 0, ['THY 1', 'THY 2']),
          c('PE 3', 'Physical Education 3', 2, 0, [], 'pe'),
          c('NSTP 1', 'National Service Training Program I', 3, 0, [], 'nstp'),
        ],
      },
      {
        term: 'second',
        courses: [
          c('MATH 600', 'Biostatistics', 2, 1, ['MATH 101']),
          c('PH-BIOCHEM', 'Pharmaceutical Biochemistry', 3, 2, ['CHEM 100', 'CHEM 200']),
          c('PH-MCR-PRS', 'Pharmaceutical Microbiology and Parasitology', 3, 2),
          c('PHAR 5', 'Hospital Pharmacy', 2, 1, ['PHAR 3']),
          c('PHYS 201', 'General Physics', 4, 1, ['MATH 101']),
          c('SCL 3', 'The Social Teachings of the Church', 3, 0, ['PHL 5', 'THY 1', 'THY 2']),
          c('PE 4', 'Physical Education 4', 2, 0, [], 'pe'),
          c('NSTP 2', 'National Service Training Program II', 3, 0, ['NSTP 1'], 'nstp'),
        ],
      },
    ],
  },
  {
    year: 3,
    semesters: [
      {
        term: 'first',
        courses: [
          c('INTERN 2', 'Internship II: Hospital Pharmacy', 1, 1, ['PHAR 5']),
          c('LIT 102A', 'Philippine Literatures', 3, 0),
          c('PHAR 4', 'Physical Pharmacy', 3, 1, ['CHEM 200', 'PHAR 3', 'PHYS 201']),
          c('PHARCARE 2', 'Public Health', 3, 0, ['PHARCARE 1', 'PH-MCR-PRS']),
          c('PHARCHM 2', 'Pharmacy and Chemistry of Organic Medicinals', 3, 1, ['PH-BIOCHEM', 'PHARCHM 1']),
          c('PHBS 1', 'Biopharmaceutics and Pharmacokinetics', 3, 0, ['BIOSCI 3', 'PH-BIOCHEM', 'PHAR 3']),
          c('PHL 4', 'Philosophy of Man', 3, 0, ['PHL 2']),
          c('SA', 'Socio-Anthropology', 3, 0),
        ],
      },
      {
        term: 'second',
        courses: [
          c('ENG 3', 'Academic Writing Skills', 3, 0, ['ENG 1', 'ENG 2']),
          c('PHAR 6', 'Pharmaceutical Manufacturing', 3, 2, ['PHAR 4']),
          c('PHARCARE 3', 'Communication and Interpersonal Skills', 3, 0, ['PHARCARE 2', 'PHL 4', 'PSY 1']),
          c('PHARCHM 3', 'Quality Control I', 3, 2, ['PHAR 4', 'PHARCHM 1']),
          c('PHBS 2A', 'Pharmacology I and Therapeutics', 4, 0, ['PH-MCR-PRS', 'PHBS 1']),
          c('PHBS 3', 'Pharmacognosy with PMP and Plant Chemistry', 3, 2, ['BOT 102A', 'PH-BIOCHEM']),
          c('RTW 1', 'Research and Thesis Writing I', 1, 0, ['MATH 600', 'PHARCHM 2']),
        ],
      },
    ],
  },
  {
    year: 4,
    semesters: [
      {
        term: 'first',
        courses: [
          c('INTERN 3', 'Internship III: Manufacturing Pharmacy', 1, 1, ['PHAR 6']),
          c('PH-INFO', 'Pharmacy Informatics', 2, 1, ['COMP 103', 'MATH 600']),
          c('PHAR 11', 'Principles of Pharmacy Administration and Management I', 3, 0, ['PHAR 6', 'PHARCARE 3']),
          c('PHARCARE 4', 'Dispensing and Medication Counseling', 3, 1, ['PHARCARE 3']),
          c('PHARCHM 4', 'Quality Control with Instrumentation', 3, 1, ['PHAR 6', 'PHARCHM 3']),
          c('PHBS 2B', 'Pharmacology II and Therapeutics', 3, 1, ['PHBS 2A']),
          c('RTW 2', 'Research and Thesis Writing II', 1, 2, ['RTW 1']),
          c('SCL 9', 'Marriage and Family', 3, 0, ['PHL 5', 'SCL 3', 'THY 1', 'THY 2']),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CA', 'Course Audit', 5, 0),
          c('HETHICS', 'Health Ethics', 3, 0, ['PHL 5']),
          c('PHAR 12', 'Pharmaceutical Marketing and Entrepreneurship', 3, 0, ['PHAR 11']),
          c('PHARCARE 5', 'Clinical Pharmacy I', 3, 1, ['PHARCARE 4', 'PHBS 2B']),
          c('PHARCHM 5', 'Clinical Toxicology', 2, 1, ['PHARCHM 3', 'PHBS 2B']),
          c('PHARJUR', 'Pharmaceutical Jurisprudence and Ethics', 3, 0, ['PHAR 5', 'PHAR 6']),
          c('PHISTCONS', 'Philippine History and Constitution', 3, 0),
        ],
      },
    ],
  },
];

// ─── BS Pharmacy, Clinical Pharmacy — Faculty of Pharmacy, 5 years ─────

const clinicalPharmCurriculum: YearLevel[] = [
  // Years 1-3 are identical to BS Pharmacy
  ...pharmacyCurriculum.slice(0, 3).map(yl => ({ ...yl, semesters: yl.semesters.map(s => ({ ...s, courses: [...s.courses] })) })),
  {
    year: 4,
    semesters: [
      {
        term: 'first',
        courses: [
          c('INTERN 3', 'Internship III: Manufacturing Pharmacy', 1, 1, ['PHAR 6']),
          c('PH-INFO', 'Pharmacy Informatics', 2, 1, ['COMP 103', 'MATH 600']),
          c('PHAR 13', 'Drug and Disease Management I', 3, 0),
          c('PHARCARE 4', 'Dispensing and Medication Counseling', 3, 1, ['PHARCARE 3']),
          c('PHARCHM 4', 'Quality Control with Instrumentation', 3, 1, ['PHAR 6', 'PHARCHM 3']),
          c('PHBS 2B', 'Pharmacology II and Therapeutics', 3, 1, ['PHBS 2A']),
          c('RTW 2', 'Research and Thesis Writing II', 1, 2, ['RTW 1']),
        ],
      },
      {
        term: 'second',
        courses: [
          c('HETHICS', 'Health Ethics', 3, 0, ['PHL 5']),
          c('PHAR 14', 'Drug and Disease Management II', 3, 0, ['PHAR 13']),
          c('PHAR 16', 'Drug Information and Literature Information', 3, 0),
          c('PHARCARE 5', 'Clinical Pharmacy I', 3, 1, ['PHARCARE 4', 'PHBS 2B']),
          c('PHARCHM 5', 'Clinical Toxicology', 2, 1, ['PHARCHM 3', 'PHBS 2B']),
          c('PHISTCONS', 'Philippine History and Constitution', 3, 0),
          c('SCL 9', 'Marriage and Family', 3, 0, ['PHL 5', 'SCL 3', 'THY 1', 'THY 2']),
        ],
      },
    ],
  },
  {
    year: 5,
    semesters: [
      {
        term: 'first',
        courses: [
          c('MICR 228', 'Immunology', 3, 1, ['PH-MCR-PRS', 'PHAR 14']),
          c('PHAR 11', 'Principles of Pharmacy Administration and Management I', 3, 0, ['PHAR 6', 'PHARCARE 3']),
          c('PHAR 15', 'Drug Disease and Management III', 3, 0, ['PHAR 14']),
          c('PHAR 17', 'Adverse Drug Reaction', 3, 0, ['PHARCHM 5']),
          c('PHAR 18', 'Radiopharmacy', 3, 0),
          c('PHARCARE 6', 'Clinical Pharmacy II', 3, 1, ['PHARCARE 5']),
        ],
      },
      {
        term: 'second',
        courses: [
          c('CA', 'Course Audit', 5, 0, ['PHARCARE 6']),
          c('CLERKSHIP', 'Clerkship', 0, 8),
          c('PHAR 12', 'Pharmaceutical Marketing and Entrepreneurship', 3, 0, ['PHAR 11']),
          c('PHAR 19', 'Patient Medication and Assessment', 3, 0, ['PHAR 15', 'PHARCARE 6']),
          c('PHARJUR', 'Pharmaceutical Jurisprudence and Ethics', 3, 0, ['PHAR 5', 'PHAR 6']),
        ],
      },
    ],
  },
];

// ── Main ──

const jsonPath = path.join(__dirname, 'ust-curricula.json');
const data: CurriculaData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

function replaceProgram(slug: string, updates: Partial<ProgramEntry>) {
  const idx = data.programs.findIndex(p => p.slug === slug);
  if (idx >= 0) {
    Object.assign(data.programs[idx], updates);
    console.log(`[REPLACED] ${slug} — ${updates.curriculum?.length} years, ${updates.curriculum?.flatMap(y => y.semesters).length} terms`);
    for (const yl of data.programs[idx].curriculum) {
      for (const s of yl.semesters) {
        console.log(`  Y${yl.year}-${s.term}: ${s.courses.length} courses`);
      }
    }
  } else {
    console.log(`[NOT FOUND] ${slug}`);
  }
}

function addProgram(program: ProgramEntry) {
  const existing = data.programs.findIndex(p => p.slug === program.slug);
  if (existing >= 0) {
    data.programs[existing] = program;
    console.log(`[UPDATED] ${program.slug}`);
  } else {
    data.programs.push(program);
    data.totalPrograms = data.programs.length;
    data.successfulScrapes = data.programs.length;
    console.log(`[ADDED] ${program.slug}`);
  }
  for (const yl of program.curriculum) {
    for (const s of yl.semesters) {
      console.log(`  Y${yl.year}-${s.term}: ${s.courses.length} courses`);
    }
  }
}

// 1. Fix BSBHS (LEAPMed)
replaceProgram('bachelor-of-science-in-basic-human-studies', {
  name: 'Bachelor of Science in Basic Human Studies (LEAPMed)',
  college: 'Faculty of Medicine and Surgery',
  cluster: 'Health',
  curriculum: bsbhsCurriculum,
});

// 2. Add Doctor of Medicine
addProgram({
  name: 'Doctor of Medicine',
  slug: 'doctor-of-medicine',
  college: 'Faculty of Medicine and Surgery',
  cluster: 'Health',
  curriculum: medicineCurriculum,
});

// 3. Fix BS Biochemistry (move to Faculty of Pharmacy)
replaceProgram('bachelor-of-science-in-biochemistry', {
  name: 'Bachelor of Science in Biochemistry',
  college: 'Faculty of Pharmacy',
  cluster: 'Health',
  curriculum: biochemCurriculum,
});

// 4. Fix BS Medical Technology (move to Faculty of Pharmacy)
replaceProgram('bachelor-of-science-in-medical-technology', {
  name: 'Bachelor of Science in Medical Technology',
  college: 'Faculty of Pharmacy',
  cluster: 'Health',
  curriculum: medtechCurriculum,
});

// 5. Fix BS Pharmacy
replaceProgram('bachelor-of-science-in-pharmacy', {
  name: 'Bachelor of Science in Pharmacy',
  college: 'Faculty of Pharmacy',
  cluster: 'Health',
  curriculum: pharmacyCurriculum,
});

// 6. Fix BS Pharmacy, Clinical Pharmacy
replaceProgram('bachelor-of-science-in-pharmacy-major-in-clinical-pharmacy', {
  name: 'Bachelor of Science in Pharmacy, major in Clinical Pharmacy',
  college: 'Faculty of Pharmacy',
  cluster: 'Health',
  curriculum: clinicalPharmCurriculum,
});

// Validate
let issues = 0;
const MAX = 15;
for (const p of data.programs) {
  for (const yl of p.curriculum) {
    for (const s of yl.semesters) {
      if (s.courses.length > MAX) {
        console.log(`WARNING: ${p.slug} Y${yl.year}-${s.term}: ${s.courses.length} courses (>${MAX})`);
        issues++;
      }
    }
  }
}

if (issues > 0) {
  console.log(`\n${issues} semesters exceed ${MAX} courses`);
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`\nSaved to ${jsonPath}`);
console.log(`Total programs: ${data.programs.length}`);
