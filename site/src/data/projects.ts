const img = (path: string) => `${import.meta.env.BASE_URL}images/${path}`;

export interface Project {
  id: string;
  title: string;
  tags: string[];
  tone: string;
  description: string;
  highlights: string[];
  image?: string;
  demoId?: string;
}

export const projects: Project[] = [
  {
    id: 'analytics-viz',
    title: 'Analytics Visualizations',
    tags: ['Product', 'Data Platform', 'EdTech'],
    tone: 'teal',
    image: img('projects/analytics-visualizations.png'),
    description:
      'Led QA and contributed development on an internal analytics visualization refactor. Helped define requirements and validated calculation logic for a platform that reconciles historical multi-year records with live role-based accounts.',
    highlights: [
      'Led QA across the refactor; helped define how historical and live account state should be joined for accurate reporting',
      'Validated calculation logic with Product Engineering against operational edge cases',
      'Contributed development alongside QA ownership for requirements and validation',
    ],
  },
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
  },
  {
    id: 'mcs-kmeans',
    title: 'K-Means Clustering Strategy',
    tags: ['Python', 'Unsupervised Learning', 'CSE 575'],
    tone: 'gold',
    image: img('projects/kmeans-clustering.png'),
    description:
      'Comparative analysis of K-Means vs. K-Means++ initialization on 300 2D points using the Elbow Method. MCS Portfolio Project #1.',
    highlights: [
      'Evaluated convergence behavior and local minima risks',
      'Determined optimal K ≈ 5 through systematic comparison',
    ],
  },
  {
    id: 'ants-sphere',
    title: 'Ants on a Sphere',
    tags: ['Processing', 'Simulation', 'Visualization'],
    tone: 'coral',
    description: 'Textured sphere in space, mouse-driven rotation, and random-walking ants—built to make chance visible so real paths can be compared against it.',
    highlights: [
      'Random walks on a spherical surface against a space backdrop',
      'Inspired by asking whether ant paths (and other natural paths) are random',
    ],
    demoId: 'ants-sphere',
  },
  // Hidden: duplicates the Simon Care internship already listed under Work.
  // {
  //   id: 'simon-care',
  //   title: 'Simon Care Management Internship',
  //   tags: ['Production Debugging', 'Feature Development'],
  //   description: '...',
  // },
  // Hidden: QA-framed as a standalone project; coverage lives under Work instead.
  // {
  //   id: 'playwright-suite',
  //   title: 'Enterprise Playwright Test Suite',
  //   tags: ['Playwright', 'QA Automation', 'EdTech'],
  //   description: '...',
  // },
];
