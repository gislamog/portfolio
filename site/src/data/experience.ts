export const experience = [
  {
    title: 'Support & QA Engineer',
    company: 'EdTech SaaS Company',
    period: 'March 2025 to Present',
    location: 'Remote',
    note: 'Promoted from independent contractor (March 2025) to full-time employee (October 2025).',
    highlights: [
      'Investigate and resolve live-data bugs surfaced through customer reports, direct code review, and session-replay analysis (PostHog), tracing root causes across the full stack.',
      'Help define requirements and functional specifications for an internal analytics and visualization platform that reconciles historical data across years with live, role-based account associations.',
      'Work directly with Product Engineering to define and validate analytics calculations, ensuring reporting logic is both technically accurate and correctly reflects real-world data conditions.',
      'Author and maintain 1,100+ automated Playwright regression tests covering account management, data import, authentication, billing flows, and analytics dashboards.',
      'Serve as a liaison between Product Engineering, Relationship Managers, and customers, translating technical decisions for non-technical stakeholders.',
      'Participate in DevOps, product management, and sales discussions alongside engineering work.',
    ],
  },
  {
    title: 'Software Development Intern',
    company: 'Simon Care Management, Corp.',
    period: 'September 2024 to December 2024',
    location: 'Remote',
    highlights: [
      'Identified, debugged, and resolved issues within the existing production codebase.',
      'Partnered with development and leadership teams to design and build new features and product enhancements.',
      'Worked with datasets to help build a roadmap for the company\'s machine learning features.',
      'Participated in cross-team meetings, contributing to project requirements and team goals.',
    ],
  },
  {
    title: 'Teaching Assistant',
    company: 'Arizona State University',
    period: '[Start to End dates placeholder]',
    location: 'Tempe, AZ / Remote',
    highlights: [
      '[Course name placeholder, e.g. SER 222 or CSE 205]',
      'Supported students with programming assignments, debugging, and course concepts.',
      'Held office hours and reviewed lab submissions.',
      '[Add specific course details when ready]',
    ],
  },
];

export type Experience = (typeof experience)[number];
