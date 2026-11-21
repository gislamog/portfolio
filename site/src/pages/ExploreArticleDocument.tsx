import { Link } from 'react-router-dom';
import { LearningMcsPortfolioArticle } from '../components/LearningMcsPortfolioArticle';
import { LearningBigDataCertArticle } from '../components/LearningBigDataCertArticle';
import { exploreArticles, type ExploreArticleId } from '../data/explore';
import { courseHref, demoHref } from '../data/projects';

function KMeansArticle() {
  return (
    <>
      <p>K-Means groups nearby points around centers called centroids. Pick a number of clusters, assign each point to its nearest center, then move each center to the average of its assigned points. Repeat until the centers barely move.</p>
      <h2>Why the starting centers matter</h2>
      <p>With random seeding, two initial centers can land in the same dense region while another region gets none. Each pass reduces the clustering loss, the sum of squared distances to the assigned centers, but the algorithm can settle into a solution that a different start would have avoided.</p>
      <p>Canonical K-Means++ picks the first center at random and weights subsequent picks by squared distance from the nearest existing center. My course comparison used a different rule. It placed the next center at the point with the greatest average distance from existing centers. The workspace offers both alongside random seeding.</p>
      <h2>Try changing one thing at a time</h2>
      <p>Start with K = 5, run the methods, and compare the final clusters, iteration count, and loss. Repeat with the same K before changing it. That lets you see how much results vary from run to run before asking how increasing K changes the fit.</p>
      <h2>What I found on these 300 points</h2>
      <p>The course variant converged faster and produced tighter clusters in my comparison. The elbow in the loss curve was around four to five clusters. That result describes this dataset and comparison. It does not establish a best seeding method or cluster count for other data.</p>
    </>
  );
}

function RobotArticle() {
  return (
    <>
      <p>A robot can be close to a wall and still be safe if it turns away. I wanted to see whether a model could learn the difference from a few distance readings and a steering action.</p>
      <h2>What the robot sees</h2>
      <p>Each row pairs five simulated distance readings and the selected steering action with a collision label. I collected about 11,000 samples, with roughly five non-collision examples for every collision. That imbalance matters because a prediction of “safe” can look accurate while missing many of the events we care about.</p>
      <h2>What the model learned</h2>
      <p>I trained a PyTorch network with two hidden layers of 64 and 32 units. Its output scores collision risk for the sensor readings and steering action. On 1,000 held-out cases, the report records one false alarm and five missed collisions. I look at those errors separately because a missed collision and an unnecessary turn have different costs.</p>
      <h2>Try making a small dataset</h2>
      <p>Collect samples in the browser arena, then choose Goal seeking to train a smaller browser model. Take the controls to see how proposed moves change the risk score. Compare a run with very few collision examples to one with more. The browser run uses its own data, and results in this arena tell us about the simulator rather than a physical robot.</p>
    </>
  );
}

export function ExploreArticleDocument({ id }: { id: ExploreArticleId }) {
  const article = exploreArticles[id];
  return (
    <article className="explore-reading">
      <header>
        <h1 id="explore-article-title">{article.title}</h1>
        <p>{article.description}</p>
        {'date' in article && <time dateTime={article.date}>{article.date === '2026-07' ? 'July 2026' : new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(article.date))}</time>}
      </header>
      {'demo' in article && (
        <nav aria-label="Related to this article" className="explore-actions">
          <Link className="portfolio-pill explore-primary" to={demoHref(article.demo)}>Try interactive demo</Link>
          <Link to={`/projects/${article.project}`}>Project case study</Link>
          <Link to={courseHref(article.course)}>Course · {article.course}</Link>
        </nav>
      )}
      {id === 'kmeans-initialization' && <KMeansArticle />}
      {id === 'robot-collision-prediction' && <RobotArticle />}
      {id === 'mcs-portfolio' && <LearningMcsPortfolioArticle includeTitle={false} />}
      {id === 'big-data-cert' && <LearningBigDataCertArticle includeTitle={false} />}
      {'demo' in article && (
        <p className="explore-article-source">Full methods and results in the <Link to="/explore/mcs-portfolio">MCS Portfolio Report</Link>.</p>
      )}
    </article>
  );
}
