import { Link } from 'react-router-dom';
import { FiCpu, FiGlobe, FiGrid, FiKey, FiBarChart2, FiEdit3, FiGitMerge, FiType, FiActivity } from 'react-icons/fi';
import { TbTriangle } from 'react-icons/tb';
import { SierpinskiDemo } from '../demos/SierpinskiDemo';
import { RobotMLDemo } from '../demos/RobotMLDemo';
import { AntsOnSphereDemo } from '../demos/AntsOnSphereDemo';
import { KMeansDemo } from '../demos/KMeansDemo';
import { CryptoDemo } from '../demos/CryptoDemo';
import { AdultIncomeDemo } from '../demos/AdultIncomeDemo';
import { MnistDemo } from '../demos/MnistDemo';
import { StableMatchingDemo } from '../demos/StableMatchingDemo';
import { LexerDemo } from '../demos/LexerDemo';
import { GlucoseDemo } from '../demos/GlucoseDemo';
import { courseHref, githubFolder, REPO_COLLISION_PREDICTOR } from '../data/projects';
import '../demos/Demos.css';
import { useEffect } from 'react';

const demos = [
  {
    id: 'robot-ml',
    title: 'Robot Collision Predictor',
    description: 'Walled arena, 5 distance sensors, collected CSV samples, crash markers, and a Test button that trains a small collision model on the data you generate. Then take the wheel yourself and watch the model score your collision risk live.',
    component: RobotMLDemo,
    icon: FiCpu,
    courseCode: 'CSE 571',
    repoUrl: REPO_COLLISION_PREDICTOR,
    repoPrivate: true,
  },
  {
    id: 'kmeans',
    title: 'K-Means vs K-Means++',
    description: 'Two panes, identical data, one Play button. Watch initialization first: random init scatters centroids arbitrarily and often drops several into one dense blob, while K-Means++ pushes them out to the perimeter. Each iteration then plays as two beats — assign (points recolor to their nearest centroid) and update (centroids glide to their cluster means) — with faint trails showing every path a centroid took. Three seeding strategies: random; the course max-average-distance K-Means++ variant, which picks each new centroid as the point maximizing average distance to all centroids chosen so far; and canonical K-Means++ (Arthur & Vassilvitskii), which samples the next centroid with probability proportional to squared distance to the nearest chosen centroid. Live SSE-by-iteration curve plus the elbow chart for K = 2…8. Same comparison as MCS Portfolio Project #1.',
    component: KMeansDemo,
    icon: FiGrid,
    courseCode: 'CSE 575',
    githubFolder: 'kmeans-strategy',
  },
  {
    id: 'crypto',
    title: 'Cryptography Playground',
    description: 'Small-prime RSA, truncated-hash birthday collisions, and LSB steganography. Educational demo, not a cryptanalysis toolkit.',
    component: CryptoDemo,
    icon: FiKey,
    courseCode: 'CSE 539',
    githubFolder: 'applied-cryptography',
  },
  {
    id: 'adult-income',
    title: 'Adult Income Explorer',
    description: 'Filter a synthetic Census-style sample by education, occupation, and hours. Companion to the CSE 578 marketing visualization project.',
    component: AdultIncomeDemo,
    icon: FiBarChart2,
    courseCode: 'CSE 578',
    githubFolder: 'adult-income-viz',
  },
  {
    id: 'mnist',
    title: 'Draw-a-Digit',
    description: 'Sketch a number and classify it with 8×8 templates. Browser stand-in for the CSE 575 MNIST neural-network lab.',
    component: MnistDemo,
    icon: FiEdit3,
    courseCode: 'CSE 575',
    githubFolder: 'kmeans-strategy',
  },
  {
    id: 'stable-matching',
    title: 'Stable Matching',
    description: 'Gale–Shapley step-through: residents propose to hospitals until a stable matching remains.',
    component: StableMatchingDemo,
    icon: FiGitMerge,
    courseCode: 'CSE 551',
    githubFolder: 'stable-matching',
  },
  {
    id: 'lexer',
    title: 'Mini Lexer',
    description: 'Tokenize a tiny language (keywords, ids, ints, reals, operators). Original implementation inspired by CSE 340.',
    component: LexerDemo,
    icon: FiType,
    courseCode: 'CSE 340',
    githubFolder: 'mini-lexer',
  },
  {
    id: 'glucose',
    title: 'Synthetic CGM Series',
    description: 'Meal-marked glucose trace with time-in-range. Methods from CSE 572; no real patient files.',
    component: GlucoseDemo,
    icon: FiActivity,
    courseCode: 'CSE 572',
    githubFolder: 'glucose-timeseries',
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
    component: AntsOnSphereDemo,
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

      {demos.map(({ id, title, description, component: Demo, icon: Icon, courseCode, githubFolder: folder, repoUrl, repoPrivate }) => (
        <section key={id} id={id} className="demo-section">
          <div className="demo-heading">
            <span className="demo-icon"><Icon /></span>
            <div>
              <h2>{title}</h2>
              <p className="demo-desc">{description}</p>
              {(courseCode || folder || repoUrl) && (
                <p className="demo-links">
                  {courseCode && <Link to={courseHref(courseCode)}>{courseCode}</Link>}
                  {folder && <a href={githubFolder(folder)} target="_blank" rel="noreferrer">GitHub</a>}
                  {repoUrl && (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={repoPrivate ? 'This repository is private. Contact me and I will share access.' : undefined}
                    >
                      GitHub
                      {repoPrivate && <span className="repo-private">Private, please request</span>}
                    </a>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="demo-body">
            <Demo />
          </div>
        </section>
      ))}
    </div>
  );
}
