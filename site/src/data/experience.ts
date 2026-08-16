export const experience = [
  {
    title: 'Support & QA Engineer / Software Developer',
    company: 'EdTech',
    period: 'March 2025 to Present',
    location: 'Remote',
    note: 'Promoted from contractor (March 2025) to full-time (October 2025).',
    highlights: [
      'Shipped production features including counselor-facing workflow UI, reliability work that eliminated runtime crashes on incomplete student data, and front-door redirects onto a Nuxt experience during a platform migration.',
      'Led QA for the Analytics Visualization refactor. Helped define requirements and validated calculation logic for a platform that reconciles multi-year historical data with live, role-based account state so reporting matches real operational conditions. Contributed some development on the same project.',
      'Develop against a multi-service local platform (shared database/auth, hostname-based routing, and parallel branch previews), using AI-assisted workflows to move faster across legacy and Nuxt surfaces while reviewing outputs for correctness and edge cases.',
      'Owned production triage for live-data defects using customer reports, code review, and PostHog session replay; authored and maintained 1,100+ Playwright regression tests covering authentication, billing, imports, role management, and analytics dashboards.',
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
  // Recruiter-hidden until dates and course details are filled in.
  // {
  //   title: 'Teaching Assistant',
  //   company: 'Arizona State University',
  //   period: '[Start to End dates placeholder]',
  //   location: 'Tempe, AZ / Remote',
  //   highlights: [
  //     '[Course name placeholder, e.g. SER 222 or CSE 205]',
  //     'Supported students with programming assignments, debugging, and course concepts.',
  //     'Held office hours and reviewed lab submissions.',
  //     '[Add specific course details when ready]',
  //   ],
  // },
];

export type Experience = (typeof experience)[number];
