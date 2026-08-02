export interface Course {
  code: string;
  title: string;
  term: string;
  bullets: string[];
  portfolioFeatured?: boolean;
}

export interface Degree {
  id: string;
  degree: string;
  school: string;
  conferred: string;
  gpa?: string;
  honors?: string;
  certificate?: { name: string; status: string; pdfUrl: string };
  portfolio?: { title: string; description: string; pdfUrl: string };
  courses: Course[];
}

export const mastersDegree: Degree = {
  id: 'masters',
  degree: 'Master of Science, Computer Science',
  school: 'Arizona State University, Ira A. Fulton Schools of Engineering',
  conferred: 'July 2026',
  gpa: '3.37',
  certificate: {
    name: 'Graduate Certificate, Big Data',
    status: 'Awarded 2026, Arizona State University',
    pdfUrl: `${import.meta.env.BASE_URL}docs/big-data-certificate.pdf`,
  },
  portfolio: {
    title: 'MCS Portfolio Report',
    description:
      'Degree completion artifact featuring K-Means clustering (CSE 575) and a PyTorch neural network for robot collision prediction (CSE 571), trained on simulated 5-sensor robot data.',
    pdfUrl: `${import.meta.env.BASE_URL}docs/mcs-portfolio.pdf`,
  },
  courses: [
    {
      code: 'CSE 340',
      title: 'Principles of Programming Languages',
      term: 'Fall 2024',
      bullets: [
        'Lexical and syntax analysis, semantics, and type systems',
        'Lambda calculus and formal language foundations',
        'FIRST/FOLLOW sets and LL parsing techniques',
      ],
    },
    {
      code: 'CSE 575',
      title: 'Statistical Machine Learning',
      term: 'Fall 2024',
      portfolioFeatured: true,
      bullets: [
        'Supervised/unsupervised learning: Naive Bayes, SVMs, neural networks, CNNs',
        'Portfolio Project #1: K-Means vs K-Means++ on 300 2D points',
        'Elbow Method analysis; optimal K ≈ 5',
      ],
    },
    {
      code: 'CSE 571',
      title: 'Artificial Intelligence',
      term: 'Fall 2024',
      portfolioFeatured: true,
      bullets: [
        'Autonomous agents, reinforcement learning, and robotics',
        'Portfolio Project #2: PyTorch collision predictor',
        '5 distance sensors + steering; 1 FP and 5 missed collisions in 1,000 tests',
      ],
    },
    {
      code: 'CSE 578',
      title: 'Data Visualization',
      term: 'Spring 2025',
      bullets: [
        'Visualization design grounded in cognition and perception',
        'Python/Jupyter: scatter plots, choropleths, time series',
        'Course project: income-driven marketing analysis with Census-style data',
      ],
    },
    {
      code: 'CSE 572',
      title: 'Data Mining',
      term: 'Spring 2025',
      bullets: [
        'Classification, clustering, association rules, deep learning',
        'Python, NumPy, pandas, scikit-learn on large datasets',
        'Compared techniques under real-world constraints',
      ],
    },
    {
      code: 'CSE 548',
      title: 'Advanced Computer Network Security',
      term: 'Summer 2025',
      bullets: [
        'PKI, VPNs, attack graphs, SDN/NFV and cloud security',
        'ML/AI applications for network security',
        'Hands-on: Python, VirtualBox, firewall/NAT labs',
      ],
    },
    {
      code: 'CSE 551',
      title: 'Foundations of Algorithms',
      term: 'Fall 2025',
      bullets: [
        'Stable matching, greedy methods, dynamic programming, network flows',
        'NP-completeness and approximation algorithms',
        '8 coding assignments plus proctored exams',
      ],
    },
    {
      code: 'CSE 568',
      title: 'Biocomputing',
      term: 'Fall 2025',
      bullets: [
        'Genetic algorithms, artificial immune systems, ACO',
        'Swarm robotics and neurocomputing',
        'Research readings on collective computation',
      ],
    },
    {
      code: 'CSE 545',
      title: 'Software Security',
      term: 'Spring 2026',
      bullets: [
        'Buffer overflows, x86-64 assembly, ELF binaries',
        'Web exploitation: SQL injection, session hijacking',
        'Offensive techniques to inform defensive design',
      ],
    },
    {
      code: 'CSE 539',
      title: 'Applied Cryptography',
      term: 'Spring 2026',
      bullets: [
        'Hash functions, Diffie-Hellman, RSA, Kerberos, SSL/TLS',
        'RSA key generation in C# with 200+ bit primes',
        'Steganography and cryptanalysis projects',
      ],
    },
    {
      code: 'CSE 543',
      title: 'Information Assurance & Security',
      term: 'Summer 2026',
      bullets: [
        'CIA triad, software security lifecycle, crypto fundamentals',
        'Defense-in-Depth and organizational IT security risk',
        'Exploitation projects bridging network and application security',
      ],
    },
  ],
};

export const bachelorsDegree: Degree = {
  id: 'bachelors',
  degree: 'Bachelor of Science, Software Engineering',
  school: 'Arizona State University, Ira A. Fulton Schools of Engineering',
  conferred: 'June 2024',
  gpa: '3.50',
  honors: "Cum Laude, Dean's List (Fall 2022 to Spring 2024)",
  courses: [
    { code: 'CSE 240', title: 'Introduction to Programming Languages', term: 'Summer 2022', bullets: ['C, C++, Scheme/Racket, and Prolog', 'Type systems, functional and logic programming'] },
    { code: 'SER 222', title: 'Design & Analysis of Data Structures & Algorithms', term: 'Summer 2022', bullets: ['Topological sort on DAGs', 'Graph data structures in Java'] },
    { code: 'SER 216', title: 'Software Enterprise: Personal Process & Quality', term: 'Fall 2022', bullets: ['Personal Software Process (PSP) and defect logging', 'Peer reviews and JaCoCo test coverage'] },
    { code: 'SER 315', title: 'Software Enterprise: Design & Process', term: 'Spring 2023', bullets: ['Chain of Responsibility, Composite, Adapter patterns', 'Z notation and reverse engineering'] },
    { code: 'SER 316', title: 'Software Enterprise: Construction', term: 'Spring 2023', bullets: ['Agile/Scrum with Taiga and GitHub Actions CI', 'Team bus scheduling system on Memoranda codebase'] },
    { code: 'SER 334', title: 'Operating Systems & System Programming', term: 'Spring 2023', bullets: ['Pthread multithreading and BMP image processing in C', 'IPC and page replacement analysis'] },
    { code: 'SER 321', title: 'Software Systems', term: 'Summer 2023', bullets: ['Java sockets, JMS, Protobuf, gRPC service registry', 'Distributed systems and P2P chat'] },
    { code: 'SER 335', title: 'Engineering Secure Software Systems', term: 'Fall 2023', bullets: ['SQL injection awareness and password hashing', 'Security patterns on a Java file manager'] },
    { code: 'SER 401/402', title: 'Computing Capstone I & II', term: '2023 to 2024', bullets: ['Healthcare regulatory assessment web app for Nash Consulting', 'React frontend, FOSSA compliance, quality reporting'] },
    { code: 'SER 322', title: 'Database Management', term: 'Spring 2024', bullets: ['ER modeling, relational algebra, SQL schema design', 'JDBC lab work'] },
    { code: 'SER 423', title: 'Mobile Systems', term: 'Spring 2024', bullets: ['Android (Kotlin/Compose) and React Native', 'Redux and native module bridges'] },
    { code: 'SER 463', title: 'Introduction to Human-Computer Interaction', term: 'Summer 2024', bullets: ['User-centered design and usability testing', 'E-commerce UX redesign capstone'] },
  ],
};

export const educationSections = [
  { id: 'masters', label: "Master's Degree" },
  { id: 'big-data-cert', label: 'Big Data Certificate' },
  { id: 'mcs-portfolio', label: 'MCS Portfolio Report' },
  { id: 'bachelors', label: "Bachelor's Degree" },
];
