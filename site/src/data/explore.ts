const image = (name: string) => `${import.meta.env.BASE_URL}images/projects/${name}`;

export const exploreArticles = {
  'kmeans-initialization': {
    title: 'K-Means vs. K-Means++',
    question: 'How much does the starting point change the clusters you get?',
    description: 'Compare three ways to initialize K-Means and see how starting centroids affect convergence and clustering loss.',
    image: image('kmeans-clustering.png'),
    alt: 'Plots of the same points with ten initial and then final cluster centers',
    demo: 'kmeans',
    project: 'mcs-kmeans',
    course: 'CSE 575',
    date: '2025-12-01',
  },
  'robot-collision-prediction': {
    title: 'Robot Collision Predictor',
    question: 'Can five distance readings tell a robot it’s about to crash?',
    description: 'Explore how a supervised model learned collision risk from simulated range readings and steering actions.',
    image: image('collision-predictor/sensors.png'),
    alt: 'Simulated robot in an arena with distance sensor rays extending toward walls',
    demo: 'robot-ml',
    project: 'mcs-collision',
    course: 'CSE 571',
    date: '2026-01-15',
  },
  'mcs-portfolio': {
    title: 'MCS Portfolio Report',
    description: 'Two research papers on clustering and collision prediction, with the experimental methods and full results.',
    date: '2026-07',
  },
  'big-data-cert': {
    title: 'ASU Big Data Graduate Certificate',
    description: 'A completed graduate credential connecting data mining, statistical machine learning, and data visualization.',
  },
};

export type ExploreArticleId = keyof typeof exploreArticles;
export const featuredExploreArticles = ['kmeans-initialization', 'robot-collision-prediction'] as const;

export function getExploreArticle(id: string): ExploreArticleId | undefined {
  return Object.prototype.hasOwnProperty.call(exploreArticles, id) ? id as ExploreArticleId : undefined;
}

export const experiments = {
  kmeans: {
    title: 'K-Means vs. K-Means++',
    description: 'Choose a cluster count and compare random, course-variant, and canonical seeding on the same 300 points.',
    article: 'kmeans-initialization',
    course: 'CSE 575',
  },
  'robot-ml': {
    title: 'Robot Collision Predictor',
    description: 'Collect sensor samples, train a small browser model, then take the controls to see how it scores collision risk.',
    article: 'robot-collision-prediction',
    course: 'CSE 571',
  },
  sierpinski: {
    title: 'Sierpiński’s Triangle',
    description: 'Start with one point and repeat a simple midpoint rule. Watch a fractal emerge one step at a time.',
  },
};

export type ExperimentId = keyof typeof experiments;

export function getExperiment(id: string): ExperimentId | undefined {
  return Object.prototype.hasOwnProperty.call(experiments, id) ? id as ExperimentId : undefined;
}
