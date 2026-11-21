export interface ProjectStudy {
  summary: string;
  role: string;
  sections: { title: string; text: string }[];
  report?: boolean;
}

export const projectStudies: Record<string, ProjectStudy> = {
  'academic-quintiles': {
    summary: 'A CK360 analytics feature that compares applications, admissions, and enrollments across college selectivity bands and weighted GPA quintiles.',
    role: 'Technical lead from requirements through release, working with leadership, Product, and Support.',
    sections: [
      { title: 'From design handoff to a reporting feature', text: 'The feature needed to show three distributions alongside a 13-column application detail table. I led requirements and design discussions and checked the proposed selectivity bands against the source category data. That review found two handoff errors, including swapped admit-rate ranges.' },
      { title: 'Why I built a custom chart', text: 'Existing Chart.js components could not accommodate the required layout of stacked bars alongside weighted GPA and course-rigor ranges for each quintile. I built a DOM-based chart with room for both the distributions and their academic context.' },
      { title: 'Two ways to filter the same data', text: 'A selectivity filter dims chart segments so the full distribution remains visible for comparison. The application-level table uses all active filters to show only matching records. That distinction keeps the charts useful for context and the table useful for inspection.' },
      { title: 'Validation at production scale', text: 'I wrote 78 Playwright end-to-end tests for calculations, shared filters, expansion controls, and the detail table. A final whole-feature review uncovered 14 integration defects missed during task-level reviews. I verified the visualization in the browser against a cohort of 14,875 applications.' },
    ],
  },
  'git-worktrees': {
    summary: 'A Bash CLI that lets several branches of an application run locally at once, each through its own hostname and port.',
    role: 'Built the CLI and automated local routing, container mounts, and worktree setup.',
    sections: [
      { title: 'Make parallel checkouts runnable', text: 'Checking out multiple branches is only part of running them in parallel. Each branch also needs a hostname, upstream port, and checkout path. I put those details under the same CLI so branch setup did not depend on manually editing proxy configuration.' },
      { title: 'Route each branch to its own environment', text: 'Caddy handles frontends that do not execute PHP, while nginx serves PHP applications. The CLI generates nginx configuration fragments that Docker Compose bind-mounts into the container. nginx can then reload its routes without hardcoded paths for each branch.' },
      { title: 'Share what does not need a separate checkout', text: 'Symlink-based worktrees share the large application tree while keeping branch-specific directories separate. The setup supports separate local environments without copying the entire tree for every branch.' },
    ],
  },
  capstone: {
    summary: 'A React and Spring Boot capstone for Nash Consulting that moved healthcare regulatory assessments from Word and email into a shared application.',
    role: 'Primary frontend developer and capstone lead on project setup, navigation, scheduling, and access flows.',
    sections: [
      { title: 'Turn assignments into a shared workflow', text: 'I set up the React frontend and Spring Boot application, including routing and navigation. The scheduling and Agenda interfaces gave administrators a place to assign reviews and staff a place to see their work.' },
      { title: 'Make scheduling constraints explicit', text: 'I implemented absence tracking and double-booking prevention alongside employee scheduling, so conflicting assignments could be identified as schedules were being built.' },
      { title: 'Scope access by role', text: 'I implemented authentication with Auth0, later moved to AWS Cognito, and used token roles to distinguish administrators who could review the full engagement from employees who saw assigned work. I also tested the API and authentication flows.' },
    ],
  },
  'piano-pogo': {
    summary: 'A piano-learning game for children, with a lesson roadmap and short games that reinforce note reading.',
    role: 'Built the learning experience around progression, on-screen piano practice, and feedback.',
    sections: [
      { title: 'Make the next lesson clear', text: 'The lesson roadmap groups material into sections and shows completed, current, and locked lessons. Star ratings and section progress make it easy to see what has been practiced and where to resume.' },
      { title: 'Give the same skills several ways to stick', text: 'Lessons connect notes on the staff to keys on an on-screen piano. Games give children short, distinct tasks, such as playing a note, recognizing a melodic step or skip, and spelling words with note letters.' },
      { title: 'Give practice visible feedback', text: 'The captured game screens show best scores and a daily challenge, while the lesson screen shows a practice streak. These are examples from the available build screenshots.' },
    ],
  },
  'mcs-collision': {
    summary: 'A PyTorch model that predicts robot collisions from five distance sensors and a steering action in a simulator.',
    role: 'Collected simulated training data, built the model, and evaluated its prediction errors.',
    report: true,
    sections: [
      { title: 'Collect inputs and labels in simulation', text: 'Each sample paired five distance readings and a steering action with a collision label. The resulting dataset contained about 11,000 samples, with roughly five non-collisions for every collision.' },
      { title: 'Train and evaluate the classifier', text: 'I trained a supervised PyTorch network with 64- and 32-unit hidden layers to score collision risk. The report records one false positive and five missed collisions in 1,000 test cases from the simulated environment.' },
    ],
  },
  'mcs-kmeans': {
    summary: 'A comparison of clustering initialization strategies on a 300-point dataset.',
    role: 'Implemented and compared initialization approaches and analyzed their convergence and clustering loss.',
    report: true,
    sections: [
      { title: 'Compare how clusters are seeded', text: 'I compared random initialization with a variant that chose new centroids using average distance from existing centroids. I used the Elbow Method to compare loss across cluster counts and identified an elbow around five clusters for this dataset.' },
      { title: 'Observe convergence and local minima', text: 'On the course dataset, the max-average-distance variant converged faster and produced tighter clusters than random initialization. The browser demo also offers canonical K-Means++ seeding, so visitors can compare it with the variant used in the report.' },
    ],
  },
};
