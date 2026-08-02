export const projects = [
  {
    id: 'mcs-collision',
    title: 'Neural Network Collision Prediction',
    tags: ['PyTorch', 'Machine Learning', 'Robotics', 'CSE 571'],
    description:
      'Supervised learning model predicting robot collisions from simulated sensor readings and steering actions. Selected as MCS Portfolio Project #2.',
    highlights: [
      '5 distance sensors at ±66°, ±33°, and 0° plus steering action as inputs',
      '64→32 hidden layer architecture with ReLU and sigmoid output',
      'Handled ~5:1 class imbalance across 11,000 training samples',
    ],
    demoId: 'robot-ml',
  },
  {
    id: 'mcs-kmeans',
    title: 'K-Means Clustering Strategy',
    tags: ['Python', 'Unsupervised Learning', 'CSE 575'],
    description:
      'Comparative analysis of K-Means vs. K-Means++ initialization on 300 2D points using the Elbow Method. MCS Portfolio Project #1.',
    highlights: [
      'Evaluated convergence behavior and local minima risks',
      'Determined optimal K ≈ 5 through systematic comparison',
      'Documented trade-offs between random and K-Means++ initialization',
    ],
  },
  {
    id: 'capstone',
    title: 'Healthcare Regulatory Assessment Platform',
    tags: ['React', 'Full-Stack', 'Capstone'],
    description:
      'Senior capstone for Nash Consulting. Web application helping healthcare facilities navigate regulatory assessments.',
    highlights: [
      'Two-semester SER 401/402 project with deployed production build',
      'Software quality reporting and FOSSA compliance/SBOM integration',
    ],
  },
  {
    id: 'simon-care',
    title: 'Simon Care Management Internship',
    tags: ['Production Debugging', 'Feature Development'],
    description:
      'Internship work on production codebase fixes, new feature development, and ML roadmap planning for care management software.',
    highlights: [
      'Debugged and resolved production issues in existing codebase',
      'Contributed to cross-team requirements and feature design',
    ],
  },
  {
    id: 'ants-sphere',
    title: 'Ants on a Sphere',
    tags: ['Java', 'Simulation', 'Visualization'],
    description:
      'Particle simulation visualizing ant-like agents traversing a spherical surface. An early creative coding project exploring emergent movement patterns.',
    highlights: [
      'Agents navigate a 3D sphere with trail-following behavior',
      'Explores themes related to swarm intelligence and biocomputing',
    ],
    demoId: 'ants-sphere',
  },
  {
    id: 'playwright-suite',
    title: 'Enterprise Playwright Test Suite',
    tags: ['Playwright', 'QA Automation', 'EdTech'],
    description:
      '1,100+ automated regression tests for an EdTech SaaS platform covering accounts, billing, data import, authentication, and analytics.',
    highlights: [
      'Tests tracked in a dedicated test-management system',
      'Covers role-based access, cross-year data reconciliation, and dashboard analytics',
    ],
  },
];

export type Project = (typeof projects)[number];
