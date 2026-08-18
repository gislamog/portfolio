export const profile = {
  name: 'Gulsum Islamoglu',
  title: 'Software Engineer',
  location: 'Southern California',
  email: 'gulsum.islamoglu8@gmail.com',
  phone: '(909) 452-2916',
  github: 'https://github.com/gislamog',
  linkedin: 'https://www.linkedin.com/in/gulsum-islamoglu8',
  handshake: 'https://asu.joinhandshake.com/profiles/gulsum-islamoglu',
  photoUrl: `${import.meta.env.BASE_URL}images/profile.png`,
  asuLogoUrl: `${import.meta.env.BASE_URL}images/asu-logo.png`,
  credentials: [
    {
      label: 'M.S. Computer Science',
      detail: 'Arizona State University · July 2026 · GPA 3.37',
    },
    {
      label: 'B.S. Software Engineering',
      detail: 'Arizona State University · June 2024 · Cum Laude · GPA 3.50',
    },
    {
      label: 'Graduate Certificate, Big Data',
      detail: 'Arizona State University · Awarded 2026',
    },
  ],
  tech: [
    'JavaScript',
    'Python',
    'React',
    'Nuxt',
    'Playwright',
    'Vue',
    'Joomla',
    'PyTorch',
  ] as const,
  skills: [
    ['Languages & Frameworks', ['JavaScript', 'Python', 'React', 'Nuxt / Vue', 'Joomla', 'Playwright']],
    ['AI & Development', ['AI-assisted implementation', 'Full-stack debugging', 'Multi-service local platforms']],
    ['Data & ML', ['PyTorch', 'Statistical machine learning', 'Data visualization', 'Analytics validation']],
    ['Security & CS', ['Applied cryptography', 'Software security', 'Algorithms', 'Databases']],
  ] as const,
};
