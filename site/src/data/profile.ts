export const profile = {
  name: 'Gulsum Islamoglu',
  title: 'Software Engineer',
  location: 'Southern California',
  email: 'gulsum.islamoglu8@gmail.com',
  phone: '(909) 452-2916',
  github: 'https://github.com/gislamog',
  linkedin: 'https://www.linkedin.com/in/gulsum-islamoglu8',
  handshake: 'https://asu.joinhandshake.com/profiles/gulsum-islamoglu',
  asuLogoUrl: `${import.meta.env.BASE_URL}images/asu-logo.png`,
  credentials: [
    {
      label: 'M.S. Computer Science',
      detail: 'Arizona State University · July 2026 · GPA 3.37',
      url: 'https://degrees.asu.edu/masters-phd/major/ASU00/ESCOMSCMCS',
    },
    {
      label: 'B.S. Software Engineering',
      detail: 'Arizona State University · June 2024 · Cum Laude · GPA 3.50',
      url: 'https://degrees.asu.edu/bachelors/major/ASU00/TSSERBS/software-engineering',
    },
    {
      label: 'Graduate Certificate,\nBig Data',
      detail: 'Arizona State University · Awarded 2026',
      url: 'https://degrees.asu.edu/masters-phd/major/ASU00/ESBDTAGRCT/big-data-graduate-certificate',
    },
  ],
  tech: [
    'JavaScript',
    'Python',
    'React',
    'Nuxt',
    'Playwright',
    'Vue',
    'PyTorch',
    'Godot',
  ] as const,
  skills: [
    {
      category: 'Languages & Frameworks',
      blurb: 'The languages and frameworks I build with day to day, across frontend, backend, and CMS work.',
      items: ['JavaScript', 'Python', 'React', 'Nuxt / Vue', 'Joomla', 'Playwright'],
    },
    {
      category: 'AI & Development',
      blurb: 'Shipping real features faster by pairing AI-assisted workflows with careful full-stack debugging.',
      items: ['AI-assisted implementation', 'Full-stack debugging', 'Multi-service local platforms'],
    },
    {
      category: 'Data & ML',
      blurb: 'From model training to turning raw numbers into visuals people actually trust.',
      items: ['PyTorch', 'Statistical machine learning', 'Data visualization', 'Analytics validation'],
    },
    {
      category: 'Security & CS',
      blurb: 'Core computer science fundamentals underpinning secure, well-structured software.',
      items: ['Applied cryptography', 'Software security', 'Algorithms', 'Databases'],
    },
  ] as const,
};
