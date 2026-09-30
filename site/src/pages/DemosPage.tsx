import { Link } from 'react-router-dom';
import { FiCpu, FiGlobe, FiGrid, FiKey, FiBarChart2, FiEdit3, FiGitMerge, FiType, FiActivity } from 'react-icons/fi';
import { TbTriangle } from 'react-icons/tb';
import { SierpinskiDemo } from '../demos/SierpinskiDemo';
import { RobotMLDemo } from '../demos/RobotMLDemo';
// import { AntsOnSphereDemo } from '../demos/AntsOnSphereDemo';
import { KMeansDemo } from '../demos/KMeansDemo';
// import { CryptoDemo } from '../demos/CryptoDemo';
// import { AdultIncomeDemo } from '../demos/AdultIncomeDemo';
// import { MnistDemo } from '../demos/MnistDemo';
// import { StableMatchingDemo } from '../demos/StableMatchingDemo';
// import { LexerDemo } from '../demos/LexerDemo';
// import { GlucoseDemo } from '../demos/GlucoseDemo';
import { courseHref, REPO_COLLISION_PREDICTOR } from '../data/projects';
import '../demos/Demos.css';
import { useEffect } from 'react';

/**
 * Private repos 404 for anyone without access, so the GitHub button routes
 * to the contact form instead, with the request message pre-filled.
 */
function requestAccessHref(title: string, repoUrl: string) {
  const repoName = repoUrl.replace(/\/$/, '').split('/').pop();
  const message = `Hi, I'd like to request access to the "${title}" GitHub repo (${repoName}).`;
  return `/contact?message=${encodeURIComponent(message)}`;
}

/**
 * Demos not yet released render as a heading with a "Coming soon" note and no
 * body. Their component imports above are commented out rather than deleted,
 * so releasing one is: uncomment its import, drop `comingSoon`, restore
 * `component`.
 */
const demos = [
  {
    id: 'robot-ml',
    title: 'Robot Collision Predictor',
    description: 'Walled arena, 5 distance sensors, collected CSV samples, crash markers, and a Test button that trains a small collision model on the data you generate. Then take the wheel yourself and watch the model score your collision risk live.',
    component: RobotMLDemo,
    icon: FiCpu,
    courseCode: 'CSE 571',
    repoUrl: REPO_COLLISION_PREDICTOR,
  },
  {
    id: 'kmeans',
    title: 'K-Means vs K-Means++',
    description: 'Pick K from 2 to 10 and both algorithms run on the 300-point course dataset. K-Means starts from K random data points. K-Means++ picks its first centroid at random, then scans every point for its average distance to the centroids so far and places the next one on the farthest. Each iteration assigns points to their nearest centroid, then moves the centroids to their cluster means, until no centroid moves more than 10⁻⁴. Each converged run adds its loss to the chart; rerunning a K greys out the earlier point.',
    component: KMeansDemo,
    icon: FiGrid,
    courseCode: 'CSE 575',
    repoUrl: 'https://github.com/gislamog/kmeans-strategy',
  },
  {
    id: 'crypto',
    title: 'Cryptography Playground',
    description: 'Small-prime RSA, truncated-hash birthday collisions, and LSB steganography. Educational demo, not a cryptanalysis toolkit.',
    // component: CryptoDemo,
    comingSoon: true,
    icon: FiKey,
    courseCode: 'CSE 539',
    repoUrl: 'https://github.com/gislamog/applied-cryptography',
  },
  {
    id: 'adult-income',
    title: 'Adult Income Explorer',
    description: 'Filter a synthetic Census-style sample by education, occupation, and hours. Companion to the CSE 578 marketing visualization project.',
    // component: AdultIncomeDemo,
    comingSoon: true,
    icon: FiBarChart2,
    courseCode: 'CSE 578',
    repoUrl: 'https://github.com/gislamog/adult-income-viz',
  },
  {
    id: 'mnist',
    title: 'Draw-a-Digit',
    description: 'Sketch a number and classify it with 8×8 templates. Browser stand-in for the CSE 575 MNIST neural-network lab.',
    // component: MnistDemo,
    comingSoon: true,
    icon: FiEdit3,
    courseCode: 'CSE 575',
  },
  {
    id: 'stable-matching',
    title: 'Stable Matching',
    description: 'Gale–Shapley step-through: residents propose to hospitals until a stable matching remains.',
    // component: StableMatchingDemo,
    comingSoon: true,
    icon: FiGitMerge,
    courseCode: 'CSE 551',
    repoUrl: 'https://github.com/gislamog/stable-matching',
  },
  {
    id: 'lexer',
    title: 'Mini Lexer',
    description: 'Tokenize a tiny language (keywords, ids, ints, reals, operators). Original implementation inspired by CSE 340.',
    // component: LexerDemo,
    comingSoon: true,
    icon: FiType,
    courseCode: 'CSE 340',
    repoUrl: 'https://github.com/gislamog/mini-lexer',
  },
  {
    id: 'glucose',
    title: 'Synthetic CGM Series',
    description: 'Meal-marked glucose trace with time-in-range. Methods from CSE 572; no real patient files.',
    // component: GlucoseDemo,
    comingSoon: true,
    icon: FiActivity,
    courseCode: 'CSE 572',
    repoUrl: 'https://github.com/gislamog/glucose-timeseries',
  },
  {
    id: 'sierpinski',
    title: "Sierpinski's Triangle",
    description: 'Click to place the first point. Walkthrough auto-plays each midpoint construction; use Keep going / Pause anytime.',
    component: SierpinskiDemo,
    icon: TbTriangle,
  },
  {
    id: 'ants-sphere',
    title: 'Ants on a Sphere',
    description: 'Textured moon in space with mouse rotation and random-walking ants. Adjust the walk, move the mouse to turn the sphere, and press SEED to add walkers.',
    // component: AntsOnSphereDemo,
    comingSoon: true,
    icon: FiGlobe,
  },
];

export function DemosPage() {
  useEffect(() => {
    const scroll = () => {
      const id = window.location.hash.slice(1);
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    scroll();
    window.addEventListener('hashchange', scroll);
    return () => window.removeEventListener('hashchange', scroll);
  }, []);

  return (
    <div className="page-header page-content container demos-page">
      <p className="section-label">Interactive</p>
      <h1>Demos</h1>
      <p className="page-lead">Coursework rebuilt for the browser. Course pages and GitHub stay one click away.</p>

      <nav className="page-toc" aria-label="Demos on this page">
        {demos.map(({ id, title }) => (
          <a key={id} href={`#${id}`}>{title}</a>
        ))}
      </nav>

      {demos.map(({ id, title, description, component: Demo, icon: Icon, courseCode, repoUrl, comingSoon }) => (
        <section key={id} id={id} className={`demo-section${comingSoon ? ' demo-coming-soon' : ''}`}>
          <div className="demo-heading">
            <span className="demo-icon"><Icon /></span>
            <div>
              <h2>{title}</h2>
              {comingSoon && <p className="demo-soon-note">Coming soon</p>}
              <p className="demo-desc">{description}</p>
              {(courseCode || repoUrl) && (
                <p className="demo-links">
                  {courseCode && <Link to={courseHref(courseCode)}>{courseCode}</Link>}
                  {repoUrl && (
                    <Link
                      to={requestAccessHref(title, repoUrl)}
                      title="This repository is private. Request access via the contact form."
                    >
                      GitHub (Private)
                    </Link>
                  )}
                </p>
              )}
            </div>
          </div>
          {Demo && (
            <div className="demo-body">
              <Demo />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
