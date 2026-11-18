export const experience = [
  {
    title: 'Software Developer & QA Engineer',
    company: 'EdTech',
    period: '2025 to Present',
    // Actual start, kept separately from the year-only `period` shown on the
    // page so the duration below can round up from real elapsed time
    // (started March) instead of from the displayed year alone.
    started: '2025-03',
    location: 'Remote',
    // Tech-stack icons shown on the Work timeline card, most load-bearing
    // first. Keys into techStackIcons (ExperiencePage.tsx).
    stack: ['JavaScript', 'Vue', 'PHP', 'Docker', 'Cloudflare'],
    highlights: [
      'Built production features for CK360 analytics in Nuxt/Vue, contributing to eight visualization refactors and owning Selectivity by Quintiles from requirements through release.',
      'Developed counselor-facing features, fixed crashes caused by incomplete student data, and implemented redirects to the new Nuxt application during the CK360 migration.',
      'Traced production bugs to their root cause across the UI, API, and database through code review, local reproduction, and PostHog session replay, including data-mutation, type-comparison, and rendering bugs. Verified deployments with SQL queries against the live database.',
      'Built a 1,700+ test Playwright suite with multi-user authentication and isolated test data, plus internal APIs that reset test organizations without direct database access. Automated Plan Sharing flows to catch 12 bugs before release.',
    ],
  },
  {
    title: 'Software Development Intern',
    company: 'Simon Care Management, Corp.',
    period: '2024',
    started: '2024-09',
    ended: '2024-12',
    location: 'Remote',
    stack: ['Android', 'Kotlin'],
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
    period: '2022',
    started: '2022-10',
    ended: '2022-12',
    location: 'Remote',
    stack: ['ASU'],
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

/** Parses "YYYY-MM"; falls back to January of that year when only a bare
    year is given (the Retail & E-Commerce entry has no month precision). */
function parseMonth(raw: string, fallbackMonth: number): Date {
  const match = raw.match(/^(\d{4})(?:-(\d{2}))?$/);
  const year = Number(match![1]);
  const month = match![2] ? Number(match![2]) - 1 : fallbackMonth;
  return new Date(year, month, 1);
}

/** Renders a job's elapsed time as a whole-year duration like "2 yrs",
    rounding UP from the precise start/end (or from the bare years in
    `period` for jobs with no month-level data), so a tenure of 1 yr 9 mo
    reads as "2 yrs" rather than being truncated to "1 yr". Any stint over 0
    months rounds up to at least "1 yr". */
export function formatDuration(period: string, started?: string, ended?: string): string | null {
  const [startRaw, endRaw] = period.split(/\s+to\s+/i);
  if (!startRaw) return null;

  const start = parseMonth(started ?? startRaw, 0);
  const endSource = ended ?? (endRaw?.trim().toLowerCase() === 'present' || !endRaw ? undefined : endRaw);
  const end = endSource ? parseMonth(endSource, 11) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 1) return null;
  const years = Math.ceil(months / 12);
  return `${years} yr${years > 1 ? 's' : ''}`;
}
