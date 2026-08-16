import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  SiJavascript,
  SiPython,
  SiReact,
  SiNuxt,
  SiVuedotjs,
  SiPytorch,
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
} from 'react-icons/fi';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
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

const explore = [
  { to: '/experience', title: 'Work', desc: 'Production features at an EdTech company and a software internship.', icon: FiBriefcase },
  { to: '/projects', title: 'Projects', desc: 'Analytics platform work, healthcare capstone, and ML portfolio pieces.', icon: FiLayers },
  { to: '/demos', title: 'Demos', desc: 'Interactive robot simulator, fractal, and swarm visualization.', icon: FiPlayCircle },
  { to: '/education', title: 'Education', desc: 'M.S. Computer Science and B.S. Software Engineering at ASU.', icon: FiBookOpen },
];

export function HomePage() {
  const featured = projects.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <motion.div className="hero-main" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="hero-profile">
              <img src={profile.photoUrl} alt={profile.name} className="profile-photo" />
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
          </motion.div>
          <motion.div className="hero-stats" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            {profile.credentials.map((cred) => (
              <div key={cred.label} className="card stat">
                <strong>{cred.label}</strong>
                <span>{cred.detail}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section-label">Selected work</p>
          <h2>Featured projects</h2>
          <div className="featured-grid">
            {featured.map((p) => {
              const Icon = projectIcon(p.id);
              return (
                <Link key={p.id} to="/projects" className="featured-card">
                  <ProjectVisual project={p} Icon={Icon} />
                  <div className="featured-body">
                    <div>{p.tags.slice(0, 2).map((t) => <span key={t} className="tag">{t}</span>)}</div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-dim">
        <div className="container">
          <p className="section-label">Skills</p>
          <h2>Technical focus</h2>
          <div className="skills-grid">
            {profile.skills.map(([category, items]) => {
              const Icon = skillIcons[category];
              return (
                <div key={category} className="card skill-card">
                  <div className="skill-card-head">
                    {Icon && <span className="skill-icon"><Icon /></span>}
                    <h3>{category}</h3>
                  </div>
                  <ul>{items.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section-label">Explore</p>
          <h2>On this site</h2>
          <div className="grid-2 explore-grid">
            {explore.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="card explore-card">
                  <span className="explore-icon"><Icon /></span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
