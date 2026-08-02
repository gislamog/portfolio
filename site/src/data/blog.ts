export const blogPosts = [
  {
    slug: 'training-a-robot-to-predict-collisions',
    title: 'Training a Robot to Predict Collisions',
    date: '2026-01-15',
    tags: ['Machine Learning', 'PyTorch', 'Robotics'],
    excerpt:
      'How I built a neural network that learns collision risk from simulated robot sensor data, and what the results taught me about class imbalance.',
    content: [
      'For my CSE 571 Artificial Intelligence course at ASU, I worked on a four-part project training a PyTorch neural network to predict whether a virtual robot would collide based on five distance sensors and a steering action.',
      'The dataset contained 11,000 samples with a roughly 5:1 ratio of non-collision to collision events. This imbalance meant accuracy alone was misleading. I had to pay close attention to false positives vs. missed collisions during evaluation.',
      'My final architecture used two hidden layers (64 and 32 neurons) with ReLU activations and a sigmoid output, trained with binary cross-entropy loss and the Adam optimizer over 20 epochs.',
      'On 1,000 held-out test cases, the model achieved only 1 false positive and 5 missed collisions. A result I was proud of given the sensor noise and class skew. The full write-up is in my MCS Portfolio Report.',
      'Key takeaway: in robotics ML, the cost of a missed collision often outweighs a false alarm. Designing your evaluation metrics around the real-world consequence matrix matters as much as model architecture.',
    ],
  },
  {
    slug: 'k-means-plus-plus-in-practice',
    title: 'K-Means++ vs Random Initialization',
    date: '2025-12-01',
    tags: ['Machine Learning', 'Clustering', 'Python'],
    excerpt:
      'A practical comparison of K-Means initialization strategies for my CSE 575 portfolio project.',
    content: [
      'K-Means is simple on paper but notoriously sensitive to initialization. For my MCS portfolio project, I clustered 300 two-dimensional points and compared random initialization against K-Means++.',
      'Using the Elbow Method, I identified K ≈ 5 as the optimal cluster count. K-Means++ consistently reached better local minima with fewer iterations, while random init occasionally trapped the algorithm in visibly suboptimal partitions.',
      'This project reinforced why libraries default to smarter initialization, and why visualizing your clusters is non-negotiable when communicating results.',
    ],
  },
];

export type BlogPost = (typeof blogPosts)[number];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
