export const experience = [
  {
    title: 'Software Developer & QA Engineer',
    company: 'EdTech',
    period: 'March 2025 to Present',
    location: 'Remote',
    note: 'Promoted from contractor (March 2025) to full-time (October 2025).',
    highlights: [
      'Built and released Selectivity by Quintiles, a new analytics visualization based on a design handoff. Linked institutional data to student application, admission, and enrollment outcomes, handled missing data, and added 78 Playwright E2E tests.',
      'Developed counselor-facing features and fixed crashes caused by incomplete student data. Contributed to the migration from the legacy application to Nuxt.',
      'Develop and debug across legacy and Nuxt applications in a local environment with shared authentication and databases, hostname-based routing, and separate branch previews.',
      'Contributed to the Analytics Visualization refactor and led QA. Helped define requirements and verified calculations using historical data, current account settings, and user permissions.',
      'Investigated production bugs using customer reports, code review, and PostHog session replay. Authored and maintained 1,100+ Playwright regression tests covering authentication, billing, imports, role management, and analytics. Automated all Plan Sharing flows, catching multiple bugs and running the tests after each development update to reduce manual QA.',
    ],
  },
  {
    title: 'Software Development Intern',
    company: 'Simon Care Management, Corp.',
    period: 'September 2024 to December 2024',
    location: 'Remote',
    highlights: [
      'Contributed to mobile application development focused on safety management for patients with Alzheimer’s and their caretakers.',
      'Improved accessibility across key flows so patients and caregivers could use the app more reliably.',
      'Helped improve location accuracy and location-based alerts used for patient safety monitoring.',
      'Debugged and resolved production issues and collaborated with development and leadership to design and ship product enhancements.',
      'Supported early ML feature roadmap planning from datasets and requirements discussions.',
    ],
  },
  {
    title: 'Teaching Assistant',
    company: 'Arizona State University',
    period: 'October 2022 to December 2022',
    location: 'Remote',
    highlights: [
      'Supported student learning by holding review sessions and providing personalized guidance.',
      'Collaborated closely with faculty to manage and create course content.',
    ],
  },
  {
    title: 'Independent Business Owner',
    company: 'Retail & E-Commerce',
    period: '2018 to 2021',
    location: 'Torrance, CA',
    highlights: [
      'Led all aspects of business operations, including employee management, hiring, scheduling, and payroll.',
      'Developed strong leadership and problem-solving skills by managing store operations, customer service, and stock management independently.',
      'Oversaw online sales, account management, and customer relations, ensuring timely order fulfillment and resolving issues.',
    ],
  },
];

export type Experience = (typeof experience)[number];

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

function parsePeriodDate(raw: string): Date | null {
  const s = raw.trim().toLowerCase();
  if (s === 'present') return new Date();

  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) return new Date(Number(yearOnly[1]), 0, 1);

  const match = s.match(/^([a-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const monthIndex = MONTHS.indexOf(match[1]);
  if (monthIndex === -1) return null;
  return new Date(Number(match[2]), monthIndex, 1);
}

/** Renders a job's `period` (e.g. "March 2025 to Present") as a duration like "1 yr 7 mos". */
export function formatDuration(period: string): string | null {
  const [startRaw, endRaw] = period.split(/\s+to\s+/i);
  if (!startRaw || !endRaw) return null;
  const start = parsePeriodDate(startRaw);
  const end = parsePeriodDate(endRaw);
  if (!start || !end) return null;

  // Year-only ranges (e.g. "2018 to 2021") don't carry month precision,
  // so don't add the "inclusive month" offset used for month-level periods.
  const isYearOnly = /^\d{4}$/.test(startRaw.trim()) && /^\d{4}$/.test(endRaw.trim());
  const inclusiveOffset = isYearOnly ? 0 : 1;

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + inclusiveOffset;
  if (months < 1) return null;

  const years = Math.floor(months / 12);
  months = months % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mo${months > 1 ? 's' : ''}`);
  return parts.length ? parts.join(' ') : '1 mo';
}
