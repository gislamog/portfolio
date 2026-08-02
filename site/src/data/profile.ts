export const profile = {
  name: 'Gulsum Islamoglu',
  title: 'Software Developer',
  location: 'Riverside, CA',
  email: 'gulsum.islamoglu8@gmail.com',
  phone: '(909) 452-2916',
  github: 'https://github.com/gislamog',
  linkedin: 'https://www.linkedin.com/in/gulsum-islamoglu8',
  handshake: 'https://asu.joinhandshake.com/profiles/gulsum-islamoglu',
  photoUrl: `${import.meta.env.BASE_URL}images/profile.png`,
  asuLogoUrl: `${import.meta.env.BASE_URL}images/asu-logo.png`,
  credentials: [
    {
      label: 'Master of Science, Computer Science',
      detail: 'Arizona State University · July 2026 · GPA 3.37',
    },
    {
      label: 'Graduate Certificate, Big Data',
      detail: 'Arizona State University · Awarded 2026',
    },
    {
      label: 'Bachelor of Science, Software Engineering',
      detail: 'Arizona State University · June 2024 · Cum Laude · GPA 3.50',
    },
    {
      label: '1,100+ Playwright regression tests',
      detail: 'Authored and maintained at current EdTech role',
    },
  ],
  skills: [
    ['Security', ['Applied cryptography', 'Software security', 'Network security', 'Information assurance', 'Vulnerability identification']],
    ['Data & ML', ['Data mining', 'Data visualization', 'Statistical machine learning', 'Artificial intelligence', 'Biocomputing']],
    ['Testing & QA', ['Manual & automated test design', 'Playwright', 'Regression testing', 'Test documentation']],
    ['Core CS', ['Algorithms', 'Operating systems', 'Database management', 'Mobile systems', 'Full-stack development']],
  ] as const,
};
