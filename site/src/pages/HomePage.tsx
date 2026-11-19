import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  SiJavascript,
  SiPython,
  SiReact,
  SiNuxt,
  SiVuedotjs,
  SiPytorch,
  SiJoomla,
} from 'react-icons/si';
import { VscBeaker } from 'react-icons/vsc';
import {
  FiBriefcase,
  FiBookOpen,
  FiLayers,
  FiPlayCircle,
  FiCode,
  FiCpu,
  FiDatabase,
  FiShield,
  FiGitBranch,
  FiTerminal,
  FiServer,
  FiBarChart2,
  FiCheckCircle,
  FiLock,
  FiHash,
  FiArrowUpRight,
} from 'react-icons/fi';
import { profile } from '../data/profile';
import { projectHref, projects } from '../data/projects';
import { BioSummary } from '../components/BioSummary';
import { SocialLinks } from '../components/SocialLinks';
import { AsuLogo } from '../components/AsuLogo';
import { ProjectVisual, projectIcon } from '../components/ProjectVisual';
import './HomePage.css';

const techIcons: Record<(typeof profile.tech)[number], IconType> = {
  JavaScript: SiJavascript,
  Python: SiPython,
  React: SiReact,
  Nuxt: SiNuxt,
  Playwright: VscBeaker,
  Vue: SiVuedotjs,
  PyTorch: SiPytorch,
};

const skillIcons: Record<string, IconType> = {
  'Languages & Frameworks': FiCode,
  'AI & Development': FiCpu,
  'Data & ML': FiDatabase,
  'Security & CS': FiShield,
};

// Per-category accent used for each panel's header band and item pills.
const skillAccents: Record<string, 'teal' | 'gold' | 'indigo' | 'rose'> = {
  'Languages & Frameworks': 'teal',
  'AI & Development': 'gold',
  'Data & ML': 'indigo',
  'Security & CS': 'rose',
};

// Each skill item gets its own icon: real brand logos for concrete tech,
// concept icons for the softer/abstract items.
const itemIcons: Record<string, IconType> = {
  JavaScript: SiJavascript,
  Python: SiPython,
  React: SiReact,
  'Nuxt / Vue': SiNuxt,
  Joomla: SiJoomla,
  Playwright: VscBeaker,
  'AI-assisted implementation': FiCpu,
  'Full-stack debugging': FiTerminal,
  'Multi-service local platforms': FiServer,
  PyTorch: SiPytorch,
  'Statistical machine learning': FiGitBranch,
  'Data visualization': FiBarChart2,
  'Analytics validation': FiCheckCircle,
  'Applied cryptography': FiLock,
  'Software security': FiShield,
  Algorithms: FiHash,
  Databases: FiDatabase,
};

const explore = [
  { to: '/experience', title: 'Work', desc: 'Development, automated testing, and quality assurance on production EdTech software and a software internship.', icon: FiBriefcase, accent: 'teal' as const },
  { to: '/projects', title: 'Projects', desc: 'Healthcare capstone, analytics platform work, and ML portfolio pieces.', icon: FiLayers, accent: 'gold' as const },
  { to: '/demos', title: 'Demos', desc: 'K-Means, crypto, income viz, robot ML, matching, lexer, and more.', icon: FiPlayCircle, accent: 'indigo' as const },
  { to: '/education', title: 'Education', desc: 'M.S. Computer Science and B.S. Software Engineering at ASU.', icon: FiBookOpen, accent: 'rose' as const },
];

const SHEETS = ['dots', 'ruled', 'hatched', 'graph'] as const;

/**
 * Home's sections are full-viewport sheets inside .app-viewport, a custom
 * scroll container the browser's native same-document anchor jump can't
 * reach, so a direct /#explore load (or a stale layout at the moment it
 * would fire) leaves it short of the target. Scroll to the hash ourselves,
 * then correct once images/fonts have settled.
 */
function useHomeHashTarget() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!(el instanceof HTMLElement)) return;

    const jump = (behavior: ScrollBehavior) => el.scrollIntoView({ behavior, block: 'start' });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const raf = requestAnimationFrame(() => jump(reduce ? 'auto' : 'smooth'));
    document.fonts?.ready.then(() => jump('auto'));

    return () => cancelAnimationFrame(raf);
  }, [hash]);
}

export function HomePage() {
  useHomeHashTarget();
  const featured = projects.slice(0, 3);

  return (
    <div className="nb-page">
      <section id="intro" className="hero">
        <div className="container hero-inner">
          {/* No entrance animation: tabs should switch instantly, not fade in. */}
          <div className="hero-main">
            <div className="hero-profile">
              <div className="hero-intro">
                <p className="section-label">{profile.title}</p>
                <h1>{profile.name}</h1>
                <div className="hero-asu">
                  <AsuLogo size="sm" />
                  <span>Arizona State University</span>
                </div>
                <SocialLinks />
              </div>
            </div>
            <p className="hero-summary"><BioSummary /></p>
            <div className="tech-row" aria-label="Technical stack">
              {profile.tech.map((name) => {
                const Icon = techIcons[name];
                return (
                  <span key={name} className="tech-chip">
                    <Icon className="tech-chip-icon" />
                    {name}
                  </span>
                );
              })}
            </div>
            <div className="hero-actions">
              <Link to="/projects" className="btn btn-primary">View Projects</Link>
              <Link to="/experience" className="btn btn-ghost">Work Experience</Link>
              <Link to="/demos" className="btn btn-ghost">Interactive Demos</Link>
            </div>
          </div>
          <div className="hero-stats">
            {profile.credentials.map((cred) => (
              <a
                key={cred.label}
                href={cred.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card stat"
                aria-label={`${cred.label.replace('\n', ' ')} — view program on ASU's website`}
              >
                <FiArrowUpRight className="stat-arrow" />
                <strong>{cred.label}</strong>
                <span>{cred.detail}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="section nb-sheet" data-sheet={SHEETS[1]}>
        <div className="container">
          <p className="section-label">Selected work</p>
          <h2>Featured projects</h2>
          <div className="featured-grid">
            {featured.map((p) => {
              const Icon = projectIcon(p.id);
              const body = (
                <>
                  <ProjectVisual project={p} Icon={Icon} />
                  <div className="featured-body">
                    <div>{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                </>
              );
              // Projects with a live site open it in a new tab; the rest go to their Projects entry.
              return p.liveUrl ? (
                <a key={p.id} href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="featured-card">
                  {body}
                </a>
              ) : (
                <Link key={p.id} to={projectHref(p.id)} className="featured-card">
                  {body}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="skills" className="section nb-sheet" data-sheet={SHEETS[2]}>
        <div className="container">
          <p className="section-label">Skills</p>
          <h2>Technical focus</h2>
          <div className="skills-grid">
            {profile.skills.map(({ category, blurb, items }) => {
              const Icon = skillIcons[category];
              const accent = skillAccents[category];
              return (
                <div key={category} className="card skill-card" data-accent={accent}>
                  <div className="skill-card-head">
                    {Icon && <span className="skill-icon"><Icon /></span>}
                    <h3>{category}</h3>
                  </div>
                  <p className="skill-blurb">{blurb}</p>
                  <div className="skill-pills">
                    {items.map((s) => {
                      const ItemIcon = itemIcons[s];
                      return (
                        <span key={s} className="skill-pill">
                          {ItemIcon && <ItemIcon className="skill-pill-icon" />}
                          {s}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="explore" className="section nb-sheet" data-sheet={SHEETS[3]}>
        <div className="container">
          <p className="section-label">Explore</p>
          <h2>On this site</h2>
          <div className="grid-2 explore-grid">
            {explore.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="card explore-card" data-accent={item.accent}>
                  <span className="explore-icon"><Icon /></span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
