const img = (path: string) => `${import.meta.env.BASE_URL}images/${path}`;

export function courseHref(code: string) {
  return `/education#course-${code.toLowerCase().replace(/\s+/g, '-')}`;
}

export function projectHref(id: string) {
  return `/projects#${id}`;
}

export function demoHref(demoId: string) {
  return `/demos#${demoId}`;
}

/**
 * First demo built for a course, or undefined if none.
 * Some courses (CSE 575) back more than one demo; the first is the primary.
 */
export function demoIdForCourse(code: string) {
  return projects.find((p) => p.courseCode === code && p.demoId)?.demoId;
}

export function projectGithubHref(project: Project): string | undefined {
  return project.githubUrl;
}

export const REPO_COLLISION_PREDICTOR = 'https://github.com/gislamog/cse571-collision-prediction';
export const REPO_SKILLS = 'https://github.com/gislamog/skills';

export interface Project {
  id: string;
  title: string;
  tags: string[];
  tone: string;
  description: string;
  highlights: string[];
  image?: string;
  demoId?: string;
  courseCode?: string;
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'academic-quintiles',
    title: 'Selectivity by Quintiles',
    tags: ['Nuxt', 'Data Visualization', 'EdTech'],
    tone: 'teal',
    image: img('projects/academic-quintiles.png'),
    description:
      'Built a new CK360 visualization from a design handoff, with no legacy implementation to reference. The page combines three stacked-bar charts and a 13-column detail table to show how applications, admissions, and enrollments are distributed across five college-selectivity bands for each WGPA quintile.',
    highlights: [
      'Served as the technical lead, organizing and leading design meetings with the CEO, Product, and Support teams to shape the visualization, define requirements, and resolve design decisions',
      'Designed separate filtering behavior for the charts and table: selectivity filters dim chart segments to preserve the full distribution, while all active filters narrow the application-level table',
      'Built a custom DOM-based chart component to support stacked bars alongside per-quintile WGPA and course-rigor ranges - layout requirements that did not fit the existing Chart.js components',
      'Caught two errors in the design handoff before release, including swapped admit-rate ranges for two selectivity bands, by validating the mockup against the application’s source-of-truth category data',
      'Wrote 78 Playwright end-to-end tests covering chart calculations, shared filters, expansion controls, and the detail table; a final whole-feature review uncovered 14 integration defects missed during task-level reviews',
      'Verified the visualization in-browser against a production-scale cohort containing 14,875 applications',
    ],
  },
  {
    id: 'analytics-viz',
    title: 'Analytics Visualizations',
    tags: ['Product', 'Data Platform', 'EdTech'],
    tone: 'teal',
    image: img('projects/analytics-visualizations.jpg'),
    description:
      'Contributed development and led QA on an internal analytics visualization refactor. Helped define requirements and validated calculation logic for a platform that reconciles historical multi-year records with live role-based accounts.',
    highlights: [
      'Contributed development alongside QA ownership for requirements and validation',
      'Helped define how historical and live account state should be joined for accurate reporting',
      'Validated calculation logic with Product Engineering against operational edge cases',
    ],
  },
  {
    id: 'git-worktrees',
    title: 'Git Worktree Workflows',
    tags: ['Git', 'nginx', 'Caddy', 'Docker'],
    tone: 'navy',
    image: img('projects/git-worktrees.png'),
    description:
      'Automated parallel git worktrees behind Caddy and nginx so several branches run locally at once, each with its own checkout, upstream port, and hostname. A bash operator CLI generates reverse-proxy config and Docker bind mounts instead of hardcoding ports and paths per branch. Session cookies pass through the proxy unchanged on the shared parent domain.',
    highlights: [
      'Split the proxy stack: Caddy for frontends that do not execute PHP and can keep running; nginx for PHP apps that reload to pick up new server blocks',
      'Dynamic nginx include of generated *.conf fragments, bind-mounted into the container via Docker Compose so worktree routes are imported rather than hardcoded',
      'Symlink-mirror worktrees: a large PHP application tree stays shared; only the directories that change per branch are unique',
    ],
    githubUrl: REPO_SKILLS,
  },
  {
    id: 'capstone',
    title: 'Healthcare Regulatory Assessment Platform',
    tags: ['React', 'Full-Stack', 'Capstone'],
    tone: 'navy',
    image: img('projects/healthcare.png'),
    description:
      'Primary frontend developer on a two-semester Nash Consulting capstone. React and Spring Boot platform that replaced Word-and-email workflows for healthcare regulatory assessments.',
    highlights: [
      'Led the project setup and frontend development as the senior-year capstone lead',
      'Set up the React and Spring Boot project, including routing and primary navigation',
      'Implemented Auth0 (later AWS Cognito) with roles on the token so administrators could review the full engagement and employees were limited to their assigned work',
      'Built employee scheduling with absence tracking, double-booking prevention, and an admin Agenda for assigning review tasks',
      'Performed security testing on the API and auth flows alongside frontend development',
    ],
  },
  {
    id: 'mcs-collision',
    title: 'Neural Network Collision Prediction',
    tags: ['PyTorch', 'Machine Learning', 'CSE 571'],
    tone: 'violet',
    image: img('projects/neural-network-collision.png'),
    description:
      'Supervised model predicting robot collisions from multi-angle sensors and steering. Selected as MCS Portfolio Project #2.',
    highlights: [
      '5 distance sensors at ±66°, ±33°, and 0° plus steering action as inputs',
      '~11,000 samples with class imbalance; 64→32 hidden layers with ReLU and sigmoid output',
    ],
    demoId: 'robot-ml',
    courseCode: 'CSE 571',
    githubUrl: 'https://github.com/gislamog/collision-predictor',
  },
  {
    id: 'mcs-kmeans',
    title: 'K-Means Clustering Strategy',
    tags: ['Python', 'Unsupervised Learning', 'CSE 575'],
    tone: 'gold',
    image: img('projects/kmeans-clustering.png'),
    description:
      'Comparative analysis of K-Means vs. K-Means++ initialization using the Elbow Method. MCS Portfolio Project #1.',
    highlights: [
      'Clustered a 300-point dataset with both K-Means and K-Means++, using the Elbow method to pick the optimal cluster count',
      'Evaluated convergence behavior and local minima risks',
      'Compared random initialization against a max-average-distance K-Means++ variant, which converged faster and produced tighter clusters',
      'Browser demo adds canonical D^2-sampling K-Means++ and runs both seedings side by side',
    ],
    demoId: 'kmeans',
    courseCode: 'CSE 575',
    githubUrl: 'https://github.com/gislamog/kmeans-strategy',
  },
  {
    id: 'mcs-crypto',
    title: 'Applied Cryptography Playground',
    tags: ['C#', 'RSA', 'CSE 539'],
    tone: 'violet',
    description:
      'Educational rebuild of hashing, RSA with Extended Euclid, and LSB steganography from Applied Cryptography. Small parameters in the browser, large primes documented in the repo.',
    highlights: [
      'Birthday collisions on truncated hashes',
      'RSA encrypt/decrypt with modular inverse',
      'Hide and recover a message in image LSBs',
    ],
    demoId: 'crypto',
    courseCode: 'CSE 539',
    githubUrl: 'https://github.com/gislamog/applied-cryptography',
  },
  {
    id: 'density-classification',
    title: 'Density Estimation and Classification',
    tags: ['Python', 'Machine Learning', 'Classification'],
    tone: 'gold',
    description:
      'Extracted features from handwritten digit images and trained a Naïve Bayes classifier to distinguish between them, evaluating accuracy against held-out test images.',
    highlights: [
      'Built a feature-extraction pipeline over handwritten digit images',
      'Trained and evaluated a Naïve Bayes classifier for digit classification',
      'Measured classification accuracy against a held-out test set',
    ],
  },
  {
    id: 'property-management',
    title: 'Property Management Application',
    tags: ['VBA', 'Excel', 'Automation'],
    tone: 'navy',
    description:
      'A VBA-driven Excel application for property management, with role-based access to protect sensitive data and automated tracking and reporting.',
    highlights: [
      'Built role-based access controls in Excel/VBA to keep property data secure by user role',
      'Automated property tracking and reporting to replace manual spreadsheet upkeep',
    ],
  },
  {
    id: 'mcs-mnist',
    title: 'Digit Classification Sketchpad',
    tags: ['Neural Networks', 'CSE 575'],
    tone: 'gold',
    description:
      'Draw a digit and classify it with 8×8 templates, a browser-friendly companion to the CSE 575 MNIST neural-network lab.',
    highlights: [
      'Downsample a 28×28 drawing and score cosine similarity',
      'Course lab trained CNNs on MNIST; this demo stays fully client-side',
    ],
    demoId: 'mnist',
    courseCode: 'CSE 575',
  },
  {
    id: 'mcs-matching',
    title: 'Stable Matching Visualizer',
    tags: ['Algorithms', 'CSE 551'],
    tone: 'coral',
    description:
      'Step through Gale–Shapley for residents and hospitals from Foundations of Algorithms.',
    highlights: [
      'Proposer-optimal matching',
      'Visible propose / accept / reject / replace steps',
    ],
    demoId: 'stable-matching',
    courseCode: 'CSE 551',
    githubUrl: 'https://github.com/gislamog/stable-matching',
  },
  {
    id: 'mcs-lexer',
    title: 'Mini Language Lexer',
    tags: ['Python', 'Compilers', 'CSE 340'],
    tone: 'teal',
    description:
      'Original Python tokenizer for a tiny language: keywords, identifiers, integers, reals, and operators. Inspired by CSE 340 without publishing course starter files.',
    highlights: [
      'Live tokenization as you type',
      'Line numbers and error tokens',
    ],
    demoId: 'lexer',
    courseCode: 'CSE 340',
    githubUrl: 'https://github.com/gislamog/mini-lexer',
  },
  {
    id: 'mcs-sdn',
    title: 'SDN Stateless Firewall Notes',
    tags: ['Network Security', 'CSE 548'],
    tone: 'navy',
    description:
      'High-level notes on packet filters, SDN flow rules, and anomaly detection from Advanced Computer Network Security. Architecture only, no attack scripts.',
    highlights: [
      'Stateless vs stateful filtering',
      'Where SDN controllers install allow/deny flows',
    ],
    courseCode: 'CSE 548',
    githubUrl: 'https://github.com/gislamog/sdn-firewall-notes',
  },
  {
    id: 'ants-sphere',
    title: 'Ants on a Sphere',
    tags: ['Processing', 'Simulation', 'Visualization'],
    tone: 'coral',
    description: 'Textured sphere in space, mouse-driven rotation, and random-walking ants, built to make chance visible so real paths can be compared against it.',
    highlights: [
      'Random walks on a spherical surface against a space backdrop',
      'Inspired by asking whether ant paths (and other natural paths) are random',
    ],
    demoId: 'ants-sphere',
  },
];
