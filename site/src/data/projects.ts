const img = (path: string) => `${import.meta.env.BASE_URL}images/${path}`;

export const MCS_GITHUB = 'https://github.com/gislamog/mcs-projects';

export function courseHref(code: string) {
  return `/education#course-${code.toLowerCase().replace(/\s+/g, '-')}`;
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

export function githubFolder(folder: string) {
  return `${MCS_GITHUB}/tree/main/${folder}`;
}

// Standalone repos that live outside mcs-projects
export const REPO_COLLISION_PREDICTOR = 'https://github.com/gislamog/cse571-collision-prediction';

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
  githubFolder?: string;
}

export const projects: Project[] = [
  {
    id: 'capstone',
    title: 'Healthcare Regulatory Assessment Platform',
    tags: ['React', 'Full-Stack', 'Capstone'],
    tone: 'navy',
    image: img('projects/healthcare.png'),
    description:
      'Two-semester senior capstone for Nash Consulting. Cloud-based platform helping healthcare facilities navigate regulatory assessments.',
    highlights: [
      'React frontend with role-based access and AWS Cognito authentication',
      'Spring Boot middleware, MongoDB Atlas, AWS S3/EC2 hosting',
      'Software quality reporting and FOSSA compliance / SBOM integration',
    ],
  },
  {
    id: 'analytics-viz',
    title: 'Analytics Visualizations',
    tags: ['Product', 'Data Platform', 'EdTech'],
    tone: 'teal',
    description:
      'Contributed development and led QA on an internal analytics visualization refactor. Helped define requirements and validated calculation logic for a platform that reconciles historical multi-year records with live role-based accounts.',
    highlights: [
      'Contributed development alongside QA ownership for requirements and validation',
      'Helped define how historical and live account state should be joined for accurate reporting',
      'Validated calculation logic with Product Engineering against operational edge cases',
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
    githubFolder: 'collision-predictor',
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
      'Evaluated convergence behavior and local minima risks',
      'Compared random initialization against a max-average-distance K-Means++ variant',
      'Browser demo adds canonical D^2-sampling K-Means++ and runs both seedings side by side',
    ],
    demoId: 'kmeans',
    courseCode: 'CSE 575',
    githubFolder: 'kmeans-strategy',
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
    githubFolder: 'applied-cryptography',
  },
  {
    id: 'mcs-income',
    title: 'Income-Driven Marketing Viz',
    tags: ['Python', 'Visualization', 'CSE 578'],
    tone: 'teal',
    description:
      'Interactive explorer of education, occupation, and hours versus high-income share, rewritten from the CSE 578 Adult-income analysis.',
    highlights: [
      'Filterable synthetic Census-style sample (public Adult schema, no private files)',
      'Stacked education bars for >50K share',
    ],
    demoId: 'adult-income',
    courseCode: 'CSE 578',
    githubFolder: 'adult-income-viz',
  },
  {
    id: 'mcs-glucose',
    title: 'CGM Time-Series Features',
    tags: ['Python', 'Data Mining', 'CSE 572'],
    tone: 'navy',
    description:
      'Meal vs overnight glucose patterns from the Artificial Pancreas project, demonstrated on synthetic CGM so patient files stay private.',
    highlights: [
      '5-minute sampling, meal spikes, time-in-range',
      'Original course CSVs are not published',
    ],
    demoId: 'glucose',
    courseCode: 'CSE 572',
    githubFolder: 'glucose-timeseries',
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
    githubFolder: 'kmeans-strategy',
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
    githubFolder: 'stable-matching',
  },
  {
    id: 'mcs-lexer',
    title: 'Mini Language Lexer',
    tags: ['Compilers', 'CSE 340'],
    tone: 'teal',
    description:
      'Original TypeScript lexer for a tiny language: keywords, identifiers, integers, reals, and operators. Inspired by CSE 340 without publishing course starter files.',
    highlights: [
      'Live tokenization as you type',
      'Line numbers and error tokens',
    ],
    demoId: 'lexer',
    courseCode: 'CSE 340',
    githubFolder: 'mini-lexer',
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
    githubFolder: 'sdn-firewall-notes',
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
